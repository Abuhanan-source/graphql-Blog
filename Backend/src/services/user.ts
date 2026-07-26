import User from "../Schema/UserSchema/UserSchema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { GraphQLError } from "graphql";
import {otpsendmailer} from "../utils/mailer.js"
dotenv.config();

export interface IUser {
    username: string;
    email: string;
    password: string;
}

export interface verifyTypes {
    email: string;
    password: string;
}

export interface verifyEmail {
    email: string;
    otp: string;
}

class UserServices {
    public static async createUser(userData: IUser) {
        if (!userData.username || !userData.email || !userData.password) {
          throw new GraphQLError("All fields are required", {
            extensions: { code: 'BAD_USER_INPUT' }
          });
      }
      

      if (userData.password.length < 8) {
        throw new GraphQLError("Password length is too Small", {
            extensions: { code: 'BAD_USER_INPUT' }
          });
      }


      const existuser = await User.findOne({ email: userData.email } as any);

      if (existuser) {
        throw new GraphQLError("User already login by this email!", {
            extensions: { code: 'BAD_USER_INPUT' }
          });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
       const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpexpires = Date.now() + 10*60*1000;

      const newUser = await User.create({ 
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          OTP:otp,
          expiryOTP:otpexpires
         });


      if(!newUser){
        throw new GraphQLError("User creation failed", {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          });
      }

      await otpsendmailer(userData.email,otp);

      return "Now Verify With OTP!";
    }

    public static async VerifyUser(verifyData: verifyTypes) {
        const { email, password } = verifyData;

         if (!email || !password) {
          throw new GraphQLError("All fields are required", {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const user = await User.findOne({ email: email } as any);

        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: 'NOT_FOUND' }
          });
        }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          throw new GraphQLError("Invalid password", {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

       return jwt.sign({ 
        userId: user._id,
        username:user.username,
        Role:user.Role,
        Isbaned:user.Isbaned,
        Status:user.Status
       }, process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
      );
    }

    public static async CurrntUser(userId: any) {
      const user = await User.findOne({ _id: userId } as any);

      if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: 'NOT_FOUND' }
          });
      }

      return user;
    }

    public static async otpVerifier(OtpEmail: verifyEmail) {
      if (!OtpEmail.email) {
          throw new GraphQLError("Please Email is Required!", {
            extensions: { code: 'NOT_FOUND_FIELD' }
          });
      }

      if (!OtpEmail.otp) {
          throw new GraphQLError("Please OTP is Required!", {
            extensions: { code: 'NOT_FOUND_FIELD' }
          });
      }

      const user = await User.findOne({email:OtpEmail.email} as any);


      if (!user) {
          throw new GraphQLError("User Not Found!", {
            extensions: { code: 'NOT_FOUND_USER' }
          });
      }

      if (user.Status === true) {
          throw new GraphQLError("You are Already Verified User!", {
            extensions: { code: 'NOT_FOUND_USER' }
          });
      }

      if(user.expiryOTP < Date.now()){
          throw new GraphQLError("OTP is Expire! Please Resend Your OTP Pin!", {
            extensions: { code: 'NOT_MATCH_EXPIRE' }
          });
      }
      
      if(user.OTP !== OtpEmail.otp){
          throw new GraphQLError("OTP not Match! Please Enter a Correct OTP!", {
            extensions: { code: 'NOT_MATCH_FIELD' }
          });
      }

      user.expiryOTP = undefined
      user.OTP = undefined
      user.Status = true;
      await user.save()

      return jwt.sign({ 
         userId: user._id,
        username:user.username,
        Role:user.Role,
        Isbaned:user.Isbaned,
        Status:user.Status
       }, process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
      );
    }

    public static async resendOtp(email: string) {
  if (!email) {
    throw new GraphQLError("Email is Required!", {
      extensions: { code: 'NOT_FOUND_FIELD' }
    });
  }

  const user = await User.findOne({ email } as any);

  if (!user) {
    throw new GraphQLError("User Not Found!", {
      extensions: { code: 'NOT_FOUND_USER' }
    });
  }

  if (user.Status === true) {
    throw new GraphQLError("You are Already Verified User!", {
      extensions: { code: 'NOT_FOUND_USER' }
    });
  }

  // Naya 6-digit OTP generate karein
  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

  user.OTP = newOtp;
  user.expiryOTP = Date.now() + 10 * 60 * 1000; 
  await user.save();

  await otpsendmailer(user.email,newOtp);

  return "OTP Resent Successfully! Please check your email.";
}

    public static async getAllUsers() {
      const user = await User.find()
      if(!user){
        throw new GraphQLError("Users not found!", {
            extensions: { code: 'NOT_FOUND_Error' }
          });
      }

      return user
    }
    
    public static async updateRole(userId:any,Role:String) {
      
        const user = await User.updateOne({ _id: userId },{
          Role:Role
        })

        if (user.matchedCount === 0) {
        throw new GraphQLError("Blogs Not Found!", {
            extensions: { code: 'BAD_Not_FOUND' }
          });
        }
      
        if (user.modifiedCount === 0) {
          throw new GraphQLError("View Increament Problem!", {
            extensions: { code: 'BAD_Increament_Problem' }
          });
        }

        return "Role Update Successfully!"
    }

    public static async UserBaned(userId:any,banedUser:Boolean) {
        const user = await User.updateOne({ _id: userId },{
          Isbaned:banedUser
        })

        if (user.matchedCount === 0) {
        throw new GraphQLError("Blogs Not Found!", {
            extensions: { code: 'BAD_Not_FOUND' }
          });
        }
      
        if (user.modifiedCount === 0) {
          throw new GraphQLError("View Increament Problem!", {
            extensions: { code: 'BAD_Increament_Problem' }
          });
        }

        return "Baned Status Update Successfully!"
    }
}

export default UserServices