# Partner Registration and Verification Flow

## 1. Create application

`POST /api/partner-applications/register`

After MongoDB saves the application, the API returns HTTP `201` with `mongoId`, `email`, `phone`, delivery state and the next endpoint. Only the email OTP is sent at this stage.

```json
{
  "success": true,
  "message": "Partner application created successfully. Please verify your email first, then verify your phone.",
  "data": {
    "mongoId": "68c2a19d6a08b92b91c01234",
    "applicationId": "68c2a19d6a08b92b91c01234",
    "partnerId": "PRT-12345678",
    "name": "Rahul Sharma",
    "email": "demo@gmail.com",
    "phone": "9876583243",
    "accountType": "single",
    "applicationStatus": "Pending_Email_Verification",
    "emailOtpSent": true,
    "nextStep": "VERIFY_EMAIL",
    "nextApi": "PATCH /api/partner-applications/68c2a19d6a08b92b91c01234/verify-email",
    "verificationOrder": ["VERIFY_EMAIL", "VERIFY_PHONE"]
  }
}
```

## 2. Verify email

`PATCH /api/partner-applications/:mongoId/verify-email`

```json
{ "otp": "123456" }
```

After successful email verification, the backend generates and sends the phone OTP. Response `nextStep` becomes `VERIFY_PHONE`.

## 3. Verify phone

`PATCH /api/partner-applications/:mongoId/verify-phone`

```json
{ "otp": "654321" }
```

Phone verification is rejected until email is verified. After both channels are verified, application status becomes `Submitted` and `nextStep` becomes `ADMIN_REVIEW`.

## Resend OTP

`POST /api/partner-applications/:mongoId/resend-otp`

```json
{ "channel": "email" }
```

Use `phone` only after email verification. OTP values are never returned in API responses.
