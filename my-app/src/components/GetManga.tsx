import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllArtworks } from "../services/apihelper";
import { resolveMediaUrl } from "../services/api";

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
            <div className="card-header p-1 text-center text-light relative">
              <h5>{img.title}</h5>
              {/* artist link will be on the artist name below */}
            </div>
            <img
              className="art-img p-1 img"
              src={typeof img.image === "string" ? (resolveMediaUrl(img.image) || img.image) : ""}
              alt={img.title}
              onClick={() => setSelectedIdx(idx)}
              style={{ cursor: "pointer" }}
            />
            <div className="art-info">
              <p>
                By{" "}
                {(() => {
                  const a: any = img.artist;
                  const artLevelName =
                    (img as any).artist_username ||
                    (img as any).artist_name ||
                    (img as any).artist_display_name;
                  let display = "Unknown";
                  let target: string | number = img.id;
                  if (artLevelName) {
                    display = artLevelName;
                    target = artLevelName;
                  } else if (!a && a !== 0) {
                    display = "Unknown";
                  } else if (typeof a === "string") {
                    display = a;
                    target = a;
                  } else if (typeof a === "number") {
                    display = String(a);
                    target = a;
                  } else if (a?.artist_username) {
                    display = a.artist_username;
                    target = a.artist_username;
                  } else if (a?.username) {
                    display = a.username;
                    target = a.username;
                  } else if (a?.artist && typeof a.artist === "object") {
                    display = a.artist.username || "Unknown";
                    target = a.artist.id || display;
                  }
                  return <Link to={`/artists/${target}`}>{display}</Link>;
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
            src={resolveMediaUrl((items[selectedIdx] as any).image) || (items[selectedIdx] as any).image}
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
