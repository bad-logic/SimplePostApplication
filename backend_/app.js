const { express, parser } = require('./config');
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
app.use(parser.json());

// ROUTES
app.use('/feed', feedRoutes);

module.exports = { app };