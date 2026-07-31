"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  STATUSES,
  hashApiKey,
  normalizeShipmentPayload,
  publicDocumentId,
  status,
} = require("../src/shipment");

const tenant = {
  tenantId: "aaron-travel-app",
  companySlug: "aaron-travel",
  companyName: "Aaron Travel",
};

test("normalise un colis universel sans conserver les champs privés", () => {
  const result = normalizeShipmentPayload({
    trackingNumber: "colis-260730-142530-123",
    price: 999,
    internalImages: ["secret"],
    company: {},
    shipment: { status: "received", destination: "Lomé" },
    sender: { name: "Alice", address: "adresse privée" },
    recipient: { name: "Bob", city: "Lomé", phone: "0000" },
    packages: [{ label: "Carton", quantity: 2, status: "IN_TRANSIT" }],
    events: [{ status: "RECEIVED", occurredAt: "2026-07-30T10:00:00Z" }],
  }, tenant);

  assert.equal(result.schemaVersion, 1);
  assert.equal(result.trackingNumber, "COLIS-260730-142530-123");
  assert.equal(result.company.slug, "aaron-travel");
  assert.equal(result.shipment.status, "RECEIVED");
  assert.equal(result.sender.address, undefined);
  assert.equal(result.recipient.phone, undefined);
  assert.equal(result.price, undefined);
});

test("accepte uniquement les statuts stables", () => {
  for (const value of STATUSES) assert.equal(status(value), value);
  assert.throws(() => status("EXPEDIE"), /non autorisé/);
});

test("rejette un numéro et un payload invalides", () => {
  assert.throws(() => publicDocumentId("aaron-travel", "../secret"), /invalide/);
  assert.throws(
    () => normalizeShipmentPayload({ trackingNumber: "ABC", shipment: { status: "LOST" } }, tenant),
    /non autorisé/,
  );
});

test("le hash de clé est stable et salé par le pepper", () => {
  assert.equal(hashApiKey("key", "pepper"), hashApiKey("key", "pepper"));
  assert.notEqual(hashApiKey("key", "pepper"), hashApiKey("key", "other"));
});
