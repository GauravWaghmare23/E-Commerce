import { connectDB } from "@/src/config/db";
import userModel from "@/src/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
                
                return NextResponse.json({ message: "All fields are required" }, { status: 400 });
                
            }

    const isUserExist = await userModel.findOne({ email });

    if (isUserExist) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const response = NextResponse.json({ message: "User created", newUser,token }, { status: 201 });

    response.cookies.set("token", token, {
      httpOnly: true,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: `Signup error: ${error}` }, { status: 500 });
  }
}