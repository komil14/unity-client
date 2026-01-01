import "../../../css/HomeNavbar.css";
import { Link } from "react-router-dom";
import { useCheckAuthQuery } from "../../services/authApi";

type HomeNavbarActive = "home" | "events" | "groups" | "volunteer" | "help";

type NavItem = {
  key: HomeNavbarActive;
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "events", label: "Events", href: "/events" },
  { key: "groups", label: "Groups", href: "#" },
  { key: "volunteer", label: "Volunteer", href: "#" },
  { key: "help", label: "Help", href: "#" },
];

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="homeNavbar__icon">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 17h12m-9 2a3 3 0 0 0 6 0M8 17V11a4 4 0 0 1 8 0v6m1 0a2 2 0 0 0 1.7-3.1A3 3 0 0 1 18 12.3V11a6 6 0 0 0-12 0v1.3a3 3 0 0 1-.7 1.6A2 2 0 0 0 6 17"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="homeNavbar__icon">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 13.2A8.5 8.5 0 0 1 10.8 3a7.2 7.2 0 1 0 10.2 10.2Z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="homeNavbar__icon">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 21a8 8 0 1 0-16 0M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
      />
    </svg>
  );
}

export default function HomeNavbar({
  active = "home",
}: {
  active?: HomeNavbarActive;
}) {
  const { data } = useCheckAuthQuery(undefined);
  const me = data?.member;

  return (
    <header className="homeNavbar" role="banner">
      <div className="homeNavbar__inner">
        <Link className="homeNavbar__brand" to="/" aria-label="Unity">
          <span className="homeNavbar__brandText">
            <i className="fa-solid fa-leaf"></i>Unity
          </span>
        </Link>

        <nav className="homeNavbar__nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={
                item.key === active
                  ? "homeNavbar__link homeNavbar__link--active"
                  : "homeNavbar__link"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="homeNavbar__actions" aria-label="Actions">
          <button
            className="homeNavbar__iconBtn"
            type="button"
            aria-label="Notifications"
          >
            <BellIcon />
          </button>
          <button
            className="homeNavbar__iconBtn"
            type="button"
            aria-label="Toggle theme"
          >
            <MoonIcon />
          </button>

          <button
            className="homeNavbar__langBtn"
            type="button"
            aria-label="Language"
          >
            <span className="homeNavbar__langDot" aria-hidden="true" />
          </button>

          {me ? (
            <span
              className="homeNavbar__iconBtn"
              aria-label={`Logged in as ${me.memberNick}`}
              title={`${me.memberNick} (${me.memberType})`}
              style={{ cursor: "default" }}
            >
              <UserIcon />
            </span>
          ) : (
            <Link
              className="homeNavbar__iconBtn"
              to="/login"
              aria-label="Login"
            >
              <UserIcon />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
