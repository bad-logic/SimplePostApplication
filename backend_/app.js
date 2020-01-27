const { express, parser, path } = require('./config');
const app = express();
const feedRoutes = require('./routes/feed.routes');


// SETTING THE HEADERS FOR CORS ERROR
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


//  PARSING THE INCOMING JSON DATA
app.use(parser.json()); // Content-Type: 'application/json'

// SERVING IMAGES STATICALLY
app.use("/images", express.static(path.join(__dirname, 'images')));

// ROUTES
app.use('/feed', feedRoutes);


// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {

    console.log("error>>", err);
    const status = err.statusCode || 500;
    const message = err.message
    res.status(status).json({ message: message });

});

module.exports = { app };