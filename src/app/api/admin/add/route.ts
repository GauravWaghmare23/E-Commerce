import productModel from "@/src/models/productModel";
import userModel from "@/src/models/userModel";
import { connectDB } from "@/src/config/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(request: NextRequest) {
  await connectDB();
  try {



    const token = request.cookies.get("token")?.value;



    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const category = formData.get("category") as string;
    const file = formData.get("image") as File;

    if (!name || !description || !price || !category) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (!file) return NextResponse.json({ message: "No image" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({}, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }).end(buffer);
    });

    if (!uploadResult) {

      return NextResponse.json({ message: "Image not uploaded" }, { status: 400 });

    }

    

    const decodedToken = jwt.verify(token!, process.env.JWT_SECRET!) as { _id: string };

    if (!decodedToken) {

      return NextResponse.json({ message: "Unauthorized User" }, { status: 400 });

    }

    const user = await userModel.findById(decodedToken._id);

    if (!user) {

      return NextResponse.json({ message: "Unauthorized User" }, { status: 400 });

    }

    if (user.role !== "admin") {

      return NextResponse.json({ message: "Unauthorized User" }, { status: 400 });

    }

    const newProduct = await productModel.create({
      name,
      slug:uuidv4(),
      description,
      price,
      category,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      imageUrl: (uploadResult as any).secure_url, 
      productby: user._id,
    });

    return NextResponse.json({ message: "Product added successfully", newProduct }, { status: 200 });


  } catch (error) {

    return NextResponse.json({ message: `product not added ${error}` }, { status: 500 });

  }
}