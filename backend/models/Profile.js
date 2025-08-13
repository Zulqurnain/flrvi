const { getPb } = require('../db/pocketbase');

/**
 * @typedef {object} Profile
 * @property {string} user - The ID of the associated user account.
 * @property {string} [bio] - A short biography written by the user.
 * @property {string[]} [photos] - An array of URLs to the user's uploaded photos.
 * @property {string} [location] - The user's location (e.g., 'Bangkok, Thailand').
 * @property {string[]} [interests] - A list of the user's interests.
 * @property {number} [age] - The user's age, calculated from their birthday.
 * @property {'Man'|'Woman'|'Other'} [gender] - The user's gender.
 */

/**
 * Profile Model
 * Handles interactions with the 'profiles' collection in PocketBase.
 */
class Profile {
  constructor() {
    this.collection = getPb().collection('profiles');
  }

  /**
   * Creates a new profile.
   * @param {Profile} profileData - The data for the new profile.
   * @returns {Promise<Profile>} The created profile record.
   */
  async create(profileData) {
    try {
      return await this.collection.create(profileData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds a profile by user ID.
   * @param {string} userId - The ID of the user associated with the profile.
   * @returns {Promise<Profile|null>} The profile record, or null if not found.
   */
  async findByUserId(userId) {
    try {
      return await this.collection.getFirstListItem(`user="${userId}"`);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Updates an existing profile.
   * @param {string} profileId - The ID of the profile to update.
   * @param {Partial<Profile>} updateData - The data to update.
   * @returns {Promise<Profile>} The updated profile record.
   */
  async update(profileId, updateData) {
    try {
      return await this.collection.update(profileId, updateData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a profile by ID.
   * @param {string} profileId - The ID of the profile to delete.
   * @returns {Promise<boolean>} True if deletion was successful.
   */
  async delete(profileId) {
    try {
      return await this.collection.delete(profileId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Profile;
