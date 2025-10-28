"use client";
import { useEffect, useState } from "react";
import { useUser } from "../../context/userContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Loader2, LogOut, PlusCircle, Settings, Edit, DollarSign, Tag } from "lucide-react";

// --- Interface Definitions (Kept from original) ---
interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}


const DashboardProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden">
      
      
      <div className="relative w-full h-48 bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Settings className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col grow">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h2>

        <div className="text-sm text-gray-600 space-y-1 mb-3">
          <p className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
            <span className="font-medium">₹{product.price.toLocaleString('en-IN')}</span>
          </p>
          <p className="flex items-center">
            <Tag className="w-4 h-4 mr-1 text-indigo-600" />
            <span className="font-medium">{product.category}</span>
          </p>
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{product.description}</p>

        <Link
          href={`/admin/${product.slug}`}
          className="mt-auto inline-flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Edit className="w-4 h-4 mr-2" />
          Manage Product
        </Link>
      </div>
    </div>
  );
};


export default function AdminDashboard() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/allProducts");
      return;
    }
    fetchProducts();
  }, [user, router]);


  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/fetch", { withCredentials: true });
      setProducts(res.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      await axios.post("/api/user/logout", {}, { withCredentials: true });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="ml-4 text-lg text-gray-600">Loading Admin Data...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header and Actions */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center mb-4 sm:mb-0">
            <Settings className="w-8 h-8 mr-3 text-indigo-600" />
            Admin Dashboard
          </h1>
          <div className="flex space-x-3">
            <Link 
              href="/admin/add" 
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-600 transition duration-150"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New Product
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-gray-900 transition duration-150"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Product List/Grid */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Inventory ({products.length} Items)</h2>

        {products.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
            <p className="text-xl text-gray-600 mb-4">No products found. Time to create some!</p>
            <Link 
              href="/admin/add" 
              className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <DashboardProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}