const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");

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
    const event = await Event.findById(eventId);
    if (!event || event.status !== "published") {
      return res.status(404).json({ message: "Event not found or not published" });
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

// List favorites
exports.listFavorites = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Authentication required" });
    const user = await User.findById(userId).populate({
      path: "favorites",
      select: "title type startDate endDate location status images shortDescription organizer",
      match: { status: "published" },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ favorites: user.favorites || [] });
  } catch (err) {
    console.error("Error listing favorites:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
