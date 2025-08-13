const mongoose = require('mongoose');
const pb = require('../pocketbase');
const User = require('../models/User');
const Profile = require('../models/Profile');

async function migrateUsers() {
  const users = await User.find();
  let migratedCount = 0;
  
  for (const user of users) {
    try {
      // Check if user already exists
      const existing = await pb.collection('users').getFirstListItem(`email="${user.email}"`, { silent: true });
      if (existing) {
        console.log(`User ${user.email} already exists, skipping`);
        continue;
      }
      
      await pb.collection('users').create({
        name: user.name,
        email: user.email,
        password: user.password,
        isPremium: user.isPremium,
        lastLogin: user.lastLogin
      });
      migratedCount++;
    } catch (err) {
      if (err.status !== 404) { // Ignore "not found" errors
        console.error(`Failed to migrate user ${user.email}:`, err.message);
      }
    }
  }
  console.log(`Migrated ${migratedCount} users to PocketBase`);
}

async function migrateProfiles() {
  const profiles = await Profile.find().populate('user');
  let migratedCount = 0;
  
  for (const profile of profiles) {
    try {
      const pbUser = await pb.collection('users').getFirstListItem(`email="${profile.user.email}"`);
      
      // Check if profile already exists
      const existingProfile = await pb.collection('profiles').getFirstListItem(`user="${pbUser.id}"`, { silent: true });
      if (existingProfile) {
        console.log(`Profile for user ${profile.user.email} already exists, skipping`);
        continue;
      }
      
      await pb.collection('profiles').create({
        user: pbUser.id,
        name: profile.name,
        bio: profile.bio,
        gender: profile.gender,
        birthdate: profile.birthdate,
        location: profile.location,
        photos: profile.photos,
        interests: profile.interests,
        preferences: profile.preferences,
        lastActive: profile.lastActive
      });
      migratedCount++;
    } catch (err) {
      console.error(`Failed to migrate profile for user ${profile.user?.email || 'unknown'}:`, err.message);
    }
  }
  console.log(`Migrated ${migratedCount} profiles to PocketBase`);
}

async function migrateSubscriptions() {
  const db = mongoose.connection.db;
  const subscriptions = await db.collection('subscriptions').find().toArray();
  let migratedCount = 0;
  
  for (const sub of subscriptions) {
    try {
      // Get user email from MongoDB users collection
      const user = await db.collection('users').findOne({ _id: sub.user });
      if (!user) {
        console.log(`User not found for subscription ${sub._id}, skipping`);
        continue;
      }
      
      // Find corresponding PocketBase user
      const pbUser = await pb.collection('users').getFirstListItem(`email="${user.email}"`);
      
      // Check if subscription already exists
      const existingSub = await pb.collection('subscriptions').getFirstListItem(`omiseSubscriptionId="${sub.omiseSubscriptionId}"`, { silent: true });
      if (existingSub) {
        console.log(`Subscription ${sub.omiseSubscriptionId} already exists, skipping`);
        continue;
      }
      
      // Create subscription in PocketBase
      await pb.collection('subscriptions').create({
        user: pbUser.id,
        plan: sub.plan,
        omiseCustomerId: sub.omiseCustomerId,
        omiseSubscriptionId: sub.omiseSubscriptionId,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate
      });
      migratedCount++;
    } catch (err) {
      console.error(`Failed to migrate subscription for user ${user?.email || 'unknown'}:`, err.message);
    }
  }
  console.log(`Migrated ${migratedCount} subscriptions to PocketBase`);
}

async function runMigration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for migration');
    
    // Run migrations
    await migrateUsers();
    await migrateProfiles();
    await migrateSubscriptions();
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
