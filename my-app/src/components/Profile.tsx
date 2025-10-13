import { useEffect, useState } from "react";
import { getArtist } from "../services/apihelper";
import { API_BASE_URL } from "../services/api";
import type { Artist as ArtistType } from "../services/apihelper";

const Profile = () => {
  const [user, setUser] = useState<ArtistType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Try to get artist from localStorage first
    try {
      const stored = localStorage.getItem("artist");
      if (stored) {
        const parsed = JSON.parse(stored) as ArtistType;
        if (mounted) {
          setUser(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore parse errors
    }

    // If not present, try to fetch by stored artistId
    try {
      const idStr = localStorage.getItem("artistId");
      if (idStr) {
        const id = Number(idStr);
        getArtist(id)
          .then((res) => {
            if (!mounted) return;
            setUser(res);
          })
          .catch((err) => {
            console.error(err);
            if (!mounted) return;
            setError(
              err.response?.data || err.message || "Failed to load profile"
            );
          })
          .finally(() => {
            if (!mounted) return;
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-4 text-center">Loading profile...</div>;
  if (error)
    return <div className="p-4 text-center text-red-500">{String(error)}</div>;
  if (!user)
    return (
      <div className="p-4 text-center">
        No profile available. Please sign in.
      </div>
    );

  return (
    <div className="flex justify-center md:items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-8 text-center">
        <img
          src={
            user.profile_picture
              ? user.profile_picture.startsWith("http")
                ? user.profile_picture
                : `${API_BASE_URL}${
                    user.profile_picture.startsWith("/") ? "" : "/"
                  }${user.profile_picture}`
              : "https://via.placeholder.com/150"
          }
          alt="Profile"
          className="w-32 h-32 mx-auto rounded-full border-4 border-blue-500 shadow-md"
        />
        <h2 className="text-2xl font-bold mt-4 text-gray-900">
          {user.username}
        </h2>
        <p className="text-blue-500 font-semibold">@{user.username}</p>
        <p className="mt-3 text-gray-700 italic">{user.bio}</p>
        <button
          onClick={() => alert("Edit profile coming soon!")}
          className="mt-6 px-6 py-2 rounded-full font-semibold shadow 
             border border-blue-500 text-blue-500 
             hover:bg-blue-500 hover:text-white 
             transition duration-200"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
