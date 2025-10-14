import { Routes, Route, NavLink } from "react-router-dom";
import "./App.css";

import GetManga from "./components/GetManga";
import UploadManga from "./components/UploadManga";
import Welcome from "./components/Welcome";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import RequireAuth from "./components/RequireAuth";
import ArtistPage from "./components/ArtistPage";
import { useAuth } from "./services/AuthContext";

function App() {
  const { token } = useAuth();

  return (
    <div className="App justify-content-center">
      <header className="App-header d-flex justify-content-center align-items-center">
        <h1 className="p-2">
          <i className="bi bi-palette"></i>Art Share
        </h1>
      </header>
      <nav className="d-flex justify-content-around bg-dark text-light p-3">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "link active" : "link")}
        >
          Welcome
        </NavLink>
        <NavLink
          to="/art"
          className={({ isActive }) => (isActive ? "link active" : "link")}
        >
          Home
        </NavLink>
        {token ? (
          <>
            <NavLink
              to="/shareart"
              className={({ isActive }) => (isActive ? "link active" : "link")}
            >
              Share Art
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? "link active" : "link")}
            >
              profile
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/signup"
              className={({ isActive }) => (isActive ? "link active" : "link")}
            >
              Sign Up
            </NavLink>
            <NavLink
              to="/signin"
              className={({ isActive }) => (isActive ? "link active" : "link")}
            >
              Sign In
            </NavLink>
          </>
        )}
      </nav>
      <nav className="d-flex justify-content-end bg-gray-200 text-dark p-1">
        <span className="text-sm italic">
          {new Date().getFullYear()} &copy; Art Share
        </span>
      </nav>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/art" element={<GetManga />} />
        <Route path="/artists/:artistId" element={<ArtistPage />} />
        <Route
          path="/shareart"
          element={
            <RequireAuth>
              <UploadManga />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        ></Route>
        <Route
          path="/profile/edit"
          element={
            <RequireAuth>
              <EditProfile />
            </RequireAuth>
          }
        />
        <Route path="*" element={<h2>Page Not Found</h2>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
      />
    </div>
  );
}

export default App;
