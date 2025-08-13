const omise = require('omise')({
  publicKey: process.env.OMISE_PUBLIC_KEY,
  secretKey: process.env.OMISE_SECRET_KEY,
});
const pb = require('../db/pocketbase');
const { ClientResponseError } = require('pocketbase/cjs');

/**
 * Creates a new subscription for a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.createSubscription = async (req, res) => {
  const { email, plan, source } = req.body;
  const userId = req.user.id;

  try {
    // 1. Create Omise Customer
    const customer = await omise.customers.create({
      email,
      description: `Customer for ${email}`,
      card: source,
    });

    // 2. Create Omise Subscription
    const omiseSubscription = await omise.customers.createSubscription(
      customer.id,
      { plan }
    );

    // 3. Save subscription details to PocketBase
    await pb.collection('subscriptions').create({
      user: userId,
      plan: omiseSubscription.plan,
      omiseCustomerId: customer.id,
      omiseSubscriptionId: omiseSubscription.id,
      status: omiseSubscription.status,
    });

    // 4. Update user's premium status in PocketBase
    await pb.collection('users').update(userId, { isPremium: true });

    res.json({ ...omiseSubscription, message: req.t('subscription_created') });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: req.t('subscription_creation_failed') });
  }
};

/**
 * Cancels an active subscription for a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.cancelSubscription = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Find the active subscription in PocketBase
    const subscription = await pb.collection('subscriptions').getFirstListItem(
      `user="${userId}" && status="active"`
    );

    // 2. Cancel the subscription in Omise
    const canceledOmiseSubscription = await omise.customers.cancelSubscription(
      subscription.omiseCustomerId,
      subscription.omiseSubscriptionId
    );

    // 3. Update subscription status in PocketBase
    await pb.collection('subscriptions').update(subscription.id, {
      status: 'canceled',
      endDate: canceledOmiseSubscription.ended_at,
    });

    // 4. Update user's premium status in PocketBase
    await pb.collection('users').update(userId, { isPremium: false });

    res.json({ message: req.t('subscription_canceled') });
  } catch (err) {
    console.error(err.message);
    if (err instanceof ClientResponseError && err.status === 404) {
      return res.status(404).json({ msg: req.t('no_active_subscription') });
    }
    res.status(500).json({ msg: req.t('subscription_cancellation_failed') });
  }
};

/**
 * Retrieves the payment history for a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getPaymentHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const payments = await pb.collection('payments').getFullList({
      filter: `user="${userId}"`,
      sort: '-date',
    });
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(req.t('server_error'));
  }
};

/**
 * Purchases a consumable item (boost).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.purchaseConsumable = async (req, res) => {
  const { productId, amount } = req.body;
  const userId = req.user.id;

  try {
    // 1. Create Omise charge for the consumable
    const charge = await omise.charges.create({
      amount: amount * 100, // Convert to satang
      currency: 'THB',
      description: `Purchase of ${productId}`,
      metadata: {
        userId: userId,
        productId: productId,
        type: 'consumable'
      }
    });

    // 2. Save payment details to PocketBase
    const payment = await pb.collection('payments').create({
      user: userId,
      amount: amount,
      currency: 'THB',
      productId: productId,
      chargeId: charge.id,
      status: charge.status,
      date: new Date(),
      type: 'consumable'
    });

    // 3. If this is a boost purchase, update user's boost status
    if (productId === 'boost_50_thb') {
      // Update user's profile to indicate they have an active boost
      // This could involve setting a boost expiration timestamp
      const userProfile = await pb.collection('profiles').getFirstListItem(
        `user="${userId}"`
      );
      
      if (userProfile) {
        await pb.collection('profiles').update(userProfile.id, {
          boostExpiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
        });
      }
    }

    res.json({
      ...charge,
      paymentId: payment.id,
      message: req.t('consumable_purchased')
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: req.t('consumable_purchase_failed') });
  }
};
