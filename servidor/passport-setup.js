const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();

let options = {};
options.clientID = process.env.GOOGLE_CLIENT_ID;
options.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
options.callbackURL = process.env.GOOGLE_CALLBACK_URL;

passport.serializeUser(function(user, done) {
 done(null, user);
});
passport.deserializeUser(function(user, done) {
 done(null, user);
});
passport.use(new GoogleStrategy({
    clientID: options.clientID,
    clientSecret: options.clientSecret,
    callbackURL: options.callbackURL
 },
 function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
 }
));