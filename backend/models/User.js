const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters long'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address',
      ],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120'],
    },
    hobbies: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We manage createdAt manually for TTL
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// 1. Single field index on name (for search by name)
userSchema.index({ name: 1 }, { name: 'idx_name_single' });

// 2. Compound index on email + age (for filtering by email and age)
userSchema.index({ email: 1, age: 1 }, { name: 'idx_email_age_compound' });

// 3. Multikey index on hobbies (array field auto-creates multikey index)
userSchema.index({ hobbies: 1 }, { name: 'idx_hobbies_multikey' });

// 4. Text index on bio (for full-text search)
userSchema.index({ bio: 'text' }, { name: 'idx_bio_text' });

// 5. Hashed index on userId
userSchema.index({ userId: 'hashed' }, { name: 'idx_userId_hashed' });

// 6. TTL index on createdAt — documents expire after 24 hours (86400 seconds)
userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, name: 'idx_createdAt_ttl' }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
