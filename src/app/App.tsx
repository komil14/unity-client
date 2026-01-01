import "../css/App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import HomeNavbar from "./components/headers/HomeNavbar";
import HomePage from "./screens/homePage/HomePage";
import EventsPage from "./screens/eventsPage/EventsPage";
import EventDetailPage from "./screens/eventsPage/EventDetailPage";

function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HomeNavbar active="home" />
              <main className="appContent">
                <HomePage />
              </main>
            </>
          }
        />

        <Route
          path="/events"
          element={
            <>
              <HomeNavbar active="events" />
              <main className="appContent">
                <EventsPage />
              </main>
            </>
          }
        />

        <Route
          path="/events/:id"
          element={
            <>
              <HomeNavbar active="events" />
              <main className="appContent">
                <EventDetailPage />
              </main>
            </>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
