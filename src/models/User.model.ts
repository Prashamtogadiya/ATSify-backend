import {Schema, model, Document} from 'mongoose';

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    refreshToken?: string | null;
}

const userSchema = new Schema<IUser>(
    {
        name:{type:String,required:true},
        email:{type:String,unique:true,required:true},
        password:{type:String,required:true},
        refreshToken:{type:String,default:null}
    },
    {
        timestamps:true,
    }
) 

export default model<IUser>("User",userSchema);