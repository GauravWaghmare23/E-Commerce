"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { DollarSign, Tag, User, Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// --- Interface Definitions (Kept from original) ---
interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  productby: string;
}

interface Seller {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

// --- Main Component ---
export default function ProductDetailsPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchProduct = async () => {
      // Only run the fetch if slug is available
      if (!slug) return;
      
      try {
        const res = await axios.get(`/api/user/product/${slug}`);
        setProduct(res.data.product);
        setSeller(res.data.productby);
      } catch (err) {
        // Axios error handling
        setError("Failed to fetch product details. This item may not exist.");
        console.error("Fetch Product Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // --- Loading State UI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="mt-4 text-lg text-gray-600">Loading Art Piece...</p>
        </div>
      </div>
    );
  }

  // --- Error/Not Found State UI ---
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
          <p className="text-xl font-semibold text-red-600 mb-4">{error || "Product not found."}</p>
          <Link href="/" className="flex items-center justify-center text-indigo-600 hover:text-indigo-800 transition">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Go back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  // --- Main Product Details UI (Full Width) ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Back Button */}
        <div className="p-6 border-b border-gray-100">
            <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition duration-200">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to All Art
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 sm:p-10">
          
          {/* LEFT COLUMN: Image Gallery */}
          <div className="relative h-[450px] md:h-[600px] w-full bg-gray-100 rounded-xl overflow-hidden shadow-xl">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain" // Use 'object-contain' for art to ensure full image visibility
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* RIGHT COLUMN: Product Information */}
          <div className="space-y-8">
            <header className="space-y-3 pb-4 border-b border-gray-200">
              <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                {product.name}
              </h1>
              <p className="flex items-center text-2xl font-bold text-indigo-600">
                <DollarSign className="w-6 h-6 mr-1" />
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center space-x-3 text-sm">
                <span className="flex items-center text-gray-600">
                  <Tag className="w-4 h-4 mr-1 text-gray-400" />
                  Category: <span className="font-semibold ml-1 text-indigo-700">{product.category}</span>
                </span>
              </div>
            </header>

            {/* Description Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                About the Piece
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </section>
            
            {/* Action Buttons (Placeholder for Buy/Add to Cart) */}
            <div className="pt-4">
                <button
                    className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.01]"
                >
                    Purchase Now
                </button>
            </div>

            {/* Seller Info */}
            {seller && (
              <section className="p-6 bg-gray-100 rounded-lg border border-gray-200 shadow-inner space-y-3">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
                  Artist/Seller Information
                </h3>
                <p className="flex items-center text-gray-700">
                  <User className="w-5 h-5 mr-2 text-indigo-500" />
                  <span className="font-medium">Name:</span> {seller.name}
                </p>
                <p className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-2 text-indigo-500" />
                  <span className="font-medium">Email:</span> {seller.email}
                </p>
                <p className="text-xs text-gray-500 pt-2">
                    Seller ID: {seller._id}
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}