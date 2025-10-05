const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Vendor = require("../models/Vendor");

/* --------------------------------------------------------
   AUTHENTICATION MIDDLEWARES
-------------------------------------------------------- */

// Protect routes - general authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user or vendor based on userType in token
      if (decoded.userType === "vendor") {
        req.vendor = await Vendor.findById(decoded.id);
        if (!req.vendor) {
          return res.status(401).json({
            success: false,
            message: "Vendor not found",
          });
        }
        req.userType = "vendor";
      } else {
        req.user = await User.findById(decoded.id);
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: "User not found",
          });
        }
        req.userType = "user";
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Authorize specific roles (for users only, not vendors)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.userType === "vendor") {
      return res.status(403).json({
        success: false,
        message: "Vendor access not allowed for this resource",
      });
    }

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

// Check if user is admin or events office
const requireAdminOrEventsOffice = (req, res, next) => {
  if (req.userType === "vendor") {
    return res.status(403).json({
      success: false,
      message: "Admin or Events Office access required",
    });
  }

  if (!req.user || !["admin", "events_office"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Admin or Events Office access required",
    });
  }

  next();
};

// Check if vendor is approved
const requireApprovedVendor = (req, res, next) => {
  if (req.userType !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Vendor access required",
    });
  }

  if (req.vendor.verificationStatus !== "approved") {
    return res.status(403).json({
      success: false,
      message: "Vendor must be approved to access this resource",
    });
  }
  next();
};

// Check if account is active
const requireActiveAccount = (req, res, next) => {
  const account = req.user || req.vendor;

  if (!account.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account is inactive. Please contact support.",
    });
  }
  next();
};

// Check if user is a vendor
const requireVendor = (req, res, next) => {
  if (req.userType !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "This route is accessible only by vendors.",
    });
  }
  next();
};

// Verify admin token and privileges
const verifyAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin" || !user.isActive) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* --------------------------------------------------------
   EXPORTS
-------------------------------------------------------- */
module.exports = {
  protect,
  authorize,
  requireAdminOrEventsOffice,
  requireApprovedVendor,
  requireActiveAccount,
  requireVendor,
  verifyAdmin,
};
