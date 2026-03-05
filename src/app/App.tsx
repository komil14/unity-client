import "../css/App.css";
import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Header from "@/libs/components/layout/Header";
import Footer from "@/libs/components/layout/Footer";
import { ToastProvider } from "@/libs/components/ui/toast";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./screens/homePage";
import LoginPage from "./screens/authPage/LoginPage.tsx";
import SignupPage from "./screens/authPage/SignupPage.tsx";

// Lazy-loaded heavy pages for code splitting
const EventsPage = lazy(() => import("./screens/eventsPage/EventsPage.tsx"));
const EventDetailPage = lazy(
  () => import("./screens/eventsPage/EventDetailPage.tsx"),
);
const CreateEventPage = lazy(
  () => import("./screens/eventsPage/CreateEventPage.tsx"),
);
const UpdateEventPage = lazy(
  () => import("./screens/eventsPage/UpdateEventPage.tsx"),
);
const GroupsPage = lazy(() => import("./screens/groupPage/GroupsPage.tsx"));
const GroupDetailPage = lazy(
  () => import("./screens/groupPage/GroupDetailPage.tsx"),
);
const ArticlesPage = lazy(
  () => import("./screens/articlesPage/ArticlesPage.tsx"),
);
const ArticleDetailPage = lazy(
  () => import("./screens/articlesPage/ArticleDetailPage.tsx"),
);
const CreateArticlePage = lazy(
  () => import("./screens/articlesPage/CreateArticlePage.tsx"),
);
const OrganizersPage = lazy(
  () => import("./screens/organizerPage/OrganizersPage.tsx"),
);
const OrganizerDetailPage = lazy(
  () => import("./screens/organizerPage/OrganizerDetailPage.tsx"),
);
const OrganizerDashboard = lazy(
  () => import("./screens/organizerPage/OrganizerDashboard.tsx"),
);
const ProfilePage = lazy(
  () => import("./screens/volunteerPage/ProfilePage.tsx"),
);
const HelpPage = lazy(() => import("./screens/helpPage/HelpPage.tsx"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

function HomeLayout() {
  return (
    <>
      <Header />
      <main className="flex-1 w-full flex flex-col">
        <div className="content-container py-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="appShell">
          <Routes>
            <Route element={<HomeLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route
                path="/events/create"
                element={
                  <ProtectedRoute allowedTypes={["ORG"]}>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route
                path="/events/:id/edit"
                element={
                  <ProtectedRoute allowedTypes={["ORG"]}>
                    <UpdateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/groups/:id" element={<GroupDetailPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route
                path="/articles/create"
                element={
                  <ProtectedRoute allowedTypes={["ORG"]}>
                    <CreateArticlePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/articles/:id" element={<ArticleDetailPage />} />
              <Route path="/organizers" element={<OrganizersPage />} />
              <Route path="/organizers/:id" element={<OrganizerDetailPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedTypes={["ORG"]}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
