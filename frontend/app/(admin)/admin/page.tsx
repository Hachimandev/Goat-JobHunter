"use client";

import { useGetMyAccountQuery } from "@/services/auth/authApi";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";
import { ROLE } from "@/constants/constant";
import LoaderSpin from "@/components/common/LoaderSpin";

const AdminPage = () => {
  useGetMyAccountQuery();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    // Check if user has company role
    const isCompany = user?.role?.name === ROLE.COMPANY;

    if (!isCompany) {
      // Not company, redirect to home
      router.replace("/");
    } else {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Show loading while checking
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoaderSpin />
    </div>
  );
};

export default AdminPage;
