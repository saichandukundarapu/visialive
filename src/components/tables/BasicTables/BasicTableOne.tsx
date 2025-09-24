import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface MediaItem {
  id: string;
  created_at: string;
  Name: string;
  video?: { url: string } | string;
  Image?: { url: string } | string;
}

export default function BasicTableOne() {
  const [mediaData, setMediaData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) fetchMedia();
  }, [token]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch media");
      const data: MediaItem[] = await res.json();
      setMediaData(
        data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error fetching media");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      await fetch(
        `https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMediaData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting media:", err);
    }
  };

  const downloadQR = (id: string) => {
    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `qr-${id}.png`;
    link.click();
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
      {/* Page Title */}
      <h2 className="text-3xl font-extrabold mb-8 text-gray-800 tracking-tight">
        📂 My Media Orders
      </h2>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Card list */}
      <div className="space-y-6">
        {mediaData.length > 0 ? (
          mediaData.map((media) => {
            const fileUrl =
              typeof media.Image === "string"
                ? media.Image
                : media.Image?.url || "";

            const videoUrl =
              typeof media.video === "string"
                ? media.video
                : media.video?.url || "";

            return (
              <div
                key={media.id}
                className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg hover:border-blue-400 hover:shadow-xl transition-all"
              >
                {/* File Preview + Info */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  {fileUrl ? (
                    <img
                      src={fileUrl}
                      alt={media.Name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      N/A
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">
                      {media.Name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(media.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="w-full md:w-1/3">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      className="w-full h-28 rounded-lg border shadow-sm"
                      controls
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Video</span>
                  )}
                </div>

                {/* QR + Actions */}
                <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-1/3">
                  <QRCodeCanvas
                    id={`qr-${media.id}`}
                    value={`https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1/${media.id}`}
                    size={60}
                  />
                  <button
                    type="button"
                    onClick={() => downloadQR(media.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Download QR
                  </button>

                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition">
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteMedia(media.id)}
                      className="px-4 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No media uploaded yet</p>
        )}
      </div>
    </div>
  );
}
