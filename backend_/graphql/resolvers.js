const User = require('./../models/user.model');
const { validator, jwt } = require('./../config');
const Post = require('./../models/post.model');
const { clearImage } = require('./../utils/file');

module.exports = {
    // createUser(args, req) {
    //     const email = args.userInput.email;

    // }
    createUser: async function({ userInput }, req) {

        const errorArray = [];
        if (!validator.isEmail(userInput.email)) {
            errorArray.push({ message: 'E-mail is invalid!!!' });
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
            errorArray.push({ message: 'Password too short!!!' });
        }
        if (validator.isEmpty(userInput.name)) {
            errorArray.push({ message: 'name must provided' });
        }
        if (errorArray.length > 0) {
            const error = new Error('validation failed');
            error.data = errorArray;
            error.statusCode = 422;
            throw error;
        }
        // try {
        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
            const error = new Error('User already exists with that Email');
            error.statusCode = 422;
            throw error;
        }

        const newUser = new User({
            name: userInput.name,
            email: userInput.email,
            password: userInput.password
        });
        const createdUser = await newUser.save();
        return {...createdUser._doc, _id: createdUser._id.toString() };
        //     } catch (err) {
        //         if (!err.statusCode) {
        //             err.statusCode = 500;
        //         }
        //         next(err);
        //     }
    },

    login: async function({ email, password }) {

        const errorArray = [];

        if (!validator.isEmail(email)) {
            errorArray.push({ message: 'E-mail is invalid!!!' });
        }
        if (validator.isEmpty(password)) {
            errorArray.push({ message: 'Password is required!!!' });
        }

        if (errorArray.length > 0) {
            const error = new Error('validation failed');
            error.data = errorArray;
            error.statusCode = 422;
            throw error;
        }

        const user = await User.MatchByCredentials(email, password);
        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        }, User.getJWT().signature_key, { expiresIn: '1h' });

        return {
            token: token,
            userId: user._id.toString()
        }

    },

    createPost: async function({ postInput }, req) {
        if (!req.isAuth) {
            // USER NOT AUTHENTICATED
            const error = new Error('User not Authenticated');
            error.statusCode = 401;
            throw error;
        }

        const errorArray = [];

        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
            errorArray.push({ message: 'title should be at least 5 characters long' });
        }

        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
            errorArray.push({ message: 'content should be at least 5 characters long' });
        }

        if (errorArray.length > 0) {
            const error = new Error('validation failed');
            error.data = errorArray;
            error.statusCode = 422;
            throw error;
        }

        let newPost = new Post({});
        newPost.title = postInput.title;
        newPost.content = postInput.content;
        newPost.imageUrl = "/" + postInput.imageUrl;
        newPost.creator = req.userId;

        const createdPost = await newPost.save();
        const user = await User.findById(req.userId);
        user.posts.push(createdPost);
        await user.save();

        return {
            ...createdPost._doc,
            _id: createdPost._id.toString(), //overwrites the _id by createdPost._id
            creator: user,
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
        }
    },

    getPosts: async function({ page }, req) {

        if (!req.isAuth) {
            // USER NOT AUTHENTICATED
            const error = new Error('User not Authenticated');
            error.statusCode = 401;
            throw error;
        }

        const POST_PER_PAGE = 2;
        const currentPage = page || 1;
        const count = await Post.find().countDocuments();
        if (count < 1) {
            const error = new Error('no post found');
            error.statusCode = 404;
            throw error;
        }

        const posts = await Post.find()
            .populate('creator')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * POST_PER_PAGE)
            .limit(POST_PER_PAGE);

        return {
            totalPosts: count,
            posts: posts.map(p => {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString()
                }
            })
        };

    },
    getPost: async function({ id }, req) {
        if (!req.isAuth) {
            // USER NOT AUTHENTICATED
            const error = new Error('User not Authenticated');
            error.statusCode = 401;
            throw error;
        }
        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error('no post found');
            error.statusCode = 404;
            throw error;
        }
        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },
    updatePost: async function({ id, postInput }, req) {
        // AUTHENTICATION
        if (!req.isAuth) {
            // USER NOT AUTHENTICATED
            const error = new Error('User not Authenticated');
            error.statusCode = 401;
            throw error;
        }

        // AUTHORISATION
        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error('no post found');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('not Authorised');
            error.statusCode = 403;
            throw error;
        }

        // VALIDATION
        const errorArray = [];

        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
            errorArray.push({ message: 'title should be at least 5 characters long' });
        }

        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
            errorArray.push({ message: 'content should be at least 5 characters long' });
        }

        if (errorArray.length > 0) {
            const error = new Error('validation failed');
            error.data = errorArray;
            error.statusCode = 422;
            throw error;
        }

        post.title = postInput.title;
        post.content = postInput.content;
        if (postInput.imageUrl !== 'undefined') {
            post.imageUrl = "/" + postInput.imageUrl;
        }
        const updatedPost = await post.save();
        return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            creator: post.creator,
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString()
        }

    },
    deletePost: async function({ id }, req) {
        // AUTHENTICATION
        if (!req.isAuth) {
            // USER NOT AUTHENTICATED
            const error = new Error('User not Authenticated');
            error.statusCode = 401;
            throw error;
        }

        // AUTHORISATION
        const post = await Post.findById(id);
        if (!post) {
            const error = new Error('no post found');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error('not Authorised');
            error.statusCode = 403;
            throw error;
        }

        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(id);
        const user = await User.findById(req.userId);
        user.posts.pull(id); // removing post id reference from user 
        await user.save();
        return true;
    },
    user: async function(args, req) {
        // AUTHENTICATION
        if (!req.isAuth) {
            // USER NOT AUTHENTICATED
            const error = new Error('User not Authenticated');
            error.statusCode = 401;
            throw error;
        }

        // AUTHORISATION
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('no user found');
            error.statusCode = 404;
            throw error;
        }

        return {
            ...user._doc,
            _id: user._id.toString(),
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        }
    },
    updateStatus: async function({ status }, req) {
        // AUTHENTICATION
        if (!req.isAuth) {
            // USER NOT AUTHENTICATED
            const error = new Error('User not Authenticated');
            error.statusCode = 401;
            throw error;
        }

        // AUTHORISATION
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('no user found');
            error.statusCode = 404;
            throw error;
        }
        user.status = status;
        const updatedUser = await user.save();
        return {
            ...updatedUser._doc,
            _id: updatedUser._id.toString(),
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
        }
    }
}