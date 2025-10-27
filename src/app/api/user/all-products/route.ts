import userModel from "@/src/models/userModel";
import productModel from "@/src/models/productModel";
import jwt from "jsonwebtoken";
import { connectDB } from "@/src/config/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request : NextRequest){

    await connectDB();

    try {
        
        const token = request.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };

        const user = await userModel.findById(decodedToken._id);

        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (user.role !== "user") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const products = await productModel.find({});

        return NextResponse.json({ message: "Products fetched successfully", products }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Something went wrong",error }, { status: 500 });
    }
}