const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
// const nodemailer = require("nodemailer");

const securePassword = async(password)=>{

    try {
        
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }

}

const loadLogin = async (req, res) => {
    try {
        // Check if the user is already logged in
        if (req.session.user) {
            return res.redirect('/home'); // Redirect to the home page
        }

        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{

    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});
        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password);

            if(passwordMatch){

               if(userData.is_admin === 0){
                  res.render('login',{message:"Email and password is incorrect"});
               }
               else{
                   req.session.user_id = userData._id;
                   res.redirect("/admin/home");
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

const loadDashboard = async(req,res)=>{

    try {
        const userData = await User.findById({_id:req.session.user_id});
        // const messages = await req.consumeFlash('info')
        res.render('home',{admin:userData});
    } catch (error) {
        console.log(error.message);
    }

}

const logout = async (req, res) => {
    try {
        req.session.user=null;
        req.session.destroy();
        res.redirect('/admin/login');
    } catch (error) {
        console.log(error.message);
    }
}

// const logout = async(req,res)=>{
//     try {
        
        // req.session.user=null;
        // req.session.destroy();
        // res.redirect('/admin');
        // res.render('login')

        // req.session.destroy(function(err){
        //     if(err){
        //         console.log(err)
        //         res.send("error")
        //     }else{
        //         res.render('/')
        //     }
        // })
//         try {
//             req.session.user = false;
//             res.redirect("/admin/login");
//         } catch (error) {
//             console.log(error);
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }




// const forgetPasswordLoad = async(req,res)=>{
//     try {
        
//         const token = req.query.token;

//         const tokenData = await User.findOne({token:token});
//         if(tokenData){
//            res.render('forget-password',{user_id:tokenData._id});
//         }else{
//            res.render('404',{message:"Invalid Link"});
//         }

//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const resetPassword = async(req,res)=>{
//     try {
        
//         const password = req.body.password;
//         const user_id = req.body.user_id;

//         const securePass = await securePassword(password);
        
//         const updatedData = await User.findByIdAndUpdate({ _id:user_id },{ $set:{password:securePass,token:''} });

//         res.redirect('/admin');

//     } catch (error) {
//         console.log(error.message);
//     }
// }

const adminDashboard = async(req,res)=>{
    try {
        
        const usersData = await User.find({is_admin:0});
        res.render('dashboard',{users:usersData});

    } catch (error) {
        console.log(error.message);
    }
}

//* Add New Work start

const newUserLoad = async(req,res)=>{
    try {
        
        res.render('new-user');

    } catch (error) {
        console.log(error.message);
    }
}

const addUser = async (req, res) => {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const mno = req.body.mno;
      const password = randomstring.generate(8);
  
      // Check if the email or mobile number already exists
      const existingUserByEmail = await User.findOne({ email });
      const existingUserByMobile = await User.findOne({ mobile: mno });
  
      if (existingUserByEmail) {
        res.render("new-user", { message: "Email already exists. Try again" });
      } else if (existingUserByMobile) {
        res.render("new-user", { message: "Mobile number already exists. Try again" });
      } else {
        const spassword = await securePassword(password);
  
        const user = new User({
          name: name,
          email: email,
          mobile: mno,
          password: spassword,
          is_admin: 0,
        });
  
        const userData = await user.save();
  
        if (userData) {
          // addUserMail(name, email, password, userData._id);
          res.redirect('/admin/dashboard');
        // await req.flash('info','new user has been added')

        } else {
          res.render('new-user', { message: 'Something went wrong.' });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.render("new-user", { message: "An error occurred." });
    }
  }
  

//edit user functionality

const editUserLoad = async(req,res)=>{

    try {
        const id = req.query.id;
        const userData = await User.findById({ _id:id });
        if(userData){
            res.render('edit-user',{ user:userData });           
        }
        else{
            res.redirect('/admin/dashboard');
        }

    } catch (error) {
        console.log(error.message);
    }

}

const updateUsers = async(req,res)=>{
    try {
        const userData = await User.findByIdAndUpdate({ _id:req.body.id },{ $set:{ name:req.body.name, email:req.body.email, mobile:req.body.mno, is_varified:req.body.verify } });
        
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.log(error.message);
    }
}

//delete users
const deleteUser = async(req,res)=>{
    try {
        
        const id = req.query.id;
        await User.deleteOne({ _id:id });
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}

//search user
const searchUser = async(req,res)=>{
    try {
  const locals = {
    title: "Search user Data"  
  };
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const users = await User.find({name: { $regex: new RegExp(searchNoSpecialChar, "i") }});

    res.render("search", {
      users,
      locals
    })

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUsers,
    deleteUser,
    searchUser
}