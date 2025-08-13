const { getPb } = require('../db/pocketbase');

async function createAdminUser() {
    const pb = getPb();
    
    try {
        // First create the admin user using the signup endpoint
        const adminData = {
            username: 'raja',
            email: 'raja@flrvi.com',
            password: '0987654321',
            passwordConfirm: '0987654321',
            name: 'Raja Admin',
            role: 'admin'
        };

        // Create admin user through users collection
        const createdUser = await pb.collection('users').create(adminData);
        console.log('✅ Admin user created successfully:', createdUser);
        
        // Set admin privileges through a custom endpoint or admin collection
        await pb.collection('users').update(createdUser.id, {
            isAdmin: true,
            verified: true
        });

        console.log('✅ Admin privileges granted successfully');
        
        // Authenticate to verify
        await pb.collection('users').authWithPassword('raja', '0987654321');
        console.log('✅ Admin authentication successful');

    } catch (error) {
        if (error.status === 404) {
            console.error('Error: Make sure the users collection exists first');
        } else {
            console.error('Error creating admin user:', error);
        }
    }
}

// Run the function
createAdminUser();
