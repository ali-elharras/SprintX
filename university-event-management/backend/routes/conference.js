// File: /university-event-management/university-event-management/backend/routes/conference.js

import { Router } from "express";
import { createConference, editConference, deleteConference, getConferences } from "../controllers/conferenceController";

const router = Router();

// Route to create a new conference
router.post("/", createConference);

// Route to edit an existing conference
router.put("/:id", editConference);

// Route to delete a conference
router.delete("/:id", deleteConference);

// Route to get all conferences
router.get("/", getConferences);

export default router;