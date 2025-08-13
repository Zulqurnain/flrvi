const pb = require('../pocketbase');

async function initCollections() {
  try {
    console.log('Initializing PocketBase collections...');
    
    // Create users collection
    await pb.collection('users').create({
      name: 'users',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true, unique: true },
        { name: 'password', type: 'password', required: true },
        { name: 'isPremium', type: 'bool', default: false },
        { name: 'lastLogin', type: 'date' }
      ],
      indexes: [{ name: 'idx_user_email', fields: ['email'] }]
    });

    // Create profiles collection
    await pb.collection('profiles').create({
      name: 'profiles',
      type: 'base',
      schema: [
        { name: 'user', type: 'relation', collection: 'users', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'bio', type: 'text' },
        { name: 'gender', type: 'text' },
        { name: 'birthdate', type: 'date' },
        { name: 'location', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'interests', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'lastActive', type: 'date' }
      ],
      indexes: [{ name: 'idx_profile_user', fields: ['user'] }]
    });

    // Create subscriptions collection
    await pb.collection('subscriptions').create({
      name: 'subscriptions',
      type: 'base',
      schema: [
        { name: 'user', type: 'relation', collection: 'users', required: true },
        { name: 'plan', type: 'text', required: true },
        { name: 'omiseCustomerId', type: 'text', required: true },
        { name: 'omiseSubscriptionId', type: 'text', required: true },
        { name: 'status', type: 'text', required: true },
        { name: 'startDate', type: 'date', required: true },
        { name: 'endDate', type: 'date' }
      ],
      indexes: [
        { name: 'idx_subscription_user', fields: ['user'] },
        { name: 'idx_subscription_status', fields: ['status'] }
      ]
    });

    // Create payments collection
    await pb.collection('payments').create({
      name: 'payments',
      type: 'base',
      schema: [
        { name: 'user', type: 'relation', collection: 'users', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'transactionId', type: 'text' }
      ],
      indexes: [
        { name: 'idx_payment_user', fields: ['user'] },
        { name: 'idx_payment_date', fields: ['date'] }
      ]
    });

    console.log('PocketBase collections initialized successfully');
  } catch (error) {
    console.error('Error initializing PocketBase collections:', error);
    process.exit(1);
  }
}

initCollections();
