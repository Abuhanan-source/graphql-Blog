import mongoose from "mongoose";

const CardSchema = new mongoose.Schema({
    ProjectName:{
        type:String,
        required:true,
    },
    Describtion:{
        type:String,
        required:true,
    },
    ProjectLink:{
        type:String,
        required:true
    },
    GithubLink:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:""
    },
    BlogOwner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    BlogViews: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timestamps: Number,
  },
],
    giturlClickHistory: [{timestamps: {type:Number}}],
    projecturlClickHistory: [{timestamps: {type:Number}}],
    
},{timestamps:true});

const Cards = mongoose.models?.ProjectCards || mongoose.model('Cards', CardSchema);

export default Cards;