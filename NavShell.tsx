import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import BirthdayBanner from "./BirthdayBanner";

export default function NavShell() {
  const { profile, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Class Portal</h1>
        <div className="header-right">
          <span className="user-name">{profile?.fullName}</span>
          <button className="logout-btn" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      <BirthdayBanner />

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="tab-bar">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Announcements
        </NavLink>
        <NavLink to="/materials" className={({ isActive }) => (isActive ? "active" : "")}>
          Materials
        </NavLink>
        <NavLink to="/updates" className={({ isActive }) => (isActive ? "active" : "")}>
          Updates
        </NavLink>
      </nav>
    </div>
  );
}
