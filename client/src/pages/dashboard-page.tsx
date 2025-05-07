import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatCard from "@/components/dashboard/stat-card";
import RecentSubmissions from "@/components/dashboard/recent-submissions";
import SkillChart from "@/components/dashboard/skill-chart";
import ContestsCard from "@/components/dashboard/contests-card";
import LearningPathCard from "@/components/dashboard/learning-path-card";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

function ExaminerDashboard({ user }: { user: any }) {
  // Fetch data specific to examiner role
  const { data: pendingReviews } = useQuery({
    queryKey: ["/api/submissions/pending-review"],
    queryFn: () => apiRequest("/api/submissions/pending-review"),
    enabled: !!user?.id,
  });

  const { data: problemStats } = useQuery({
    queryKey: ["/api/problems/stats"],
    queryFn: () => apiRequest("/api/problems/stats"),
    enabled: !!user?.id,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Examiner Dashboard</h1>
        <p className="text-slate-500">Manage problems and review submissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Pending Reviews"
          value={pendingReviews?.count || 0}
          trend={`${pendingReviews?.todayCount || 0} new today`}
          trendType="neutral"
        />
        <StatCard
          title="Problems Created"
          value={problemStats?.totalProblems || 0}
          trend={`${problemStats?.thisWeek || 0} this week`}
          trendType="positive"
        />
        <StatCard
          title="Avg. Completion Rate"
          value={problemStats?.avgCompletionRate || 0}
          suffix="%"
          trend={`${problemStats?.trend || 0}% vs last week`}
          trendType="informative"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentSubmissions submissions={pendingReviews?.submissions || []} />
        </div>
        <div className="space-y-6">
          <ContestsCard contests={[]} />
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ user }: { user: any }) {
  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: [`/api/users/${user?.id}/stats`],
    queryFn: () => apiRequest(`/api/users/${user?.id}/stats`),
    enabled: !!user?.id,
  });

  const { data: userSkills, isLoading: isLoadingSkills } = useQuery({
    queryKey: [`/api/users/${user?.id}/skills`],
    queryFn: () => apiRequest(`/api/users/${user?.id}/skills`),
    enabled: !!user?.id,
  });

  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["/api/submissions"],
    queryFn: () => apiRequest("/api/submissions"),
    enabled: !!user?.id,
  });

  const { data: activeCompetitions, isLoading: isLoadingCompetitions } = useQuery({
    queryKey: ["/api/competitions/active"],
    queryFn: () => apiRequest("/api/competitions/active"),
  });

  const getDaysOfWeek = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();
    const result = [];

    for (let i = 0; i < 7; i++) {
      const dayIndex = (today - 6 + i + 7) % 7;
      const isActive = i < (userStats?.currentStreak || 0);
      result.push({ day: days[dayIndex], active: isActive });
    }

    return result;
  };

  const streakDays = getDaysOfWeek();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Learning Dashboard</h1>
        <p className="text-slate-500">Track your progress and keep learning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Problems Solved"
          value={userStats?.problemsSolved || 0}
          total={543}
          percentage={(userStats?.problemsSolved || 0) / 543 * 100}
          trend="+12% this week"
          trendType="positive"
        />
        <StatCard
          title="Current Streak"
          value={userStats?.currentStreak || 0}
          suffix="days"
          badge={userStats?.currentStreak ? "Daily goal met" : "Keep coding!"}
          badgeType={userStats?.currentStreak ? "success" : "warning"}
          extraContent={
            <div className="mt-3 flex space-x-1">
              {streakDays.map((day, index) => (
                <div 
                  key={index}
                  className={`h-6 w-6 ${day.active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'} rounded flex items-center justify-center text-xs`}
                >
                  {day.day}
                </div>
              ))}
            </div>
          }
        />
        <StatCard
          title="Your Ranking"
          value={userStats?.ranking || 0}
          suffix="of 8,423 users"
          badge="Top 15%"
          badgeType="warning"
          extraContent={
            <div className="mt-3 flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-green-500 font-medium">Moved up 23 positions</span>
              <span className="text-slate-400 ml-1">this week</span>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkillChart skills={userSkills || []} />
          <RecentSubmissions submissions={submissions || []} />
        </div>
        <div className="space-y-6">
          <ContestsCard contests={activeCompetitions || []} />
          <LearningPathCard
            title="Data Structures Mastery"
            progress={53}
            completed={17}
            total={32}
            nextLesson="Hash Tables Deep Dive"
            nextLessonDescription="Learn collision handling strategies and implementation techniques"
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4">
          {user?.role === 'examiner' ? (
            <ExaminerDashboard user={user} />
          ) : (
            <StudentDashboard user={user} />
          )}
        </main>
      </div>
    </div>
  );
}