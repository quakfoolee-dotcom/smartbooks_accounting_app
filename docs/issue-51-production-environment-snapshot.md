# Issue 51 Production Environment Snapshot

Date: 2026-06-28

## Goal

Document the production environment setup required before backend persistence or database storage is enabled by default.

## Before And After

| Area | Before | After |
| --- | --- | --- |
| Environment variables | Runtime knobs were discoverable only by reading `backend/src/server.js` and frontend startup code. | `docs/production-backend-environment.md` now lists `PORT`, `SMARTBOOKS_DATA_DIR`, and frontend backend-mode configuration. |
| Deployment guidance | README noted that a real backend host and environment configuration were still needed, but did not explain the required shape. | README links to a dedicated setup guide covering hosting, HTTPS, storage, backups, secrets, logs, and monitoring. |
| Production safety boundary | Persistence contract and hardening docs warned that backend mode was not production-ready. | The setup guide states what is currently supported and explicitly lists gaps that still block real customer data. |
| Operational response | Save, backup, restore, and revision-conflict response steps were spread across contract language. | A short runbook now gives operator actions for backend startup, save failure, revision conflict, backup failure, and restore failure. |
| Documentation links | No direct environment setup doc existed. | Persistence contract and production hardening plan link to the setup guide. |

## Documentation Changes

| File | Change |
| --- | --- |
| `docs/production-backend-environment.md` | Added the production setup guide for backend persistence. |
| `docs/persistence-contract.md` | Linked the setup guide from the security notes. |
| `docs/production-persistence-hardening.md` | Linked the setup guide from the production default definition of done. |
| `README.md` | Added a production backend setup pointer in the data/security area. |

## QC Results

| Check | Result |
| --- | --- |
| Documentation link check | Passed: `npm run docs:check` |
| Project syntax/docs check | Passed: `npm run check` |

## Follow-Up

This closes the documentation gap for production environment setup. Remaining production work is still tracked by the persistence roadmap: authenticated identity, role-aware authorization, durable audit logging, database adapter work, rate limiting, encryption policy, and production monitoring.

