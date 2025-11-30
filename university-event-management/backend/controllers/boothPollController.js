const BoothPoll = require('../models/BoothPoll');
const User = require('../models/User');

// @desc    Create a new booth poll (Events Office only)
// @route   POST /api/booth-polls
// @access  Private (Events Office)
exports.createBoothPoll = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, durationWeeks, boothSize, vendors, pollEndDate } = req.body;

    // Validate that at least two vendors are provided
    if (!vendors || vendors.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two vendor options are required for a poll',
      });
    }

    // Validate that vendors have company names
    const invalidVendors = vendors.filter(v => !v.companyName || v.companyName.trim() === '');
    if (invalidVendors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All vendors must have a company name',
      });
    }

    const pollData = {
      title,
      description,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationWeeks,
      boothSize,
      pollEndDate: new Date(pollEndDate),
      createdBy: req.user._id,
      vendors: vendors.map((v) => ({
        companyName: v.companyName.trim(),
        description: v.description || '',
        votes: 0,
      })),
      votes: [],
    };

    const poll = await BoothPoll.create(pollData);
    const populatedPoll = await poll.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Booth poll created successfully',
      data: populatedPoll,
    });
  } catch (error) {
    console.error('Error creating booth poll:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating booth poll',
      error: error.message,
    });
  }
};

// @desc    Get all active booth polls
// @route   GET /api/booth-polls
// @access  Public
exports.getAllBoothPolls = async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    const query = { isArchived: { $ne: true } };
    if (status) {
      query.status = status;
    }

    const polls = await BoothPoll.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Add votedBy info for current user if authenticated
    const pollsWithUserVotes = polls.map((poll) => {
      const pollObj = poll.toObject();
      if (req.user) {
        const userVote = poll.votes.find((v) => v.user.toString() === req.user._id.toString());
        pollObj.userVote = userVote ? userVote.vendorIndex : null;
      }
      return pollObj;
    });

    res.status(200).json({
      success: true,
      count: pollsWithUserVotes.length,
      data: pollsWithUserVotes,
    });
  } catch (error) {
    console.error('Error fetching booth polls:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booth polls',
      error: error.message,
    });
  }
};

// @desc    Get single poll by ID
// @route   GET /api/booth-polls/:id
// @access  Public
exports.getBoothPoll = async (req, res) => {
  try {
    const poll = await BoothPoll.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('votes.user', 'firstName lastName email');

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Booth poll not found',
      });
    }

    const pollObj = poll.toObject();
    if (req.user) {
      const userVote = poll.votes.find((v) => v.user._id.toString() === req.user._id.toString());
      pollObj.userVote = userVote ? userVote.vendorIndex : null;
    }

    res.status(200).json({
      success: true,
      data: pollObj,
    });
  } catch (error) {
    console.error('Error fetching booth poll:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booth poll',
      error: error.message,
    });
  }
};

// @desc    Remove vote from a booth poll
// @route   DELETE /api/booth-polls/:id/vote
// @access  Private (Authenticated users)
exports.removeVoteFromPoll = async (req, res) => {
  try {
    const poll = await BoothPoll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Booth poll not found',
      });
    }

    // Find existing vote
    const existingVote = poll.votes.find((v) => v.user.toString() === req.user._id.toString());
    
    if (!existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have not voted on this poll',
      });
    }

    // Remove vote count from vendor
    poll.vendors[existingVote.vendorIndex].votes = Math.max(0, poll.vendors[existingVote.vendorIndex].votes - 1);
    
    // Remove vote from poll
    poll.votes = poll.votes.filter((v) => v.user.toString() !== req.user._id.toString());

    await poll.save();
    const populatedPoll = await poll.populate('createdBy', 'firstName lastName email');

    const pollObj = populatedPoll.toObject();
    pollObj.userVote = null;

    res.status(200).json({
      success: true,
      message: 'Vote removed successfully',
      data: pollObj,
    });
  } catch (error) {
    console.error('Error removing vote from poll:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing vote from poll',
      error: error.message,
    });
  }
};

// @desc    Vote on a booth poll (Students, Staff, TA, Professor)
// @route   POST /api/booth-polls/:id/vote
// @access  Private (Authenticated users)
exports.voteOnPoll = async (req, res) => {
  try {
    const { vendorIndex } = req.body;

    if (vendorIndex === undefined || vendorIndex === null) {
      return res.status(400).json({
        success: false,
        message: 'Vendor index is required',
      });
    }

    const poll = await BoothPoll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Booth poll not found',
      });
    }

    // Check if poll is still active
    if (poll.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This poll is no longer active',
      });
    }

    // Check if poll end date has passed
    if (new Date() > poll.pollEndDate) {
      poll.status = 'closed';
      await poll.save();
      return res.status(400).json({
        success: false,
        message: 'Voting period has ended',
      });
    }

    // Validate vendor index
    if (vendorIndex < 0 || vendorIndex >= poll.vendors.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor index',
      });
    }

    // Check if user already voted
    const existingVote = poll.votes.find((v) => v.user.toString() === req.user._id.toString());

    if (existingVote) {
      // Remove previous vote count
      poll.vendors[existingVote.vendorIndex].votes = Math.max(0, poll.vendors[existingVote.vendorIndex].votes - 1);
      // Update vote
      existingVote.vendorIndex = vendorIndex;
      existingVote.votedAt = new Date();
    } else {
      // Add new vote
      poll.votes.push({
        user: req.user._id,
        vendorIndex,
        votedAt: new Date(),
      });
    }

    // Increment vote count for selected vendor
    poll.vendors[vendorIndex].votes += 1;

    await poll.save();
    const populatedPoll = await poll.populate('createdBy', 'firstName lastName email');

    const pollObj = populatedPoll.toObject();
    pollObj.userVote = vendorIndex;

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: pollObj,
    });
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({
      success: false,
      message: 'Error voting on poll',
      error: error.message,
    });
  }
};

// @desc    Close a poll and declare winner (Events Office)
// @route   POST /api/booth-polls/:id/close
// @access  Private (Events Office)
exports.closeBoothPoll = async (req, res) => {
  try {
    const poll = await BoothPoll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Booth poll not found',
      });
    }

    if (poll.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Poll is already closed',
      });
    }

    // Find vendor with most votes
    let winnerIndex = 0;
    let maxVotes = poll.vendors[0].votes || 0;

    for (let i = 1; i < poll.vendors.length; i++) {
      if (poll.vendors[i].votes > maxVotes) {
        maxVotes = poll.vendors[i].votes;
        winnerIndex = i;
      }
    }

    const winnerVendor = poll.vendors[winnerIndex];

    poll.status = 'closed';
    poll.winner = {
      vendorIndex: winnerIndex,
      companyName: winnerVendor.companyName,
      voteCount: winnerVendor.votes,
      declaredAt: new Date(),
    };

    await poll.save();
    const populatedPoll = await poll.populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Poll closed successfully',
      data: populatedPoll,
    });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing poll',
      error: error.message,
    });
  }
};

// @desc    Delete/Archive a poll (Events Office)
// @route   DELETE /api/booth-polls/:id
// @access  Private (Events Office)
exports.deleteBoothPoll = async (req, res) => {
  try {
    const poll = await BoothPoll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Booth poll not found',
      });
    }

    poll.isArchived = true;
    await poll.save();

    res.status(200).json({
      success: true,
      message: 'Booth poll archived successfully',
      data: poll,
    });
  } catch (error) {
    console.error('Error deleting booth poll:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting booth poll',
      error: error.message,
    });
  }
};
