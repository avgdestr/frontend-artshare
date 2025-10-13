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
    // Fetch all artworks and optionally artist info if id is numeric
    Promise.all([
      getAllArtworks().catch((e) => {
        console.error(e);
        return [] as any[];
      }),
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
        // Filter artworks by artist match: id, username, or artist_username on artwork
        const filtered = (all as any[]).filter((aw) => {
          const art = aw as any;
          // if artistId param is numeric, match by id
          const n = Number(artistId);
          if (!Number.isNaN(n)) {
            if (typeof art.artist === "number") return art.artist === n;
            if (art.artist && typeof art.artist === "object") return art.artist.id === n || art.artist?.pk === n;
            return false;
          }
          // else treat artistId as username
          const uname = String(artistId).toLowerCase();
          if (typeof art.artist === "string") return art.artist.toLowerCase() === uname;
          if (art.artist && typeof art.artist === "object") return (art.artist.username || "").toLowerCase() === uname || (art.artist.artist_username || "").toLowerCase() === uname;
          // artwork-level fields
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

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-2xl font-bold">{artist?.username || artistId}</h2>
          <p className="text-gray-600">More from this artist</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {artworks.map((a) => (
            <div key={a.id} className="bg-white rounded shadow p-2">
              <img src={a.image} alt={a.title} className="w-full h-48 object-cover mb-2" />
              <h3 className="font-semibold">{a.title}</h3>
            </div>
          ))}
          {artworks.length === 0 && <div>No artworks found for this artist.</div>}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
