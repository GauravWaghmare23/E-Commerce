"use client";
import { useEffect } from "react";
import { useUser } from "../context/userContext";
import { useRouter } from "next/navigation";

const Gate = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "user") {
      router.push("/allProducts");
    } else if (user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/login");
    }
  }, [user,router]);

  return null;
};

export default Gate;