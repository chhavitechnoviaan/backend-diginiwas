import mongoose from "mongoose";

const { Schema } = mongoose;

export const RENTAL_ENUMS = {
  buildingTypes: ["Residential", "Commercial"],
  propertyTypes: ["Apartment", "Villa", "Plot", "Builder Floor", "Penthouse", "Independent House"],
  bhkTypes: ["Studio", "1 RK", "1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "5 BHK", "6 BHK", "6+ BHK"],
  areaTypes: ["Built-up Area", "Super Built-up Area", "Carpet Area", "Saleable Area", "Plot Area"],
  sizeUnits: ["Sq. Ft.", "Sq. Meter", "Sq. Yard", "Acre", "Hectare"],
  spaces: ["Prayer Room", "Servant Room", "Study Room", "Extra Room", "Basement", "Store Room", "Private Garden", "Private Pool", "Terrace"],
  suitedFor: ["Students", "Working Professionals", "Family", "Bachelor", "Company Lease", "Any"],
  furnishing: ["Furnished", "Semi-Furnished", "Unfurnished"],
  furnishingItems: ["Water Purifier", "Fan", "Fridge", "Exhaust Fan", "Dining Table", "Geyser", "Stove", "Light", "Curtains", "Modular Kitchen", "TV", "Chimney", "AC", "Bed", "Wardrobe", "Sofa", "Washing Machine", "Microwave", "Home Automation", "Smart Card Access", "Solar Heater", "Split AC", "VRV AC"],
  waterSources: ["Municipal Supply", "Borewell/Underground", "Tanker", "Others"],
  locationAdvantages: ["Good School in vicinity", "Nearby Metro Station", "Peaceful Vicinity", "Near City Center", "Safe & Secure Locality", "Near Reputed Hospital", "Close to Shopping Mall/Market", "Highway/Expressway Access", "Near IT Park/Business Hub", "Close to Railway Station"],
  facings: ["East", "West", "North", "South", "North East", "North West", "South East", "South West"],
  views: ["Beach View", "Garden View", "Golf Course", "Lake View", "Park View", "Road View", "Community View", "Pool View", "Creek View", "Sea View"],
  flooring: ["Marble", "Concrete", "Cemented", "Carpeted", "Wooden", "Vitrified Tiles", "Wooden Tiles", "Imported Tiles", "Indian Tiles", "Ceramic", "Hardwood", "Carpet", "Others"],
  amenities: ["Gymnasium", "Swimming Pool", "Kids Play Areas", "Jogging/Cycle Track", "Power Backup", "Attached Market", "24 x 7 Security", "Clubhouse", "High Speed Elevators", "Day Care Center", "Party Hall", "EV Charging", "Multi-level Parking", "Multi-purpose Sports Court", "Theatre/Mini Cinema", "Rooftop Deck/Observatory", "Shopping Complex", "Community Shuttle Service", "Central Park"],
  highlights: ["Pet Friendly", "Gated Community", "Smart Home", "Premium Location", "Corner Unit", "Vastu Compliant", "Private Garden", "Low Density Project", "Quiet/Low Traffic Area", "Wheelchair Accessible", "Never Occupied"],
  imageCategories: ["Bedroom", "Study Room", "Attached Bathroom", "Bathroom", "Floor Plan", "Master Plan", "Exterior View", "Nearby", "Common Area", "Washroom", "Kitchen", "Room", "Map Location", "Gym", "Garden", "Parking", "Terrace", "Swimming Pool", "Living Room", "Dining Area", "Balcony", "Lobby", "Other"],
};

const areaSchema = new Schema({
  value: { type: Number, required: true, min: 1 },
  type: { type: String, required: true, enum: RENTAL_ENUMS.areaTypes },
  unit: { type: String, enum: RENTAL_ENUMS.sizeUnits, default: "Sq. Ft." },
  display: { type: Boolean, default: false },
}, { _id: false });

const imageSchema = new Schema({
  url: { type: String, required: true, trim: true },
  publicId: { type: String, default: null },
  category: { type: String, enum: RENTAL_ENUMS.imageCategories, default: "Other" },
  isCover: { type: Boolean, default: false },
  caption: { type: String, maxlength: 150, default: "" },
}, { _id: true });

const rentalPropertySchema = new Schema({
  propertyId: { type: String, unique: true, sparse: true, index: true },
  listingType: { type: String, enum: ["Rent"], default: "Rent", immutable: true },
  buildingType: { type: String, enum: RENTAL_ENUMS.buildingTypes, required: true, index: true },
  propertyType: { type: String, enum: RENTAL_ENUMS.propertyTypes, required: true, index: true },
  location: {
    city: { type: String, required: true, trim: true, index: true },
    locality: { type: String, required: true, trim: true, index: true },
    society: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    pinCode: { type: String, match: [/^[1-9][0-9]{5}$/, "Invalid PIN code"], default: null },
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
    isLocationConfirmed: { type: Boolean, default: false },
  },
  rent: {
    amount: { type: Number, required: true, min: 1, index: true },
    frequency: { type: String, enum: ["Per Month", "Per Year"], default: "Per Month" },
    negotiable: { type: Boolean, default: false },
  },
  maintenance: {
    amount: { type: Number, min: 0, default: 0 },
    frequency: { type: String, enum: ["Per SqFt", "Monthly", "Quarterly", "Yearly", "One Time"], default: "Monthly" },
    includedInRent: { type: Boolean, default: false },
  },
  securityDeposit: {
    type: { type: String, enum: ["Zero Deposit", "One Month", "Two Months", "Other"], required: true },
    amount: { type: Number, min: 0, default: 0 },
    description: { type: String, maxlength: 200, default: "" },
  },
  bhk: { type: String, enum: RENTAL_ENUMS.bhkTypes, required: true, index: true },
  areaDetails: { type: [areaSchema], validate: [v => v?.length > 0, "At least one area is required"] },
  additionalSpaces: [{ type: String, enum: RENTAL_ENUMS.spaces }],
  media: {
    images: { type: [imageSchema], validate: [v => v?.length > 0, "At least one image is required"] },
    videos: [{ url: String, publicId: String, title: String }],
  },
  availability: {
    availableFrom: { type: String, enum: ["Immediately", "Later"], required: true },
    availableDate: { type: Date, default: null },
  },
  suitedFor: [{ type: String, enum: RENTAL_ENUMS.suitedFor }],
  furnishing: {
    status: { type: String, enum: RENTAL_ENUMS.furnishing, required: true, index: true },
    items: [{ name: { type: String, enum: RENTAL_ENUMS.furnishingItems }, quantity: { type: Number, min: 1, default: 1 } }],
  },
  specifications: {
    bathrooms: { type: Number, required: true, min: 0, max: 20 },
    coveredParking: { type: Number, min: 0, max: 20, default: 0 },
    openParking: { type: Number, min: 0, max: 20, default: 0 },
    powerBackup: { type: Boolean, default: false },
    waterSources: [{ type: String, enum: RENTAL_ENUMS.waterSources }],
    liftAvailable: { type: Boolean, default: false },
    locationAdvantages: [{ type: String, enum: RENTAL_ENUMS.locationAdvantages }],
    balconies: { type: Number, min: 0, max: 20, default: 0 },
    facing: { type: String, enum: RENTAL_ENUMS.facings, default: null },
    view: { type: String, enum: RENTAL_ENUMS.views, default: null },
    flooring: { type: String, enum: RENTAL_ENUMS.flooring, default: null },
    connectingRoadWidth: { value: { type: Number, min: 0, default: null }, unit: { type: String, enum: ["Feet", "Meter"], default: "Feet" } },
    totalFloorCount: { type: Number, min: 0, default: null },
    propertyFloor: { type: Number, min: -5, default: null },
    towerBlock: { type: String, trim: true, default: "" },
    unitNo: { type: String, trim: true, default: "" },
    keepUnitNoPrivate: { type: Boolean, default: false },
  },
  amenities: [{ type: String, enum: RENTAL_ENUMS.amenities }],
  oneLineDescription: { type: String, required: true, trim: true, maxlength: 200 },
  propertyHighlights: [{ type: String, enum: RENTAL_ENUMS.highlights }],
  description: { type: String, required: true, trim: true, minlength: 25, maxlength: 4000 },
  createdBy: {
    id: { type: Schema.Types.ObjectId, default: null },
    role: { type: String, enum: ["admin", "seller", "partner"], default: "admin" },
  },
  status: { type: String, enum: ["Draft", "Submitted", "Assigned_To_Partner", "Reviewing", "Verified", "Live", "Rejected", "Rented"], default: "Draft", index: true },
  propertyVerificationStatus: { type: String, enum: ["Pending", "In_Progress", "Verified", "Rejected"], default: "Pending", index: true },
  verified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

rentalPropertySchema.pre("validate", async function () {
  if (!this.propertyId) this.propertyId = `DWR-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
  if (this.availability?.availableFrom === "Later" && !this.availability.availableDate) throw new Error("Available date is required");
  const covers = this.media?.images?.filter(image => image.isCover) || [];
  if (this.media?.images?.length && covers.length !== 1) throw new Error("Exactly one cover image is required");
});

rentalPropertySchema.index({ "location.city": 1, "location.locality": 1, status: 1 });
rentalPropertySchema.index({ "rent.amount": 1, bhk: 1, "furnishing.status": 1 });

export default mongoose.model("RentalProperty", rentalPropertySchema);
