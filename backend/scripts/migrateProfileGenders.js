const path = require('path');
const PocketBase = require('pocketbase').default;
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Create PocketBase client
const pb = new PocketBase(process.env.POCKETBASE_URL.replace(/"/g, ''));

// Environment variables are already loaded by pocketbase.js
// Gender value mapping
const genderMap = {
  'Man': 'male',
  'Woman': 'female',
  'Other': 'other'
};

// Check if PocketBase is running
async function checkPocketBaseHealth() {
  try {
    const response = await axios.get(`${process.env.POCKETBASE_URL}/api/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (err) {
    console.error('Health check failed:', err.message);
    return false;
  }
}

// Connect to PocketBase with retry logic
async function connectToPocketBase() {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds
  
  for (let i = 1; i <= maxRetries; i++) {
    try {
      // Check health first
      const isHealthy = await checkPocketBaseHealth();
      if (!isHealthy) {
        throw new Error('PocketBase health check failed');
      }

      // Attempt to authenticate
      await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL,
        process.env.POCKETBASE_ADMIN_PASSWORD
      );
      console.log('Successfully connected to PocketBase');
      return true;
    } catch (err) {
      console.error(`Connection attempt ${i}/${maxRetries} failed:`, err);
      
      if (i < maxRetries) {
        console.log(`Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  return false;
}

async function migrateGenders() {
  try {
    console.log('Starting gender migration with PocketBase...');
    
    // Connect to PocketBase with retry logic
    const connected = await connectToPocketBase();
    if (!connected) {
      throw new Error('Could not establish connection to PocketBase after multiple attempts');
    }

    // Get all profiles from PocketBase
    const profiles = await pb.collection('profiles').getFullList({
      sort: '-created',
    });

    let updatedCount = 0;

    for (const profile of profiles) {
      if (genderMap[profile.gender]) {
        const newGender = genderMap[profile.gender];
        await pb.collection('profiles').update(profile.id, {
          gender: newGender
        });
        updatedCount++;
        console.log(`Updated profile ${profile.id}: ${profile.gender} -> ${newGender}`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} profiles.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    process.exit(1);
  }
}

migrateGenders();
