const { validationResult } = require('./../config');
const PostModel = require('./../models/post.model');
const { file, path } = require('./../config');

exports.getPosts = (req, res, next) => {

    PostModel.find({})
        .then(posts => {
            res.status(200).json({
                message: 'posts fetched successfull!!!',
                posts: posts
            });
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}

exports.getPost = (req, res, next) => {

    const id = req.params.id;
    PostModel.findById(id)
        .then(post => {
            if (!post) {
                const error = new Error('no post found');
                error.statusCode = 404;
                // return next(err);
                throw error; // will be caught by the below catch block which will then call express error handling 
                // middleware
            }
            res.status(200).json({
                message: 'post found',
                post: post
            });
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}

exports.createPost = (req, res, next) => {

    const error = validationResult(req);

    const image = req.file;

    if (!image) {
        const error = new Error('File Type not supported');
        error.statusCode = 422;
        throw error;
    }
    if (!error.isEmpty()) {
        const error = new Error('validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw error; // automatically exit and will be catched by express general error handler middleware
        // return res.status(422).json({
        //     message: 'validation failed',
        //     errors: error.array()
        // });
    }

    let newPost = new PostModel({});
    newPost.title = req.body.title;
    newPost.content = req.body.content;
    newPost.imageUrl = "/" + image.path;
    newPost.creator = {
        name: 'Roshan',
    }

    newPost.save()
        .then(result => {
            res.status(201).json({
                message: 'post created successfully!!!',
                post: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err); // will be caught by express general error handler middleware
        });

}


exports.editPost = (req, res, next) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        const error = new Error('validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
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
        throw error;
    }

    const id = req.params.id;

    PostModel.findById(id)
        .then(post => {
            if (!post) {
                const error = new Error('no post found');
                error.statusCode = 404;
                throw error;
            }
            // CASE WHERE NEW IMAGE IS UPLOADED, WE NEED TO DELETE THE OLD IMAGE FROM FILESYSTEM
            if (post.imageUrl !== newImagePath) {
                clearImage(post.imageUrl);
            }
            post.title = req.body.title;
            post.content = req.body.content;
            post.imageUrl = newImagePath;

            return post.save();
        })
        .then(response => {
            res.status(200).json({
                message: 'post updated successfully!!!',
                post: response
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });


}


const clearImage = filePath => {

    filePath = path.join(__dirname, "..", filePath);
    file.unlink(filePath, (err, done) => {
        if (err) {
            console.log("error deleting the file");
        }
    });

}