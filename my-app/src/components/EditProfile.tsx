import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getArtist, updateArtist, deleteArtist } from "../services/apihelper";
import { useAuth } from "../services/AuthContext";

const EditProfile: React.FC = () => {
  const { artist: initialArtist, logout, setArtist } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(initialArtist || null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialArtist) {
      setUser(initialArtist);
      setUsername(initialArtist.username || "");
      setBio(initialArtist.bio || "");
    } else {
      const idStr = localStorage.getItem("artistId");
      if (idStr) {
        const id = Number(idStr);
        getArtist(id)
          .then((res) => {
            setUser(res);
            setUsername(res.username || "");
            setBio(res.bio || "");
          })
          .catch((err) => {
            console.error(err);
            setError(err.response?.data || err.message || String(err));
          });
      }
    }
  }, [initialArtist]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setPicture(f);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await updateArtist(user.id, {
        username: username || undefined,
        bio: bio || undefined,
        profile_picture: picture || undefined,
      } as any);
      // Update local auth state and storage
      try {
        localStorage.setItem("artist", JSON.stringify(updated));
        localStorage.setItem("artistId", String(updated.id));
      } catch (e) {}
      setArtist(updated);
      navigate("/profile");
    } catch (err: any) {
      console.error(err);
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const ok = confirm(
      "Permanently delete your account? This will remove your profile and all associated data on the server. This action cannot be undone."
    );
    if (!ok) return;
    setLoading(true);
    setError(null);
    try {
      // Prefer username-based route if available (some backends use username in the URL)
      const ident = user.username || user.id;
      await deleteArtist(ident);
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("artist");
        localStorage.removeItem("artistId");
      } catch (e) {}
      setArtist(null);
      alert("Your account has been deleted.");
      logout();
    } catch (err: any) {
      console.error(err);
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  function formatError(err: any) {
    // Axios-style error may include response.data which can be an object
    try {
      if (!err) return "Unknown error";
      if (err.response && err.response.data) {
        const d = err.response.data;
        if (typeof d === "string") return d;
        try {
          return JSON.stringify(d);
        } catch (e) {
          return String(d);
        }
      }
      if (err.message) return err.message;
      return String(err);
    } catch (e) {
      return "An error occurred";
    }
  }

  if (!user) return <div className="p-4">No user data available</div>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
      {error && <div className="text-red-500 mb-3">{String(error)}</div>}
      <label className="block mb-2">Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />
      <label className="block mb-2">Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />
      <label className="block mb-2">Profile picture</label>
      <input type="file" accept="image/*" onChange={handleFile} />
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save changes
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-red-500 text-white rounded"
        >
          Delete account
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
