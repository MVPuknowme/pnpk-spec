#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";

const REQUIRED_TOP_LEVEL = [
  "pnpk_version",
  "packet_type",
  "service",
  "created_at",
  "sentinel",
  "execution"
];

const ALLOWED_SENTINEL_DECISIONS = new Set([
  "ready",
  "allowed",
  "blocked",
  "pending",
  "unsafe"
]);

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function validatePacket(packet, filePath) {
  const errors = [];

  assert(packet && typeof packet === "object" && !Array.isArray(packet), "root must be an object", errors);
  for (const key of REQUIRED_TOP_LEVEL) {
    assert(Object.hasOwn(packet, key), `missing required field: ${key}`, errors);
  }

  assert(typeof packet.pnpk_version === "string", "pnpk_version must be a string", errors);
  assert(typeof packet.packet_type === "string", "packet_type must be a string", errors);
  assert(typeof packet.service === "string", "service must be a string", errors);
  assert(!Number.isNaN(Date.parse(packet.created_at)), "created_at must be an ISO-compatible date-time", errors);

  const sentinel = packet.sentinel ?? {};
  assert(typeof sentinel === "object" && !Array.isArray(sentinel), "sentinel must be an object", errors);
  assert(ALLOWED_SENTINEL_DECISIONS.has(sentinel.decision), "sentinel.decision is invalid", errors);

  const execution = packet.execution ?? {};
  assert(typeof execution === "object" && !Array.isArray(execution), "execution must be an object", errors);
  assert(execution.executable === false, "execution.executable must be false", errors);
  assert(execution.payments_executed === false, "execution.payments_executed must be false", errors);
  assert(execution.devices_activated === false, "execution.devices_activated must be false", errors);
  assert(execution.private_data_moved === false, "execution.private_data_moved must be false", errors);
  assert(execution.production_failover_triggered !== true, "production failover must not be triggered by a PNPK packet", errors);

  if (packet.financial_request) {
    validateFinancialRequest(packet.financial_request, errors);
  }

  return { filePath, errors };
}

function validateFinancialRequest(financial, errors) {
  assert(financial && typeof financial === "object" && !Array.isArray(financial), "financial_request must be an object", errors);
  assert(["account_holder_request", "bank_request", "legal_process_review"].includes(financial.request_type), "financial_request.request_type is invalid", errors);
  assert(financial.execution_authority === "none", "financial_request.execution_authority must be none", errors);
  assert(financial.funds_movement_requested === false, "financial_request.funds_movement_requested must be false", errors);
  assert(typeof financial.jurisdiction === "string" && financial.jurisdiction.length > 0, "financial_request.jurisdiction is required", errors);

  const authorization = financial.authorization ?? {};
  assert(typeof authorization.status === "string", "financial_request.authorization.status is required", errors);
  assert(["verified", "pending", "rejected", "not_applicable"].includes(authorization.status), "financial_request.authorization.status is invalid", errors);

  if (financial.request_type === "account_holder_request") {
    assert(authorization.status === "verified", "account-holder requests require verified authorization", errors);
  }

  if (financial.request_type === "legal_process_review") {
    const legal = financial.legal_process ?? {};
    assert(legal.document_present === true, "legal process review requires document_present=true", errors);
    assert(typeof legal.court_or_agency === "string" && legal.court_or_agency.length > 0, "legal process review requires court_or_agency", errors);
    assert(typeof legal.case_or_reference === "string" && legal.case_or_reference.length > 0, "legal process review requires case_or_reference", errors);
    assert(legal.validity_status === "verified", "legal process must be independently verified", errors);
    assert(legal.exemptions_reviewed === true, "legal exemptions must be reviewed", errors);
  }
}

async function collectPnpkFiles(inputPath) {
  const absolute = resolve(inputPath);
  const info = await stat(absolute);
  if (info.isFile()) return [absolute];

  const files = [];
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const child = resolve(absolute, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectPnpkFiles(child));
    } else if (entry.isFile() && extname(entry.name) === ".pnpk") {
      files.push(child);
    }
  }
  return files;
}

async function main() {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) inputs.push("examples");

  const files = [];
  for (const input of inputs) files.push(...await collectPnpkFiles(input));

  if (files.length === 0) {
    console.error("No .pnpk files found.");
    process.exit(1);
  }

  let failures = 0;
  for (const file of files) {
    try {
      const packet = JSON.parse(await readFile(file, "utf8"));
      const { errors } = validatePacket(packet, file);
      if (errors.length === 0) {
        console.log(`PASS ${file}`);
      } else {
        failures += 1;
        console.error(`FAIL ${file}`);
        for (const error of errors) console.error(`  - ${error}`);
      }
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${file}`);
      console.error(`  - ${error.message}`);
    }
  }

  console.log(`\nChecked ${files.length} PNPK file(s); failures: ${failures}.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
