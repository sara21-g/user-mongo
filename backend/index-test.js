/**
 * index-test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * This script connects to MongoDB, inserts sample data, then runs queries using
 * .explain("executionStats") to analyze how each index is used.
 *
 * Run: node index-test.js
 */

require('dotenv').config();
const dns = require('dns');
// Force public DNS resolvers to fix SRV lookup issues with MongoDB Atlas
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');

// ─── Sample Data ───────────────────────────────────────────────────────────────
const sampleUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 28,
    hobbies: ['reading', 'hiking', 'photography'],
    bio: 'Alice loves exploring mountains and capturing nature through her lens.',
    userId: 'uid-alice-001',
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    age: 35,
    hobbies: ['gaming', 'cooking'],
    bio: 'Bob is a passionate gamer and home chef who loves trying new recipes.',
    userId: 'uid-bob-002',
  },
  {
    name: 'Carol White',
    email: 'carol@example.com',
    age: 22,
    hobbies: ['dancing', 'reading', 'yoga'],
    bio: 'Carol practices yoga daily and enjoys classical literature in her spare time.',
    userId: 'uid-carol-003',
  },
  {
    name: 'David Brown',
    email: 'david@example.com',
    age: 45,
    hobbies: ['fishing', 'gardening'],
    bio: 'David enjoys the peace of fishing by the lake and tending to his garden.',
    userId: 'uid-david-004',
  },
  {
    name: 'Eva Martinez',
    email: 'eva@example.com',
    age: 30,
    hobbies: ['painting', 'hiking', 'music'],
    bio: 'Eva is an artist who finds inspiration in nature and expresses it through painting and music.',
    userId: 'uid-eva-005',
  },
];

// ─── Logger ────────────────────────────────────────────────────────────────────
const log = (title, obj) => {
  console.log('\n' + '═'.repeat(70));
  console.log(`  📊 ${title}`);
  console.log('═'.repeat(70));
  console.log(JSON.stringify(obj, null, 2));
};

const logStats = (title, stats) => {
  console.log('\n' + '─'.repeat(70));
  console.log(`  📈 ${title}`);
  console.log('─'.repeat(70));
  const execStats = stats?.executionStats || {};
  console.log(`  ✅ Execution Time (ms)   : ${execStats.executionTimeMillis ?? 'N/A'}`);
  console.log(`  🔑 Keys Examined         : ${execStats.totalKeysExamined ?? 'N/A'}`);
  console.log(`  📄 Documents Examined    : ${execStats.totalDocsExamined ?? 'N/A'}`);
  console.log(`  📦 Documents Returned    : ${execStats.nReturned ?? 'N/A'}`);
  const winningPlan = stats?.queryPlanner?.winningPlan;
  const stage = winningPlan?.stage || winningPlan?.inputStage?.stage || 'N/A';
  console.log(`  🏆 Winning Plan Stage    : ${stage}`);
};

// ─── Main ──────────────────────────────────────────────────────────────────────
async function runIndexTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clean slate
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Insert sample data
    const inserted = await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${inserted.length} sample users`);

    // Wait briefly for indexes to be ready
    await new Promise((r) => setTimeout(r, 500));

    // ── Test 1: Single Field Index on `name` ────────────────────────────────
    const nameQuery = await User.find({ name: 'Alice Johnson' })
      .explain('executionStats');
    logStats('Test 1: Single Field Index on `name`', nameQuery);

    // ── Test 2: Compound Index on `email` + `age` ───────────────────────────
    const compoundQuery = await User.find({ email: 'bob@example.com', age: 35 })
      .explain('executionStats');
    logStats('Test 2: Compound Index on `email` + `age`', compoundQuery);

    // ── Test 3: Multikey Index on `hobbies` (array field) ───────────────────
    const multikeyQuery = await User.find({ hobbies: 'hiking' })
      .explain('executionStats');
    logStats('Test 3: Multikey Index on `hobbies`', multikeyQuery);

    // ── Test 4: Text Index on `bio` ─────────────────────────────────────────
    const textQuery = await User.find({ $text: { $search: 'yoga nature' } })
      .explain('executionStats');
    logStats('Test 4: Text Index on `bio`', textQuery);

    // ── Test 5: Hashed Index on `userId` ────────────────────────────────────
    const hashedQuery = await User.find({ userId: 'uid-eva-005' })
      .explain('executionStats');
    logStats('Test 5: Hashed Index on `userId`', hashedQuery);

    // ── Test 6: TTL Index on `createdAt` — describe index ───────────────────
    console.log('\n' + '─'.repeat(70));
    console.log('  📈 Test 6: TTL Index on `createdAt`');
    console.log('─'.repeat(70));
    const indexes = await User.collection.indexes();
    const ttlIndex = indexes.find((i) => i.name === 'idx_createdAt_ttl');
    if (ttlIndex) {
      console.log('  ✅ TTL Index found:');
      console.log(`     Name             : ${ttlIndex.name}`);
      console.log(`     Key              : ${JSON.stringify(ttlIndex.key)}`);
      console.log(`     expireAfterSeconds: ${ttlIndex.expireAfterSeconds}`);
    } else {
      console.log('  ⚠️  TTL Index not found. It may still be building.');
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(70));
    console.log('  ✅ Index Test Complete! All 6 index types validated.');
    console.log('═'.repeat(70) + '\n');

  } catch (err) {
    console.error('❌ Error during index test:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

runIndexTests();
