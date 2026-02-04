import "../css/App.css";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Header from "@/libs/components/layout/Header";
import Footer from "@/libs/components/layout/Footer";
import { ToastProvider } from "@/libs/components/ui/toast";
import HomePage from "./screens/homePage";
import EventsPage from "./screens/eventsPage/EventsPage.tsx";
import EventDetailPage from "./screens/eventsPage/EventDetailPage.tsx";
import CreateEventPage from "./screens/eventsPage/CreateEventPage.tsx";
import UpdateEventPage from "./screens/eventsPage/UpdateEventPage.tsx";
import GroupsPage from "./screens/groupPage/GroupsPage.tsx";
import GroupDetailPage from "./screens/groupPage/GroupDetailPage.tsx";
import ArticlesPage from "./screens/articlesPage/ArticlesPage.tsx";
import ArticleDetailPage from "./screens/articlesPage/ArticleDetailPage.tsx";
import CreateArticlePage from "./screens/articlesPage/CreateArticlePage.tsx";
import OrganizersPage from "./screens/organizerPage/OrganizersPage.tsx";
import OrganizerDetailPage from "./screens/organizerPage/OrganizerDetailPage.tsx";
import OrganizerDashboard from "./screens/organizerPage/OrganizerDashboard.tsx";
import ProfilePage from "./screens/volunteerPage/ProfilePage.tsx";
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
    <ToastProvider>
      <div className="appShell">
        <Routes>
          <Route element={<HomeLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/edit" element={<UpdateEventPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/create" element={<CreateArticlePage />} />
            <Route path="/articles/:id" element={<ArticleDetailPage />} />
            <Route path="/organizers" element={<OrganizersPage />} />
            <Route path="/organizers/:id" element={<OrganizerDetailPage />} />
            <Route path="/dashboard" element={<OrganizerDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App;
