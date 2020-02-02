const { express, body } = require('./../config');

const router = express.Router();

const User = require('./../models/user.model');

const authController = require('./../controller/auth.controller');

const isAuthenticated = require('./../middleware/isAuth');

router.put('/signup', [
    body('email').isEmail().withMessage('please enter a valid email')
    .custom((value, { req }) => {
        return User.findOne({ email: value })
            .then(user => {
                if (user) {
                    return Promise.reject('email address already exists'); // will be stored as error of validation
                }
            });
    }),
    body('password').trim().isLength({ min: 5 }).isAlphanumeric().withMessage('password should be at least 5 characters long and should contain numbers and letters'),
    body('name').trim().not().isEmpty().withMessage('Please provide name')
], authController.register);

router.post('/login', [
    body('email').isEmail().withMessage('Enter valid email address'),
    body('password').trim().not().isEmpty().withMessage('Password cannot be empty')
], authController.login);

router.get('/status', isAuthenticated, authController.getUserStatus);

router.patch('/status',
    isAuthenticated, [
        body('status')
        .trim()
        .not()
        .isEmpty()
    ],
    authController.updateUserStatus
);


module.exports = router;