const { express, parser, path, multer, morgan, exGraphQl } = require('./config');
const app = express();
const graphQlSchema = require('./graphql/schema');
const graphQlResolver = require('./graphql/resolvers');

// SETTING THE HEADERS FOR CORS ERROR
// IN CASE OF GRAPHQL express-graphql, it rejects any request other than POST
// AND BROWSER AUTOMATICALLY SENDS OPTIONS REQUEST FIRST TO CHECK IF OTHER 
// REQUESTS ARE ALLOWED WHICH IS THEN REJECTED BY expresss-graphql
// SO WE MUST ALLOW THE OPTIONS REQUEST
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api_key');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // now the following next() is not executed and OPTIONS request doesnot reach the
        // express-graphql which automatically rejects methods other than POST request
    }
    next();
});

//  PARSING THE INCOMING JSON DATA
// REGISTERING THE JSON PARSER MIDDLEWARE
app.use(parser.json()); // Content-Type: 'application/json'

// SERVING IMAGES STATICALLY
// REGISTERING THE FILE/IMAGE SERVING MIDDLEWARE
app.use("/images", express.static(path.join(__dirname, 'images')));

// SET UP MULTER
// HANDLING  multipart/form-data

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {

    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// REGISTERING THE IMAGE HANDLING MIDDLEWARE
app.use(multer({ fileFilter: fileFilter, storage: fileStorage }).single('image'));

// USING MIDDLEWARE TO OUTPUT THE ENDPOINTS LOG
app.use(morgan('dev'));

app.use('/graphql', exGraphQl({
    schema: graphQlSchema,
    rootValue: graphQlResolver,
    // for sending detailed information about errors
    customFormatErrorFn(err) { // receives error detected by graphql
        if (!err.originalError) { // set by express-graphql when it detects an error is thrown by us or 3rd party middlewares
            return err;
        }
        const data = err.originalError.data;
        const code = err.originalError.statusCode || 500;
        const message = err.message || 'An error Occurred!!!';
        return {
            message: message,
            status: code,
            data: data
        };
    },
    graphiql: true // to view the graphiql browser tool we use '.use' instead of '.post' becoz browser only sends get request
}));

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {

    console.log("error>>", err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({ message: message, data: data });

});

module.exports = { app };