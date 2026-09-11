import Property from "../../models/Property.js";
import generatePropertyId from "../../utils/generatePropertyId.js";
import cloudinary from "../../config/cloudinary.js";

export const addProperty = async (req, res) => {
  try {
    const propertyId = await generatePropertyId();

    // Array standard se fields wise image/pdf filter karne ke liye
    let images = [];
    let floorPlanUrl = "";
    let reraCertificateUrl = "";

    // Agar multiple fields use kar rahe hain toh files array/object form m aati h
    if (req.files) {
      if (Array.isArray(req.files)) {
        // Purana tarika agar single array h
        images = req.files
          .filter(file => file.fieldname === "images")
          .map((file) => ({ url: file.path, public_id: file.filename }));
      } else {
        // Agar fields upload h
        if (req.files.images) {
          images = req.files.images.map((file) => ({ url: file.path, public_id: file.filename }));
        }
        if (req.files.floorPlan) floorPlanUrl = req.files.floorPlan[0].path;
        if (req.files.reraCertificate) reraCertificateUrl = req.files.reraCertificate[0].path;
      }
    }

    // String arrays ko object se normal array m parse krna pad skta h agar frontend stringify krke bheje
    let parsedAmenities = req.body.amenities;
    let parsedTags = req.body.tags;
    
    if (typeof req.body.amenities === "string") parsedAmenities = JSON.parse(req.body.amenities || "[]");
    if (typeof req.body.tags === "string") parsedTags = JSON.parse(req.body.tags || "[]");

    const property = await Property.create({
      ...req.body,
      propertyId,
      images,
      floorPlan: floorPlanUrl || req.body.floorPlan,
      reraCertificate: reraCertificateUrl || req.body.reraCertificate,
      amenities: parsedAmenities,
      tags: parsedTags
    });

    res.status(201).json({
      success: true,
      message: "Property Added Successfully",
      property,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

  export const getAllProperties = async (req, res) => {
    console.log("Fetching all properties...", req.body);
    try {
      const properties = await Property.find().sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        count: properties.length,
        properties,
      });
    } catch (error) {
      console.log(error);
  
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getAllPropertiesbyfilter = async (req, res) => {
  try {
    const { city, propertyType, transactionType } = req.query;

    let filterQuery = {};

    // 1. City Filter (Case-insensitive) -> Matches "jaipur"
    if (city && city.trim() !== "") {
      filterQuery.city = { $regex: new RegExp(`^${city.trim()}$`, "i") };
    }

    // 2. Transaction Type Filter -> Matches "Sale"
    if (transactionType && transactionType.trim() !== "" && transactionType.toLowerCase() !== "search") {
      filterQuery.transactionType = { $regex: new RegExp(`^${transactionType.trim()}$`, "i") };
    }

    // 3. Category / Property Type Filter -> Matches "Apartment", "House", etc.
    if (propertyType && propertyType.trim() !== "") {
      filterQuery.$or = [
        { category: { $regex: propertyType.trim(), $options: "i" } },
        { propertyType: { $regex: propertyType.trim(), $options: "i" } }
      ];
    }

    // Database query execution
    const properties = await Property.find(filterQuery).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Filter Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

  export const getPropertyById = async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
  
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }
  
      res.status(200).json({
        success: true,
        property,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const updateProperty = async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
  
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }
  
      Object.assign(property, req.body);
  
      if (req.files && req.files.length > 0) {
        const uploadedImages = [];
  
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "diginiwas/properties",
          });
  
          uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
  
        property.images = uploadedImages;
      }
  
      await property.save();
  
      res.status(200).json({
        success: true,
        message: "Property Updated Successfully",
        property,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  export const deleteProperty = async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
  
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }
  
      for (const image of property.images) {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
  
      await property.deleteOne();
  
      res.status(200).json({
        success: true,
        message: "Property Deleted Successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const changePropertyStatus = async (req, res) => {
    try {
      const { status } = req.body;
  
      const property = await Property.findById(req.params.id);
  
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }
  
      property.status = status;
  
      await property.save();
  
      res.status(200).json({
        success: true,
        message: "Status Updated",
        property,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const searchProperties = async (req, res) => {
    try {
      const { keyword } = req.query;
  
      const properties = await Property.find({
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { city: { $regex: keyword, $options: "i" } },
          { category: { $regex: keyword, $options: "i" } }
        ]
      });
  
      res.status(200).json({
        success: true,
        properties,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const filterProperties = async (req, res) => {
    try {
      const {
        city,
        category,
        transactionType,
        minPrice,
        maxPrice,
      } = req.query;
  
      let filter = {};
  
      if (city) filter.city = city;
  
      if (category) filter.category = category;
  
      if (transactionType)
        filter.transactionType = transactionType;
  
      if (minPrice || maxPrice) {
        filter.price = {};
  
        if (minPrice)
          filter.price.$gte = Number(minPrice);
  
        if (maxPrice)
          filter.price.$lte = Number(maxPrice);
      }
  
      const properties = await Property.find(filter);
  
      res.status(200).json({
        success: true,
        properties,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const propertyDashboard = async (req, res) => {
    try {
      const total = await Property.countDocuments();
  
      const published = await Property.countDocuments({
        status: "Published",
      });
  
      const draft = await Property.countDocuments({
        status: "Draft",
      });
  
      const sold = await Property.countDocuments({
        status: "Sold",
      });
  
      res.status(200).json({
        success: true,
        total,
        published,
        draft,
        sold,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };