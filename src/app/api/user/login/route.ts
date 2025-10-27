import userModel from "@/src/models/userModel";
import { connectDB } from "@/src/config/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
    await connectDB();
    
    try {

        const {email,password} = await request.json();

        if (!email || !password ) {
                    
                    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
                    
                }

        const user = await userModel.findOne({email});

        if (!user) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        const token  = jwt.sign({_id:user._id},process.env.JWT_SECRET!,{expiresIn:"7d"});

        const Response = NextResponse.json({ message: "Login successful", user, token }, { status: 200 });
        
        Response.cookies.set("token",token,{httpOnly:true});

        return Response
        

        
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Login error: ${error}` }, { status: 500 });
    }
}