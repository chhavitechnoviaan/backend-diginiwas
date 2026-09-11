// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT || 587),
//   secure: String(process.env.SMTP_SECURE || "false") === "true",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// console.log(
//   "SMTP HOST:",
//   process.env.SMTP_HOST
// );

// console.log(
//   "SMTP USER:",
//   process.env.SMTP_USER
// );

// console.log(
//   "SMTP PASS LENGTH:",
//   process.env.SMTP_PASS
//     ?.trim()
//     .length
// );
// const from =
//   process.env.MAIL_FROM ||
//   `"DigiNiwas" <${process.env.SMTP_USER}>`;

// export const sendSellerEmailOtp = async ({
//   to,
//   name,
//   otp,
// }) => {
//   await transporter.sendMail({
//     from,
//     to,
//     subject: "Verify your DigiNiwas seller email",
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#173247">
//         <div style="background:#1F3C50;color:white;padding:22px;border-radius:14px 14px 0 0">
//           <h2 style="margin:0">DigiNiwas Seller Verification</h2>
//         </div>
//         <div style="border:1px solid #DCE5E9;border-top:none;padding:24px;border-radius:0 0 14px 14px">
//           <p>Hi ${name || "Seller"},</p>
//           <p>Use this OTP to verify your email address:</p>
//           <div style="font-size:28px;font-weight:700;letter-spacing:7px;color:#15966F;margin:22px 0">
//             ${otp}
//           </div>
//           <p>This OTP expires in 10 minutes.</p>
//           <p style="font-size:12px;color:#718096">Do not share this OTP with anyone.</p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendSellerApprovalCredentials = async ({
//   to,
//   name,
//   sellerId,
//   temporaryPassword,
// }) => {
//   await transporter.sendMail({
//     from,
//     to,
//     subject: "Your DigiNiwas seller account has been approved",
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#173247">
//         <div style="background:#1F3C50;color:white;padding:22px;border-radius:14px 14px 0 0">
//           <h2 style="margin:0">Seller Account Approved</h2>
//         </div>

//         <div style="border:1px solid #DCE5E9;border-top:none;padding:24px;border-radius:0 0 14px 14px">
//           <p>Hi ${name},</p>
//           <p>Your DigiNiwas Seller account has been approved by Admin.</p>

//           <div style="background:#EAF9F4;padding:16px;border-radius:12px;margin:20px 0">
//             <p style="margin:0 0 8px"><strong>Seller ID:</strong> ${sellerId}</p>
//             <p style="margin:0 0 8px"><strong>Login Email:</strong> ${to}</p>
//             <p style="margin:0"><strong>Temporary Password:</strong> ${temporaryPassword}</p>
//           </div>

//           <p>You must change this temporary password after your first login.</p>
//           <p style="font-size:12px;color:#718096">
//             DigiNiwas will never ask you to share your password or OTP.
//           </p>
//         </div>
//       </div>
//     `,
//   });
// };

// export const sendSellerApplicationRejectedEmail = async ({
//   to,
//   name,
//   remarks,
//   actionRequired = false,
// }) => {
//   await transporter.sendMail({
//     from,
//     to,
//     subject: actionRequired
//       ? "Action required on your DigiNiwas seller application"
//       : "Update on your DigiNiwas seller application",
//     html: `
//       <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#173247">
//         <h2>${actionRequired ? "Action Required" : "Application Update"}</h2>
//         <p>Hi ${name},</p>
//         <p>${
//           actionRequired
//             ? "Admin needs additional information or a correction before your application can be approved."
//             : "Your seller application could not be approved."
//         }</p>
//         <p><strong>Admin remarks:</strong> ${remarks || "No remarks provided."}</p>
//       </div>
//     `,
//   });
// };


import nodemailer from "nodemailer";

const transporter =
  nodemailer.createTransport({
    host:
      process.env.SMTP_HOST,

    port: Number(
      process.env.SMTP_PORT ||
        587
    ),

    secure:
      String(
        process.env.SMTP_SECURE ||
          "false"
      ) === "true",

    auth: {
      user:
        process.env.SMTP_USER
          ?.trim(),

      pass:
        process.env.SMTP_PASS
          ?.replace(/\s/g, ""),
    },
  });

// ======================================================
// SMTP DEBUG
// ======================================================

console.log(
  "SMTP HOST:",
  process.env.SMTP_HOST
);

console.log(
  "SMTP USER:",
  process.env.SMTP_USER
);

console.log(
  "SMTP PASS LENGTH:",
  process.env.SMTP_PASS
    ?.replace(/\s/g, "")
    .length
);

const from =
  process.env.MAIL_FROM ||
  `"DigiNiwas" <${process.env.SMTP_USER}>`;


// ======================================================
// SELLER REGISTRATION EMAIL OTP
// ======================================================

export const sendSellerEmailOtp =
  async ({
    to,
    name,
    otp,
  }) => {
    if (!to || !String(to).trim()) {
      throw new Error("Seller email OTP recipient is required");
    }

    await transporter.sendMail({
      from,

      to,

      subject:
        "Verify your DigiNiwas seller email",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: auto;
            color: #173247;
          "
        >
          <div
            style="
              background: #1F3C50;
              color: white;
              padding: 22px;
              border-radius: 14px 14px 0 0;
            "
          >
            <h2 style="margin: 0;">
              DigiNiwas Seller Verification
            </h2>
          </div>

          <div
            style="
              border: 1px solid #DCE5E9;
              border-top: none;
              padding: 24px;
              border-radius: 0 0 14px 14px;
            "
          >
            <p>
              Hi ${name || "Seller"},
            </p>

            <p>
              Use this OTP to verify
              your email address:
            </p>

            <div
              style="
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 7px;
                color: #15966F;
                margin: 22px 0;
              "
            >
              ${otp}
            </div>

            <p>
              This OTP expires
              in 10 minutes.
            </p>

            <p
              style="
                font-size: 12px;
                color: #718096;
              "
            >
              Do not share this OTP
              with anyone.
            </p>
          </div>
        </div>
      `,
    });
  };


// ======================================================
// SELLER LOGIN EMAIL OTP
// ======================================================

export const sendSellerLoginOtpEmail =
  async ({
    to,
    name,
    otp,
  }) => {
    await transporter.sendMail({
      from,

      to,

      subject:
        "Your DigiNiwas Seller Login OTP",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: auto;
            color: #173247;
          "
        >
          <div
            style="
              background: #1F3C50;
              color: white;
              padding: 22px;
              border-radius: 14px 14px 0 0;
            "
          >
            <h2 style="margin: 0;">
              DigiNiwas Seller Login
            </h2>
          </div>

          <div
            style="
              border: 1px solid #DCE5E9;
              border-top: none;
              padding: 24px;
              border-radius: 0 0 14px 14px;
            "
          >
            <p>
              Hi ${name || "Seller"},
            </p>

            <p>
              We received a request
              to login to your
              DigiNiwas Seller account.
            </p>

            <p>
              Use the OTP below
              to complete your login:
            </p>

            <div
              style="
                background: #EAF9F4;
                border-radius: 12px;
                padding: 18px;
                margin: 22px 0;
                text-align: center;
              "
            >
              <div
                style="
                  font-size: 30px;
                  font-weight: 700;
                  letter-spacing: 8px;
                  color: #15966F;
                "
              >
                ${otp}
              </div>
            </div>

            <p>
              This login OTP expires
              in 10 minutes.
            </p>

            <p
              style="
                font-size: 12px;
                color: #718096;
              "
            >
              If you did not request
              this login OTP,
              please ignore this email.
            </p>

            <p
              style="
                font-size: 12px;
                color: #718096;
              "
            >
              DigiNiwas will never ask
              you to share your OTP
              or password.
            </p>
          </div>
        </div>
      `,
    });
  };


// ======================================================
// SELLER APPROVAL CREDENTIAL EMAIL
// ======================================================

export const sendSellerApprovalCredentials =
  async ({
    to,
    name,
    sellerId,
    temporaryPassword,
  }) => {
    if (!to || !String(to).trim()) {
      throw new Error("Seller credentials email recipient is required");
    }

    await transporter.sendMail({
      from,

      to,

      subject:
        "Your DigiNiwas seller account is ready",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            color: #173247;
          "
        >
          <div
            style="
              background: #1F3C50;
              color: white;
              padding: 22px;
              border-radius: 14px 14px 0 0;
            "
          >
            <h2 style="margin: 0;">
              Seller Account Created
            </h2>
          </div>

          <div
            style="
              border: 1px solid #DCE5E9;
              border-top: none;
              padding: 24px;
              border-radius: 0 0 14px 14px;
            "
          >
            <p>
              Hi ${name},
            </p>

            <p>
              Your DigiNiwas Seller account
              is now active after successful email and phone verification.
            </p>

            <div
              style="
                background: #EAF9F4;
                padding: 16px;
                border-radius: 12px;
                margin: 20px 0;
              "
            >
              <p
                style="
                  margin: 0 0 8px;
                "
              >
                <strong>
                  Seller ID:
                </strong>

                ${sellerId}
              </p>

              <p
                style="
                  margin: 0 0 8px;
                "
              >
                <strong>
                  Login Email:
                </strong>

                ${to}
              </p>

              <p style="margin: 0;">
                <strong>
                  Temporary Password:
                </strong>

                ${temporaryPassword}
              </p>
            </div>

            <p>
              You must change this
              temporary password
              after your first login.
            </p>

            <p
              style="
                font-size: 12px;
                color: #718096;
              "
            >
              DigiNiwas will never ask
              you to share your password
              or OTP.
            </p>
          </div>
        </div>
      `,
    });
  };


// ======================================================
// SELLER REJECTED / ACTION REQUIRED EMAIL
// ======================================================

export const sendSellerApplicationRejectedEmail =
  async ({
    to,
    name,
    remarks,
    actionRequired = false,
  }) => {
    await transporter.sendMail({
      from,

      to,

      subject:
        actionRequired
          ? "Action required on your DigiNiwas seller application"
          : "Update on your DigiNiwas seller application",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: auto;
            color: #173247;
          "
        >
          <div
            style="
              background: #1F3C50;
              color: white;
              padding: 22px;
              border-radius: 14px 14px 0 0;
            "
          >
            <h2 style="margin: 0;">
              ${
                actionRequired
                  ? "Action Required"
                  : "Application Update"
              }
            </h2>
          </div>

          <div
            style="
              border: 1px solid #DCE5E9;
              border-top: none;
              padding: 24px;
              border-radius: 0 0 14px 14px;
            "
          >
            <p>
              Hi ${name},
            </p>

            <p>
              ${
                actionRequired
                  ? "Admin needs additional information or a correction before your application can be approved."
                  : "Your seller application could not be approved."
              }
            </p>

            <div
              style="
                background: #F8FAFB;
                padding: 14px;
                border-radius: 10px;
              "
            >
              <strong>
                Admin remarks:
              </strong>

              ${remarks || "No remarks provided."}
            </div>
          </div>
        </div>
      `,
    });
  };


// ======================================================
// VERIFY SMTP
// ======================================================

export const verifySellerMailer =
  async () => {
    try {
      await transporter.verify();

      console.log(
        "SELLER SMTP READY"
      );

      return true;
    } catch (error) {
      console.error(
        "SELLER SMTP ERROR:",
        error
      );

      return false;
    }
  };
