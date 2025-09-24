import  { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface MediaItem {
  id: string;
  created_at: string;
  Name: string;
  video?: { url: string } | string;
  Image?: { url: string } | string;
}

export default function MediaList() {
  const [mediaData, setMediaData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editVideo, setEditVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // uploadStatus keyed by media id: "", "Uploading image...", etc.
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) fetchMedia();
  }, [token]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      setMediaData(
        data.sort(
          (a: MediaItem, b: MediaItem) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const saveEdit = async (id: string) => {
    try {
      setUploadStatus((s) => ({ ...s, [id]: "Starting..." }));
      let uploadedImg = null;
      let uploadedVid = null;

      if (editImage) {
        setUploadStatus((s) => ({ ...s, [id]: "Uploading image..." }));
        uploadedImg = await uploadFile(editImage, "image");
        setUploadStatus((s) => ({ ...s, [id]: "Image uploaded" }));
      }

      if (editVideo) {
        setUploadStatus((s) => ({ ...s, [id]: "Uploading video..." }));
        uploadedVid = await uploadFile(editVideo, "video");
        setUploadStatus((s) => ({ ...s, [id]: "Video uploaded" }));
      }

      const body: any = { Name: editName };
      if (uploadedImg) body.Image = uploadedImg;
      if (uploadedVid) body.video = uploadedVid;

      setUploadStatus((s) => ({ ...s, [id]: "Saving..." }));

      const res = await fetch(
        `https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setMediaData((md) => md.map((m) => (m.id === id ? updated : m)));

      setEditId(null);
      setEditImage(null);
      setEditVideo(null);

      setUploadStatus((s) => ({ ...s, [id]: "Saved" }));
      setTimeout(() => {
        setUploadStatus((s) => ({ ...s, [id]: "" }));
      }, 4000);
    } catch (err: any) {
      setError(err.message);
      setUploadStatus((s) => ({ ...s, [id]: `Error: ${err.message}` }));
    }
  };

  const deleteMedia = async (id: string) => {
    await fetch(`https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMediaData(mediaData.filter((item) => item.id !== id));
  };

  // Download combined Image + QR code with proper sizes and padding
  const downloadCombinedImageQR = async (media: MediaItem) => {
    if (!media.Image) return;

    const imageUrl = typeof media.Image === "string" ? media.Image : (media.Image as any)?.url;
    const qrCanvas = document.getElementById(`qr-${media.id}`) as HTMLCanvasElement;
    if (!qrCanvas) return;

    const image = new Image();
    image.crossOrigin = "anonymous"; // to avoid CORS issues if allowed
    image.src = imageUrl;

    image.onload = () => {
      const imgWidth = image.width;
      const imgHeight = image.height;
      const qrSize = Math.floor(imgWidth * 0.25);
      const padding = 40;
      const gap = 20;
      const canvasWidth = imgWidth + padding * 2;
      const canvasHeight = imgHeight + qrSize + gap + padding * 2;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvasWidth;
      exportCanvas.height = canvasHeight;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(image, padding, padding, imgWidth, imgHeight);
      ctx.drawImage(qrCanvas, padding + (imgWidth - qrSize) / 2, padding + imgHeight + gap, qrSize, qrSize);

      const pngUrl = exportCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `media-${media.id}.png`;
      link.click();

      setUploadStatus((s) => ({ ...s, [media.id]: "Download complete" }));
      setTimeout(() => setUploadStatus((s) => ({ ...s, [media.id]: "" })), 2000);
    };

    image.onerror = () => {
      setError("Failed to load image for download");
    };
  };

  // Share combined Image + QR code
  const shareCombinedImageQR = (media: MediaItem) => {
    if (!media.Image) {
      setUploadStatus((s) => ({ ...s, [media.id]: "No image to share" }));
      setTimeout(() => setUploadStatus((s) => ({ ...s, [media.id]: "" })), 2000);
      return;
    }

    const imageUrl = typeof media.Image === "string" ? media.Image : (media.Image as any)?.url;
    const qrCanvas = document.getElementById(`qr-${media.id}`) as HTMLCanvasElement;
    if (!qrCanvas) return;

    const image = new Image();
    image.crossOrigin = "anonymous"; // to avoid CORS issues if allowed
    image.src = imageUrl;

    image.onload = () => {
      const imgWidth = image.width;
      const imgHeight = image.height;
      const qrSize = Math.floor(imgWidth * 0.25);
      const padding = 40;
      const gap = 20;
      const canvasWidth = imgWidth + padding * 2;
      const canvasHeight = imgHeight + qrSize + gap + padding * 2;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvasWidth;
      exportCanvas.height = canvasHeight;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(image, padding, padding, imgWidth, imgHeight);
      ctx.drawImage(qrCanvas, padding + (imgWidth - qrSize) / 2, padding + imgHeight + gap, qrSize, qrSize);

      exportCanvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `media-${media.id}.png`, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Media with QR Code",
              text: "Sharing image combined with QR code",
            });
            setUploadStatus((s) => ({ ...s, [media.id]: "Shared successfully" }));
            setTimeout(() => setUploadStatus((s) => ({ ...s, [media.id]: "" })), 2000);
          } catch {
            setUploadStatus((s) => ({ ...s, [media.id]: "Share failed" }));
            setTimeout(() => setUploadStatus((s) => ({ ...s, [media.id]: "" })), 2000);
          }
        } else {
          setUploadStatus((s) => ({ ...s, [media.id]: "Sharing not supported" }));
          setTimeout(() => setUploadStatus((s) => ({ ...s, [media.id]: "" })), 2000);
        }
      });
    };

    image.onerror = () => {
      setError("Failed to load image for sharing");
    };
  };

  // Spinner with white stroke for uploading status
  const Spinner = ({ size = 14 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="inline-block"
      aria-hidden
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="6"
      />
      <path
        d="M45 25a20 20 0 0 0-6.6-14"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );

  // Status circle component unchanged
  const StatusCircle = ({ status }: { status: string }) => {
    const isUploading =
      status.toLowerCase().includes("upload") ||
      status.toLowerCase().includes("saving") ||
      status.toLowerCase().includes("starting");

    if (!isUploading) return null;

    return (
      <div
        className="w-3 h-3 rounded-full mr-2"
        style={{
          background: "linear-gradient(90deg, #7c3aed, #0ea5a3)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
    );
  };

  const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "");

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#fafbfc" }}>
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-2"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                lineHeight: 1.1,
              }}
            >
              My Media Orders
            </h1>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
             
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="px-6 py-4 rounded-2xl text-center"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 10px 25px rgba(102,126,234,0.15)",
              }}
            >
              <div className="text-xs font-medium text-white/80 mb-1">Total Items</div>
              <div className="text-2xl font-bold text-white">{mediaData.length}</div>
            </div>

          <button
      className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
      style={{
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        boxShadow: "0 8px 20px rgba(79,172,254,0.3)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 25px rgba(79,172,254,0.4)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(79,172,254,0.3)";
              }}
              
onClick={() => navigate("/basic-tables")}

    >
      Create New
    </button>
          </div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      </header>

      {loading && <p className="text-center text-slate-600 text-lg">Loading...</p>}
      {error && <p className="text-center text-red-600 text-lg">{error}</p>}

      <div className="space-y-6">
        {mediaData.map((media) => {
          const mediaUrl = `https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1/${media.id}`;
          const status = uploadStatus[media.id] || "";

          return (
            <div
              key={media.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 transition-all duration-300"
              style={{
                boxShadow: "0 4px 20px rgba(148,163,184,0.08)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(148,163,184,0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(148,163,184,0.08)";
                e.currentTarget.style.transform = "translateY(0px)";
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 min-w-0">
                  {editId === media.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xl font-semibold border-2 border-slate-300 rounded-xl px-4 py-3 w-full focus:border-indigo-500 focus:outline-none transition-colors"
                      style={{ color: "#1e293b" }}
                    />
                  ) : (
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {media.Name}
                      <span className="ml-4 text-sm font-normal text-slate-500">
                        {formatDate(media.created_at)}
                      </span>
                    </h3>
                  )}

                  <div className="flex gap-3 flex-wrap items-center mb-4">
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                      }}
                    >
                      Active
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                      ID: {media.id.slice(0, 8)}...
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      Uploaded {new Date(media.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          media.Image ? "bg-blue-400" : "bg-slate-300"
                        }`}
                      ></div>
                      {media.Image ? "Has image" : "No image"}
                    </span>
                    <span className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          media.video ? "bg-purple-400" : "bg-slate-300"
                        }`}
                      ></div>
                      {media.video ? "Has video" : "No video"}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div
                    className="flex items-center gap-6 px-6 py-4 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "1px solid #e2e8f0",
                      minWidth: 380,
                    }}
                  >
                    <div
                      className="rounded-xl p-3 flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <QRCodeCanvas
                        id={`qr-${media.id}`}
                        value={mediaUrl}
                        size={120}
                        fgColor="#1e293b"
                        bgColor="white"
                        level="H"
                      />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 mb-3">QR Code Actions</div>

                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => downloadCombinedImageQR(media)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200"
                          style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102,126,234,0.3)";
                          }}
                        >
                          ⬇ Download
                        </button>

                        <button
                          className="text-sm px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => shareCombinedImageQR(media)}
                          title="Share Image + QR code"
                        >
                          Share
                        </button>
                      </div>

                      <div
                        className="text-xs text-slate-500 truncate mb-3"
                        style={{ maxWidth: 280 }}
                      >
                        {mediaUrl}
                      </div>

                      {/* Enhanced Status Display */}
                      <div className="flex items-center">
                        {status ? (
                          <>
                            <StatusCircle status={status} />
                            {(
                              status.toLowerCase().includes("upload") ||
                              status.toLowerCase().includes("saving") ||
                              status.toLowerCase().includes("downloaded") ||
                              status.toLowerCase().includes("shared") ||
                              status.toLowerCase().includes("copied") ||
                              status.toLowerCase().includes("error")
                            ) ? (
                              <span
                                className="text-xs font-medium text-white px-3 py-1 rounded-full flex items-center gap-2"
                                style={{
                                  background: status.toLowerCase().includes("error")
                                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  boxShadow: "0 2px 8px rgba(102,126,234,0.3)",
                                }}
                              >
                                {(status.toLowerCase().includes("upload") ||
                                  status.toLowerCase().includes("saving")) ? (
                                  <Spinner size={12} />
                                ) : null}
                                {status}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-600 font-medium">{status}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            Synced
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-700 text-sm font-medium mb-2">Image</p>
                  {editId === media.id ? (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-indigo-400 rounded-xl cursor-pointer hover:bg-indigo-50 text-sm text-slate-600 transition-colors">
                      <FaCloudUploadAlt className="text-indigo-500 text-xl mb-2" />
                      {editImage ? editImage.name : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                      />
                    </label>
                  ) : media.Image ? (
                    <div
                      className="w-full relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer transition-transform hover:scale-105"
                      style={{ paddingTop: "100%", backgroundColor: "#ffffff" }}
                      onClick={() =>
                        setPreviewUrl(
                          typeof media.Image === "string"
                            ? media.Image
                            : (media.Image as any)?.url
                        )
                      }
                    >
                      <img
                        src={
                          typeof media.Image === "string"
                            ? media.Image
                            : (media.Image as any)?.url
                        }
                        alt={media.Name}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-28 bg-slate-100 rounded-xl flex items-center justify-center">
                      <p className="text-sm text-slate-500">No Image</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-slate-700 text-sm font-medium mb-2">Video</p>
                  {editId === media.id ? (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-indigo-400 rounded-xl cursor-pointer hover:bg-indigo-50 text-sm text-slate-600 transition-colors">
                      <FaCloudUploadAlt className="text-indigo-500 text-xl mb-2" />
                      {editVideo ? editVideo.name : "Upload Video"}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => setEditVideo(e.target.files?.[0] || null)}
                      />
                    </label>
                  ) : media.video ? (
                    <div
                      className="w-full relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer transition-transform hover:scale-105"
                      style={{ paddingTop: "100%", backgroundColor: "#000000" }}
                      onClick={() =>
                        setPreviewUrl(
                          typeof media.video === "string"
                            ? media.video
                            : (media.video as any)?.url
                        )
                      }
                    >
                      <video
                        src={
                          typeof media.video === "string"
                            ? media.video
                            : (media.video as any)?.url
                        }
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        controls={false}
                        muted
                        playsInline
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            background: "rgba(255,255,255,0.95)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            pointerEvents: "none",
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1e293b">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-28 bg-slate-100 rounded-xl flex items-center justify-center">
                      <p className="text-sm text-slate-500">No Video</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                {editId === media.id ? (
                  <button
                    onClick={() => saveEdit(media.id)}
                    className="px-6 py-2 text-white rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(16,185,129,0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.3)";
                    }}
                  >
                    💾 Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditId(media.id);
                      setEditName(media.Name);
                    }}
                    className="px-6 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    ✏️ Edit
                  </button>
                )}
                <button
                  onClick={() => deleteMedia(media.id)}
                  className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl text-sm font-medium transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
    {previewUrl && (
  <div
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
    onClick={() => setPreviewUrl(null)}
  >
    <div
      className="bg-white p-4 rounded-2xl shadow-2xl max-w-3xl w-[90%] relative"
      onClick={(e) => e.stopPropagation()}
    >
      {previewUrl.endsWith(".mp4") || previewUrl.includes("video") ? (
        <video
          src={previewUrl}
          className="w-full h-[250px] sm:h-[300px] md:h-[400px] object-contain rounded-lg"
          controls
          autoPlay
        />
      ) : (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-[250px] sm:h-[300px] md:h-[400px] object-contain rounded-lg"
        />
      )}

      {/* Close button */}
      <button
        onClick={() => setPreviewUrl(null)}
        className="absolute top-3 right-3 text-3xl font-bold text-gray-700 hover:text-gray-900"
      >
        ×
      </button>
    </div>
  </div>
)}

    </div>
  );
}
