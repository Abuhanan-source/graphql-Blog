import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.Email as string,
    pass: process.env.Pass as string,
  },
});

export const otpsendmailer = async (email:string,otp:string)=>{
    await transporter.sendMail({
        from:process.env.Email,
        to:email,
        subject:"reset your email",
        html:`<p>Your OTP for password reset is <b>${otp}</b> it expires in 5 minutes.</p>`
    })
}