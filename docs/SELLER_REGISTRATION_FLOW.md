# Seller self-registration flow

Base URL: `http://localhost:5000/api/sellers`

The seller flow no longer requires Aadhaar, PAN, document upload, or admin approval.

## 1. Register seller

`POST /applications/register`

Header: `Content-Type: application/json`

```json
{
  "name": "Rahul Verma",
  "email": "rahul.seller02@gmail.com",
  "phone": "9876543211",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "country": "India",
  "address": "Scheme No. 54, Indore",
  "pinCode": "452010",
  "latitude": 22.751,
  "longitude": 75.895
}
```

Copy `data.applicationId` from the response.

## 2. Verify email OTP

`POST /applications/verify-email`

```json
{
  "applicationId": "PASTE_APPLICATION_ID",
  "otp": "123456"
}
```

After successful email verification, the phone OTP is sent.

## 3. Verify phone OTP

`POST /applications/verify-phone`

```json
{
  "applicationId": "PASTE_APPLICATION_ID",
  "otp": "123456"
}
```

After successful phone verification, the account is activated automatically and the seller ID and temporary password are emailed to the seller.

## Resend phone OTP

`POST /applications/resend-phone-otp`

```json
{
  "applicationId": "PASTE_APPLICATION_ID"
}
```

For the current testing flow, the generated phone OTP is included in `data.otp` in the successful response.

## 4. Seller login

`POST /auth/login`

```json
{
  "email": "rahul.seller02@gmail.com",
  "password": "TEMPORARY_PASSWORD_FROM_EMAIL"
}
```

The partner registration and admin approval flow is unchanged.
