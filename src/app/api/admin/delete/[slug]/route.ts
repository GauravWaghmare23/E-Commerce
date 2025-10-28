import productModel from "@/src/models/productModel";
import userModel from "@/src/models/userModel";
import { connectDB } from "@/src/config/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function DELETE(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  await connectDB();
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };

    const user = await userModel.findById(decodedToken._id);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;

    const deletedProduct = await productModel.findOneAndDelete({ slug });

    if (!deletedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `Error deleting product: ${error}` }, { status: 500 });
  }
}
