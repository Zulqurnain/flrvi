/**
 * Generate 1000 Dummy Users for FLRVI
 * Requirements:
 * - 100 males (10% Thai, 90% European/American/Arabic)
 * - 850 females (100% Thai)
 * - 50 transgenders
 * - All profiles must have images
 * - Use rate limiting for external API calls
 */

const { getPb } = require('../db/pocketbase');
const rateLimiter = require('../utils/rateLimiter');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Thai Names Database
const THAI_NAMES = {
  male: [
    'Somchai', 'Somsak', 'Somphong', 'Somporn', 'Somjit', 'Anon', 'Anan', 'Anek', 'Apicha', 'Arthit',
    'Boonmee', 'Boonsong', 'Chaiwat', 'Chatchai', 'Chatri', 'Danai', 'Ekachai', 'Gamon', 'Itthipol',
    'Jakkrit', 'Kamol', 'Kawin', 'Kittisak', 'Manop', 'Niran', 'Pawat', 'Prayut', 'Rachen', 'Sarawut',
    'Suchart', 'Surachai', 'Thawatchai', 'Thirawat', 'Wanchai', 'Wichit', 'Yuthana', 'Nattapong', 'Pichit'
  ],
  female: [
    'Somying', 'Siriporn', 'Sunisa', 'Supanna', 'Sasithorn', 'Apinya', 'Araya', 'Benjamat', 'Chanida', 'Chutima',
    'Duangjai', 'Duangkamon', 'Fasai', 'Gingkarn', 'Janpen', 'Jirawan', 'Kamolchanok', 'Kannika', 'Kanya',
    'Ketsara', 'Kultida', 'Lamai', 'Malee', 'Mayuree', 'Nalina', 'Nalinee', 'Napasorn', 'Nattaya', 'Nitaya',
    'Panida', 'Patcharee', 'Patima', 'Pensri', 'Phantira', 'Pimnara', 'Piyada', 'Porntip', 'Pranee',
    'Ratana', 'Sirilak', 'Siriwan', 'Suchada', 'Sukanya', 'Supaporn', 'Suphatra', 'Tasanee', 'Thanapon',
    'Thanyarat', 'Wanida', 'Wanlaya', 'Waranya', 'Watsana', 'Wipaporn', 'Wiwat', 'Yada', 'Yuphin'
  ],
  transgender: [
    'Nong', 'Nim', 'Nuch', 'Ploy', 'Benz', 'Mint', 'Fern', 'Nan', 'Ping', 'Pim', 'Cartoon', 'Belle',
    'Cherry', 'Cream', 'Dream', 'Grace', 'Jazz', 'Kiki', 'Luna', 'Maya', 'Nova', 'Peach', 'Rose',
    'Sky', 'Star', 'Venus', 'Yuki', 'Zara', 'Angel', 'Candy', 'Diamond', 'Fame', 'Gift', 'Hope'
  ]
};

const THAI_SURNAMES = [
  'Pongsakorn', 'Rattanakorn', 'Siripongse', 'Wongsawat', 'Thanakit', 'Jindarat', 'Charoenrat',
  'Boonjit', 'Kasemsarn', 'Phongphan', 'Siriwan', 'Thaweesak', 'Ruangrit', 'Mongkol', 'Cherdchai',
  'Lertsiri', 'Wanichkul', 'Phakdeesan', 'Boontham', 'Charoensuk', 'Dechakul', 'Ekkachai', 'Fongkerd',
  'Gunthong', 'Hiranrat', 'Intharakul', 'Jitpreecha', 'Kamonrat', 'Limsiri', 'Manotham', 'Nanthakul'
];

const WESTERN_NAMES = {
  male: [
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
    'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth',
    'Ahmed', 'Mohammad', 'Ali', 'Omar', 'Hassan', 'Ibrahim', 'Youssef', 'Khalid', 'Saeed', 'Abdulla'
  ],
  surnames: [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez',
    'Al-Rashid', 'Al-Mahmoud', 'Al-Ahmad', 'Al-Hassan', 'Al-Ali', 'Bin-Mohammed', 'Bin-Ahmed', 'El-Sayed'
  ]
};

const NATIONALITIES = {
  thai: 'Thai',
  western: ['American', 'British', 'German', 'French', 'Italian', 'Spanish', 'Australian', 'Canadian'],
  arabic: ['Saudi Arabian', 'Emirati', 'Lebanese', 'Egyptian', 'Jordanian', 'Moroccan']
};

class DummyUserGenerator {
  constructor() {
    this.pb = null;
    this.imageDir = path.join(__dirname, '../temp_images');
    this.ensureImageDirectory();
  }

  ensureImageDirectory() {
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
    }
  }

  async initialize() {
    this.pb = getPb();
    
    try {
      // Authenticate as admin
      await this.pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL,
        process.env.POCKETBASE_ADMIN_PASSWORD
      );
      console.log('✅ Authenticated with PocketBase');
    } catch (error) {
      console.error('❌ Failed to authenticate:', error);
      throw error;
    }
  }

  getRandomAge() {
    return Math.floor(Math.random() * (35 - 18) + 18); // 18-35 years old
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateThaiProfile(gender) {
    const firstName = this.getRandomElement(THAI_NAMES[gender]);
    const lastName = this.getRandomElement(THAI_SURNAMES);
    
    return {
      full_name: `${firstName} ${lastName}`,
      display_name: firstName,
      gender: gender,
      nationality: NATIONALITIES.thai,
      ethnicity: 'Thai',
      age: this.getRandomAge(),
      location: this.getRandomElement(['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Koh Samui']),
      bio: this.generateBio(gender, 'thai'),
      interests: this.generateInterests()
    };
  }

  generateWesternProfile(gender) {
    const firstName = this.getRandomElement(WESTERN_NAMES.male);
    const lastName = this.getRandomElement(WESTERN_NAMES.surnames);
    const nationality = Math.random() < 0.3 ? 
      this.getRandomElement(NATIONALITIES.arabic) : 
      this.getRandomElement(NATIONALITIES.western);
    
    return {
      full_name: `${firstName} ${lastName}`,
      display_name: firstName,
      gender: gender,
      nationality: nationality,
      ethnicity: nationality.includes('Saudi') || nationality.includes('Emirati') || nationality.includes('Lebanese') ? 'Arabic' : 'Caucasian',
      age: this.getRandomAge(),
      location: this.getRandomElement(['New York', 'London', 'Dubai', 'Los Angeles', 'Paris', 'Berlin']),
      bio: this.generateBio(gender, 'western'),
      interests: this.generateInterests()
    };
  }

  generateBio(gender, ethnicity) {
    const bios = {
      thai_female: [
        "Love exploring Thai culture and meeting new people. Let's chat! 🌺",
        "Bangkok girl who loves good food and travel. Looking for genuine connections ✨",
        "Traditional Thai values with modern mindset. Let's see where this goes 💕",
        "Foodie who loves pad thai and sunset walks on the beach 🏖️"
      ],
      thai_male: [
        "Easy-going Thai guy who loves adventure and good company 🏍️",
        "Business owner in Bangkok, looking for someone special 💼",
        "Love Muay Thai, good food, and meaningful conversations 🥊"
      ],
      western_male: [
        "Expat living in Thailand, love the culture and people here 🌴",
        "Digital nomad exploring Southeast Asia. Let's explore together! 💻",
        "Adventure seeker and culture enthusiast. New to Thailand 🎒"
      ],
      transgender: [
        "Living my authentic self and loving every moment 🏳️‍⚧️",
        "Transgender and proud! Looking for genuine connections ❤️",
        "Life is beautiful when you're true to yourself ✨"
      ]
    };

    const key = ethnicity === 'thai' ? `thai_${gender}` : 
                gender === 'transgender' ? 'transgender' : `western_${gender}`;
    
    return this.getRandomElement(bios[key] || bios.thai_female);
  }

  generateInterests() {
    const allInterests = [
      'Travel', 'Food', 'Music', 'Movies', 'Art', 'Photography', 'Fitness', 'Yoga',
      'Reading', 'Dancing', 'Cooking', 'Sports', 'Fashion', 'Technology', 'Nature',
      'Beach', 'Hiking', 'Shopping', 'Meditation', 'Languages', 'Culture'
    ];
    
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 interests
    const selected = [];
    
    while (selected.length < count) {
      const interest = this.getRandomElement(allInterests);
      if (!selected.includes(interest)) {
        selected.push(interest);
      }
    }
    
    return selected.join(', ');
  }

  async downloadRandomImage(gender, index) {
    try {
      // Use different image services with rate limiting
      const imageUrl = this.getImageUrl(gender, index);
      
      const response = await rateLimiter.executeWithRateLimit(
        axios.get,
        [imageUrl, { responseType: 'stream' }],
        3000 // 3 second delay between image downloads
      );

      const filename = `${gender}_${index}_${Date.now()}.jpg`;
      const filepath = path.join(this.imageDir, filename);
      
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filepath));
        writer.on('error', reject);
      });
      
    } catch (error) {
      console.error(`Failed to download image for ${gender} ${index}:`, error.message);
      // Return a placeholder or try alternative service
      return this.createPlaceholderImage(gender, index);
    }
  }

  getImageUrl(gender, index) {
    // Use multiple image services to avoid rate limits
    const services = [
      `https://picsum.photos/400/600?random=${index}`,
      `https://source.unsplash.com/400x600/?portrait,${gender}&sig=${index}`,
      `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=600&fit=crop&crop=face`
    ];
    
    return this.getRandomElement(services);
  }

  async createPlaceholderImage(gender, index) {
    // Create a simple placeholder image file
    const filename = `placeholder_${gender}_${index}.txt`;
    const filepath = path.join(this.imageDir, filename);
    fs.writeFileSync(filepath, `Placeholder image for ${gender} user ${index}`);
    return filepath;
  }

  async createUserProfile(profile, imagePaths) {
    try {
      // First create the auth user
      const userData = {
        username: profile.display_name.toLowerCase() + Math.random().toString(36).substr(2, 9),
        email: `${profile.display_name.toLowerCase()}${Math.random().toString(36).substr(2, 5)}@flrvi-demo.com`,
        password: 'demo123456',
        passwordConfirm: 'demo123456',
        verified: Math.random() > 0.3 // 70% verified
      };

      const user = await this.pb.collection('users').create(userData);
      console.log(`✅ Created user: ${profile.display_name}`);

      // Create extended profile with images
      const profileData = {
        ...profile,
        user_id: user.id,
        is_verified: Math.random() > 0.7, // 30% verified
        is_premium: Math.random() > 0.8,  // 20% premium
        is_active: true,
        last_seen: new Date().toISOString()
      };

      // Add images if available
      if (imagePaths && imagePaths.length > 0) {
        const formData = new FormData();
        
        // Add all profile data
        Object.keys(profileData).forEach(key => {
          if (key !== 'profile_images') {
            formData.append(key, profileData[key]);
          }
        });

        // Add image files
        imagePaths.forEach((imagePath, index) => {
          if (fs.existsSync(imagePath)) {
            const stream = fs.createReadStream(imagePath);
            formData.append('profile_images', stream);
          }
        });

        const extendedProfile = await this.pb.collection('user_profiles_extended').create(formData);
        console.log(`✅ Created extended profile for: ${profile.display_name}`);
      } else {
        const extendedProfile = await this.pb.collection('user_profiles_extended').create(profileData);
        console.log(`✅ Created extended profile (no images) for: ${profile.display_name}`);
      }

      return { user, profile: extendedProfile };
      
    } catch (error) {
      console.error(`❌ Failed to create profile for ${profile.display_name}:`, error.message);
      return null;
    }
  }

  async generateAllUsers() {
    console.log('🚀 Starting dummy user generation...');
    console.log('📊 Target: 1000 users (100 males, 850 females, 50 transgender)');

    const results = {
      created: 0,
      failed: 0,
      males: 0,
      females: 0,
      transgender: 0
    };

    // Generate 850 Thai females
    console.log('\n👩 Generating 850 Thai females...');
    for (let i = 0; i < 850; i++) {
      try {
        const profile = this.generateThaiProfile('female');
        
        // Download images with rate limiting
        const imagePaths = [];
        for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) { // 1-3 images
          const imagePath = await this.downloadRandomImage('female', i * 10 + j);
          if (imagePath) imagePaths.push(imagePath);
        }

        const result = await this.createUserProfile(profile, imagePaths);
        
        if (result) {
          results.created++;
          results.females++;
          console.log(`✅ Female ${i + 1}/850 - ${profile.display_name}`);
        } else {
          results.failed++;
        }

        // Clean up image files
        imagePaths.forEach(path => {
          if (fs.existsSync(path)) fs.unlinkSync(path);
        });

      } catch (error) {
        console.error(`❌ Failed to create female ${i + 1}:`, error.message);
        results.failed++;
      }

      // Progress update every 50 users
      if ((i + 1) % 50 === 0) {
        console.log(`📈 Progress: ${i + 1}/850 females created`);
      }
    }

    // Generate 100 males (10% Thai, 90% Western/Arabic)
    console.log('\n👨 Generating 100 males...');
    for (let i = 0; i < 100; i++) {
      try {
        const isThai = i < 10; // First 10 are Thai
        const profile = isThai ? this.generateThaiProfile('male') : this.generateWesternProfile('male');
        
        // Download images
        const imagePaths = [];
        for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
          const imagePath = await this.downloadRandomImage('male', i * 10 + j);
          if (imagePath) imagePaths.push(imagePath);
        }

        const result = await this.createUserProfile(profile, imagePaths);
        
        if (result) {
          results.created++;
          results.males++;
          console.log(`✅ Male ${i + 1}/100 - ${profile.display_name} (${isThai ? 'Thai' : 'Western'})`);
        } else {
          results.failed++;
        }

        // Clean up
        imagePaths.forEach(path => {
          if (fs.existsSync(path)) fs.unlinkSync(path);
        });

      } catch (error) {
        console.error(`❌ Failed to create male ${i + 1}:`, error.message);
        results.failed++;
      }
    }

    // Generate 50 transgender users
    console.log('\n🏳️‍⚧️ Generating 50 transgender users...');
    for (let i = 0; i < 50; i++) {
      try {
        const profile = this.generateThaiProfile('transgender');
        
        // Download images
        const imagePaths = [];
        for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
          const imagePath = await this.downloadRandomImage('transgender', i * 10 + j);
          if (imagePath) imagePaths.push(imagePath);
        }

        const result = await this.createUserProfile(profile, imagePaths);
        
        if (result) {
          results.created++;
          results.transgender++;
          console.log(`✅ Transgender ${i + 1}/50 - ${profile.display_name}`);
        } else {
          results.failed++;
        }

        // Clean up
        imagePaths.forEach(path => {
          if (fs.existsSync(path)) fs.unlinkSync(path);
        });

      } catch (error) {
        console.error(`❌ Failed to create transgender user ${i + 1}:`, error.message);
        results.failed++;
      }
    }

    console.log('\n📊 Final Results:');
    console.log(`✅ Created: ${results.created} users`);
    console.log(`❌ Failed: ${results.failed} users`);
    console.log(`👨 Males: ${results.males}`);
    console.log(`👩 Females: ${results.females}`);
    console.log(`🏳️‍⚧️ Transgender: ${results.transgender}`);
    console.log(`🎉 Total: ${results.created} users successfully created!`);

    return results;
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new DummyUserGenerator();
  
  generator.initialize()
    .then(() => generator.generateAllUsers())
    .then((results) => {
      console.log('🎉 Dummy user generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Generation failed:', error);
      process.exit(1);
    });
}

module.exports = DummyUserGenerator;