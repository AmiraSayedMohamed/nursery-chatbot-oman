const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const nurseriesPath = path.join(__dirname, '../lib/nurseries.json');

async function main() {
  if (!uri) {
    throw new Error('MONGODB_URI not found in .env.local');
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collection = db.collection('nurseries');

  // Read nurseries from JSON file
  const data = JSON.parse(fs.readFileSync(nurseriesPath, 'utf-8'));

  // Remove all old data (optional)
  await collection.deleteMany({});

  // Insert all nurseries
  await collection.insertMany(data);

  console.log(`تم استيراد ${data.length} حضانة إلى MongoDB بنجاح!`);
  await client.close();
}

main().catch(console.error);
