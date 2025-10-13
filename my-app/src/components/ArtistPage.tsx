import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtist, getAllArtworks } from "../services/apihelper";

const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artist, setArtist] = useState<any | null>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getAllArtworks().catch(() => [] as any[]),
      (async () => {
        if (!artistId) return null;
        const n = Number(artistId);
        if (!Number.isNaN(n)) {
          try {
            return await getArtist(n);
          } catch (e) {
            return null;
          }
        }
        return null;
      })(),
    ])
      .then(([all, a]) => {
        if (!mounted) return;
        setArtist(a || null);
        const filtered = (all as any[]).filter((aw) => {
          const art = aw as any;
          const n = Number(artistId);
          if (!Number.isNaN(n)) {
            if (typeof art.artist === "number") return art.artist === n;
            if (art.artist && typeof art.artist === "object") return art.artist.id === n || art.artist?.pk === n;
            return false;
          }
          const uname = String(artistId).toLowerCase();
          if (typeof art.artist === "string") return art.artist.toLowerCase() === uname;
          if (art.artist && typeof art.artist === "object") return (art.artist.username || "").toLowerCase() === uname || (art.artist.artist_username || "").toLowerCase() === uname;
          return (art.artist_username || "").toLowerCase() === uname || (art.artist_name || "").toLowerCase() === uname;
        });
        setArtworks(filtered);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [artistId]);

  if (loading) return <div className="p-4 text-center">Loading artist...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  const displayName = artist?.username || artistId;
  const avatar = artist?.profile_picture || "https://via.placeholder.com/150";
  const bio = artist?.bio || "";

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-6 rounded shadow mb-6">
          <div className="flex-shrink-0">
            <img
              src={avatar}
              alt={displayName}
              className="w-36 h-36 rounded-full object-cover border-2 border-gray-300"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-semibold">{displayName}</h1>
              <div className="flex gap-4 text-center">
                <div>
                  <div className="font-bold text-lg">{artworks.length}</div>
                  <div className="text-sm text-gray-500">posts</div>
                </div>
                <div>
                  <div className="font-bold text-lg">0</div>
                  <div className="text-sm text-gray-500">followers</div>
                </div>
                <div>
                  <div className="font-bold text-lg">0</div>
                  <div className="text-sm text-gray-500">following</div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="font-medium">{bio}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artworks.map((a) => (
              <div key={a.id} className="relative group">
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-full h-48 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-end justify-between p-3 text-white opacity-0 group-hover:opacity-100">
                  <div className="text-sm">{a.title}</div>
                </div>
              </div>
            ))}
            {artworks.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">No artworks found for this artist.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
