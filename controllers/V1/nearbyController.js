import NewProperty from "../../models/NewProperty.js";

const escapeOverpass = (value) => String(value || "").replace(/["\\]/g, "");

const toRadians = (value) => (value * Math.PI) / 180;

// Straight-line (aerial) distance between property and amenity.
const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

const getMarkerMeta = (category, type) => {
  if (category === "education") {
    return {
      markerType: "EDUCATION",
      icon: type === "college" || type === "university" ? "graduation-cap" : "school",
      iconEmoji: "🎓",
    };
  }

  if (category === "healthcare") {
    return {
      markerType: "HEALTHCARE",
      icon: type === "pharmacy" ? "pill" : "hospital",
      iconEmoji: "🏥",
    };
  }

  if (category === "food") {
    return {
      markerType: "FOOD",
      icon: type === "cafe" ? "coffee" : "utensils",
      iconEmoji: type === "cafe" ? "☕" : "🍴",
    };
  }

  return {
    markerType: "OTHER",
    icon: "map-pin",
    iconEmoji: "📍",
  };
};

const buildGoogleMapUrl = (lat, lng) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const buildDirectionsUrl = (originLat, originLng, destinationLat, destinationLng) =>
  `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destinationLat},${destinationLng}&travelmode=driving`;

const getCategoryFromType = (type) => {
  if (["school", "college", "university"].includes(type)) return "education";
  if (["hospital", "clinic", "doctors", "pharmacy"].includes(type)) return "healthcare";
  if (["cafe", "restaurant", "fast_food"].includes(type)) return "food";
  return null;
};

const getNearbyAmenitiesFromOsm = async (lat, lng, radius) => {
  const query = `[out:json][timeout:20];(\nnode(around:${radius},${lat},${lng})[amenity~"school|college|university|hospital|clinic|doctors|pharmacy|cafe|restaurant|fast_food"];\nway(around:${radius},${lat},${lng})[amenity~"school|college|university|hospital|clinic|doctors|pharmacy|cafe|restaurant|fast_food"];\nrelation(around:${radius},${lat},${lng})[amenity~"school|college|university|hospital|clinic|doctors|pharmacy|cafe|restaurant|fast_food"];\n);out center tags;`;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "DigiNiwas/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Overpass API failed with ${response.status}`);
  }

  const json = await response.json();

  return (json.elements || [])
    .map((x) => ({
      osmId: x.id,
      osmElementType: x.type,
      type: x.tags?.amenity || "other",
      name: escapeOverpass(x.tags?.name || x.tags?.brand || "Unnamed place"),
      latitude: x.lat ?? x.center?.lat ?? null,
      longitude: x.lon ?? x.center?.lon ?? null,
      address: [
        x.tags?.["addr:housenumber"],
        x.tags?.["addr:street"],
        x.tags?.["addr:suburb"],
        x.tags?.["addr:city"],
        x.tags?.["addr:state"],
        x.tags?.["addr:postcode"],
      ]
        .filter(Boolean)
        .join(", "),
    }))
    .filter(
      (x) =>
        Number.isFinite(Number(x.latitude)) &&
        Number.isFinite(Number(x.longitude))
    );
};

export const exploreNearby = async (req, res) => {
  try {
    const { propertyId } = req.query;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "propertyId query parameter is required",
      });
    }

    const property = await NewProperty.findOne({
      $or: [
        ...(String(propertyId).match(/^[0-9a-fA-F]{24}$/)
          ? [{ _id: propertyId }]
          : []),
        { propertyId },
      ],
    }).lean();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const propertyLat = Number(property.latitude);
    const propertyLng = Number(property.longitude);

    if (!Number.isFinite(propertyLat) || !Number.isFinite(propertyLng)) {
      return res.status(422).json({
        success: false,
        message: "Property latitude/longitude missing",
      });
    }

    const radius = Math.min(
      Math.max(Number(req.query.radius || 3000), 500),
      10000
    );

    let amenities = [];
    let provider = "OpenStreetMap/Overpass";
    let warning = null;

    try {
      amenities = await getNearbyAmenitiesFromOsm(
        propertyLat,
        propertyLng,
        radius
      );
    } catch (error) {
      console.error("Overpass API Error:", error);
      warning = "Nearby place provider is temporarily unavailable";
      provider = "unavailable";
    }

    const groups = {
      education: [],
      healthcare: [],
      food: [],
    };

    // Flat marker array makes frontend map rendering very easy.
    const mapMarkers = [
      {
        id: `property-${property._id}`,
        mongoId: property._id,
        propertyId: property.propertyId,
        markerType: "PROPERTY",
        category: "property",
        type: "property",
        name: property.title,
        latitude: propertyLat,
        longitude: propertyLng,
        icon: "home",
        iconEmoji: "🏠",
        mapUrl: buildGoogleMapUrl(propertyLat, propertyLng),
        directionsUrl: null,
        distanceKm: 0,
        distanceMeters: 0,
      },
    ];

    for (const item of amenities) {
      const category = getCategoryFromType(item.type);
      if (!category) continue;

      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      const distanceKm = calculateDistanceKm(
        propertyLat,
        propertyLng,
        lat,
        lng
      );
      const marker = getMarkerMeta(category, item.type);

      const amenity = {
        osmId: item.osmId,
        osmElementType: item.osmElementType,
        category,
        type: item.type,
        name: item.name,
        latitude: lat,
        longitude: lng,
        address: item.address,
        distanceKm,
        distanceMeters: Math.round(distanceKm * 1000),
        distanceType: "straight_line",
        markerType: marker.markerType,
        icon: marker.icon,
        iconEmoji: marker.iconEmoji,
        mapUrl: buildGoogleMapUrl(lat, lng),
        directionsUrl: buildDirectionsUrl(
          propertyLat,
          propertyLng,
          lat,
          lng
        ),
      };

      groups[category].push(amenity);

      mapMarkers.push({
        id: `${category}-${item.osmElementType || "osm"}-${item.osmId}`,
        osmId: item.osmId,
        osmElementType: item.osmElementType,
        category,
        markerType: marker.markerType,
        type: item.type,
        name: item.name,
        latitude: lat,
        longitude: lng,
        address: item.address,
        distanceKm,
        distanceMeters: amenity.distanceMeters,
        distanceType: "straight_line",
        icon: marker.icon,
        iconEmoji: marker.iconEmoji,
        mapUrl: amenity.mapUrl,
        directionsUrl: amenity.directionsUrl,
      });
    }

    // Nearest places first inside every category.
    Object.values(groups).forEach((list) => {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    });

    return res.status(200).json({
      success: true,
      message: "Nearby map data loaded",
      data: {
        property: {
          _id: property._id,
          propertyId: property.propertyId,
          title: property.title,
          city: property.city,
          locality: property.locality,
          latitude: propertyLat,
          longitude: propertyLng,
          icon: "home",
          iconEmoji: "🏠",
          mapUrl: buildGoogleMapUrl(propertyLat, propertyLng),
        },
        map: {
          center: {
            latitude: propertyLat,
            longitude: propertyLng,
          },
          zoom: 14,
          radiusMeters: radius,
          markers: mapMarkers,
          markerLegend: {
            property: {
              markerType: "PROPERTY",
              icon: "home",
              iconEmoji: "🏠",
              label: "Property",
            },
            education: {
              markerType: "EDUCATION",
              icon: "school",
              iconEmoji: "🎓",
              label: "School / College / University",
            },
            healthcare: {
              markerType: "HEALTHCARE",
              icon: "hospital",
              iconEmoji: "🏥",
              label: "Hospital / Clinic / Pharmacy",
            },
            food: {
              markerType: "FOOD",
              icon: "utensils",
              iconEmoji: "🍴",
              label: "Restaurant / Cafe / Food",
            },
          },
        },
        radiusMeters: radius,
        provider,
        warning,
        distanceNote:
          "distanceKm/distanceMeters are straight-line distances. directionsUrl opens Google Maps for road routing.",
        amenities: groups,
      },
    });
  } catch (error) {
    console.error("Explore Nearby Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
