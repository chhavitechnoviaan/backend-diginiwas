import RentalProperty, { RENTAL_ENUMS } from "../../models/RentalProperty.js";

const parsePayload = (body) => {
  if (body.data) return typeof body.data === "string" ? JSON.parse(body.data) : body.data;
  return body;
};

const uploadedUrl = file => file?.path || file?.secure_url || file?.url;

export const getRentalFormOptions = async (_req, res) => res.json({ success: true, data: RENTAL_ENUMS });

export const createRentalProperty = async (req, res) => {
  try {
    const payload = parsePayload(req.body);
    const imageMeta = Array.isArray(payload.imageMeta) ? payload.imageMeta : [];
    const uploadedImages = (req.files?.images || []).map((file, index) => ({
      url: uploadedUrl(file), publicId: file.filename || null,
      category: imageMeta[index]?.category || (index === 0 ? "Living Room" : "Other"),
      caption: imageMeta[index]?.caption || "", isCover: imageMeta[index]?.isCover ?? index === 0,
    }));
    const suppliedImages = payload.media?.images || [];
    const images = uploadedImages.length ? uploadedImages : suppliedImages;
    const uploadedVideo = req.files?.video?.[0];
    const videos = uploadedVideo ? [{ url: uploadedUrl(uploadedVideo), publicId: uploadedVideo.filename, title: "Property tour" }] : (payload.media?.videos || []);
    const user = req.user || {};
    const property = await RentalProperty.create({
      ...payload,
      listingType: "Rent",
      media: { images, videos },
      createdBy: payload.createdBy || { id: user._id || user.id || null, role: user.role || "admin" },
    });
    return res.status(201).json({ success: true, message: "Rental property created successfully", data: property });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getRentalProperties = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.city) query["location.city"] = new RegExp(req.query.city, "i");
    const data = await RentalProperty.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, count: data.length, data });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

export const getRentalPropertyById = async (req, res) => {
  const data = await RentalProperty.findById(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: "Rental property not found" });
  return res.json({ success: true, data });
};

export const updateRentalProperty = async (req, res) => {
  try {
    const data = await RentalProperty.findByIdAndUpdate(req.params.id, parsePayload(req.body), { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: "Rental property not found" });
    return res.json({ success: true, message: "Rental property updated", data });
  } catch (error) { return res.status(400).json({ success: false, message: error.message }); }
};
