# PNPK Financial Request Extension

## Purpose

The PNPK Financial Request Extension provides a non-executable proof format for lawful, consent-based financial information requests and legal-process review.

It is designed for:

- account holders requesting access to or export of their own records;
- financial institutions responding to authenticated customer requests;
- banks documenting authorized retrieval or review workflows;
- regulated legal-process teams documenting receipt and verification of court or agency process;
- fraud-recovery teams preserving evidence and retrieval status without moving funds.

## Core rule

```text
A PNPK financial packet may prove authority, scope, review, and retrieval status.
It may never debit, transfer, freeze, garnish, seize, or release funds by itself.
```

## Request types

### `account_holder_request`

Use when the verified account holder asks for their own financial information.

Required controls:

- strong identity verification performed by the bank or authorized provider;
- explicit, revocable authorization;
- narrow purpose and date range;
- data-minimization and retention limits;
- no raw credentials, full account numbers, or authentication secrets in the packet;
- retrieval only; no funds movement.

### `bank_request`

Use when a regulated financial institution requests evidence or records within its lawful authority.

Required controls:

- institution identity and authority independently verified;
- named purpose and legal/compliance basis;
- least-privilege scope;
- dual-control or reviewer approval for sensitive retrieval;
- immutable audit reference;
- no payment or account-control authority conveyed by the PNPK packet.

### `legal_process_review`

Use to document review of a subpoena, garnishment order, levy, judgment, warrant, restitution order, or other legal process.

Required controls:

- independently verify the issuing court or agency;
- verify case/reference number and current validity;
- verify service and jurisdiction;
- review federal and state exemptions;
- preserve notice and challenge/appeal status where applicable;
- require authorized legal/compliance approval;
- PNPK records the review but never executes the seizure or transfer.

## Important legal distinction

Ordinary consumer debt collectors generally cannot simply take money from an account because they know the account details. Garnishment commonly requires a lawsuit, judgment, and court order, but exceptions and special processes can apply to taxes, child support, federal student loans, government debts, restitution, and other categories. Laws vary by jurisdiction.

Federal benefits can have additional protections. Banks may be required to identify and protect certain directly deposited federal benefits when processing a garnishment order.

This specification is an engineering control framework, not legal advice. Implementers must obtain jurisdiction-specific legal review.

## Required financial object

```json
{
  "financial_request": {
    "request_type": "account_holder_request",
    "jurisdiction": "US-OR",
    "purpose": "Export the account holder's posted transaction history",
    "scope": {
      "data_types": ["transactions"],
      "date_from": "2026-01-01",
      "date_to": "2026-06-30",
      "account_reference": "tokenized-or-hashed-reference"
    },
    "authorization": {
      "status": "verified",
      "method_reference": "bank-controlled-verification-reference",
      "granted_at": "2026-07-13T20:45:00Z",
      "expires_at": "2026-07-14T20:45:00Z",
      "revocable": true
    },
    "legal_process": {
      "document_present": false,
      "validity_status": "not_applicable",
      "exemptions_reviewed": false
    },
    "execution_authority": "none",
    "funds_movement_requested": false,
    "retrieval_status": "approved_for_read_only_retrieval"
  }
}
```

## Minnesota fraud-control lessons

The Feeding Our Future prosecutions described fraudulent claims supported by fabricated attendance rosters, random names and ages, false invoices, shell companies, kickbacks, and money laundering. PNPK financial implementations should therefore require:

1. **Independent event verification** — do not rely only on submitted records.
2. **Capacity reconciliation** — claimed volume must fit real facilities, staffing, customers, inventory, time, and geography.
3. **Entity-network checks** — detect shared owners, addresses, devices, bank destinations, and circular relationships.
4. **Counterparty verification** — independently confirm vendors, beneficiaries, and service recipients.
5. **Separation of duties** — claimant, verifier, approver, and payer must not collapse into one role.
6. **Duplicate and velocity controls** — detect repeated claims, sudden volume growth, and round-number patterns.
7. **Source-document integrity** — hash evidence, preserve provenance, and flag templated or synthetically generated records.
8. **Post-payment tracing** — monitor rapid pass-through, fan-out, unusual real-estate purchases, foreign transfers, and related-party payments through authorized bank controls.
9. **Human legal review** — AI may score risk and summarize evidence but must not authorize seizure, garnishment, or recovery.
10. **Fail closed** — conflicting identity, authority, scope, or exemption evidence blocks the workflow.

## Retrieval-security model

```yaml
retrieval_security:
  default: blocked
  access: read_only
  identity_verification: external_authoritative_provider
  authorization: explicit_and_scoped
  dual_control: required_for_sensitive_or_legal_process
  data_minimization: required
  raw_credentials_in_packet: prohibited
  full_account_numbers_in_packet: prohibited
  funds_movement: prohibited
  ai_role: detect_summarize_recommend
  human_role: approve_legal_and_operational_actions
  audit: immutable_reference_required
```
