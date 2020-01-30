const { express, parser, path, multer, morgan } = require('./config');
const app = express();
const feedRoutes = require('./routes/feed.routes');
const authRoutes = require('./routes/auth.routes');

// SETTING THE HEADERS FOR CORS ERROR
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, api_key');
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
// ROUTES
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);


// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {

    console.log("error>>", err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({ message: message, data: data });

});

module.exports = { app };