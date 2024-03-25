const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system");

const express = require("express");
const nocache = require('nocache')
const app = express();

app.use(express.static('public'));
app.use(nocache())
//for user routes
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);


//for admin routes
const adminRoute = require('./routes/adminRoute');

app.use('/admin',adminRoute);

app.listen(9000,function(){
    console.log("Server is runnnig...");
});