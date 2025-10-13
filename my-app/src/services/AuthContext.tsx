import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  artist: any | null;
  setToken: (t: string | null) => void;
  setArtist: (a: any | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [artist, setArtist] = useState<any | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      const a = localStorage.getItem("artist");
      if (t) setToken(t);
      if (a) setArtist(JSON.parse(a));
    } catch (e) {}
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("artist");
      localStorage.removeItem("artistId");
    } catch (e) {}
    setToken(null);
    setArtist(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ token, artist, setToken, setArtist, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
