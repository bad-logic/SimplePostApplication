const { express, check, body } = require('./../config');

const router = express.Router();

const feedController = require('./../controller/feed.controller');

const isAuthenticated = require('./../middleware/isAuth');

router.route('/post')
    .get(isAuthenticated, feedController.getPosts)
    .post(isAuthenticated, [
        body('title')
        .trim()
        .isLength({ min: 5 }).withMessage(`'title' should be at least 5 characters long`),
        body('content')
        .trim()
        .isLength({ min: 5 }).withMessage(`'content' should be at least 5 characters long`)
    ], feedController.createPost);

router.route('/post/:id')
    .get(isAuthenticated, feedController.getPost)
    .put(isAuthenticated, [
            body('title')
            .trim()
            .isLength({ min: 5 }).withMessage(`'title' should be at least 5 characters long`),
            body('content')
            .trim()
            .isLength({ min: 5 }).withMessage(`'content' should be at least 5 characters long`)
        ],
        feedController.editPost)
    .delete(isAuthenticated, feedController.deletePost);

module.exports = router;