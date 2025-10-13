import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginArtist, getCurrentArtist } from "../services/apihelper";

const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginArtist({ username, password });
      // The backend might return the token in different shapes. Try common options.
      const data = res?.data ?? {};

      // token could be in data.token, data.key, data.access (JWT), or in headers.authorization
      let token: string | undefined = undefined;
      token = data.token || data.key || data.access || data?.auth_token;

      // Check headers (some backends return Authorization header)
      const authHeader = (res.headers &&
        (res.headers.authorization || res.headers.Authorization)) as
        | string
        | undefined;
      if (!token && authHeader) {
        token = authHeader;
      }

      // Normalize token: if it looks like 'Bearer ...' or 'Token ...' keep it, else assume Bearer if JWT-like or Token otherwise
      if (token && !/^Bearer\s+/i.test(token) && !/^Token\s+/i.test(token)) {
        // crude heuristic for JWT: three base64url segments separated by dots
        if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token)) {
          token = `Bearer ${token}`;
        } else {
          token = `Token ${token}`;
        }
      }

      const artist = data.artist ?? data.user ?? data;

      if (token) {
        try {
          localStorage.setItem("token", token);
        } catch (e) {}

        if (artist) {
          try {
            localStorage.setItem("artist", JSON.stringify(artist));
            if ((artist as any).id)
              localStorage.setItem("artistId", String((artist as any).id));
          } catch (e) {}
        }

        navigate("/profile");
        return;
      }

      // No token returned. If artist info exists in the response, save it.
      if (artist) {
        try {
          localStorage.setItem("artist", JSON.stringify(artist));
          if ((artist as any).id)
            localStorage.setItem("artistId", String((artist as any).id));
        } catch (e) {}
      }

      // Try fetching the current artist if the backend uses session cookies.
      try {
        const me = await getCurrentArtist();
        if (me) {
          try {
            localStorage.setItem("artist", JSON.stringify(me));
            localStorage.setItem("artistId", String(me.id));
          } catch (e) {}
          // No token but session cookie present; consider the user logged in.
          navigate("/profile");
          return;
        }
      } catch (e) {
        // ignore error — we'll show a helpful message below
      }

      setError(
        "Login succeeded but no token received. If your server uses session cookies, ensure CORS allows credentials and that the login endpoint sets cookies."
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start sm:items-center justify-center min-h-screen bg-gray-50 py-8">
      <form
        onSubmit={handleSubmit}
        className="card p-4 sm:p-6 rounded shadow-md w-full max-w-md mx-3"
      >
        <h2 className="text-xl font-semibold mb-4">Sign In</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <input
          className="form-control mb-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading} className="btn btn-primary w-full">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default Signin;
