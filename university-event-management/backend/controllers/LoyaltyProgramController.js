const LoyaltyProgram = require('../models/LoyaltyProgram');

// Get all loyalty programs with vendor details
exports.getAllLoyaltyPrograms = async (req, res) => {
    try {
        const programs = await LoyaltyProgram.find().populate('Vendor', 'companyName logo industry description email phoneNumber website address');
        res.status(200).json(programs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a new loyalty program
exports.createLoyaltyProgram = async (req, res) => {
    try {
        const vendorId = req.vendor.id; // Assuming vendor ID is available in req.vendor
        const { discountRate, promoCode, termsAndConditions } = req.body;
        const newProgram = new LoyaltyProgram({ discountRate, promoCode, termsAndConditions, Vendor: vendorId });
        await newProgram.save();
        res.status(201).json(newProgram);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get loyalty programs for a vendor
exports.getLoyaltyProgramsByVendor = async (req, res) => {
    try {
        const vendorId = req.vendor.id; // Assuming vendor ID is available in req.vendor
        const programs = await LoyaltyProgram.find({ Vendor: vendorId });
        res.status(200).json(programs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

//cancel my participation in loyalty program
exports.cancelLoyaltyProgram = async (req, res) => {
    try {
        const vendorId = req.vendor.id; // Assuming vendor ID is available in req.vendor
        const programId = req.params.id;
        const program = await LoyaltyProgram.findOneAndDelete({ _id: programId, Vendor: vendorId });
        if (!program) {
            return res.status(404).json({ error: 'Loyalty program not found or not authorized' });
        }
        res.status(200).json({ message: 'Loyalty program cancelled successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};