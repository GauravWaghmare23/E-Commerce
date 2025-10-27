import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/config/db";
import productModel from "@/src/models/productModel";
import userModel from "@/src/models/userModel";
import jwt from "jsonwebtoken";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> } // ✅ params is a Promise in Next.js 16
) {
  await connectDB();

  try {

    const { slug } = await context.params;

  
    const token = request.cookies.get("token")?.value;

    if (!token) {

      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });

    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };


    const user = await userModel.findById(decoded._id);

    if (!user) {

      return NextResponse.json({ message: "Unauthorized: User not found" }, { status: 401 });

    }


    if (user.role !== "user") {

      return NextResponse.json({ message: "Forbidden: Access denied" }, { status: 403 });

    }


    const product = await productModel.findOne({ slug });


    if (!product) {

      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const productby = await userModel.findById(product.productby)

    return NextResponse.json({ message: "Product fetched successfully", product, productby }, { status: 200 });


  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ message: "Internal server error", error: String(error) }, { status: 500 });
  }
}