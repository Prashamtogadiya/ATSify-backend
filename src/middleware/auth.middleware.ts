import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { decode } from "punycode";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export const authenticate = (req:Request,res:Response,next:NextFunction)=>{
    const header = req.headers.authorization;

    if(!header|| !header.startsWith("Bearer")){
        return res.status(401).json({success:false,message:"Unauthorized token missing"});
    }

    const token = header.split(" ")[1];
    try{
        const decoded = jwt.verify(token,ACCESS_SECRET)as {id:string};
        req.userId = decoded.id;
        next();
    }catch{
        return res.status(401).json({success:false,message:"Invalid or expired token"});
    }
}
