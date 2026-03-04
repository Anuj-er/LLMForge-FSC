const express = require('express');
const { createQuery, getHistory, deleteQuery } = require('../controllers/queryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/query -> Accept user question, call LLMs, summarize, and save
router.post('/query', protect, createQuery);

// GET /api/history -> Return previous queries
router.get('/history', protect, getHistory);

// DELETE /api/history/:id -> Delete a specific query
router.delete('/history/:id', protect, deleteQuery);

module.exports = router;
