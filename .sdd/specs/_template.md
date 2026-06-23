# Feature Spec Template

Version: 0.2.0
Status: DRAFT
Last Updated: 2026-06-23

Use this template for new feature specs under:

```text
.sdd/specs/feature-{name}/
```

Recommended files:

- `SPEC.md`
- `PLAN.md`
- `TASKS.md`
- `CONTEXT.md`
- `CHANGELOG.md`

## 1. SPEC.md Template

```markdown
# SPEC.md - FE{NN} {Feature Name}

Version: 0.1.0
Status: DRAFT
Owner:
Last Updated: YYYY-MM-DD
Feature ID: FE{NN}
Feature folder: `.sdd/specs/feature-{name}/`

Business context (short):

---

## 1. Feature Overview

### 1.1 Feature Name

### 1.2 Business Context

Explain why this feature matters to the pickleball booking business.

### 1.3 Goal / Outcome

The system will:

- Outcome 1
- Outcome 2
- Outcome 3

### 1.4 Scope Level

- [ ] Full Spec - core business/security/financial/concurrency risk
- [ ] Standard Spec
- [ ] Light Spec

---

## 2. Actors and Permissions

| Actor | Description | Permission / Responsibility |
| --- | --- | --- |
| Guest | | |
| Customer | | |
| Staff | | |
| Owner | | |
| Admin | | |

---

## 3. Preconditions

- PRE-FE{NN}-001:
- PRE-FE{NN}-002:
- PRE-FE{NN}-003:

---

## 4. Main Flows

### MF-FE{NN}-001: Main Flow Name

1.
2.
3.

### MF-FE{NN}-002: Main Flow Name

1.
2.
3.

---

## 5. Alternative Flows

| ID | Alternative Flow |
| --- | --- |
| AF-FE{NN}-001 | |
| AF-FE{NN}-002 | |

---

## 6. Business Rules

- BR-FE{NN}-001:
- BR-FE{NN}-002:
- BR-FE{NN}-003:

---

## 7. Functional Requirements

- FR-FE{NN}-001: When ..., the system shall ...
- FR-FE{NN}-002: If ..., then the system shall ...

---

## 8. Acceptance Criteria

- AC-FE{NN}-001: Given ..., when ..., then ...
- AC-FE{NN}-002: Given ..., when ..., then ...

---

## 9. Edge Cases and Error Handling

| ID | Edge Case / Error | Expected System Behavior |
| --- | --- | --- |
| EC-FE{NN}-001 | | |
| EC-FE{NN}-002 | | |

---

## 10. Data Requirements

### 10.1 Entities Involved

| Entity | Purpose in this feature |
| --- | --- |
| `table_name` | |

### 10.2 Data Fields

| Field | Type | Required | Validation / Notes |
| --- | --- | --- | --- |
| | | | |

### 10.3 Data Integrity Rules

- DIR-FE{NN}-001:
- DIR-FE{NN}-002:

---

## 11. API / Interface Contract

| Method | Endpoint | Actor | Request | Response | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/...` | | | | |
| POST | `/api/...` | | | | |

### 11.1 Response Shape

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

---

## 12. UI/UX Expectations

- UI-FE{NN}-001:
- UI-FE{NN}-002:

---

## 13. Security and Safety

- SEC-FE{NN}-001:
- SEC-FE{NN}-002:
- SEC-FE{NN}-003:

Cross-check:

- `.sdd/constraints/safety.md`
- `.sdd/constraints/business.md`
- `.sdd/constraints/global.md`

---

## 14. Performance / Reliability

- NFR-FE{NN}-001:
- NFR-FE{NN}-002:

---

## 15. Logging / Audit / Notification

- LOG-FE{NN}-001:
- AUD-FE{NN}-001:
- NOTIF-FE{NN}-001:

---

## 16. Dependencies

| Dependency | Type | Notes |
| --- | --- | --- |
| FE01 Auth | Feature | |
| Table name | Database | |

---

## 17. Open Questions

| ID | Question | Owner | Status | Resolution |
| --- | --- | --- | --- | --- |
| Q-FE{NN}-001 | | | Open | |

---

## 18. Traceability

| Requirement | Acceptance Criteria | Task |
| --- | --- | --- |
| FR-FE{NN}-001 | AC-FE{NN}-001 | T-FE{NN}-001 |
```

## 2. PLAN.md Template

```markdown
# PLAN.md - FE{NN} {Feature Name}

Version: 0.1.0
Status: DRAFT
Last Updated: YYYY-MM-DD

## 1. Goal

## 2. Scope

### In Scope

### Out Of Scope

## 3. Dependencies

| Dependency | Needed For | Status |
| --- | --- | --- |
| | | |

## 4. Implementation Strategy

### 4.1 Backend

### 4.2 Frontend

### 4.3 Database

### 4.4 Tests / Verification

## 5. Step Plan

| Step | Description | Owner | Output |
| --- | --- | --- | --- |
| 1 | | | |

## 6. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| | | |

## 7. Rollback / Recovery

## 8. Verification Checklist

- [ ] Spec requirements satisfied
- [ ] API behavior verified
- [ ] UI behavior verified
- [ ] Role/security behavior verified
- [ ] Database behavior verified
- [ ] Changelog updated
```

## 3. TASKS.md Template

```markdown
# TASKS.md - FE{NN} {Feature Name}

Version: 0.1.0
Status: DRAFT
Last Updated: YYYY-MM-DD

## Backend

- [ ] T-FE{NN}-001:
- [ ] T-FE{NN}-002:

## Frontend

- [ ] T-FE{NN}-101:
- [ ] T-FE{NN}-102:

## Database

- [ ] T-FE{NN}-201:

## Tests / Verification

- [ ] T-FE{NN}-301:

## Documentation

- [ ] T-FE{NN}-401:

## Done Criteria

- [ ] All acceptance criteria have matching implementation or documented deferral.
- [ ] Role and safety rules reviewed.
- [ ] No unrelated domain requirements imported.
- [ ] `CHANGELOG.md` updated.
```

## 4. CONTEXT.md Template

```markdown
# CONTEXT.md - FE{NN} {Feature Name}

## 1. Background

## 2. Related Files

| Path | Why It Matters |
| --- | --- |
| | |

## 3. Related Database Tables

## 4. Related API Endpoints

## 5. Related Specs

## 6. Notes For Implementers
```

## 5. CHANGELOG.md Template

```markdown
# CHANGELOG.md - FE{NN} {Feature Name}

## YYYY-MM-DD

### Added

- Initial draft.

### Changed

### Fixed

### Deferred
```
