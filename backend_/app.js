const { express, parser } = require('./config');
const app = express();
const feedRoutes = require('./routes/feed.routes');

// setting the headers for cors error

//  parsing the incoming json format data
app.use(parser.json());


module.exports = { app };