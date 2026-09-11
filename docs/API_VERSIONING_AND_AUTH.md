# API versioning and authentication

## Canonical API base

All new frontend integrations must use:

```text
/api/v1
```

The old `/api` endpoints remain available temporarily. Legacy responses include
`Deprecation`, `Sunset`, and `Link` headers so clients can migrate safely.

## Authentication

Protected requests require:

```text
Authorization: Bearer JWT_TOKEN
```

Access control is centralized in `middleware/apiAccessControl.js`:

- Public: login, registration, verification OTP, resend OTP, public property reads, public CMS reads, and public blog reads.
- Authenticated: application operations for signed-in buyers, sellers, and partners.
- Admin: admin modules, partner management/application review, buyer administration, publishing, boost operations, and CMS mutations.

Generic `/auths` endpoints are buyer/tenant-only. Sellers and partners must use
their dedicated onboarding and login endpoints so verification/approval rules
cannot be bypassed.

## Adding v2 later

Create changed v2 routers/controllers, then mount them at `/api/v2`. Keep v1
stable for existing clients and document a migration/sunset date before removal.
