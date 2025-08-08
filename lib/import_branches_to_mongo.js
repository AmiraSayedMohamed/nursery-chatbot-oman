// lib/branches.js
// Script to import branches from data.ts to MongoDB

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'nurseries';
const COLLECTION_NAME = 'branches';

async function main() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not set in environment');
  }
  // Read data.ts as text
  const dataFilePath = path.join(__dirname, 'data.ts');
  const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
  // Extract branches array (supporting type annotation)
  const branchesMatch = fileContent.match(/export const branches:\s*string\[\]\s*=\s*\[([\s\S]*?)\]/);
  if (!branchesMatch) {
    throw new Error('branches array not found in data.ts');
  }
  const branchesString = branchesMatch[1];
  const branches = branchesString
    .split(',')
    .map(branch => branch.trim().replace(/['"]/g, ''))
    .filter(branch => branch.length > 0);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  // Remove all existing branches
  await collection.deleteMany({});
  // Insert new branches
  await collection.insertMany(branches.map(b => ({ name: b })));
  console.log('Branches imported:', branches.length);
  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
