const { express, check, body } = require('./../config');

const router = express.Router();

const feedController = require('./../controller/feed.controller');


router.route('/post')
    .get(feedController.getPosts)
    .post([
        body('title')
        .trim()
        .isLength({ min: 5 }).withMessage(`'title' should be at least 5 characters long`),
        body('content')
        .trim()
        .isLength({ min: 5 }).withMessage(`'content' should be at least 5 characters long`)
    ], feedController.createPost);

router.get('/post/:id', feedController.getPost);

module.exports = router;