import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RequireAuth, RequireChild, RequireParent } from "./components/AuthGuards";
import { AppShell } from "./layouts/AppShell";
import { ImmersiveHomeLayout } from "./layouts/ImmersiveHomeLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { HomeAreaPage } from "./pages/HomeAreaPage";
import { GoalDetailPage } from "./pages/GoalDetailPage";
import { GoalsPage } from "./pages/GoalsPage";
import { HabitsPage } from "./pages/HabitsPage";
import { LoginPage } from "./pages/LoginPage";
import { MissionsPage } from "./pages/MissionsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ParentAccessPage } from "./pages/ParentAccessPage";
import { ParentPage } from "./pages/ParentPage";
import { QuestsPage } from "./pages/QuestsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ReviewPage } from "./pages/ReviewPage";
import { ReviewsHubPage } from "./pages/ReviewsHubPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { FocusPage } from "./pages/FocusPage";
import { LifeAreasPage } from "./pages/LifeAreasPage";
import { CampaignPage } from "./pages/CampaignPage";
import { TodayPage } from "./pages/TodayPage";
import { ProgressionHubPage } from "./pages/ProgressionHubPage";
import { JournalHubPage } from "./pages/JournalHubPage";
import { FamilyHubPage } from "./pages/FamilyHubPage";
const InsightsPage = lazy(() => import("./pages/InsightsPage").then((module) => ({ default: module.InsightsPage })));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<RequireChild />}>
            <Route element={<ImmersiveHomeLayout />}><Route index element={<DashboardPage />} /></Route>
            <Route path="focus" element={<FocusPage />} />
          </Route>
          <Route element={<AppShell />}>
            <Route element={<RequireChild />}>
              <Route path="home" element={<HomeAreaPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="today" element={<TodayPage />} />
              <Route path="progression" element={<ProgressionHubPage />} />
              <Route path="journal" element={<JournalHubPage />} />
              <Route path="family" element={<FamilyHubPage />} />
              <Route path="goals/:goalId" element={<GoalDetailPage />} />
              <Route path="tasks" element={<QuestsPage />} />
              <Route path="quests" element={<QuestsPage />} />
              <Route path="habits" element={<HabitsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="discovery" element={<DiscoveryPage />} />
              <Route path="life-areas" element={<LifeAreasPage />} />
              <Route path="campaign" element={<CampaignPage />} />
              <Route path="insights" element={<Suspense fallback={<div className="panel p-6">Loading insights...</div>}><InsightsPage /></Suspense>} />
              <Route path="reviews" element={<ReviewsHubPage />} />
              <Route path="reviews/weekly" element={<ReviewPage period="weekly" />} />
              <Route path="reviews/monthly" element={<ReviewPage period="monthly" />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="missions" element={<MissionsPage />} />
              <Route path="parent-access" element={<ParentAccessPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route element={<RequireParent />}><Route path="parent" element={<ParentPage />} /></Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
