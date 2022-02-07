require('dotenv').config();
const md5 = require('md5');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser: true});



const userSchema =new mongoose.Schema({
    username: String,
    password: String
});
 




const User = new mongoose.model('User',userSchema);

app.get("/", function(req, res){
  res.render("home");
});
app.route("/login").get(function(req,res){
    res.render("login");
}).post(function(req,res){
    
    const loginUsername= req.body.username;
    const loginPassword = md5(req.body.password);
    User.findOne({username: loginUsername},function(err,result){

        if(err){
            console.log(err)
        }
        else if(result.password === loginPassword ){
            res.render("secrets")
        }
    })

});
app.route("/register").get(function(req, res){
    res.render("register");
}).post(function (req,res){
    const newUser = new User({
        username: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save(function(err){
        if(!err){
            res.render("secrets")
        }else{
            console.log(err)
        }
    })

});

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
