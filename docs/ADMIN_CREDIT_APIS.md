# Admin Credit APIs

Base URL: `/api/credits`

All endpoints below require an admin JWT:

```http
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json
```

`partnerId` accepts either the MongoDB `_id` or DigiNiwas partner code such as
`PRT-26369681`. Sub-Agent accounts do not own an independent wallet; use their
Team/Agency Owner for wallet adjustments.

## 1. Withdraw credits

`POST /admin/withdraw`

```json
{
  "partnerId": "PRT-26369681",
  "credits": 25,
  "reason": "DigiNiwas deducted 25 credits for maintenance",
  "idempotencyKey": "maintenance-2026-09-PRT-26369681"
}
```

The request fails when the wallet does not have enough credits. `reason` is
saved as the transaction description and `metadata.userVisibleReason`, so the
same text can be shown in the partner app.

## 2. Add credits to one account

`POST /admin/add`

Cash/offline payment (added to paid balance):

```json
{
  "partnerId": "PRT-26369681",
  "credits": 250,
  "source": "CASH_PAYMENT",
  "amountInRupees": 500,
  "reason": "Cash payment received at DigiNiwas office",
  "idempotencyKey": "cash-receipt-1042"
}
```

Free/manual benefit (added to promotional balance):

```json
{
  "partnerId": "PRT-26369681",
  "credits": 100,
  "source": "PROMOTIONAL",
  "reason": "Diwali bonus from DigiNiwas",
  "idempotencyKey": "diwali-2026-PRT-26369681"
}
```

## 3. Add free credits to selected accounts

`POST /admin/bulk-add`

```json
{
  "partnerIds": ["PRT-26369681", "PRT-71145981"],
  "credits": 100,
  "reason": "Diwali bonus from DigiNiwas",
  "idempotencyKey": "diwali-2026-selected"
}
```

## 4. Add free credits to every wallet owner

`POST /admin/bulk-add`

```json
{
  "allPartners": true,
  "credits": 100,
  "reason": "DigiNiwas festive bonus",
  "idempotencyKey": "festive-bonus-2026"
}
```

Bulk credits are always promotional/free credits and never create a payment.
The response contains successful and failed account counts plus a result for
each partner. A maximum of 1,000 wallet owners can be processed in one request.

Always send a unique `idempotencyKey` for retry-safe admin actions. Reusing the
same key prevents the same account from being credited or debited twice.
# Important: Synchronize Existing Team Wallet Balances

Team/Agency owner credits are stored in `TeamWallet`. The updated wallet
service now mirrors every new team credit/debit into the owner's
`Partner.creditWallet`, so the Wallet & Credit Management partner table and
the partner profile show the same current balance.

After deploying this update, call the following endpoint **once** to copy old
TeamWallet balances (for example Amit Verma's existing 197 credits) into the
corresponding partner `creditWallet` fields:

```http
POST /api/credits/admin/sync-wallets
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json
```

No request body is required.

Example response:

```json
{
  "success": true,
  "message": "1 team wallet(s) synchronized with partner creditWallet.",
  "data": {
    "processed": 1,
    "updated": 1
  }
}
```
