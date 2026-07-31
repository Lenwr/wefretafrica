"use strict";

const crypto = require("node:crypto");

const SCHEMA_VERSION = 1;
const STATUSES = Object.freeze([
  "PENDING",
  "RECEIVED",
  "LOADED",
  "IN_TRANSIT",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "CANCELLED",
]);

const MAX = Object.freeze({
  trackingNumber: 80,
  slug: 64,
  name: 120,
  label: 160,
  location: 160,
  note: 500,
  packages: 100,
  events: 200,
});

function text(value, max, required = false) {
  const result = String(value ?? "").trim();
  if (required && !result) throw new Error("Champ obligatoire manquant");
  if (result.length > max) throw new Error(`Champ trop long (maximum ${max})`);
  return result;
}

function slugify(value) {
  const slug = text(value, MAX.slug, true)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug || slug.length > MAX.slug) throw new Error("companySlug invalide");
  return slug;
}

function trackingNumber(value) {
  const number = text(value, MAX.trackingNumber, true).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,79}$/.test(number)) {
    throw new Error("trackingNumber invalide");
  }
  return number;
}

function status(value) {
  const result = text(value || "PENDING", 32).toUpperCase();
  if (!STATUSES.includes(result)) throw new Error(`Statut non autorisé: ${result}`);
  return result;
}

function isoDate(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const date = value?.toDate instanceof Function ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Date invalide");
  return date.toISOString();
}

function positiveNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0) throw new Error("Nombre invalide");
  return result;
}

function positiveInteger(value, fallback = 1) {
  const result = positiveNumber(value, fallback);
  if (!Number.isInteger(result) || result < 1) throw new Error("Quantité invalide");
  return result;
}

function normalizeParty(value = {}) {
  return {
    name: text(value.name, MAX.name),
    city: text(value.city, MAX.location),
    country: text(value.country, 80),
  };
}

function normalizeShipmentPayload(input, tenant) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Payload JSON invalide");
  }

  const now = new Date().toISOString();
  const tenantId = text(tenant.tenantId, MAX.slug, true);
  const companySlug = slugify(tenant.companySlug);
  const number = trackingNumber(input.trackingNumber);
  const shipmentStatus = status(input.shipment?.status);
  const packagesInput = Array.isArray(input.packages) ? input.packages : [];
  const eventsInput = Array.isArray(input.events) ? input.events : [];

  if (packagesInput.length > MAX.packages || eventsInput.length > MAX.events) {
    throw new Error("Payload trop volumineux");
  }

  const packages = packagesInput.map((item, index) => ({
    id: text(item?.id || `package-${index + 1}`, 80, true),
    label: text(item?.label || `Colis ${index + 1}`, MAX.label, true),
    quantity: positiveInteger(item?.quantity, 1),
    weightKg: positiveNumber(item?.weightKg),
    status: status(item?.status || shipmentStatus),
  }));

  const events = eventsInput
    .map((event) => ({
      id: text(event?.id || crypto.randomUUID(), 80, true),
      status: status(event?.status),
      occurredAt: isoDate(event?.occurredAt, now),
      location: text(event?.location, MAX.location),
      label: text(event?.label, MAX.label),
      note: text(event?.note, MAX.note),
    }))
    .sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));

  return {
    schemaVersion: SCHEMA_VERSION,
    tenantId,
    trackingNumber: number,
    company: {
      slug: companySlug,
      name: text(input.company?.name || tenant.companyName || companySlug, MAX.name, true),
    },
    shipment: {
      status: shipmentStatus,
      origin: text(input.shipment?.origin, MAX.location),
      destination: text(input.shipment?.destination, MAX.location),
      service: text(input.shipment?.service, 80),
      estimatedDeliveryAt: isoDate(input.shipment?.estimatedDeliveryAt),
    },
    sender: normalizeParty(input.sender),
    recipient: normalizeParty(input.recipient),
    packages,
    events,
    archived: input.archived === true,
    revoked: input.revoked === true,
    createdAt: isoDate(input.createdAt, now),
    updatedAt: now,
  };
}

function publicDocumentId(companySlug, number) {
  return `${slugify(companySlug)}_${trackingNumber(number)}`;
}

function hashApiKey(apiKey, pepper) {
  return crypto
    .createHash("sha256")
    .update(`${text(pepper, 512, true)}:${text(apiKey, 512, true)}`)
    .digest("hex");
}

function constantTimeEqual(left, right) {
  const a = Buffer.from(String(left || ""), "utf8");
  const b = Buffer.from(String(right || ""), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = {
  SCHEMA_VERSION,
  STATUSES,
  constantTimeEqual,
  hashApiKey,
  normalizeShipmentPayload,
  publicDocumentId,
  slugify,
  status,
  trackingNumber,
};
