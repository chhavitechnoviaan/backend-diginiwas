// import CreditSetting from "../models/CreditSetting.js";

// import {
//   DEFAULT_CREDIT_SETTINGS,
// } from "../config/creditPlans.js";

// export const getOrCreateCreditSettings =
//   async () => {
//     let settings =
//       await CreditSetting.findOne({
//         settingKey:
//           "GLOBAL_CREDIT_SETTING",
//       });

//     if (!settings) {
//       settings =
//         await CreditSetting.create({
//           settingKey:
//             "GLOBAL_CREDIT_SETTING",

//           creditsPerRupee:
//             DEFAULT_CREDIT_SETTINGS
//               .creditsPerRupee,

//           products:
//             DEFAULT_CREDIT_SETTINGS
//               .products,
//         });
//     }

//     return settings;
//   };

// export const getCreditSettings =
//   async () => {
//     return getOrCreateCreditSettings();
//   };

// export const getCreditProduct =
//   async (code) => {
//     const settings =
//       await getOrCreateCreditSettings();

//     const product =
//       settings.products.find(
//         (item) =>
//           item.code === code &&
//           item.isActive !== false
//       );

//     return product || null;
//   };

// export const calculateCreditsFromAmount =
//   async (amountInRupees) => {
//     const settings =
//       await getOrCreateCreditSettings();

//     const amount =
//       Number(amountInRupees);

//     if (
//       !Number.isFinite(amount) ||
//       amount <= 0
//     ) {
//       throw new Error(
//         "Invalid amount"
//       );
//     }

//     const credits =
//       Math.floor(
//         amount *
//           Number(
//             settings.creditsPerRupee ||
//               1
//           )
//       );

//     return {
//       amountInRupees: amount,

//       credits,

//       creditsPerRupee:
//         Number(
//           settings.creditsPerRupee ||
//             1
//         ),

//       settingVersion:
//         settings.version,
//     };
//   };

import CreditSetting from "../models/CreditSetting.js";
import { DEFAULT_CREDIT_SETTINGS } from "../config/creditPlans.js";

export const getOrCreateCreditSettings = async () => {
  let settings = await CreditSetting.findOne({ settingKey: "GLOBAL_CREDIT_SETTING" });
  if (!settings) {
    settings = await CreditSetting.create({
      settingKey: "GLOBAL_CREDIT_SETTING",
      creditsPerRupee: DEFAULT_CREDIT_SETTINGS.creditsPerRupee,
      products: DEFAULT_CREDIT_SETTINGS.products,
    });
  }
  return settings;
};

export const getCreditProduct = async (code) => {
  const settings = await getOrCreateCreditSettings();
  return settings.products.find((item) => item.code === code && item.isActive !== false) || null;
};

export const calculateCreditsFromAmount = async (amountInRupees) => {
  const settings = await getOrCreateCreditSettings();
  const amount = Number(amountInRupees);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount");
  return {
    amountInRupees: amount,
    credits: Math.floor(amount * Number(settings.creditsPerRupee || 1)),
    creditsPerRupee: Number(settings.creditsPerRupee || 1),
    settingVersion: settings.version,
  };
};
