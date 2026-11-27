import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { RosterEntry } from "../lib/types";

type Step = "lookup" | "set-password";

export default function SignupPage() {
  const { checkRoster, claimAccount } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("lookup");
  const [matric, setMatric] = useState("");
  const [rosterEntry, setRosterEntry] = useState<RosterEntry | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const entry = await checkRoster(matric);
      if (!entry) {
        setError("That matric number isn't on the class roster. Check the spelling, or contact your class rep.");
        return;
      }
      if (entry.claimed) {
        setError("This account has already been set up. Go to the login screen instead.");
        return;
      }
      setRosterEntry(entry);
      setStep("set-password");
    } catch {
      setError("Couldn't check the roster right now. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await claimAccount(matric, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't set up your account. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "lookup") {
    return (
      <div className="auth-screen">
        <h1>Set up your account</h1>
        <p className="subtitle">Enter your matric number to get started</p>
        <form onSubmit={handleLookup} className="auth-form">
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
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? "Checking..." : "Continue"}
          </button>
        </form>
        <p className="auth-switch">
          Already set up? <Link to="/login">Sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <h1>Welcome, {rosterEntry?.fullName.split(" ")[0]}</h1>
      <p className="subtitle">Choose a password for your account</p>
      <form onSubmit={handleSetPassword} className="auth-form">
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "Setting up..." : "Finish setup"}
        </button>
      </form>
    </div>
  );
}
