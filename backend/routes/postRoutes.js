const express = require('express');
const router = express.Router();
const { createPost, getPosts, likePost, addComment, getComments } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.route('/')
    .post(protect, createPost)
    .get(getPosts);

router.put('/:id/like', protect, likePost);

router.route('/:postId/comments')
    .post(protect, addComment)
    .get(getComments);

module.exports = router;
