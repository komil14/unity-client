import "../css/App.css";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import HomeNavbar from "./components/headers/HomeNavbar";
import HomePage from "./screens/homePage/HomePage.tsx";
import EventsPage from "./screens/eventsPage/EventsPage.tsx";
import EventDetailPage from "./screens/eventsPage/EventDetailPage.tsx";
import LoginPage from "./screens/authPage/LoginPage.tsx";
import SignupPage from "./screens/authPage/SignupPage.tsx";

function HomeLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  const active = pathname.startsWith("/events") ? "events" : ("home" as const);

  return (
    <>
      <HomeNavbar active={active} />
      <main className="appContent">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
