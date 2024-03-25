const express = require("express");
const user_route = express();
const session = require("express-session");

// const config = require("../config/config");


const auth = require("../middleware/auth");

user_route.set('view engine','ejs');
user_route.set('views','./views/users');

user_route.use(session({secret: 'session-secret-key',
resave: false,
saveUninitialized: true,
cookie: {
  maxAge: 1000 * 60 * 60 * 24* 7 }}));

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());//convert data to string
user_route.use(bodyParser.urlencoded({extended:true}));

// const path = require("path");

// user_route.use(express.static('public'));

const userController = require("../controllers/userController");

user_route.get('/register',auth.isLogout,userController.loadRegister);

user_route.post('/register',userController.insertUser);

// user_route.get('/',auth.isLogout,userController.loginLoad);
user_route.get('/login',auth.isLogout,userController.loginLoad);

user_route.post('/login',userController.verifyLogin);

user_route.get('/home',auth.isLogin,userController.loadHome);

user_route.get('/logout',auth.isLogin,userController.userLogout);

user_route.get('/',auth.isLogout,userController.loginLoad);

// user_route.post('/',userController.verifyLogin);

user_route.get("/",)

module.exports = user_route;