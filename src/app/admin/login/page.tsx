import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Sign In" };

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
