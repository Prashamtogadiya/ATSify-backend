import User from "../models/User.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const registerUser =async (name:string,email:string,password:string)=>{
    const exists = await User.findOne({email});
    if(exists) throw new Error("User already exists");
    
    const hash = await bcrypt.hash(password,Number(process.env.SALT_ROUND)||10);
    const user = await User.create({name,email,password:hash});
    return user;
}

export const validateUser = async (email:string,password:string)=>{
    const user = await User.findOne({email});
    if(!user)throw new Error("User not found");

    const valid = bcrypt.compare(password,user.password);
    if(!valid)throw new Error("Invalid credentials");

    return user;
}

export const generateAccessToken = (userId:string)=>{
    return jwt.sign({id:userId},ACCESS_SECRET,{expiresIn:"15m"});
}

export const generateTokens = async(userId:string)=>{
    const accessToken = generateAccessToken(userId);
    const refreshToken = jwt.sign({id:userId},REFRESH_SECRET,{expiresIn:'7d'});
    await User.findByIdAndUpdate(userId.toString(),{refreshToken});
    return {accessToken,refreshToken}; 
}

export const verifyRefresh = async (refreshToken:string)=>{
    const user = await User.findOne({refreshToken});
    if(!user)throw new Error("Invalid refresh token");

    jwt.verify(refreshToken,REFRESH_SECRET);
    return user;
}

export const logoutUser = async (refreshToken:string)=>{
    const user = await User.findOne({refreshToken});
    if(user){
        user.refreshToken=null;
        await user.save();
    }
}