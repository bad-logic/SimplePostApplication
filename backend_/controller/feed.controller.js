const { validationResult } = require('./../config');
const Post = require('./../models/post.model');
const { file, path } = require('./../config');
const User = require('./../models/user.model');

const POST_PER_PAGE = 2;

exports.getPosts = async(req, res, next) => {

    const currentPage = req.query.page || 1;
    let totalItems;

    // USING ASYNC AWAIT
    try {
        // mongoose does not return a real promise but returns a promise like object
        // where you can use then/catch or async/await
        // you can return a real promise by chaining  .exec after mongoose operations
        const totalItems = await Post.find().countDocuments().exec();
        const posts = await Post.find().populate('creator')
            .skip((currentPage - 1) * POST_PER_PAGE).limit(POST_PER_PAGE).exec();
        res.status(200).json({
            message: 'posts fetched successfull!!!',
            posts: posts,
            totalItems: totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

    // USING PROMISE
    // Post.find()
    //     .countDocuments()
    //     .then(count => {
    //         totalItems = count;
    //         return Post.find()
    //             .skip((currentPage - 1) * POST_PER_PAGE)
    //             .limit(POST_PER_PAGE);
    //     })
    //     .then(posts => {
    //         res.status(200).json({
    //             message: 'posts fetched successfull!!!',
    //             posts: posts,
    //             totalItems: totalItems
    //         });
    //     })
    //     .catch(err => {
    //         if (!err.statusCode) {
    //             err.statusCode = 500;
    //         }
    //         next(err);
    //     });

}

exports.getPost = async(req, res, next) => {

    const id = req.params.id;
    try {
        const post = await Post.findById(id);
        if (!post) {
            const error = new Error('no post found');
            error.statusCode = 404;
            // return next(err);
            next(error); // will be caught by the below catch block which will then call express error handling 
            // middleware
        }
        res.status(200).json({
            message: 'post found',
            post: post
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

exports.createPost = async(req, res, next) => {

    const error = validationResult(req);

    const image = req.file;

    if (!image) {
        const error = new Error('File Type not supported');
        error.statusCode = 422;
        next(error);
    }
    if (!error.isEmpty()) {
        const error = new Error('validation failed, entered data is incorrect');
        error.statusCode = 422;
        next(error);
    }

    let newPost = new Post({});
    newPost.title = req.body.title;
    newPost.content = req.body.content;
    newPost.imageUrl = "/" + image.path;
    newPost.creator = req.userId;

    // USING ASYNC/AWAIT
    try {
        const result = await newPost.save();
        const user = await User.findById(req.userId);
        user.posts.push(newPost);
        const done = await user.save();
        res.status(201).json({
            message: 'post created successfully!!!',
            post: newPost,
            creator: {
                _id: user._id,
                name: user.name
            }
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
    // USING PROMISE
    // let creator;
    // newPost.save()
    //     .then(result => {
    //         return User.findById(req.userId);
    //     })
    //     .then(user => {
    //         // logged in user info in user
    //         creator = user;
    //         user.posts.push(newPost); // mongoose will automatically extract and store the id
    //         return user.save();
    //     })
    //     .then(done => {
    //         res.status(201).json({
    //             message: 'post created successfully!!!',
    //             post: newPost,
    //             creator: {
    //                 _id: creator._id,
    //                 name: creator.name
    //             }
    //         });
    //     })
    //     .catch(err => {
    //         if (!err.statusCode) {
    //             err.statusCode = 500;
    //         }
    //         next(err); // will be caught by express general error handler middleware
    //     });

}


exports.editPost = async(req, res, next) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        const error = new Error('validation failed, entered data is incorrect');
        error.statusCode = 422;
        next(error);
    }

    const image = req.file;


    // if new image is not provided, old image path will be sent in image field from the react app 
    let newImagePath = req.body.image; //old imageUrl
    // if new image is provided then we will update the imageUrl in database
    if (image) {
        newImagePath = "/" + image.path; //new imageUrl
    }
    // THIS CASE MAY NOT OCCURR STILL CHECKING IN CASE, DATA IS SENT FROM OTHER SOURCES TO THIS API ENDPOINT
    if (!newImagePath) {
        const error = new Error('No file is provided');
        error.statusCode = 422;
        next(error);
    }

    const postId = req.params.id;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('no post found');
            error.statusCode = 404;
            throw error;
        }

        // CHECKING IF THE POST IS CREATED BY THE LOGGED IN USER
        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error('Not authorised');
            error.statusCode = 403;
            throw error;
        }

        // CASE WHERE NEW IMAGE IS UPLOADED, WE NEED TO DELETE THE OLD IMAGE FROM FILESYSTEM
        if (post.imageUrl !== newImagePath) {
            clearImage(post.imageUrl);
        }
        post.title = req.body.title;
        post.content = req.body.content;
        post.imageUrl = newImagePath;
        const response = await post.save();
        res.status(200).json({
            message: 'post updated successfully!!!',
            post: response
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

    // USING PROMISE
    // Post.findById(postId)
    //     .then(post => {

    //         //  CHECKING IF NO POST WITH THAT POSTID
    //         if (!post) {
    //             const error = new Error('no post found');
    //             error.statusCode = 404;
    //             throw error;
    //         }

    //         // CHECKING IF THE POST IS CREATED BY THE LOGGED IN USER
    //         if (post.creator.toString() !== req.userId.toString()) {
    //             const error = new Error('Not authorised');
    //             error.statusCode = 403;
    //             throw error;
    //         }

    //         // CASE WHERE NEW IMAGE IS UPLOADED, WE NEED TO DELETE THE OLD IMAGE FROM FILESYSTEM
    //         if (post.imageUrl !== newImagePath) {
    //             clearImage(post.imageUrl);
    //         }
    //         post.title = req.body.title;
    //         post.content = req.body.content;
    //         post.imageUrl = newImagePath;

    //         return post.save();
    //     })
    //     .then(response => {
    //         res.status(200).json({
    //             message: 'post updated successfully!!!',
    //             post: response
    //         });
    //     })
    //     .catch(err => {
    //         if (!err.statusCode) {
    //             err.statusCode = 500;
    //         }
    //         next(err);
    //     });

}

exports.deletePost = async(req, res, next) => {

    const postId = req.params.id;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('no post found');
            error.status = 404;
            throw error;
        }

        // CHECKING IF THE POST IS CREATED BY THE LOGGED IN USER
        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error('Not authorised');
            error.statusCode = 403;
            throw error;
        }

        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId); // removing post id reference from user 
        await user.save();
        res.status(200).json({
            message: 'Post deleted successfully!!!'
        });


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

    // USING PROMISE
    // Post.findById(postId)
    //     .then(post => {
    //         if (!post) {
    //             const error = new Error('no post found');
    //             error.status = 404;
    //             throw error;
    //         }

    //         // CHECKING IF THE POST IS CREATED BY THE LOGGED IN USER
    //         if (post.creator.toString() !== req.userId.toString()) {
    //             const error = new Error('Not authorised');
    //             error.statusCode = 403;
    //             throw error;
    //         }

    //         clearImage(post.imageUrl);
    //         return Post.findByIdAndRemove(postId);

    //     })
    //     .then(response => {
    //         // POST HAS BEEN DELETED SO REMOVE THE POSTID FROM THE USER MODEL
    //         return User.findById(req.userId);
    //     })
    //     .then(user => {
    //         // POSTID REMOVED FROM USER MODEL
    //         user.posts.pull(postId);
    //         return user.save();
    //     })
    //     .then(result => {
    //         res.status(200).json({
    //             message: 'Post deleted successfully!!!'
    //         });
    //     })
    //     .catch(err => {
    //         if (!err.statusCode) {
    //             err.statusCode = 500;
    //         }
    //         next(err);
    //     });

}

const clearImage = filePath => {

    filePath = path.join(__dirname, "..", filePath);
    file.unlink(filePath, (err, done) => {
        if (err) {
            console.log("error deleting the file");
        }
    });
}