const express = require('express');
const router = express.Router();
const { getUser, followUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:id', getUser);
router.put('/:id/follow', protect, followUser);

module.exports = router;
