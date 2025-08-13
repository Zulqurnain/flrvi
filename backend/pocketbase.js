const PocketBase = require('pocketbase/cjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ 
  path: path.resolve(__dirname, '.env'),
  override: true
});

// Create PocketBase client with full API URL
const pb = new PocketBase(process.env.POCKETBASE_URL);

// Health check function
const health = {
  check: async () => {
    try {
      // Authenticate as admin
      await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL,
        process.env.POCKETBASE_ADMIN_PASSWORD
      );
      
      // Check if collections exist
      const collections = await pb.collections.getFullList();
      return true;
    } catch (err) {
      throw new Error(`PocketBase health check failed: ${err.message}`);
    }
  }
};

module.exports = {
  pb,
  health
};
