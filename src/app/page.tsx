"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/userContext";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/allProducts");
      }
    } else {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen sketchbook-bg flex items-center justify-center">
      <div className="sketch-card p-8 text-center float-animation">
        <h1 className="text-4xl font-bold gradient-text sketch-text mb-4">
          Welcome to ArtEcommerce
        </h1>
        <p className="text-lg text-gray-700 sketch-text">
          Your creative shopping destination
        </p>
        <div className="mt-6">
          <div className="animate-pulse">
            <div className="w-16 h-16 border-4 border-t-transparent border-b-transparent border-l-pink-300 border-r-blue-300 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
