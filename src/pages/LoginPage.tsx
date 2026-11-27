import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [matric, setMatric] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(matric, password);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? friendlyAuthError(err.message)
          : "Something went wrong. Try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <h1>Class Portal</h1>
      <p className="subtitle">Sign in with your matric number</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Matric number
          <input
            value={matric}
            onChange={(e) => setMatric(e.target.value)}
            placeholder="e.g. CST/2021/045"
            autoCapitalize="characters"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="auth-switch">
        First time here? <Link to="/signup">Set up your account</Link>
      </p>
    </div>
  );
}

function friendlyAuthError(message: string): string {
  if (message.includes("invalid-credential") || message.includes("wrong-password")) {
    return "Incorrect matric number or password.";
  }
  if (message.includes("user-not-found")) {
    return "No account found for that matric number. Set up your account first.";
  }
  if (message.includes("too-many-requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return "Couldn't sign in. Check your details and try again.";
}
