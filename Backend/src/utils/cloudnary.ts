import { v2 as cloudinary } from "cloudinary";
import  dotenv  from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_USERNAME as string,
  api_key: process.env.CLOUD_API as string,
  api_secret: process.env.CLOUD_PASSWORD as string,
});

const uploadOnCloudinary = async (buffer: Buffer) => {

  try {

    const base64 = `data:image/png;base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64);

    return result.secure_url;

  } catch (error) {
    console.log(error);
  }

};

export default uploadOnCloudinary;