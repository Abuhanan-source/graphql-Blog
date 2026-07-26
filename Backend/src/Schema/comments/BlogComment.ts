import mongoose from "mongoose";

const Blogcomments = new mongoose.Schema({
    Comment:{
        type:String,
        required:true,
    },
    UserComment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    BlogOwner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Cards",
    },
    
    
},{timestamps:true});

const Comments = mongoose.models?.Comments || mongoose.model('Comments', Blogcomments);

export default Comments;