import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtist, getAllArtworks } from "../services/apihelper";

const ArtistPage: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [artist, setArtist] = useState<any | null>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

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
        const allArr = Array.isArray(all) ? (all as any[]) : [];
        const filtered = allArr.filter((aw) => {
          const art = aw as any;
          const n = Number(artistId);
          if (!Number.isNaN(n)) {
            if (typeof art.artist === "number") return art.artist === n;
            if (art.artist && typeof art.artist === "object")
              return art.artist.id === n || art.artist?.pk === n;
            return false;
          }
          const uname = String(artistId).toLowerCase();
          if (typeof art.artist === "string")
            return art.artist.toLowerCase() === uname;
          if (art.artist && typeof art.artist === "object")
            return (
              (art.artist.username || "").toLowerCase() === uname ||
              (art.artist.artist_username || "").toLowerCase() === uname
            );
          return (
            (art.artist_username || "").toLowerCase() === uname ||
            (art.artist_name || "").toLowerCase() === uname
          );
        });
        // Filter out any invalid entries (null, non-objects) to avoid runtime errors
        setArtworks(filtered.filter((x) => x && typeof x === "object"));
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

  // Prefer artist username from fetched artist, but fall back to artwork-level fields
  const firstArt = artworks && artworks.length > 0 ? artworks[0] : null;
  const displayName =
    artist?.username ||
    firstArt?.artist_username ||
    firstArt?.artist_name ||
    firstArt?.artist_display_name ||
    artistId;
  const avatar =
    artist?.profile_picture ||
    firstArt?.artist_profile_picture ||
    "https://via.placeholder.com/150";
  const bio = artist?.bio || firstArt?.artist_bio || "";
  // lightbox state and key handler are declared earlier to keep hook order stable

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
              </div>
            </div>
            <div className="mt-3">
              <p className="font-medium">{bio}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          {/* Masonry: columns with break-inside to flow items */}
          <div
            className="masonry-columns"
            style={{ columnCount: 3, columnGap: 12 }}
          >
            {/**
             * Only render artworks that look like objects and have an image string.
             * This avoids runtime exceptions when the API returns unexpected shapes.
             */}
            {artworks
              .filter(
                (a) => a && typeof a === "object" && typeof a.image === "string"
              )
              .map((a, idx) => (
                <div
                  key={a.id ?? idx}
                  className="mb-3 break-inside-avoid rounded overflow-hidden relative cursor-pointer"
                  onClick={() => setLightboxIdx(idx)}
                >
                  <img
                    src={a.image}
                    alt={a.title || "Artwork"}
                    className="w-full object-cover"
                  />
                  <div className="p-2 bg-white">
                    <div className="font-medium text-sm">{a.title}</div>
                  </div>
                </div>
              ))}
            {artworks.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                No artworks found for this artist.
              </div>
            )}
          </div>
          {/* Lightbox */}
          {lightboxIdx !== null &&
            lightboxIdx >= 0 &&
            Array.isArray(artworks) &&
            lightboxIdx <
              artworks.filter(
                (a) => a && typeof a === "object" && typeof a.image === "string"
              ).length && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                onClick={() => setLightboxIdx(null)}
              >
                <button
                  className="absolute top-4 right-4 text-white text-2xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx(null);
                  }}
                >
                  &times;
                </button>
                <button
                  className="absolute left-4 text-white text-3xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((i) =>
                      i === null
                        ? null
                        : (i - 1 + artworks.length) % artworks.length
                    );
                  }}
                >
                  &#8592;
                </button>
                {
                  // Safely resolve current artwork for the lightbox
                }
                {(() => {
                  const visible = artworks.filter(
                    (a) =>
                      a && typeof a === "object" && typeof a.image === "string"
                  );
                  const cur = visible[lightboxIdx as number];
                  if (!cur) return null;
                  return (
                    <img
                      src={cur.image}
                      alt={cur.title}
                      className="max-h-[80vh] max-w-[80vw] object-contain"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  );
                })()}
                <button
                  className="absolute right-4 text-white text-3xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((i) =>
                      i === null ? null : (i + 1) % artworks.length
                    );
                  }}
                >
                  &#8594;
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
