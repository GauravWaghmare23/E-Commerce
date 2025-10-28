import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import userModel from './src/models/userModel';
import { connectDB } from './src/config/db';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin
  if (path.startsWith('/admin')) {
    await connectDB();

    try {
      const token = request.cookies.get('token')?.value;

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };

      const user = await userModel.findById(decodedToken._id);

      if (!user || user.role !== 'admin') {
        return NextResponse.redirect(new URL('/allProducts', request.url));
      }

      // User is authenticated and is admin, allow access
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // For non-admin routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
