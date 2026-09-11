// import Property from "../models/Property.js";

// const generatePropertyId = async () => {
//   const count = await Property.countDocuments();

//   return `DW-${1001 + count}`;
// };

// export default generatePropertyId;

import Property from "../models/Property.js";

const generatePropertyId = async () => {
  // Sabse latest property nikalenge propertyId ke descending order (-1) mein sort karke
  const lastProperty = await Property.findOne({}, { propertyId: 1 })
    .sort({ propertyId: -1 })
    .exec();

  // Agar database m koi property nahi h, toh 1001 se shuru karein
  if (!lastProperty || !lastProperty.propertyId) {
    return "DW-1001";
  }

  // Purani ID se number extract karna (e.g., "DW-1003" se "1003" nikalna)
  const lastIdStr = lastProperty.propertyId;
  const lastNumber = parseInt(lastIdStr.replace("DW-", ""), 10);

  // Agla number generate karna
  const nextNumber = lastNumber + 1;

  return `DW-${nextNumber}`;
};

export default generatePropertyId;