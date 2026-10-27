import AuthProvider from "@/components/AuthProvider";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </AuthProvider>
  );
}
