const express = require('express');
const router = express.Router();
const {
  createBoothPoll,
  getAllBoothPolls,
  getBoothPoll,
  voteOnPoll,
  closeBoothPoll,
  deleteBoothPoll,
} = require('../controllers/boothPollController');
const { protect, requireAdminOrEventsOffice } = require('../middleware/auth');

// Public routes
router.get('/', getAllBoothPolls);
router.get('/:id', getBoothPoll);

// Protected routes
router.post('/', protect, requireAdminOrEventsOffice, createBoothPoll);
router.post('/:id/vote', protect, voteOnPoll);
router.post('/:id/close', protect, requireAdminOrEventsOffice, closeBoothPoll);
router.delete('/:id', protect, requireAdminOrEventsOffice, deleteBoothPoll);

module.exports = router;
