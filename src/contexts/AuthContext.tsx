import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { matricToDocId, matricToSyntheticEmail, normalizeMatric } from "../lib/matric";
import type { RosterEntry, StudentProfile } from "../lib/types";

interface AuthContextValue {
  user: User | null;
  profile: StudentProfile | null;
  loading: boolean;
  /** Looks up a matric number in the roster. Null if not found. */
  checkRoster: (matric: string) => Promise<RosterEntry | null>;
  /** First-time login: claims a roster entry and sets a password. */
  claimAccount: (matric: string, password: string) => Promise<void>;
  /** Returning login with matric number + previously-set password. */
  login: (matric: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileSnap = await getDoc(doc(db, "profiles", firebaseUser.uid));
        setProfile(profileSnap.exists() ? (profileSnap.data() as StudentProfile) : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function checkRoster(matric: string): Promise<RosterEntry | null> {
    const docId = matricToDocId(matric);
    const snap = await getDoc(doc(db, "roster", docId));
    if (!snap.exists()) return null;
    return snap.data() as RosterEntry;
  }

  async function claimAccount(matric: string, password: string) {
    const normalized = normalizeMatric(matric);
    const docId = matricToDocId(matric);
    const rosterRef = doc(db, "roster", docId);
    const rosterSnap = await getDoc(rosterRef);

    if (!rosterSnap.exists()) {
      throw new Error("That matric number isn't on the class roster.");
    }
    const entry = rosterSnap.data() as RosterEntry;
    if (entry.claimed) {
      throw new Error(
        "This account has already been set up. Use the login screen instead."
      );
    }

    const email = matricToSyntheticEmail(normalized);
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    const newProfile: StudentProfile = {
      uid: credential.user.uid,
      matric: normalized,
      fullName: entry.fullName,
      birthday: entry.birthday,
      isAdmin: entry.isAdmin,
    };
    await setDoc(doc(db, "profiles", credential.user.uid), newProfile);
    // Mark the roster entry claimed so it can't be claimed again from
    // another device/browser.
    await setDoc(rosterRef, { ...entry, claimed: true }, { merge: true });
    // Firestore security rules (not just client code) enforce that only
    // an unclaimed roster entry can be claimed -- see firestore.rules.
    setProfile(newProfile);
  }

  async function login(matric: string, password: string) {
    const email = matricToSyntheticEmail(matric);
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, checkRoster, claimAccount, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
