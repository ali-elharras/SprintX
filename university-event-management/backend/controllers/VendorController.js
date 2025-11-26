const BoothApplication = require('../models/BoothApplication');
const Vendor = require('../models/Vendor');
const BazaarApplication = require('../models/BazaarApplication');

//get all pending payments 
exports.getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await BoothApplication.find({
      vendor: req.vendor.id,
      paymentStatus: 'pending'
    });

    res.status(200).json({ success: true, data: pendingPayments });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

//get the sum of pending payments 
exports.getPendingPaymentsSum = async (req, res) => {
  try {
    const boothPendingPayments = await BoothApplication.find({
      vendor: req.vendor.id,
      paymentStatus: 'pending'
    });

    const bazaarPendingPayments = await BazaarApplication.find({
      vendor: req.vendor.id,
      paymentStatus: 'pending'
    });

    const totalBoothPendingAmount = boothPendingPayments.reduce((sum, application) => {
      return sum + application.paymentAmount;
    }, 0);

    const totalBazaarPendingAmount = bazaarPendingPayments.reduce((sum, application) => {
      return sum + application.paymentAmount;
    }, 0);

    const totalPendingAmount = totalBoothPendingAmount + totalBazaarPendingAmount;
    res.status(200).json({ success: true, data: { totalPendingAmount } });
  } catch (error) {
    console.error('Error calculating pending payments sum:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
