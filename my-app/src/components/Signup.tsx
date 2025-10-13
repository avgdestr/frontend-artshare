import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerArtist } from "../services/apihelper";
import type { RegisterData, Artist } from "../services/apihelper";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // New states for show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setMessage("");
    setStep(2);
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    // Revoke previous preview URL to avoid memory leaks
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setProfilePicture(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();

    setFieldErrors({});
    setLoading(true);

    const data: RegisterData = {
      username,
      email,
      password,
      bio,
      profile_picture: profilePicture,
    };

    try {
      const artist: Artist = await registerArtist(data);
      setMessage("Registration successful!");
      console.log(artist);
      // redirect to sign in so user can login
      navigate("/signin");
    } catch (error: any) {
      const resp = error?.response?.data;
      if (resp) {
        if (typeof resp === "object") {
          // field errors or structured response
          setFieldErrors(resp as Record<string, string[]>);
          const firstMessages = Object.values(resp).flat();
          setMessage(String(firstMessages[0] ?? "Registration failed"));
        } else {
          setMessage(String(resp));
        }
      } else {
        setMessage(error.message || "Registration failed");
      }
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start sm:items-center min-h-screen bg-gray-50 py-8">
      <div className="card shadow-md p-4 sm:p-6 w-full max-w-md mx-3 rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>
        {message && <p className="text-red-500 text-center mb-4">{message}</p>}
        {Object.keys(fieldErrors).length > 0 && (
          <div className="mb-4 text-left text-sm text-red-600">
            {Object.entries(fieldErrors).map(([k, v]) => (
              <div key={k}>
                <strong>{k}:</strong> {v.join(" ")}
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} className="flex flex-col">
            <input
              type="text"
              placeholder="Username"
              className="form-control mb-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              className="form-control mb-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="form-control w-full pr-16"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="form-control w-full pr-16"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? "Please wait..." : "Next"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={handleStep2}
            className="flex flex-col items-center space-y-4"
          >
            <div className="relative w-32 h-32">
              <label className="cursor-pointer">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="rounded-full w-32 h-32 object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 text-gray-500">
                    Upload PFP
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="form-control w-full"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-success w-full"
            >
              {loading ? "Registering..." : "Complete Signup"}
            </button>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
