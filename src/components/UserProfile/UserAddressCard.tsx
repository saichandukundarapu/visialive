import { useEffect, useState } from "react";

interface FileMeta {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

interface User {
  id: number;
  created_at: string;
  name: string;
  email: string;
  profile_picture?: FileMeta | null;
}

export default function UserProfileCard() {
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
    return <p className="p-5 text-red-500">No user data found.</p>;
  }

  // ✅ Get initials (e.g., "Sai Chandu" -> "SC")
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        {/* Avatar with initials fallback */}
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white text-xl font-bold overflow-hidden">
          {user.profile_picture?.url ? (
            <img
              src={user.profile_picture.url}
              alt={user.name}
              className="object-cover w-full h-full"
            />
          ) : (
            getInitials(user.name)
          )}
        </span>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {user.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
