import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      name: "",
      image: null as File | null,
      video: null as File | null,
      savedId: null as string | null,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userMedia, setUserMedia] = useState<any[]>([]);
  const [publicVideo, setPublicVideo] = useState<string | null>(null);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const [previewQrUrl, setPreviewQrUrl] = useState<string | null>(null);

  const token = localStorage.getItem("authToken");

  const navigateToBasicTables = () => {
    window.location.href = "/basic-tables";
  };

  const navigateToHome = () => {
  window.location.href = "/basic-tables";
};


  useEffect(() => {
    if (token) fetchUserMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUserMedia = async () => {
    try {
      const res = await fetch(
        "https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch media");
      const data: any[] = await res.json();

      // Sort newest first, then videos first if same timestamp
      data.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        if (timeB !== timeA) return timeB - timeA;
        if (!!a.video && !b.video) return -1;
        if (!a.video && !!b.video) return 1;
        return 0;
      });

      setUserMedia(data);
    } catch (err: any) {
      setMessage(`❌ Error fetching media: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchPublicVideo = async () => {
      try {
        const res = await fetch(
          "https://x73t-i3sy-hy16.n7e.xano.io/api:iYpTp_60/publicurl"
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPublicVideo(data[0].video?.url || null);
        } else if (data.video?.url) {
          setPublicVideo(data.video.url);
        }
      } catch (err) {
        console.error("Error fetching public video:", err);
      }
    };
    fetchPublicVideo();
  }, []);

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

  const saveMedia = async (row: any, imgObj: any, vidObj: any) => {
    const body: any = { Name: row.name };
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
    try {
      setLoading(true);
      setMessage("Uploading...");
      const updatedRows = [...rows];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.image && !row.video) continue;
        let uploadedImg = null;
        let uploadedVid = null;
        if (row.image) uploadedImg = await uploadFile(row.image, "image");
        if (row.video) uploadedVid = await uploadFile(row.video, "video");
        const saved = await saveMedia(row, uploadedImg, uploadedVid);
        updatedRows[i].savedId = saved.id;
      }
      setRows(updatedRows);
      setMessage("✅ Uploaded & saved successfully!");
      fetchUserMedia();
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (index: number, field: string, value: any) => {
    const newRows = [...rows];
    (newRows[index] as any)[field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now(),
        name: "",
        image: null,
        video: null,
        savedId: null,
      },
    ]);
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  /**
   * Compose and download combined image+QR from an existing <img> and a QR canvas in DOM.
   * Uses canvas composition similar to your original downloadQR.
   */
  const downloadCombinedFromDom = (imgElementId: string, qrCanvasId: string, fileName = "media-qr") => {
    const qrCanvas = document.getElementById(qrCanvasId) as HTMLCanvasElement | null;
    const imgEl = document.getElementById(imgElementId) as HTMLImageElement | null;
    if (!qrCanvas || !imgEl) {
      // fallback: open QR in new tab if possible
      if (qrCanvas) {
        const href = qrCanvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = href;
        a.download = `${fileName}-qr.png`;
        a.click();
      }
      return;
    }

    const outputWidth = 900;
    const outputImgHeight = 1320;
    const outputQRSize = 300;
    const margin = 50;
    const qrMarginTop = 50;
    const logoUrl = "https://placehold.co/64x64/png?text=Logo";

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputImgHeight + outputQRSize + margin * 2 + qrMarginTop;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const iw = img.width;
      const ih = img.height;
      const ir = iw / ih;
      const or = outputWidth / outputImgHeight;
      let sw = iw,
        sh = ih,
        sx = 0,
        sy = 0;

      if (ir > or) {
        sw = ih * or;
        sx = (iw - sw) / 2;
      } else {
        sh = iw / or;
        sy = (ih - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, margin, outputWidth, outputImgHeight);

      const logoSize = 64;
      const logoMargin = 12;
      const logoX = logoMargin;
      const logoY = margin + outputImgHeight - logoSize - logoMargin;
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        // draw QR from canvas
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          const qrX = (canvas.width - outputQRSize) / 2;
          const qrY = outputImgHeight + margin + qrMarginTop;
          ctx.drawImage(qrImg, qrX, qrY, outputQRSize, outputQRSize);

          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${fileName}-${Date.now()}.png`;
          link.click();
        };
        qrImg.src = qrCanvas.toDataURL("image/png");
      };
      logoImg.src = logoUrl;
    };
    img.src = imgEl.src;
  };

  /**
   * Compose and download combined image+QR from an image URL (string) and QR canvas id.
   * Useful for remote images (recent uploads) where no <img> id exists or to avoid DOM dependency.
   */
  const downloadCombinedFromSrc = (imageSrc: string, qrCanvasId: string, fileName = "media-qr") => {
    const qrCanvas = document.getElementById(qrCanvasId) as HTMLCanvasElement | null;
    if (!qrCanvas) {
      // fallback: download image only
      const a = document.createElement("a");
      a.href = imageSrc;
      a.download = `${fileName}-image.png`;
      a.click();
      return;
    }

    const outputWidth = 900;
    const outputImgHeight = 1320;
    const outputQRSize = 300;
    const margin = 50;
    const qrMarginTop = 50;
    const logoUrl = "https://placehold.co/64x64/png?text=Logo";

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputImgHeight + outputQRSize + margin * 2 + qrMarginTop;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const iw = img.width;
      const ih = img.height;
      const ir = iw / ih;
      const or = outputWidth / outputImgHeight;
      let sw = iw,
        sh = ih,
        sx = 0,
        sy = 0;

      if (ir > or) {
        sw = ih * or;
        sx = (iw - sw) / 2;
      } else {
        sh = iw / or;
        sy = (ih - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, margin, outputWidth, outputImgHeight);

      const logoSize = 64;
      const logoMargin = 12;
      const logoX = logoMargin;
      const logoY = margin + outputImgHeight - logoSize - logoMargin;
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        // draw QR from canvas
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          const qrX = (canvas.width - outputQRSize) / 2;
          const qrY = outputImgHeight + margin + qrMarginTop;
          ctx.drawImage(qrImg, qrX, qrY, outputQRSize, outputQRSize);

          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${fileName}-${Date.now()}.png`;
          link.click();
        };
        qrImg.src = qrCanvas.toDataURL("image/png");
      };
      logoImg.src = logoUrl;
    };
    img.src = imageSrc;
  };

  return (
    <>
      <PageMeta title="AR Dashboard" description="Media upload & analytics" />

      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-indigo-50 p-6 space-y-12">
        {/* Header */}
        <section className="relative text-center py-10 px-4">
          <span className="inline-block px-3 py-0.5 rounded-full border border-purple-200 text-purple-600 text-sm font-medium mb-3">
            ★ VisaLive AR
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-snug max-w-2xl mx-auto">
            Upload Your AR Media
          </h1>
          <p className="text-base text-gray-600 mt-3 max-w-xl mx-auto">
            Manage immersive AR content with uploads, QR codes, and analytics.
          </p>
        </section>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition animate-zoomIn"
            >
              <input
                type="text"
                placeholder="Enter name"
                value={row.name}
                onChange={(e) => updateRow(idx, "name", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />

              <label className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer bg-gray-50 hover:bg-indigo-50">
                <span className="text-sm text-gray-600">
                  {row.image ? row.image.name : "Upload Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => updateRow(idx, "image", e.target.files?.[0] || null)}
                />
                <FaCloudUploadAlt className="text-purple-500" />
              </label>

              <label className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer bg-gray-50 hover:bg-indigo-50">
                <span className="text-sm text-gray-600">
                  {row.video ? row.video.name : "Upload Video"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => updateRow(idx, "video", e.target.files?.[0] || null)}
                />
                <FaCloudUploadAlt className="text-green-500" />
              </label>

              <div className="flex items-center justify-center">
                {row.savedId ? (
                  <QRCodeCanvas
                    id={`qr-${row.id}`}
                    value={`https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1/${row.savedId}`}
                    size={128}
                  />
                ) : (
                  <span className="text-xs text-gray-400">No QR yet</span>
                )}
              </div>

              <div className="flex items-center justify-center relative cursor-pointer">
                {row.image && (
                  <img
                    id={`img-preview-${row.id}`}
                    src={URL.createObjectURL(row.image)}
                    alt="preview"
                    className="w-24 h-16 object-cover rounded border cursor-pointer"
                    onClick={() => {
                     if (row.image) {
  setPreviewImageSrc(URL.createObjectURL(row.image));
}

                      setPreviewQrUrl(
                        row.savedId
                          ? `https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1/${row.savedId}`
                          : null
                      );
                    }}
                    title="Click to preview image"
                  />
                )}
              </div>

              {/* Action buttons restored */}
              <div className="flex flex-col items-center justify-center gap-2">
                {row.savedId && (
                  <>
                    <button
                      type="button"
                      onClick={() => downloadCombinedFromDom(`img-preview-${row.id}`, `qr-${row.id}`, `media-${row.id}`)}
                      className="p-2 rounded text-white text-xs w-full bg-purple-600 hover:opacity-90 shadow-lg"
                    >
                      Download QR & Image
                    </button>

                    <button
                      type="button"
                      onClick={navigateToBasicTables}
                      className="p-2 rounded text-white text-xs w-full bg-green-500 hover:opacity-90 shadow-lg"
                    >
                      Preview All 
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => deleteRow(row.id)}
                  className="text-xl font-bold text-red-600 hover:text-red-700 transition px-2 py-1 rounded shadow-lg "
                  aria-label="Delete row"
                  title="Delete row"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
            <button
              type="button"
              onClick={addRow}
              className="w-full sm:w-auto px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition"
            >
              + Add Row
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold rounded-lg shadow transition"
            >
              {loading ? "Uploading..." : "Submit All"}
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-6 text-center text-base font-medium text-gray-700">{message}</p>
        )}

        {/* Hero Video Section */}
        <section className="bg-gradient-to-r from-purple-50 to-indigo-50 py-12 px-0">
          <div className="w-full">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-6 text-center"
            >
              Watch VisaLive AR in Action
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-gray-600 mb-8 max-w-3xl mx-auto text-center"
            >
              A glimpse of how VisaLive transforms images into immersive AR
              experiences with video overlays, 3D objects, and real-time engagement.
            </motion.p>

         <motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  whileInView={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.7 }}
  viewport={{ once: true }}
  className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-300 transform transition-transform duration-500 hover:scale-105"
>
  {publicVideo ? (
    <video
      src={publicVideo}
      controls
      autoPlay
      muted
      loop
      className="w-full h-[450px] object-cover rounded-2xl"
    />
  ) : (
    <p className="text-gray-500 text-center py-20">Loading video...</p>
  )}
</motion.div>

          </div>
        </section>

        {/* Recent Uploads Tile */}
        <section className="bg-white rounded-2xl shadow-lg p-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Recent Uploads</h3>
            <button
              onClick={navigateToHome}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              type="button"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {userMedia.slice(0, 6).map((media) => {
              const mediaUrl = `https://x73t-i3sy-hy16.n7e.xano.io/api:EkZ0h1wI/media1/${media.id}`;
              return (
                <div
                  key={media.id}
                  className="border rounded-lg overflow-hidden relative group cursor-pointer flex flex-col"
                >
                  {media.Image?.url ? (
                    <img
                      id={`recent-img-${media.id}`}
                      src={media.Image.url}
                      alt={media.Name || "media image"}
                      className="w-full object-cover cursor-pointer"
                      style={{ aspectRatio: "10/9", maxHeight: 160 }}
                      onClick={() => {
                        setPreviewImageSrc(media.Image.url);
                        setPreviewQrUrl(mediaUrl);
                      }}
                      title="Click to preview"
                    />
                  ) : media.video?.url ? (
                    <video
                      src={media.video.url}
                      className="w-full object-cover cursor-pointer"
                      style={{ aspectRatio: "16/9", maxHeight: 160 }}
                      controls={false}
                      muted
                      onClick={() => window.open(media.video.url, "_blank")}
                      title="Click to play video"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                      No media
                    </div>
                  )}

                  {/* QR Code below media (fully visible) */}
                  <div className="flex justify-center py-3 bg-white">
                    <QRCodeCanvas
                      id={`qr-${media.id}`}
                      value={mediaUrl}
                      size={100}
                      fgColor="#0f172a"
                      bgColor="white"
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  {/* Name overlay */}
                  

                  {/* Download button for recent card (optional) */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => downloadCombinedFromSrc(media.Image?.url || media.video?.url || "", `qr-${media.id}`, `media-${media.id}`)}
                      className="w-full text-xs px-3 py-2 bg-purple-600 text-white rounded shadow"
                    >
                      Download QR & Image
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <h4 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 text-center py-2 rounded-lg shadow-sm">
          Your AR Journey Dashboard
        </h4>

        <div className="p-6 rounded-2xl border bg-white shadow-lg">
          <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Your Statistics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-tr from-pink-50 to-pink-100 text-center animate-zoomIn">
              <p className="text-3xl font-bold text-pink-600">{userMedia.length}</p>
              <p className="text-sm text-gray-600 mt-1">Uploads</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-tr from-green-50 to-green-100 text-center animate-zoomIn">
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Profile Views</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-tr from-purple-50 to-indigo-100 text-center animate-zoomIn">
              <p className="text-3xl font-bold text-indigo-600">
                {userMedia.filter((m) => m.video).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Videos</p>
            </div>
          </div>
        </div>

        {/* Showcase Section */}
        <section className="mt-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
             <img
  src="https://tse2.mm.bing.net/th/id/OIP.FNvG0Z7GHVw18lf7iTJQ8wHaDW?pid=Api"
  alt="AR Example 1"
  className="w-full h-48 object-cover rounded-xl shadow-lg"
/>

<img
  src="https://tse3.mm.bing.net/th/id/OIP.u61G03fF8YA20LlKG5tozgHaEo?pid=Api"
  alt="AR Example 2"
  className="w-full h-48 object-cover rounded-xl shadow-lg"
/>

<img
  src="https://tse3.mm.bing.net/th/id/OIP.vOWnKvcQCPz9TzgyJJZgywHaE8?pid=Api"
  alt="AR Example 3"
  className="w-full h-48 object-cover rounded-xl shadow-lg col-span-2"
/>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-2xl border border-gray-300"
            >
              {publicVideo ? (
                <video
                  src={publicVideo}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full h-[350px] object-cover"
                />
              ) : (
                <p className="text-gray-500 text-center py-20">Loading video...</p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Image + QR Preview Modal */}
        {previewImageSrc && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setPreviewImageSrc(null);
              setPreviewQrUrl(null);
            }}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg max-w-4xl max-h-[80vh] overflow-auto p-6 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImageSrc}
                alt="Preview"
                className="object-contain max-w-full max-h-[60vh] rounded mb-4"
              />

             {previewImageSrc && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={() => {
      setPreviewImageSrc(null);
      setPreviewQrUrl(null);
    }}
  >
    <div
      className="relative bg-white rounded-lg shadow-lg max-w-4xl max-h-[85vh] overflow-auto p-6 flex flex-col items-center"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Single Image */}
      <img
        src={previewImageSrc}
        alt="Preview"
        className="object-contain max-w-full max-h-[50vh] rounded mb-4"
      />

      {/* QR code only if previewQrUrl exists */}
      {previewQrUrl && (
        <div className="flex flex-col items-center">
          <QRCodeCanvas value={previewQrUrl} size={120} />
          <p className="text-sm text-gray-600 mt-3 break-all text-center px-4">
            {previewQrUrl}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-purple-600 text-white rounded shadow"
          onClick={() => {
            const found = userMedia.find((m) => m.Image?.url === previewImageSrc);
            if (found) {
              downloadCombinedFromSrc(
                previewImageSrc,
                `qr-${found.id}`,
                `media-${found.id}`
              );
            } else {
              const a = document.createElement("a");
              a.href = previewImageSrc;
              a.download = `image-${Date.now()}.png`;
              a.click();
            }
          }}
        >
          Download QR & Image
        </button>

        <button
          type="button"
          className="px-4 py-2 bg-gray-200 rounded shadow"
          onClick={() => {
            setPreviewImageSrc(null);
            setPreviewQrUrl(null);
          }}
        >
          Close
        </button>
      </div>

      {/* Close icon in corner */}
      <button
        onClick={() => {
          setPreviewImageSrc(null);
          setPreviewQrUrl(null);
        }}
        className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-4xl font-extrabold cursor-pointer select-none"
        aria-label="Close preview"
      >
        ×
      </button>
    </div>
  </div>
)}

              <button
                onClick={() => {
                  setPreviewImageSrc(null);
                  setPreviewQrUrl(null);
                }}
                className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-4xl font-extrabold cursor-pointer select-none"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
