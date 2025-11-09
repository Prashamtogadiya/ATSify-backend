import { Request, Response } from "express";
import { generateAccessToken, generateTokens, registerUser, validateUser, verifyRefresh, logoutUser } from "../services/auth.service";

export const signUp = async(req:Request,res:Response)=>{
    try{
        const {name, email, password} = req.body;
        const user = await registerUser(name,email,password);

        const {password:_pw,refreshToken:_rt,...userData} = user.toObject();
        return res.status(201).json({success:true,message:"User created",user:userData});

    }catch(err:any){
        return res.status(400).json({success:false,message:err.message});
    }
};

export const login = async (req:Request,res:Response)=>{
    try{
        const {email, password} = req.body;
        const user = await validateUser(email,password);
        const userId = user._id as string;
        const {accessToken,refreshToken} = await generateTokens(userId.toString());

        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
            path:"/"
        });

        return res.json({success:true,accessToken});
    }catch(err:any){
        return res.status(400).json({success:false,message:err.message});
    }
};

export const refreshAccessToken = async (req:Request,res:Response)=>{
    try{
        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken);

        if(!refreshToken) return res.status(401).json({success:false,message:"No refresh token"});

        const user = await verifyRefresh(refreshToken);
        const userId = user._id as string;
        const accessToken = generateAccessToken(userId.toString());
        return res.json({success:true,accessToken});
    }catch(err:any){
        return res.status(403).json({success:false,message:"Invalid refersh token"});
    }
}

export const logout = async(req:Request,res:Response)=>{
    try{
        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken);
        
        if(refreshToken) await logoutUser(refreshToken);
        res.clearCookie("refreshToken",{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
            path:"/"
        });

        return res.json({success:true,message:"Logout Successful"});
    }catch(err : any){
        return res.json({success:false,message:"Internal server error"});
    }
}