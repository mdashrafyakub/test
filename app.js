require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const md5 = require('md5');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");



const mongoose = require("mongoose");
var session = require('express-session');
const passport =require ('passport');

const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-find-or-create')

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret:"This is a Secret.",
    saveUninitialized: true,
    resave: false,
    
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser: true});

const userSchema =new mongoose.Schema({
    username: String,
    password: String,
    googleId: String,
    facebookId:String,
    twitterId:String
});
 
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User',userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//google
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  

  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));
//facebook
passport.use(new FacebookStrategy({
  clientID: process.env.CLIENT_ID_FB,
  clientSecret: process.env.CLIENT_SECRET_FB,
  callbackURL: "http://localhost:3000/auth/facebook/secrets"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));
//Twitter
// passport.use(new TwitterStrategy({
//   consumerKey: process.env.CLIENT_ID_TWITTER,
//   consumerSecret: process.env.CLIENT_SECRET_TWITTER,
//   callbackURL: "http://localhost:3000/auth/twitter/secrets"
// },
// function(token, tokenSecret, profile, cb) {
//   User.findOrCreate({ twitterId: profile.id }, function (err, user) {
//     return cb(err, user);
//   });
// }
// ));




app.get("/", function(req, res){
  res.render("home");
});
app.get("/auth/google",
passport.authenticate('google', { scope: ["profile"] })
);
app.get('/auth/facebook',
  passport.authenticate('facebook'));

// app.get('/auth/twitter',
//   passport.authenticate('twitter'));

app.get("/auth/google/secrets",
passport.authenticate('google', { failureRedirect: "/login" }),
function(req, res) {
  // Successful authentication, redirect to secrets.
  res.redirect("/secrets");
});
app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("here")
    res.redirect('/secrets');
  });

  // app.get('/auth/twitter/secrets', 
  // passport.authenticate('twitter', { failureRedirect: '/login' }),
  // function(req, res) {
  //   // Successful authentication, redirect home.
    
  //   res.redirect('/secrets');
  // });
app.get("/logout",function(req,res){
    req.logout();
    res.redirect('/');
})
app.route("/login").get(function(req,res){
    res.render("login");
}).post(function(req,res){
    const user = new User({
        username: req.body.username,
        password : req.body.password
    });
    req.login(user,function(err){
        if (err){
            console.log(err)
        }else{
            
            passport.authenticate("local")(req, res, function(){
                
                res.redirect("/secrets");
            });
        } 
    });
});
app.get("/secrets", function(req, res){
    
    if (req.isAuthenticated()){
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  });

app.route("/register").get(function(req, res){
    res.render("register");
}).post(function (req,res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");  
              })
            }
    })
});

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
