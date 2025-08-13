const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const paymentController = require('../../controllers/paymentController');

// @route   POST api/v1/payment/subscribe
// @desc    Create a new subscription for user
// @access  Private
router.post(
  '/subscribe',
  [
    protect,
    [
      check('email', 'Email is required').isEmail(),
      check('plan', 'Plan is required').not().isEmpty(),
      check('source', 'Source token is required').not().isEmpty()
    ]
  ],
  validate,
  paymentController.createSubscription
);

// @route   POST api/v1/payment/cancel-subscription
// @desc    Cancel user's active subscription
// @access  Private
router.post(
  '/cancel-subscription',
  protect,
  paymentController.cancelSubscription
);

// @route   GET api/v1/payment/history
// @desc    Get user's payment history
// @access  Private
router.get(
  '/history',
  protect,
  paymentController.getPaymentHistory
);

// @route   POST api/v1/payment/purchase-consumable
// @desc    Purchase a consumable item (boost)
// @access  Private
router.post(
  '/purchase-consumable',
  [
    protect,
    [
      check('productId', 'Product ID is required').not().isEmpty(),
      check('amount', 'Amount is required').isNumeric().notEmpty()
    ]
  ],
  validate,
  paymentController.purchaseConsumable
);

module.exports = router;
