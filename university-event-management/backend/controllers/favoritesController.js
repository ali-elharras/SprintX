const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");
const BoothApplication = require("../models/BoothApplication");

// Roles allowed to favorite events
const ALLOWED_ROLES = ["student", "staff", "events_office", "ta", "professor"]; // admin excluded intentionally

// Add event to favorites
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user?._id; // protect middleware sets req.user
    const { eventId } = req.body;

    if (!userId) return res.status(401).json({ message: "Authentication required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!ALLOWED_ROLES.includes(user.role)) {
      return res.status(403).json({ message: "Role not permitted to favorite events" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }
    // Try Event first
    let isValidTarget = false;
    const event = await Event.findById(eventId);
    if (event && event.status === "published") {
      isValidTarget = true;
    } else {
      // If not an Event, try BoothApplication
      const booth = await BoothApplication.findById(eventId);
      if (booth) {
        // Allow approved booths to be favorited
        const allowedBoothStatuses = ["approved", "published", "active", "upcoming"];
        if (!booth.status || allowedBoothStatuses.includes(booth.status)) {
          isValidTarget = true;
        }
      }
    }
    if (!isValidTarget) {
      return res.status(404).json({ message: "Item not found or not eligible to favorite" });
    }

    if (user.favorites.some(f => f.toString() === eventId)) {
      return res.status(200).json({ message: "Event already in favorites" });
    }
    user.favorites.push(eventId);
    await user.save();
    return res.status(201).json({ message: "Added to favorites", favorites: user.favorites });
  } catch (err) {
    console.error("Error adding favorite:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Remove event from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { eventId } = req.params;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!ALLOWED_ROLES.includes(user.role)) {
      return res.status(403).json({ message: "Role not permitted to modify favorites" });
    }
    user.favorites = user.favorites.filter(f => f.toString() !== eventId);
    await user.save();
    return res.status(200).json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (err) {
    console.error("Error removing favorite:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List favorites (supports Event and BoothApplication)
exports.listFavorites = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Authentication required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const favIds = (user.favorites || []).map((id) => id.toString());
    if (favIds.length === 0) return res.status(200).json({ favorites: [] });

    // Fetch matching Events
    const events = await Event.find({ _id: { $in: favIds }, status: "published" })
      .select("title name type startDate endDate location status images shortDescription organizer");

    // Fetch matching Booths
    const booths = await BoothApplication.find({ _id: { $in: favIds } })
      .populate("vendor", "companyName firstName lastName email")
      .select("location startDate endDate status attendees vendor createdAt updatedAt");

    const transformedEvents = events.map((ev) => ({
      _id: ev._id,
      title: ev.title || ev.name,
      type: ev.type || "event",
      startDate: ev.startDate,
      endDate: ev.endDate,
      location: ev.location,
      status: ev.status,
      images: ev.images || [],
      shortDescription: ev.shortDescription,
    }));

    const transformedBooths = booths.map((booth) => {
      const vendorName = booth.vendor?.companyName ||
        (booth.vendor?.firstName && booth.vendor?.lastName
          ? `${booth.vendor.firstName} ${booth.vendor.lastName}`
          : "Vendor");
      return {
        _id: booth._id,
        title: `${vendorName} - Booth at ${booth.location || "TBD"}`,
        type: "booth",
        startDate: booth.startDate,
        endDate: booth.endDate,
        location: booth.location || "TBD",
        status: booth.status || "pending",
        images: [],
        shortDescription: `Booth by ${vendorName}`,
      };
    });

    // Maintain original order of favorites
    const mapById = new Map([...transformedEvents, ...transformedBooths].map((it) => [it._id.toString(), it]));
    const ordered = favIds.map((id) => mapById.get(id)).filter(Boolean);

    return res.status(200).json({ favorites: ordered });
  } catch (err) {
    console.error("Error listing favorites:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
