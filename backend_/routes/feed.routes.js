const { express } = require('./../config');

const router = express.Router();

const feedController = require('./../controller/feed.controller');


router.route('/post')
    .get(feedController.getPosts)
    .post(feedController.createPost);

module.exports = router;