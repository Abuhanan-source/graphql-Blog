import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },

    Role:{
        type:String,
        enum:["User","Admin"],
        default:"User"
    },

    Isbaned:{
        type:Boolean,
        default:false
    },

    OTP:{
        type:String,
    },

    Status:{
        type: Boolean,
        default:false
    },

    expiryOTP:{
        type:Date
    },

    


},{timestamps:true});

const User = mongoose.models?.User || mongoose.model('User', UserSchema);

export default User;