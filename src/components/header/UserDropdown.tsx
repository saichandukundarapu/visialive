import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router";

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

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  // ✅ Fetch logged-in user
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://x73t-i3sy-hy16.n7e.xano.io/api:qgU3RyVM/auth/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // ✅ Get initials (e.g., "Sai Chandu" -> "SC")
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ✅ Tailwind color palette for avatars
  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
  ];

  // ✅ Pick a consistent color based on user name/email
  const getAvatarColor = (name?: string, email?: string) => {
    const str = name || email || "default";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span
          className={`mr-3 flex items-center justify-center rounded-full h-11 w-11 text-white font-bold overflow-hidden ${
            user?.profile_picture?.url
              ? ""
              : getAvatarColor(user?.name, user?.email)
          }`}
        >
          {user?.profile_picture?.url ? (
            <img
              src={user.profile_picture.url}
              alt={user.name}
              className="object-cover h-full w-full"
            />
          ) : (
            getInitials(user?.name || "Guest")
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {loading ? "Loading..." : user?.name || "Guest"}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user?.name || "Guest User"}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user?.email || "Not logged in"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem onItemClick={closeDropdown} tag="a" to="/profile">
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem onItemClick={closeDropdown} tag="a" to="/settings">
              Account settings
            </DropdownItem>
          </li>
          <li>
            <DropdownItem onItemClick={closeDropdown} tag="a" to="/support">
              Support
            </DropdownItem>
          </li>
        </ul>

        {/* Sign out */}
        <Link
          to="/signin"
          onClick={() => localStorage.removeItem("authToken")}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg 
                     group text-theme-sm hover:bg-gray-100 hover:text-gray-700 
                     dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          Sign out
        </Link>
      </Dropdown>
    </div>
  );
}
