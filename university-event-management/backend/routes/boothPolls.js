const express = require('express');
const router = express.Router();
const {
  createBoothPoll,
  getAllBoothPolls,
  getBoothPoll,
  voteOnPoll,
  removeVoteFromPoll,
  closeBoothPoll,
  deleteBoothPoll,
} = require('../controllers/boothPollController');
const { protect, requireAdminOrEventsOffice, optionalProtect } = require('../middleware/auth');

// Public routes (with optional authentication to include userVote)
router.get('/', optionalProtect, getAllBoothPolls);
router.get('/:id', optionalProtect, getBoothPoll);

// Protected routes
router.post('/', protect, requireAdminOrEventsOffice, createBoothPoll);
router.post('/:id/vote', protect, voteOnPoll);
router.delete('/:id/vote', protect, removeVoteFromPoll);
router.post('/:id/close', protect, requireAdminOrEventsOffice, closeBoothPoll);
router.delete('/:id', protect, requireAdminOrEventsOffice, deleteBoothPoll);

module.exports = router;
