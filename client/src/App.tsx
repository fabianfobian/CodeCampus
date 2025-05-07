import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProblemsPage from "@/pages/problems-page";
import ProblemDetailPage from "@/pages/problem-detail-page";
import CompetitionsPage from "@/pages/competitions-page";
import SubmissionsPage from "@/pages/submissions-page";
import UsersPage from "@/pages/admin/users-page";
import AdminProblemsPage from "@/pages/admin/problems-page";
import ReportsPage from "@/pages/admin/reports-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/problems" component={ProblemsPage} />
      <ProtectedRoute path="/problem/:id" component={ProblemDetailPage} />
      <ProtectedRoute path="/competitions" component={CompetitionsPage} />
      <ProtectedRoute path="/submissions" component={SubmissionsPage} />
      <ProtectedRoute 
        path="/admin/users" 
        component={UsersPage} 
        allowedRoles={['super_admin', 'admin']}
      />
      <ProtectedRoute 
        path="/admin/problems" 
        component={AdminProblemsPage}
        allowedRoles={['super_admin', 'admin', 'examiner']}
      />
      <ProtectedRoute 
        path="/admin/reports" 
        component={ReportsPage}
        allowedRoles={['super_admin', 'admin']}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
