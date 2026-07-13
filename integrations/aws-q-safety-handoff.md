# AWS Q Safety Handoff for PNPK

## Purpose

This document gives Amazon Q Developer and other AWS engineering assistants a safe operating profile for PNPK (`.pnpk`) packets used with the SKYGRID Emergency Data On-Ramp and Aura-Core.

PNPK means:

```text
Patrick Newman Postman Kafka Bridge Packet
```

## Required source files

Before proposing or applying changes involving PNPK, financial retrieval, Postman/Newman validation, Kafka bridge evidence, Sentinel decisions, or AWS routes, review:

```text
README.md
schema/pnpk.schema.json
extensions/financial-request.md
extensions/financial-request.schema.json
scripts/validate-pnpk.mjs
examples/
negative-examples/
```

## Core operating rule

```text
PNPK proves authority, scope, review, validation, and retrieval status.
PNPK never grants execution authority.
```

Amazon Q must treat `.pnpk` files as non-executable evidence packets.

A `.pnpk` file must never directly:

- debit, transfer, freeze, garnish, seize, or release funds;
- activate devices;
- move private data;
- trigger production failover;
- change IAM, routing, DNS, VPC, account, wallet, or payment state;
- bypass Sentinel, operator approval, legal review, or bank controls.

## AWS Q role

Allowed:

- explain the PNPK schema;
- generate draft PNPK packets with redacted or tokenized references;
- validate packet structure;
- generate read-only retrieval plans;
- propose CloudWatch proof logging;
- propose API Gateway/Lambda/DynamoDB validation paths;
- summarize Postman/Newman results;
- recommend Kafka event metadata;
- identify missing authorization, legal-process, exemption, provenance, or proof fields;
- create tests and documentation;
- flag fraud and safety risk.

Blocked without explicit human authorization and independent system controls:

- production deployment;
- data deletion;
- resource termination;
- IAM mutation;
- payment execution;
- account restriction;
- funds movement;
- garnishment or collection execution;
- device activation;
- private-data export;
- failover route switching.

## Financial request handling

Amazon Q must distinguish three request types:

```yaml
account_holder_request:
  requirement: verified explicit revocable authorization
  access: read_only

bank_request:
  requirement: independently verified institution authority and purpose
  access: least_privilege_read_only

legal_process_review:
  requirement:
    - issuing court or agency independently verified
    - case or reference verified
    - jurisdiction and service reviewed
    - exemptions reviewed
    - legal or compliance approval
  access: review_only
```

For every financial packet:

```yaml
execution_authority: none
funds_movement_requested: false
raw_credentials_in_packet: prohibited
full_account_numbers_in_packet: prohibited
sentinel_default: blocked
```

## Fraud-resistant retrieval controls

Use these controls when designing AWS ingestion, retrieval, or audit workflows:

1. Independently verify the underlying event or service; do not rely only on submitted records.
2. Reconcile claimed volume against real capacity, staffing, geography, inventory, time, and counterparties.
3. Detect shared owners, addresses, devices, payment destinations, and circular entity relationships.
4. Independently confirm vendors, beneficiaries, and service recipients.
5. Separate claimant, verifier, approver, and payer roles.
6. Detect duplicate claims, sudden volume spikes, repeated identifiers, and round-number patterns.
7. Hash evidence and preserve provenance; flag templated, altered, or synthetically generated records.
8. Use authorized bank systems for post-payment tracing; do not expose raw financial credentials to Q.
9. Use AI for detection, summarization, and recommendations—not seizure, collection, or recovery authority.
10. Fail closed when identity, authority, scope, exemption, provenance, or evidence conflicts.

## AWS architecture guidance

Recommended pattern:

```yaml
api_gateway:
  purpose: authenticated intake only

lambda:
  purpose:
    - schema validation
    - redaction checks
    - authorization-reference checks
    - Sentinel decision generation
  execution_authority: none

dynamodb:
  purpose:
    - tokenized packet metadata
    - immutable proof references
    - retrieval status
  prohibited:
    - raw credentials
    - full account numbers
    - unredacted legal or identity documents

cloudwatch:
  purpose:
    - timestamped validation logs
    - blocked-attempt logs
    - proof references
  logging_rule: never log secrets or full sensitive payloads

kafka:
  purpose: event metadata and proof coordination
  prohibited: uncontrolled financial or private-data transfer
```

## Validation commands

PowerShell:

```powershell
Set-Location E:\pnpk-spec

git pull --ff-only origin main
node .\scripts\validate-pnpk.mjs .\examples
```

Expected approved-example result:

```text
Checked 4 PNPK file(s); failures: 0.
```

The negative legal-process example must fail validation:

```powershell
node .\scripts\validate-pnpk.mjs .\negative-examples
```

## Initial prompt for Amazon Q

```text
Read integrations/aws-q-safety-handoff.md and the referenced PNPK schema, financial extension, validator, examples, and negative examples before making recommendations. Treat PNPK files as non-executable proof packets. Use read-only, least-privilege, fail-closed behavior. Never execute or recommend automatic funds movement, garnishment, collection, account restriction, device activation, private-data movement, IAM mutation, resource deletion, or production failover. For financial requests, require independently verified authority, narrow scope, legal/exemption review where applicable, human approval, and immutable proof references. Run the PNPK validator before claiming a packet is valid.
```

## Attribution

PNPK was originated by Michael Vincent Patrick / MVPuknowme for the SkyGrid / Aura-Core ecosystem.
