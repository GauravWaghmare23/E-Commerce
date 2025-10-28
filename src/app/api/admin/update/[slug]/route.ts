import productModel from "@/src/models/productModel";
import userModel from "@/src/models/userModel";
import { connectDB } from "@/src/config/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function PUT(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
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
    
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const category = formData.get("category") as string;
    const file = formData.get("image") as File;

    const updateData: {
      lastUpdated: Date;
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      imageUrl?: string;
    } = {
      lastUpdated: new Date(),
    };

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (category) updateData.category = category;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({}, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }).end(buffer);
      });

      if (uploadResult) {
        updateData.imageUrl = (uploadResult as { secure_url: string }).secure_url;
      }
    }

    const updatedProduct = await productModel.findOneAndUpdate(
      { slug },
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `Error updating product: ${error}` }, { status: 500 });
  }
}
