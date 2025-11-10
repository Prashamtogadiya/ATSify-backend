import { Request, Response } from "express";
import { generateAccessToken, generateTokens, registerUser, validateUser, verifyRefresh, logoutUser } from "../services/auth.service";

/**
 * POST /signup
 *
 * Create a new user, persist it, and return the created user (without sensitive fields).
 *
 * Request body:
 *  - { name: string, email: string, password: string }
 *
 * Responses:
 *  - 201: { success: true, message: "User created", user: { ... } }
 *  - 400: { success: false, message: string } (validation / duplicate email / DB errors)
 */
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

/**
 * POST /login
 *
 * Validate credentials, create access + refresh tokens, set refresh token cookie, and return access token.
 *
 * Request body:
 *  - { email: string, password: string }
 *
 * Responses:
 *  - 200: { success: true, accessToken: string } and sets httpOnly refreshToken cookie
 *  - 400: { success: false, message: string } (invalid credentials / other errors)
 */
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

/**
 * POST /refresh
 *
 * Read refresh token from cookie, verify it and return a new access token.
 *
 * Requires:
 *  - Cookie: { refreshToken: string }
 *
 * Responses:
 *  - 200: { success: true, accessToken: string }
 *  - 401: { success: false, message: "No refresh token" }
 *  - 403: { success: false, message: "Invalid refresh token" }
 */
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

/**
 * POST /logout
 *
 * Revoke the refresh token stored in the DB for the current cookie (if present),
 * clear the refreshToken cookie and return success.
 *
 * Cookie:
 *  - refreshToken (optional)
 *
 * Responses:
 *  - 200: { success: true, message: "Logout Successful" }
 *  - 500: { success: false, message: "Internal server error" }
 */
export const logout = async(req:Request,res:Response)=>{
    try{
        const refreshToken = req.cookies.refreshToken;
        
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