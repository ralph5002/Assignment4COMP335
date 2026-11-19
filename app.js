var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// add this line before var indexRouter = require('./routes/index');
// If not, you MAY have an errpr: password is not a string
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Must be after the line app = express();
var session = require('express-session'); // to use session

const Client = require('pg').Client;
const client = new Client({
connectionString: process.env.DATABASE_URL
});
client.connect();


// javascript password encryption (https://www.npmjs.com/package/bcryptjs)
var bcrypt = require('bcryptjs');
// authentication middleware
var passport = require('passport');
// authentication locally (not using passport-google, passport-twitter, passport-github...)
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
usernameField: 'username', // form field name
passwordField: 'password'
},
function(username, password, done) {
client.query('SELECT * FROM users WHERE username = $1', [username], function(err, result) {
if (err) {
console.log("SQL error"); //next(err);
return done(null,false, {message: 'sql error'});
}
if (result.rows.length > 0) {
let matched = bcrypt.compareSync(password, result.rows[0].password);
if (matched) {
console.log("Successful login, ", result.rows[0]);
return done(null, result.rows[0]);
}
}
console.log("Bad username or password");
// returning to passport
// message is passport key
return done(null, false, {message: 'Bad username or password'});
});
})
);

// Store user information into session
// Store only the user id in the session
passport.serializeUser((user, done) => done(null, user.id));

// Load the user from the database on each request
passport.deserializeUser((id, done) => {
client.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
if (err) return done(err);
done(null, result.rows[0]);
});
});

// Use the session middleware
// configure session object to handle cookie
// secret: 'webDev' This is the secret used to sign the session ID cookie.
// It should be a long, randomly-generated string to ensure security.
app.use(session({
secret: process.env.SESSION_SECRET,
resave:false,
saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
// new stuff ends here




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;