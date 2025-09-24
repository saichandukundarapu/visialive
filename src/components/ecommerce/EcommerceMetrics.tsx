import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

export default function UploadMedia() {
  const [mediaName, setMediaName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userMedia, setUserMedia] = useState<any[]>([]);

  const token = localStorage.getItem("authToken");

  // ✅ Fetch existing uploaded media
  useEffect(() => {
    if (token) fetchUserMedia();
  }, [token]);

  const fetchUserMedia = async () => {
    try {
      const res = await fetch(
        "https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/my",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      setUserMedia(data);
    } catch (err: any) {
      setMessage(`❌ Error fetching media: ${err.message}`);
    }
  };

  // ✅ Upload file to Xano
  const uploadFile = async (file: File, type: "image" | "video") => {
    const formData = new FormData();
    formData.append("content", file);

    const endpoint = type === "video" ? "upload/video" : "upload/image";

    const res = await fetch(
      `https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/${endpoint}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    if (!res.ok) throw new Error(`Upload ${type} failed`);
    return res.json();
  };

  // ✅ Save record into media table
  const saveMedia = async (name: string, imgObj: any, vidObj: any) => {
    const body: any = { Name: name };
    if (imgObj) body.Image = imgObj;
    if (vidObj) body.video = vidObj;

    const res = await fetch(
      "https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) throw new Error("Saving media failed");
    return res.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaName || (!image && !video)) {
      setMessage("⚠️ Please enter a name and select file(s).");
      return;
    }
    try {
      setLoading(true);
      setMessage("Uploading...");

      let uploadedImg = null;
      let uploadedVid = null;

      if (image) uploadedImg = await uploadFile(image, "image");
      if (video) uploadedVid = await uploadFile(video, "video");

      await saveMedia(mediaName, uploadedImg, uploadedVid);

      setMessage("✅ Uploaded & saved successfully!");
      setMediaName("");
      setImage(null);
      setVideo(null);
      fetchUserMedia();
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl">
      <h2 className="text-2xl font-bold text-center mb-6">
        Upload AR Media
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name */}
        <input
          type="text"
          placeholder="Enter media name"
          value={mediaName}
          onChange={(e) => setMediaName(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Row 2: Image + Video */}
        <div className="grid grid-cols-2 gap-6">
          {/* Upload Image */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
            <label className="block text-gray-700 font-semibold mb-2">
              Upload Image
            </label>
            <FaCloudUploadAlt className="mx-auto text-4xl text-blue-500 mb-2" />
            <span className="text-sm text-gray-600">
              {image ? image.name : "Click to upload image"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          {/* Upload Video */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
            <label className="block text-gray-700 font-semibold mb-2">
              Upload Video
            </label>
            <FaCloudUploadAlt className="mx-auto text-4xl text-blue-500 mb-2" />
            <span className="text-sm text-gray-600">
              {video ? video.name : "Click to upload video"}
            </span>
            <input
              type="file"
              accept="video/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        {/* Row 3: Effects + Masks */}
        <div className="grid grid-cols-2 gap-6">
          {/* Upload Effects */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition">
            <label className="block text-gray-700 font-semibold mb-2">
              Upload Effects
            </label>
            <FaCloudUploadAlt className="mx-auto text-4xl text-purple-500 mb-2" />
            <span className="text-sm text-gray-600">Click to upload effects</span>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Upload Masks */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition">
            <label className="block text-gray-700 font-semibold mb-2">
              Upload Masks
            </label>
            <FaCloudUploadAlt className="mx-auto text-4xl text-green-500 mb-2" />
            <span className="text-sm text-gray-600">Click to upload masks</span>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition"
        >
          {loading ? "Uploading..." : "Submit"}
        </button>
      </form>

      {message && <p className="text-center mt-4">{message}</p>}

      {/* ✅ Gallery */}
      {userMedia.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">📂 Your Uploaded Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userMedia.map((media) => (
              <div
                key={media.id}
                className="p-4 border rounded-lg shadow hover:shadow-lg transition"
              >
                <p className="font-semibold text-center mb-2">
                  {media.Name}
                </p>

                {/* ✅ Show image if available */}
                {media.Image && (
                  <img
                    src={`https://x73t-i3sy-hy16.n7e.xano.io${media.Image.path}`}
                    alt={media.Name}
                    className="w-full rounded-md mb-2"
                  />
                )}

                {/* ✅ Show video if available */}
                {media.video && (
                  <video
                    src={`https://x73t-i3sy-hy16.n7e.xano.io${media.video.path}`}
                    controls
                    className="w-full rounded-md"
                  />
                )}

                {/* ✅ QR Code */}
                <div className="mt-2 flex justify-center">
                  <QRCodeCanvas
                    value={`https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1/${media.id}`}
                    size={100}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
