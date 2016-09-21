// dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var RedisStore = require('connect-redis')(session);

var config = require('./config.js');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store: new RedisStore({
        host: 'localhost',
        port: 6379
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// configure the Google strategy for use by passport
passport.use(new GoogleStrategy({
        clientID: config.googleAuth.clientID,
        clientSecret: config.googleAuth.clientSecret,
        callbackURL: config.googleAuth.callbackURL
    },
    function(token, refreshToken, profile, done) {
        console.log(profile);
        process.nextTick(function() {
            // try to find the user based on their google id
            Account.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err) return done(err);

                // if the user is attempting to log in with a
                // valid greenhouse.io email
                if (profile._json.domain == "greenhouse.io") {

                    if (user) {
                        // if user is found, log them in
                        return done(null, user);
                    } else {
                        //if the user isnt in our database, create a new user
                        var newAccount= new Account();
                        newAccount.google.id    = profile.id;
                        newAccount.google.token = token;
                        newAccount.username     = profile.displayName;

                        newAccount.save(function(err) {
                            if(err) throw err;
                            return done(null, newAccount);
                        });
                    }
                } else {
                    // if the email domain is not greenhouse.io, return error
                    done(new Error("Invalid host name. Sign in is only possible for those with greenhouse.io email addresses."))
                }
            });
        });
    }
));

// mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;