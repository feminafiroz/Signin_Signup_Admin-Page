const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const securePassword = async(password)=>{

    try {
        
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }

}

//for send mail  

const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "config.emailUser",
                pass: 'config.emailPassword'
            }
        })
        const mailOptions = {
            from: 'config.emailUser',
            to: email,
            subject: 'For verfication mail',
            // html: '<p> hii' + name + ',please click here to <a href = "http://localhost:3001/forget-password?token=' + user_id + '">Reset </a>your password.</p>'
            html: '<p> hii' + name + ',please click here to <a href = "http://localhost:3001/verify?id=' + user_id + '">Verfify</a>your mail.</p>'

        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("email has been sent :-", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);

    }
}


const loadRegister = async(req,res)=>{
    try {
        
        res.render('registration');

    } catch (error) {
        console.log(error.message);
    }
}

const insertUser = async(req,res)=>{

    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
           name:req.body.name,
           email:req.body.email,
           mobile:req.body.mno,
            password:spassword,
           is_admin:0
        });

        const userData = await user.save();



        if(userData){
            sendVerifyMail(req.body.name, req.body.email, userData._id);
           res.render('registration',{message:"Your registration has been successfully!!! ."});
        }
        else{
           res.render('registration',{message:"Your registration has been failed."});
        }

    } catch (error) {
        console.log(error.message);
        if (error.code === 11000 && error.keyPattern.email) {
            // Duplicate email error (code 11000) - email already exists
            res.render("registration", { message: "Email already exists. Try again" });
          } else {
            // Handle other errors (e.g., validation errors)
            res.render("registration", { message: "An error occurred." });
          }
        }
    }




// login user methods started

const loginLoad = async(req,res)=>{

    try {
        
        if (req.session.user) {
            return res.redirect('/home'); // Redirect to the home page
        }

        res.render('login');

    } catch (error) {
        console.log(error.message);
    }

}

// const checklogin=((req,res,next)=>{
//     if(req.session.user){
//         console.log(8)
//         res.reenter('login')
//     }else{
//         console.log(9)
//     }
// })



const verifyLogin = async(req,res)=>{

    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});

        if(userData){
           
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_varified === 0){
                   res.render('login',{message:"Please verify your mail."});
                }
                else{
                    req.session.user_id = userData._id;
                   res.redirect('/home');
                }
            }
            else{
                res.render('login',{message:"Email and password is incorrect"});
            }
        }
        else{
          res.render('login',{message:"Email and password is incorrect"});
        }

    } catch (error) {
        console.log(error.message);
    }

}

const loadHome = async(req,res)=>{
    try {
        
        const userData = await User.findById({ _id:req.session.user_id });
        res.render('home',{ user:userData });

    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async(req,res)=>{

    try {
        
        req.session.destroy();
        res.redirect('/');

        // req.session.destroy(function(err){
        //     if(err){
        //         console.log(err)
        //         res.send("error")
        //     }else{
        //         res.redirect('/')
        //     }
        // })

    } catch (error) {
        console.log(error.message);
    }

}


//user profile edit & update





module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
  
    
}