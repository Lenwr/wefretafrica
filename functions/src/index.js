"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const {
  constantTimeEqual,
  hashApiKey,
  normalizeShipmentPayload,
  publicDocumentId,
  slugify,
  trackingNumber,
} = require("./shipment");

initializeApp();

const API_KEY_PEPPER = defineSecret("TRACKING_API_KEY_PEPPER");
const rateBuckets = new Map();

function json(res, status, body) {
  res.set("Cache-Control", "no-store");
  return res.status(status).json(body);
}

function allowPublicRequest(req) {
  const key = String(req.ip || req.headers["x-forwarded-for"] || "unknown").split(",")[0];
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt > 60_000) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= 60;
}

async function authenticate(req) {
  const tenantId = String(req.get("x-tenant-id") || "").trim();
  const apiKey = String(req.get("x-api-key") || "").trim();
  if (!tenantId || !apiKey) return null;

  const snapshot = await getFirestore().collection("tenantIntegrations").doc(tenantId).get();
  if (!snapshot.exists) return null;
  const tenant = { tenantId, ...snapshot.data() };
  const acceptedHashes = [
    tenant.keyHash,
    ...(Array.isArray(tenant.keyHashes) ? tenant.keyHashes : []),
  ].filter(Boolean);
  if (tenant.active !== true || !acceptedHashes.length || !tenant.companySlug) return null;

  const suppliedHash = hashApiKey(apiKey, API_KEY_PEPPER.value());
  return acceptedHashes.some((value) => constantTimeEqual(suppliedHash, value)) ? tenant : null;
}

function routeParts(req) {
  return String(req.path || "/").split("/").filter(Boolean);
}

async function handlePublicRead(req, res, parts) {
  if (!allowPublicRequest(req)) {
    res.set("Retry-After", "60");
    return json(res, 429, { error: "TOO_MANY_REQUESTS" });
  }

  const companySlug = slugify(parts[2]);
  const number = trackingNumber(decodeURIComponent(parts.slice(3).join("/")));
  const snapshot = await getFirestore()
    .collection("publicTrackings")
    .doc(publicDocumentId(companySlug, number))
    .get();

  if (!snapshot.exists || snapshot.get("archived") === true || snapshot.get("revoked") === true) {
    return json(res, 404, { error: "TRACKING_NOT_FOUND" });
  }
  return json(res, 200, { data: snapshot.data() });
}

async function handleWrite(req, res, parts) {
  const tenant = await authenticate(req);
  if (!tenant) return json(res, 401, { error: "UNAUTHORIZED" });

  if (parts.length === 2 && ["POST", "PUT"].includes(req.method)) {
    const shipment = normalizeShipmentPayload(req.body, tenant);
    const ref = getFirestore()
      .collection("publicTrackings")
      .doc(publicDocumentId(tenant.companySlug, shipment.trackingNumber));
    const existing = await ref.get();
    if (existing.exists && existing.get("tenantId") !== tenant.tenantId) {
      return json(res, 409, { error: "TRACKING_CONFLICT" });
    }
    if (existing.exists) shipment.createdAt = existing.get("createdAt") || shipment.createdAt;
    await ref.set(shipment);
    return json(res, existing.exists ? 200 : 201, { data: shipment });
  }

  if (parts.length === 3 && req.method === "DELETE") {
    const number = trackingNumber(decodeURIComponent(parts[2]));
    const ref = getFirestore()
      .collection("publicTrackings")
      .doc(publicDocumentId(tenant.companySlug, number));
    const snapshot = await ref.get();
    if (!snapshot.exists || snapshot.get("tenantId") !== tenant.tenantId) {
      return json(res, 404, { error: "TRACKING_NOT_FOUND" });
    }
    await ref.update({
      archived: true,
      revoked: true,
      updatedAt: new Date().toISOString(),
      revokedAt: FieldValue.serverTimestamp(),
    });
    return res.status(204).send("");
  }

  return json(res, 404, { error: "NOT_FOUND" });
}

exports.trackingApi = onRequest(
  {
    region: "europe-west1",
    secrets: [API_KEY_PEPPER],
    timeoutSeconds: 30,
    memory: "256MiB",
    maxInstances: 20,
  },
  async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type,X-Api-Key,X-Tenant-Id");
      if (req.method === "OPTIONS") return res.status(204).send("");
      if (Number(req.get("content-length") || 0) > 262_144) {
        return json(res, 413, { error: "PAYLOAD_TOO_LARGE" });
      }

      const parts = routeParts(req);
      if (req.method === "GET" && parts[0] === "v1" && parts[1] === "public" && parts.length >= 4) {
        return await handlePublicRead(req, res, parts);
      }
      if (parts[0] === "v1" && parts[1] === "shipments") {
        return await handleWrite(req, res, parts);
      }
      return json(res, 404, { error: "NOT_FOUND" });
    } catch (error) {
      console.error("trackingApi", error);
      const clientError = /invalide|obligatoire|trop|autorisé|Date|Nombre/.test(error.message);
      return json(res, clientError ? 400 : 500, {
        error: clientError ? "INVALID_PAYLOAD" : "INTERNAL_ERROR",
        message: clientError ? error.message : undefined,
      });
    }
  },
);
