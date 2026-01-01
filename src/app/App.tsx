import "../css/App.css";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Header from "@/libs/components/layout/Header";
import Footer from "@/libs/components/layout/Footer";
import HomePage from "./screens/homePage/HomePage.tsx";
import EventsPage from "./screens/eventsPage/EventsPage.tsx";
import EventDetailPage from "./screens/eventsPage/EventDetailPage.tsx";
import GroupsPage from "./screens/groupPage/GroupsPage.tsx";
import GroupDetailPage from "./screens/groupPage/GroupDetailPage.tsx";
import OrganizersPage from "./screens/organizerPage/OrganizersPage.tsx";
import OrganizerDetailPage from "./screens/organizerPage/OrganizerDetailPage.tsx";
import HelpPage from "./screens/helpPage/HelpPage.tsx";
import LoginPage from "./screens/authPage/LoginPage.tsx";
import SignupPage from "./screens/authPage/SignupPage.tsx";

function HomeLayout() {
  const location = useLocation();
  void location;

  return (
    <>
      <Header />
      <main className="flex-1 w-full flex flex-col">
        <div className="content-container py-6">
          <Outlet />
        </div>
      </main>
      <Footer />
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
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/organizers" element={<OrganizersPage />} />
          <Route path="/organizers/:id" element={<OrganizerDetailPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
