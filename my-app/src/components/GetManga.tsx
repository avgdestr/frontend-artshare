import React, { useEffect, useState } from "react";
import { getAllArtworks } from "../services/apihelper";

interface ArtworkItem {
  id: number;
  title: string;
  image: string;
  artist:
    | { username?: string }
    | { artist_username?: string }
    | string
    | number;
}

const GetManga = () => {
  const [items, setItems] = useState<ArtworkItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAllArtworks()
      .then((res) => {
        if (!mounted) return;
        setItems(res as any);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(
          err.response?.data || err.message || "Failed to load artworks"
        );
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + items.length) % items.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % items.length);
    }
  };

  if (loading)
    return <div className="p-4 text-center">Loading artworks...</div>;
  if (error)
    return <div className="p-4 text-center text-red-500">{String(error)}</div>;

  return (
    <div className="row container-fluid justify-content-center">
      <div className="masonry mt-2">
        {items.map((img, idx) => (
          <div className="art-card card-color shadow" key={img.id}>
            <div className="card-header p-1 text-center text-light">
              <h5>{img.title}</h5>
            </div>
            <img
              className="art-img p-1 img"
              src={img.image}
              alt={img.title}
              onClick={() => setSelectedIdx(idx)}
              style={{ cursor: "pointer" }}
            />
            <div className="art-info">
              <p>
                By{" "}
                {(() => {
                  const a: any = img.artist;
                  if (!a && a !== 0) return "Unknown";
                  if (typeof a === "string") return a;
                  if (typeof a === "number") return String(a);
                  if (a.artist_username) return a.artist_username;
                  if (a.username) return a.username;
                  // Fallback: try nested 'artist' property (some responses are odd)
                  if (a.artist && typeof a.artist === "object")
                    return a.artist.username || "Unknown";
                  return "Unknown";
                })()}
              </p>
            </div>
          </div>
        ))}
      </div>
      {selectedIdx !== null && (
        <div className="lightbox" onClick={() => setSelectedIdx(null)}>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={handlePrev}
            style={{ cursor: "pointer" }}
          >
            &#8592;
          </button>
          <img
            src={(items[selectedIdx] as any).image}
            alt={(items[selectedIdx] as any).title}
            className="lightbox-img"
          />
          <button
            className="lightbox-nav lightbox-next"
            onClick={handleNext}
            style={{ cursor: "pointer" }}
          >
            &#8594;
          </button>
          <div className="lightbox-desc">
            <h3>{(items[selectedIdx] as any).title}</h3>
            <p>
              By{" "}
              {(() => {
                const a: any = (items[selectedIdx] as any).artist;
                if (!a && a !== 0) return "Unknown";
                if (typeof a === "string") return a;
                if (typeof a === "number") return String(a);
                if (a.artist_username) return a.artist_username;
                if (a.username) return a.username;
                if (a.artist && typeof a.artist === "object")
                  return a.artist.username || "Unknown";
                return "Unknown";
              })()}
            </p>
          </div>
          <span className="lightbox-close">&times;</span>
        </div>
      )}
    </div>
  );
};

export default GetManga;
