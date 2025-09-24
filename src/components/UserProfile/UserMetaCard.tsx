import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

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
  bio?: string;
  address?: string;
  subscription_type?: string;
  profile_picture?: FileMeta | null;
}

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSubscription, setEditSubscription] = useState("");

  // fetch user from Xano
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

        const data: User = await res.json();
        setUser(data);

        // Initialize edit form values
        setEditName(data.name);
        setEditEmail(data.email);
        setEditBio(data.bio || "");
        setEditAddress(data.address || "");
        setEditSubscription(data.subscription_type || "");
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("❌ Error fetching user:", err.message);
        } else {
          console.error("❌ Unknown error fetching user:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      const res = await fetch(
        "https://x73t-i3sy-hy16.n7e.xano.io/api:qgU3RyVM/auth/me",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            bio: editBio,
            address: editAddress,
            subscription_type: editSubscription,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update user");

      const updated = await res.json();
      setUser(updated);
      alert("Profile updated successfully!");
      closeModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ Update error:", err.message);
        alert("Update failed: " + err.message);
      } else {
        console.error("❌ Unknown update error:", err);
        alert("Update failed");
      }
    }
  };

  if (loading) {
    return <p className="p-5 text-gray-500">Loading profile...</p>;
  }

  if (!user) {
    return <p className="p-5 text-red-500">No user data found</p>;
  }

  // ✅ Get initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ✅ Avatar colors
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
  const getAvatarColor = (name?: string, email?: string) => {
    const str = name || email || "default";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Avatar + Info */}
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <span
              className={`flex items-center justify-center w-20 h-20 rounded-full text-white text-2xl font-bold overflow-hidden ${
                user.profile_picture?.url
                  ? ""
                  : getAvatarColor(user.name, user.email)
              }`}
            >
              {user.profile_picture?.url ? (
                <img
                  src={user.profile_picture.url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user.name)
              )}
            </span>

            <div>
              <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                {user.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>

              {/* Extra fields visible in front view */}
              {user.bio && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  📝 {user.bio}
                </p>
              )}
              {user.address && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  📍 {user.address}
                </p>
              )}
              {user.subscription_type && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  ✉️ Subscription: {user.subscription_type}
                </p>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <Button size="sm" onClick={openModal}>
            Edit
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Profile
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Bio</Label>
                  <Input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Subscription Type</Label>
                  <Input
                    type="text"
                    value={editSubscription}
                    onChange={(e) => setEditSubscription(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={closeModal}
              >
                Close
              </Button>
              <Button size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
