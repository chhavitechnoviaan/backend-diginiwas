

// export const CREDIT_PRODUCT_CODES = {
//   LEAD_UNLOCK: "LEAD_UNLOCK",

//   PARTNER_BOOST: "PARTNER_BOOST",

//   // Existing code ko preserve kiya hai
//   // taaki existing dashboards break na hon.
//   PROPERTY_BOOST: "PROPERTY_BOOST",

//   PARTNER_FEATURED: "PARTNER_FEATURED",
//   FEATURED_7_DAYS: "FEATURED_7_DAYS",

//   PARTNER_LOCALITY_TOP: "PARTNER_LOCALITY_TOP",
//   LOCALITY_TOP_30_DAYS: "LOCALITY_TOP_30_DAYS",
// };

// export const DEFAULT_CREDIT_SETTINGS = {
//   creditsPerRupee: 1,

//   products: [
//     {
//       code: "LEAD_UNLOCK",
//       label: "Lead Unlock",
//       credits: 25,
//       durationDays: null,
//       targetType: "Lead",
//       isActive: true,
//     },

//     {
//       code: "PARTNER_BOOST",
//       label: "Boost Partner",
//       credits: 99,
//       durationDays: 7,
//       targetType: "Partner",
//       isActive: true,
//     },

//     {
//       code: "PROPERTY_BOOST",
//       label: "Boost Property",
//       credits: 100,
//       durationDays: 7,
//       targetType: "Property",
//       isActive: true,
//     },

//     {
//       code: "PARTNER_FEATURED",
//       label: "Featured Partner",
//       credits: 149,
//       durationDays: 7,
//       targetType: "Partner",
//       isActive: true,
//     },

//     {
//       code: "FEATURED_7_DAYS",
//       label: "Featured Property",
//       credits: 160,
//       durationDays: 7,
//       targetType: "Property",
//       isActive: true,
//     },

//     {
//       code: "PARTNER_LOCALITY_TOP",
//       label: "Partner Locality Top",
//       credits: 200,
//       durationDays: 30,
//       targetType: "Partner",
//       isActive: true,
//     },

//     {
//       code: "LOCALITY_TOP_30_DAYS",
//       label: "Property Locality Top",
//       credits: 210,
//       durationDays: 30,
//       targetType: "Property",
//       isActive: true,
//     },
//   ],
// };

export const CREDIT_PRODUCT_CODES = {
  LEAD_UNLOCK: "LEAD_UNLOCK",
  PARTNER_BOOST: "PARTNER_BOOST",
  PROPERTY_BOOST: "PROPERTY_BOOST",
  PARTNER_FEATURED: "PARTNER_FEATURED",
  FEATURED_7_DAYS: "FEATURED_7_DAYS",
  PARTNER_LOCALITY_TOP: "PARTNER_LOCALITY_TOP",
  LOCALITY_TOP_30_DAYS: "LOCALITY_TOP_30_DAYS",
};

export const DEFAULT_CREDIT_SETTINGS = {
  creditsPerRupee: 1,
  products: [
    { code: "LEAD_UNLOCK", label: "Lead Unlock", credits: 25, durationDays: null, targetType: "Lead", isActive: true },
    { code: "PARTNER_BOOST", label: "Boost Partner", credits: 99, durationDays: 7, targetType: "Partner", isActive: true },
    { code: "PROPERTY_BOOST", label: "Boost Property", credits: 100, durationDays: 7, targetType: "Property", isActive: true },
    { code: "PARTNER_FEATURED", label: "Featured Partner", credits: 149, durationDays: 7, targetType: "Partner", isActive: true },
    { code: "FEATURED_7_DAYS", label: "Featured Property", credits: 160, durationDays: 7, targetType: "Property", isActive: true },
    { code: "PARTNER_LOCALITY_TOP", label: "Partner Locality Top", credits: 200, durationDays: 30, targetType: "Partner", isActive: true },
    { code: "LOCALITY_TOP_30_DAYS", label: "Property Locality Top", credits: 210, durationDays: 30, targetType: "Property", isActive: true },
  ],
};
