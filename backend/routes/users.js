const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ─── Helper ────────────────────────────────────────────────────────────────────
const handleError = (res, err, code = 500) => {
  console.error(err);
  res.status(code).json({ success: false, message: err.message || 'Server Error' });
};

// ─── POST /api/users — Create a new user ──────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const saved = await user.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) {
      return handleError(res, new Error('Email or userId already exists'), 400);
    }
    handleError(res, err, 400);
  }
});

// ─── GET /api/users — Retrieve all users (with filtering, sorting, pagination) ─
// Query params:
//   name        → search by name (regex, case-insensitive)
//   email       → exact filter by email
//   age         → exact filter by age
//   minAge      → filter age >= minAge
//   maxAge      → filter age <= maxAge
//   hobbies     → comma-separated list (find users who have ALL listed hobbies)
//   search      → full-text search on bio
//   sortBy      → field to sort by (default: createdAt)
//   order       → asc | desc (default: desc)
//   page        → page number (default: 1)
//   limit       → results per page (default: 10)
router.get('/', async (req, res) => {
  try {
    const {
      name,
      email,
      age,
      minAge,
      maxAge,
      hobbies,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Name search (partial, case-insensitive)
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    // Exact email filter
    if (email) {
      filter.email = email.toLowerCase();
    }

    // Age filters
    if (age !== undefined) {
      filter.age = Number(age);
    } else {
      const ageFilter = {};
      if (minAge !== undefined) ageFilter.$gte = Number(minAge);
      if (maxAge !== undefined) ageFilter.$lte = Number(maxAge);
      if (Object.keys(ageFilter).length > 0) filter.age = ageFilter;
    }

    // Hobbies filter (user must have ALL listed hobbies)
    if (hobbies) {
      const hobbiesArray = hobbies.split(',').map((h) => h.trim());
      filter.hobbies = { $all: hobbiesArray };
    }

    // Full-text search on bio
    if (search) {
      filter.$text = { $search: search };
    }

    // Sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    handleError(res, err);
  }
});

// ─── GET /api/users/:id — Get a single user by MongoDB _id ────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return handleError(res, new Error('User not found'), 404);
    res.json({ success: true, data: user });
  } catch (err) {
    handleError(res, err, 400);
  }
});

// ─── PUT /api/users/:id — Update a user by MongoDB _id ───────────────────────
router.put('/:id', async (req, res) => {
  try {
    // Run validators on update
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return handleError(res, new Error('User not found'), 404);
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 11000) {
      return handleError(res, new Error('Email already exists'), 400);
    }
    handleError(res, err, 400);
  }
});

// ─── DELETE /api/users/:id — Delete a user by MongoDB _id ────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return handleError(res, new Error('User not found'), 404);
    res.json({ success: true, message: 'User deleted successfully', data: deleted });
  } catch (err) {
    handleError(res, err, 400);
  }
});

module.exports = router;
