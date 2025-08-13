/**
 * Initialize PocketBase Collections for FLRVI Admin Panel
 * This script creates necessary collections for UI/theme management and user profiles
 */

const { getPb } = require('../db/pocketbase');
const bcrypt = require('bcryptjs');

async function initializeCollections() {
  const pb = getPb();
  
  try {
    // Removed admin authentication for compatibility

    // 1. UI Theme Configuration Collection
    const themeSchema = {
      name: 'ui_themes',
      type: 'base',
      schema: [
        {
          name: 'theme_name',
          type: 'text',
          required: true,
          options: {
            max: 100
          }
        },
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['website', 'mobile_app', 'admin_panel', 'all']
          }
        },
        {
          name: 'primary_color',
          type: 'text',
          required: true,
          options: {
            pattern: '^#[0-9A-Fa-f]{6}$'
          }
        },
        {
          name: 'secondary_color',
          type: 'text',
          required: true,
          options: {
            pattern: '^#[0-9A-Fa-f]{6}$'
          }
        },
        {
          name: 'background_color',
          type: 'text',
          required: true,
          options: {
            pattern: '^#[0-9A-Fa-f]{6}$'
          }
        },
        {
          name: 'text_color',
          type: 'text',
          required: true,
          options: {
            pattern: '^#[0-9A-Fa-f]{6}$'
          }
        },
        {
          name: 'accent_color',
          type: 'text',
          required: false,
          options: {
            pattern: '^#[0-9A-Fa-f]{6}$'
          }
        },
        {
          name: 'background_image',
          type: 'file',
          required: false,
          options: {
            maxSelect: 1,
            maxSize: 5000000,
            mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
          }
        },
        {
          name: 'custom_css',
          type: 'editor',
          required: false
        },
        {
          name: 'is_active',
          type: 'bool',
          required: true
        },
        {
          name: 'created_by',
          type: 'relation',
          required: true,
          options: {
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            maxSelect: 1,
            displayFields: ['username']
          }
        }
      ]
    };

    // 2. User Profile Extended Collection
    const profileSchema = {
      name: 'user_profiles_extended',
      type: 'base',
      schema: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: '_pb_users_auth_',
            cascadeDelete: true,
            maxSelect: 1,
            displayFields: ['username', 'email']
          }
        },
        {
          name: 'full_name',
          type: 'text',
          required: true,
          options: {
            max: 100
          }
        },
        {
          name: 'display_name',
          type: 'text',
          required: true,
          options: {
            max: 50
          }
        },
        {
          name: 'gender',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['male', 'female', 'transgender', 'non_binary', 'other']
          }
        },
        {
          name: 'nationality',
          type: 'text',
          required: true,
          options: {
            max: 50
          }
        },
        {
          name: 'ethnicity',
          type: 'text',
          required: false,
          options: {
            max: 50
          }
        },
        {
          name: 'age',
          type: 'number',
          required: true,
          options: {
            min: 18,
            max: 100
          }
        },
        {
          name: 'profile_images',
          type: 'file',
          required: true,
          options: {
            maxSelect: 6,
            maxSize: 10000000,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
          }
        },
        {
          name: 'bio',
          type: 'text',
          required: false,
          options: {
            max: 500
          }
        },
        {
          name: 'location',
          type: 'text',
          required: false,
          options: {
            max: 100
          }
        },
        {
          name: 'interests',
          type: 'text',
          required: false,
          options: {
            max: 200
          }
        },
        {
          name: 'is_verified',
          type: 'bool',
          required: true
        },
        {
          name: 'is_premium',
          type: 'bool',
          required: true
        },
        {
          name: 'is_active',
          type: 'bool',
          required: true
        },
        {
          name: 'last_seen',
          type: 'date',
          required: false
        }
      ]
    };

    // 3. Admin Users Collection
    const adminSchema = {
      name: 'admin_users',
      type: 'auth',
      options: {
        allowEmailAuth: true,
        allowUsernameAuth: true,
        allowOAuth2Auth: false,
        requireEmail: true,
        exceptEmailDomains: [],
        onlyEmailDomains: [],
        minPasswordLength: 8
      },
      schema: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['super_admin', 'admin', 'moderator']
          }
        },
        {
          name: 'permissions',
          type: 'select',
          required: true,
          options: {
            maxSelect: 10,
            values: [
              'manage_users',
              'manage_themes',
              'manage_payments',
              'view_analytics',
              'manage_content',
              'manage_settings',
              'view_logs',
              'manage_admins',
              'delete_users',
              'system_control'
            ]
          }
        },
        {
          name: 'is_active',
          type: 'bool',
          required: true
        },
        {
          name: 'last_login',
          type: 'date',
          required: false
        }
      ]
    };

    // 4. Users Collection
    const usersSchema = {
      name: 'users',
      type: 'auth',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'gender',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['male', 'female', 'transgender']
          }
        },
        {
          name: 'nationality',
          type: 'text',
          required: true
        },
        {
          name: 'photo',
          type: 'file',
          required: true,
          options: {
            maxSelect: 1,
            maxSize: 5000000,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
          }
        },
        {
          name: 'isAdmin',
          type: 'bool',
          required: false,
          default: false
        },
        {
          name: 'verified',
          type: 'bool',
          required: false,
          default: false
        }
      ]
    };

    // Create collections
    const collections = [
      { schema: themeSchema, name: 'UI Themes' },
      { schema: profileSchema, name: 'User Profiles Extended' },
      { schema: adminSchema, name: 'Admin Users' },
      { schema: usersSchema, name: 'Users' }
    ];

    for (const collection of collections) {
      try {
        await pb.collections.create(collection.schema);
        console.log(`✅ Created collection: ${collection.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Collection ${collection.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating ${collection.name}:`, error.message);
        }
      }
    }

    // Create default theme configurations
    await createDefaultThemes(pb);

    // Create raja admin user
    await createRajaAdmin(pb);

    console.log('✅ Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createDefaultThemes(pb) {
  const defaultThemes = [
    {
      theme_name: 'FLRVI Default',
      platform: 'all',
      primary_color: '#E91E63',
      secondary_color: '#FF9800',
      background_color: '#FCE4EC',
      text_color: '#333333',
      accent_color: '#C2185B',
      custom_css: `
        /* FLRVI Default Theme */
        .gradient-bg {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
      `,
      is_active: true,
      created_by: 'admin' // This will be updated with actual admin ID
    },
    {
      theme_name: 'Dark Mode',
      platform: 'all',
      primary_color: '#BB86FC',
      secondary_color: '#03DAC6',
      background_color: '#121212',
      text_color: '#FFFFFF',
      accent_color: '#9C27B0',
      custom_css: `
        /* Dark Mode Theme */
        body.dark-theme {
          background-color: #121212;
          color: #ffffff;
        }
        .dark-theme .card {
          background-color: #1E1E1E;
          border: 1px solid #333333;
        }
      `,
      is_active: false,
      created_by: 'admin'
    }
  ];

  for (const theme of defaultThemes) {
    try {
      await pb.collection('ui_themes').create(theme);
      console.log(`✅ Created default theme: ${theme.theme_name}`);
    } catch (error) {
      console.log(`⚠️  Theme ${theme.theme_name} might already exist`);
    }
  }
}

async function createRajaAdmin(pb) {
  try {
    const adminData = {
      username: 'raja',
      email: 'raja@flrvi.com',
      password: '0987654321',
      passwordConfirm: '0987654321',
      role: 'super_admin',
      permissions: [
        'manage_users',
        'manage_themes', 
        'manage_payments',
        'view_analytics',
        'manage_content',
        'manage_settings',
        'view_logs',
        'manage_admins',
        'delete_users',
        'system_control'
      ],
      is_active: true,
      verified: true
    };

    const admin = await pb.collection('admin_users').create(adminData);
    console.log('✅ Created raja admin user successfully!');
    console.log('📧 Username: raja');
    console.log('🔑 Password: 0987654321');
    
    return admin;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Raja admin user already exists');
    } else {
      console.error('❌ Error creating raja admin:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeCollections()
    .then(() => {
      console.log('🎉 All done! Database is ready for FLRVI.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeCollections, createRajaAdmin };