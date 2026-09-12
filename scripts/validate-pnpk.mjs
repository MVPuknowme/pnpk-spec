#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";

const REQUIRED_TOP_LEVEL = [
  "pnpk_version",
  "packet_type",
  "service",
  "created_at",
  "

function validatePacket(packet, filePath) {
  const errors = [];

  
  assert(typeof packet.pnpk_version === "string", "pnpk_version must be a string", errors)

  const execution = packet.execution ?? {};
  assert(typeof execution === "object" && !Array.isArray(execution), "execution must be an object", errors);
  assert(execution.executable === false, "execution.executable must be false", errors);
  assert(execution.payments_executed === false, "execution.payments_executed must be false", errors);
  assert(execution.devices_activated === false, "execution.devices_activated must be false", errors);
  assert(execution.private_data_moved === false, "execution.private_data_moved must be false", errors);
  assert(execution.production_failover_triggered !== true, "production failover must not be triggered by a PNPK packet", 
  
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
