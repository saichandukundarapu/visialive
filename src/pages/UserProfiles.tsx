import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

interface User {
  id: number;
  created_at: string;
  name: string;
  email: string;
  password?: string;
  phone_number?: string;
  paypal_email?: string;
  address?: string;
  subscription_type?: string;
}

export default function UserProfiles() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const res = await fetch(
          "https://x73t-i3sy-hy16.n7e.xano.io/api:qgU3RyVM/auth/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        console.error("❌ Error fetching user:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <p className="p-5 text-gray-500">Loading profile...</p>;
  }

  if (!user) {
    return <p className="p-5 text-red-500">No user data found</p>;
  }

  return (
    <>
      <PageMeta title="Account Settings" description="Manage your account settings" />
      <PageBreadcrumb pageTitle="Account" />

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
          Account
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Manage your account settings
        </p>

        <div className="space-y-6">
          {/* Field Component */}
          {[
            { label: "Full Name", value: user.name, action: "Change name" },
            { label: "Email address", value: user.email, action: "Change email" },
            { label: "Password", value: "********", action: "Change password" },
            { label: "Phone Number", value: user.phone_number || "Not set", action: "Change phone" },
            { label: "PayPal email address", value: user.paypal_email || "Not set", action: "Change PayPal email" },
            { label: "Address", value: user.address || "Not set", action: "Change address" },
            { label: "Subscription Type", value: user.subscription_type || "Not set", action: "Change subscription" },
            { label: "Created At", value: new Date(user.created_at).toLocaleString() },
          ].map((field, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  disabled
                  value={field.value}
                  className="w-full sm:w-96 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                />
              </div>
              {field.action && (
                <button className="text-sm font-medium text-indigo-600 hover:underline whitespace-nowrap">
                  {field.action}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
