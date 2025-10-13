import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [items, setItems] = useState<ArtworkItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);
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
            <div className="card-header p-1 text-center text-light relative">
              <h5>{img.title}</h5>
              <button
                className="absolute top-1 right-1 text-white p-1 hover:opacity-80"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuIdx(openMenuIdx === idx ? null : idx);
                }}
                aria-label="More"
              >
                <i className="bi bi-three-dots-vertical"></i>
              </button>
              {openMenuIdx === idx && (
                <div
                  className="absolute top-8 right-1 bg-white text-black rounded shadow p-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="block px-3 py-1 text-left w-full hover:bg-gray-100"
                    onClick={() => {
                      // navigate to artist page; prefer artist id when numeric else username
                      const a: any = img as any;
                      const artistVal = a.artist;
                      const artLevelName =
                        a.artist_username ||
                        a.artist_name ||
                        a.artist_display_name;
                      if (typeof artistVal === "number")
                        navigate(`/artists/${artistVal}`);
                      else if (artLevelName)
                        navigate(`/artists/${artLevelName}`);
                      else if (typeof artistVal === "object" && artistVal?.id)
                        navigate(`/artists/${artistVal.id}`);
                      else if (typeof artistVal === "string")
                        navigate(`/artists/${artistVal}`);
                      else navigate(`/artists/${String(a.id)}`);
                      setOpenMenuIdx(null);
                    }}
                  >
                    See more from this artist
                  </button>
                </div>
              )}
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
                  // If the artwork object carries a username field separately, prefer that
                  const artLevelName =
                    (img as any).artist_username ||
                    (img as any).artist_name ||
                    (img as any).artist_display_name;
                  if (artLevelName) return artLevelName;
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
                const item: any = items[selectedIdx] as any;
                const a: any = item.artist;
                const artLevelName =
                  item.artist_username ||
                  item.artist_name ||
                  item.artist_display_name;
                if (artLevelName) return artLevelName;
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
