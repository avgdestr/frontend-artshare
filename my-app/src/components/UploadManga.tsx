import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import { createArtwork } from "../services/apihelper";

const UploadManga = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  // description/caption removed (backend doesn't support it)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const { logout } = useAuth();
  const [artist, setArtist] = useState<{
    username?: string;
    profile_picture?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    // revoke previous preview
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!title || !image) {
      setMessage("Title and image are required.");
      return;
    }
    setLoading(true);
    setProgress(0);
    try {
      // Resize image on the client to max 1080px and compress to JPEG
      const fileToUpload = image ? await resizeImage(image, 1080, 0.85) : image;
      const data = { title, image: fileToUpload as any };
      const created = await createArtwork(data as any, (ev) => {
        if (!ev) return;
        const loaded = ev.loaded ?? 0;
        const total = ev.total ?? 0;
        if (total > 0) setProgress(Math.round((loaded / total) * 100));
      });
      setMessage("Upload successful!");
      setTitle("");
      setImage(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      console.log(created);
    } catch (err: any) {
      setMessage(err.response?.data || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Helper: resize image file using canvas and return a File/Blob
  async function resizeImage(
    file: File,
    maxDim = 1080,
    quality = 0.85
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Failed to get canvas context"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas is empty"));
            const newFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".jpg"),
              {
                type: "image/jpeg",
              }
            );
            resolve(newFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
      img.src = URL.createObjectURL(file);
    });
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem("artist");
      if (stored) setArtist(JSON.parse(stored));
    } catch (e) {}
  }, []);

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-md rounded-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left: Preview */}
        <div className="md:w-2/3 bg-black flex items-center justify-center">
          <label className="w-full h-96 md:h-auto block cursor-pointer">
            {preview ? (
              <div className="w-full h-96 md:h-full relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (preview) URL.revokeObjectURL(preview);
                    setPreview(null);
                    setImage(null);
                  }}
                  className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="w-full h-96 md:h-full flex flex-col items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  fill="currentColor"
                  className="mb-3"
                  viewBox="0 0 16 16"
                >
                  <path d="M.5 2A1.5 1.5 0 0 1 2 0.5h12A1.5 1.5 0 0 1 15.5 2v12a1.5 1.5 0 0 1-1.5 1.5H2A1.5 1.5 0 0 1 .5 14V2zm4.5 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM2 2v10h12V2H2z" />
                </svg>
                <div className="text-sm">Click to select a photo</div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Right: Metadata */}
        <div className="md:w-1/3 p-6">
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <img
                src={
                  artist?.profile_picture ?? "https://via.placeholder.com/40"
                }
                alt="avatar"
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <div className="font-semibold">
                  {artist?.username ?? "Your Name"}
                </div>
                <div className="text-sm text-gray-500">
                  @{artist?.username ?? "username"}
                </div>
              </div>
            </div>
            <button className="text-sm text-red-500" onClick={logout}>
              Logout
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="Write a title..."
              className="w-full mb-3 px-3 py-2 border rounded focus:outline-none"
            />

            {/* caption removed */}

            <div className="flex items-center justify-between">
              {/* no filename/status text by user request */}
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {loading ? "Uploading..." : "Share"}
              </button>
            </div>
            {progress > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                  <div
                    className="h-2 bg-blue-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-right text-gray-600 mt-1">
                  {progress}%
                </div>
              </div>
            )}
            {message && (
              <div className="mt-3 text-sm text-center text-green-600">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadManga;
