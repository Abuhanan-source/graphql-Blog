import User from "../../Schema/UserSchema/UserSchema.js";
import UserServices, { type IUser, type verifyTypes, type verifyEmail } from "../../services/user.js";
import BlogServices, { type IBlog, type IUpdateBlog } from "../../services/Cards.js";
import Cards from "../../Schema/projectCardScheme/CardSchema.js";
import CommentServices, { type CommentCreateType } from "../../services/Comment.js";
import Comments from "../../Schema/comments/BlogComment.js";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
};

export const resolvers = {
    Query: {

    users: async (_: any,param:any,{user}:any)=>{
      if(user.role == "User"){
          throw new Error("It is only for Admins!")
      }

      if(user.isVerified === false){
          throw new Error(`You are unverified!`);
      }

      if (user.Isbaned) throw new Error("Your account has been banned!");

      try {
       return await UserServices.getAllUsers() 
      } catch (error) {
        throw error;
      }
       
    },

    Blogs:async (_: any,param:any,)=>{
      try {
        return await BlogServices.GetAllBlog()
      } catch (error) {
        throw error;
      }
    },


     getCurrentUser:async (_: any, param : any,{user}:any) => {
        try {

          if (!user) throw new Error("Unauthorized!");
          
          return await UserServices.CurrntUser(user.userId.toString())
        } catch (error) {
           throw error; 
        }
    },

    CurrentBlog:async (_: any, blogId : String,{user}:any) => {
      try {

        if(!user){
            throw new Error("Invalid User! Please Login First!");
        }

        if (user.Isbaned) throw new Error("Your account has been banned!");

        if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

        const Blog = await BlogServices.specificBlog(blogId,user.userId);
        return Blog
      } catch (error) {
        throw error;
      }
    },

      clearcookie: async (_: any, params: any, { res }: any) => {

        try {
          res.clearCookie("uid", {
            path: "/",
            httpOnly: true,
            secure: isProd,                       // true in deployment, false in local
            sameSite: isProd ? "none" : "lax",    // adjust based on what login uses
          });
          
          return "Logout Successfully!";
        } catch (error) { 
          throw new Error("Logout Error!");
        }
    },

    UserCreatedBlog:async (_: any, params:any, { user }: any) => {

      if(!user){
              throw new Error(`You are Authorized User!`);
      }

      if (user.Isbaned) throw new Error("Your account has been banned!");
      
      if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

      try {
        const blog = await BlogServices.UserCreatedBlog(user.userId);

        return blog;
      } catch (error) {
        throw error; 
      }
    },

    getCurrentUserComment:async (_: any, {BlogID}:any, { user }: any) => {
      if(!user){
        throw new Error(`You are unAuthorized!`);
      }

      if (user.Isbaned) throw new Error("Your account has been banned!");

      if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }
      try {
        return await CommentServices.getAllComment(BlogID,user.userId)
      } catch (error) {
        throw error;
      }
    },

    getViews:async (_: any, {id}:any, { user }: any) => {

      if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

      if (user.Isbaned) throw new Error("Your account has been banned!");

      try {
            return await BlogServices.getViewsCounter(id)
      } catch (error) {
        throw error;
      }
    },

    BlogDashboard: async (_: any, params:any, { user }: any) => {
      if(!user){
            throw new Error("Invalid User! Please Login First!");
      }

      if (user.Isbaned) throw new Error("Your account has been banned!");

      if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

      try {
        return await BlogServices.dashboarduserBlog(user.userId)
      } catch (error) {
        throw new Error(`Request Failed: ${(error as Error).message}`);
      }
    },

    checkSignupStatus: async (_: any, { email }: any) => {
        const user = await User.findOne({ email } as any);
        if (!user) return { exists: false, verified: false };
        return { exists: true, verified: user.Status === true };
      },
    

  },
  

  Mutation: {
    SignUp: async (_: any, userData : IUser) => {
      try {
        return await UserServices.createUser(userData);
      } catch (error) {
        throw error; 
      }
      
    },

    Login: async (_: any, verifyData: verifyTypes,{ res }: any) => {
      try {
        const token = await UserServices.VerifyUser(verifyData);

        res.cookie("uid", token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      });

        return "Login successful";
      } catch (error) {
        throw error; 
      }
    },

    CreateCards: async (_: any, BlogData : IBlog,{user}:any) => {
      try {
        
        if(!user){
            throw new Error("Invalid User! Please Login First!");
        }

        if(user.Isbaned === true){
            throw new Error("You are Baned for this service!");
        }

        if(user.isVerified === false){
              throw new Error(`You are unverified!`);
        }


          await BlogServices.createBlog(BlogData,user)

          return "Blog Created Successful!"

      } catch (error) {
        throw error; 
      }
      
    },


    UpdateBlog: async (_: any, BlogData : IUpdateBlog,{user}:any) => {
      
      try {
        
        if(!user){
            throw new Error("Invalid User! Please Login First!");
        }

         if(user.Isbaned === true){
            throw new Error("You are Baned for this service!");
        }

        if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

          await BlogServices.updateBlog(BlogData,user.userId)

          return "Blog Update Successfully!"

      } catch (error) {
        throw error; 
      }
      
    },

    emailVerified:async (_: any, OtpEmail:verifyEmail, { res }: any) => {
      try {
        const token = await UserServices.otpVerifier(OtpEmail);

            res.cookie("uid", token, {
          path: "/",
          ...cookieOptions,
        });

        return "Accout Verified successfully!";
      } catch (error) {
        throw error; 
      }
    },

    UserComment:async (_: any, CommentInfo:CommentCreateType, { user }: any) => {

      if(!user){
            throw new Error("Invalid User! Please Login First!");
        }

        if(user.Isbaned === true){
            throw new Error("You are Baned for this service!");
        }

        if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

      try {
        return await CommentServices.CreateComment(CommentInfo,user.userId)
      } catch (error) {
        throw error;
      }
    },

     GitTotalCount: async (_: any, { link}:any, { user }: any) => {
      if (!user) {
        throw new Error("Unauthorized!");
      }

        if(user.Isbaned === true){
            throw new Error("You are Baned for this service!");
        }

        if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

      if (!link) {
        throw new Error("Link is required!");
      }

      try {
        return BlogServices.GiturlClickHistory(link,user.userId)
    } catch (error) {
      throw new Error(`Request Failed: ${(error as Error).message}`);
    }
      },

    projecturlClickHistory: async (_: any, { link}:any, { user }: any) => {
      if (!user) {
        throw new Error("Unauthorized!");
      }

      if(user.isVerified === false){
          throw new Error(`You are unverified!`);
      } 

      if(user.Isbaned === true){
            throw new Error("You are Baned for this service!");
        }

      if (!link) {
        throw new Error("Link is required!");
      }

      try{
        return BlogServices.projecturlClickHistory(link,user.userId)
      } catch (error) {
    throw new Error(`Request Failed: ${(error as Error).message}`);
  }
    },

    DeleteUserBlog: async (_: any, {BlogID}:any, { user }: any) => {

        if(!user){
           throw new Error("Unauthorized!");
        }

        if(user.Isbaned === true){
            throw new Error("You are Baned for this service!");
        }

        if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

         if (!BlogID) {
        throw new Error("Blog is not found!");
      }

        try {
            return await BlogServices.DeleteBlog(BlogID,user.userId,user.Role === "Admin")
        } catch (error) {
          throw new Error(`Request Failed: ${(error as Error).message}`);
        }
    },

     UpdateUserRole: async (_: any, {userId,Role}:{userId:any,Role:String}, { user }: any) => {

      if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

      if (user.Isbaned) throw new Error("Your account has been banned!");

       if(user.Role === "Admin"){
        try {
          return await UserServices.updateRole(userId,Role)
        } catch (error) {
          throw new Error(`Request Failed: ${(error as Error).message}`);
        }
       }else{
        throw new Error(`You Can Not Mordified!`);
      }
        
     },


     UpdateBanedStatus: async (_: any, {userId,Baned}:{userId:any,Baned:Boolean}, { user }: any) => {

      if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

      if (user.Isbaned) throw new Error("Your account has been banned!");
      
      if(user.Role === "Admin"){
          try {
          return await UserServices.UserBaned(userId,Baned)
        } catch (error) {
          throw new Error(`Request Failed: ${(error as Error).message}`);
        }
      }else{
        throw new Error(`You Can Not Mordified!`);
      }

        
     },

     CommentDeleted: async (_: any, {CommentId}:{CommentId:any}, { user }: any) => {

      if(user.isVerified === false){
              throw new Error(`You are unverified!`);
      }

      if (user.Isbaned) throw new Error("Your account has been banned!");

      if(user.Role === "Admin"){
          try {
          return await CommentServices.DeleteComment(CommentId)
        } catch (error) {
          throw new Error(`Request Failed: ${(error as Error).message}`);
        }
      }else{
        throw new Error(`You Can Not Mordified!`);
      }

        
     },

     resendOtp: async (_: any, { email }: any,{ user }: any) => {

          if(user.isVerified === true){
              throw new Error(`You are already verified!`);
          }

          if (user.Isbaned) throw new Error("Your account has been banned!");
          try {
            return await UserServices.resendOtp(email);
          } catch (error) {
            throw error;
          }
        },

    


  },

  ProjectCards: {
    BlogOwner: async (parent: any) => {
      if (!parent.BlogOwner) return null;
      return await User.findOne({_id:parent.BlogOwner} as any);
    },
    totalComment: async (parent: any) => {
      const comments = await Comments.find({BlogOwner:parent._id} as any);
      return comments.length
    },

     totalViews: (parent: any) => {
        return parent.BlogViews?.length ?? 0;
      }

  },

  BlogView: {
    user: async (parent: any) => {
      if (!parent.user) return null;
      return await User.findOne({ _id: parent.user } as any);
    }
  },

   UserComment: {
    UserComment: async (parent: any) => {
      return await User.findOne(parent.UserComment);
    }
    },


}