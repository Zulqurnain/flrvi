const PocketBase = require('pocketbase/cjs');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

let pbInstance = null;

function getPb() {
  if (!pbInstance) {
    const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
    console.log(`Initializing PocketBase with URL: ${pocketbaseUrl}`);
    pbInstance = new PocketBase(pocketbaseUrl);
  }
  return pbInstance;
}

function setPb(instance) {
  pbInstance = instance;
}

module.exports = { getPb, setPb };
