const { getPb } = require('../db/pocketbase');

/**
 * @typedef {object} SubscriptionData
 * @property {string} user - The ID of the subscribed user.
 * @property {string} plan - The Omise plan ID for the subscription.
 * @property {string} omiseCustomerId - The customer ID from the Omise payment gateway.
 * @property {string} omiseSubscriptionId - The subscription ID from the Omise payment gateway.
 * @property {'active' | 'canceled' | 'past_due'} status - The current status of the subscription.
 * @property {Date} [startDate] - The date the subscription was created.
 * @property {Date} [endDate] - The date the subscription was canceled or expired.
 */

/**
 * Subscription model for interacting with the 'subscriptions' collection in PocketBase.
 */
class Subscription {
  static collectionName = 'subscriptions';

  /**
   * Creates a new subscription record.
   * @param {SubscriptionData} data - The subscription data.
   * @returns {Promise<object>} The created subscription record.
   */
  static async create(data) {
    const pb = getPb();
    return await pb.collection(Subscription.collectionName).create(data);
  }

  /**
   * Finds a subscription by its ID.
   * @param {string} id - The ID of the subscription.
   * @returns {Promise<object|null>} The subscription record, or null if not found.
   */
  static async findById(id) {
    const pb = getPb();
    try {
      return await pb.collection(Subscription.collectionName).getOne(id);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Finds a subscription by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<object|null>} The subscription record, or null if not found.
   */
  static async findByUserId(userId) {
    const pb = getPb();
    try {
      return await pb.collection(Subscription.collectionName).getFirstListItem(`user="${userId}"`);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Finds a subscription by Omise subscription ID.
   * @param {string} omiseSubscriptionId - The Omise subscription ID.
   * @returns {Promise<object|null>} The subscription record, or null if not found.
   */
  static async findByOmiseSubscriptionId(omiseSubscriptionId) {
    const pb = getPb();
    try {
      return await pb.collection(Subscription.collectionName).getFirstListItem(`omiseSubscriptionId="${omiseSubscriptionId}"`);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Updates an existing subscription record.
   * @param {string} id - The ID of the subscription to update.
   * @param {Partial<SubscriptionData>} data - The data to update.
   * @returns {Promise<object>} The updated subscription record.
   */
  static async update(id, data) {
    const pb = getPb();
    return await pb.collection(Subscription.collectionName).update(id, data);
  }

  /**
   * Deletes a subscription record by its ID.
   * @param {string} id - The ID of the subscription to delete.
   * @returns {Promise<boolean>} True if deletion was successful.
   */
  static async delete(id) {
    const pb = getPb();
    return await pb.collection(Subscription.collectionName).delete(id);
  }
}

module.exports = Subscription;
