"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "../../context/userContext";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, Loader2 } from "lucide-react"; // Importing lucide icons for better UI

// Define the Product interface
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

// --- Navigation Bar Component ---
const Navbar = ({ user, handleLogout }: { user: { username?: string } | null; handleLogout: () => void }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="shrink-0 font-bold text-2xl text-indigo-600 tracking-wider">
                            E-commerce
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 shadow-sm"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout ({user.username || 'User'})
                            </button>
                        ) : (
                            <Link href="/login" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 transition duration-150 shadow-sm">
                                Login
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout ({user.username || 'User'})
                            </button>
                        ) : (
                            <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-500 hover:bg-green-600">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};


function AllProductsPage() {
    const { user, setUser } = useUser();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");


    const categories = ["All", "Electronics", "Mobiles", "Home", "Kitchen", "Faishon"];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get("/api/user/all-products");
                setProducts(res.data.products);
                setFilteredProducts(res.data.products);
            } catch (err) {
                setError("Failed to fetch art pieces. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);


    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(product => product.category === selectedCategory));
        }
    }, [selectedCategory, products]);


    const handleLogout = async () => {
        try {
            await axios.post("/api/user/logout", {}, { withCredentials: true });
            setUser(null);
            // Optional: localStorage.removeItem("token"); - assuming the token is handled by http-only cookies
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} handleLogout={handleLogout} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                <div className="flex justify-center mb-10">
                    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl shadow-lg">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
                                    selectedCategory === category
                                        ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>


                {loading ? (
                    <div className="flex justify-center items-center min-h-[50vh] flex-col">
                        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
                        <p className="mt-2 text-gray-600">Loading Art Pieces...</p>
                    </div>
                ) : error ? (
                    <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <p className="font-semibold">{error}</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center p-8 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                        <p className="font-semibold">No art pieces found in the selected category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default AllProductsPage;


const ProductCard = ({ product }: { product: Product }) => {
    return (
        <Link href={`/moredetails/${product.slug}`}>
            <div className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
                <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                </div>
                <div className="p-4">
                    <h2 className="text-base font-semibold text-gray-800 truncate mb-1">
                        {product.name}
                    </h2>
                    <p className="text-xs text-gray-500 truncate mb-2">
                        {product.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-lg font-bold text-indigo-600">
                            ₹{product.price.toLocaleString('en-IN')}
                        </p>
                        <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                            {product.category}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};