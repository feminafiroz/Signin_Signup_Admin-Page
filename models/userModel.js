const mongoose = require("mongoose");
const validator = require("validator")

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true, unique:true,
        validate(value)
        {
            if(!validator.isEmail(value))
            {
                throw new Error("email is invalid");
            }
        }
    },
    mobile:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_varified:{
        type:Number,
        default:1
    },
    token:{
        type:String,
        default:''
    }

});

module.exports = mongoose.model('User',userSchema);