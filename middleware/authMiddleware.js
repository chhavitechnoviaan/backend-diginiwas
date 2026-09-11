import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    let token;

    const authHeader =
      req.headers.authorization;

    if (
      authHeader &&
      authHeader.startsWith("Bearer ")
    ) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Not authorized. Token missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      id:
        decoded.id ||
        decoded._id ||
        decoded.userId,

      role: decoded.role,
    };

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Auth Middleware Error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token.",
    });
  }
};

// Use after `protect` on routes which must only be called from the admin panel.
export const requireAdmin = (req, res, next) => {
  if (String(req.user?.role || "").toLowerCase() !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access is required.",
    });
  }

  next();
};
