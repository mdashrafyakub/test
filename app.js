require('dotenv').config();
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

function errorstatement(){

}

const userSchema =new mongoose.Schema({
    username: String,
    password: String
});
 


userSchema.plugin(encrypt, { secret:process.env.SECRET,encryptedFields: ['password'] });

const User = new mongoose.model('User',userSchema);

app.get("/", function(req, res){
  res.render("home");
});
app.route("/login").get(function(req,res){
    res.render("login");
}).post(function(req,res){
    
    const loginUsername= req.body.username;
    const loginPassword = req.body.password;
    User.findOne({username: loginUsername},function(err,result){

        if(err){
            console.log(err)
        }
        else if(result){
            res.render("secrets")
        }
    })

});
app.route("/register").get(function(req, res){
    res.render("register");
}).post(function (req,res){
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
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
