
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  RocketIcon, 
  CheckCircledIcon, 
  CircleIcon,
  LockClosedIcon,
  ClockIcon,
  PersonIcon
} from "@radix-ui/react-icons";

const LEARNING_PATHS = [
  {
    id: 1,
    title: "Data Structures Fundamentals",
    description: "Master the essential data structures used in programming",
    difficulty: "Beginner",
    totalLessons: 15,
    estimatedHours: 25,
    topics: ["Arrays", "Linked Lists", "Stacks", "Queues", "Hash Tables"],
    prerequisites: [],
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Algorithm Design Patterns",
    description: "Learn common algorithmic approaches and problem-solving techniques",
    difficulty: "Intermediate",
    totalLessons: 20,
    estimatedHours: 35,
    topics: ["Two Pointers", "Sliding Window", "Recursion", "Dynamic Programming"],
    prerequisites: ["Data Structures Fundamentals"],
    color: "bg-green-500"
  },
  {
    id: 3,
    title: "Advanced Graph Algorithms",
    description: "Deep dive into graph theory and advanced graph algorithms",
    difficulty: "Advanced",
    totalLessons: 18,
    estimatedHours: 40,
    topics: ["DFS/BFS", "Shortest Path", "Minimum Spanning Tree", "Network Flow"],
    prerequisites: ["Algorithm Design Patterns"],
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "System Design Fundamentals",
    description: "Learn how to design scalable systems and architectures",
    difficulty: "Advanced",
    totalLessons: 12,
    estimatedHours: 30,
    topics: ["Scalability", "Load Balancing", "Caching", "Database Design"],
    prerequisites: ["Advanced Graph Algorithms"],
    color: "bg-orange-500"
  }
];

function LearningPathCard({ path, userProgress }: { path: any; userProgress: any }) {
  const progress = userProgress?.completedLessons || 0;
  const progressPercentage = (progress / path.totalLessons) * 100;
  const isLocked = path.prerequisites.length > 0 && !userProgress?.canAccess;

  return (
    <Card className={`relative overflow-hidden ${isLocked ? 'opacity-60' : ''}`}>
      <div className={`absolute top-0 left-0 w-full h-2 ${path.color}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center">
              {isLocked ? (
                <LockClosedIcon className="h-5 w-5 mr-2 text-slate-400" />
              ) : (
                <RocketIcon className="h-5 w-5 mr-2" />
              )}
              {path.title}
            </CardTitle>
            <Badge variant={
              path.difficulty === 'Beginner' ? 'secondary' :
              path.difficulty === 'Intermediate' ? 'default' : 'destructive'
            }>
              {path.difficulty}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-2">{path.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isLocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}/{path.totalLessons} lessons</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-slate-600">
            <ClockIcon className="h-4 w-4 mr-1" />
            {path.estimatedHours}h total
          </div>
          <div className="flex items-center text-slate-600">
            <PersonIcon className="h-4 w-4 mr-1" />
            {path.totalLessons} lessons
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Topics covered:</h4>
          <div className="flex flex-wrap gap-1">
            {path.topics.map((topic: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {path.prerequisites.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Prerequisites:</h4>
            <div className="space-y-1">
              {path.prerequisites.map((prereq: string, index: number) => (
                <div key={index} className="flex items-center text-sm text-slate-600">
                  <CheckCircledIcon className="h-4 w-4 mr-2 text-green-500" />
                  {prereq}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          {isLocked ? (
            <Button disabled className="w-full">
              Complete Prerequisites First
            </Button>
          ) : progress === path.totalLessons ? (
            <Button variant="outline" className="w-full">
              Review Path
            </Button>
          ) : progress > 0 ? (
            <Button className="w-full">
              Continue Learning
            </Button>
          ) : (
            <Button className="w-full">
              Start Path
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LearningPathsPage() {
  const { user } = useAuth();

  // Fetch user's learning progress
  const { data: userProgress } = useQuery({
    queryKey: [`/api/users/${user?.id}/learning-progress`],
    queryFn: () => apiRequest(`/api/users/${user?.id}/learning-progress`),
    enabled: !!user?.id,
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Learning Paths</h1>
              <p className="text-slate-600">
                Structured learning journeys to master different aspects of programming and computer science
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {LEARNING_PATHS.map((path) => (
                <LearningPathCard 
                  key={path.id} 
                  path={path} 
                  userProgress={userProgress?.[path.id]} 
                />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-slate-800">
                    {userProgress ? Object.keys(userProgress).length : 0}
                  </div>
                  <div className="text-sm text-slate-600">Paths Started</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-slate-800">
                    {userProgress ? 
                      Object.values(userProgress).reduce((acc: number, progress: any) => 
                        acc + (progress?.completedLessons || 0), 0
                      ) : 0
                    }
                  </div>
                  <div className="text-sm text-slate-600">Lessons Completed</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-slate-800">
                    {userProgress ? 
                      Object.values(userProgress).reduce((acc: number, progress: any) => 
                        acc + (progress?.timeSpent || 0), 0
                      ) : 0
                    }h
                  </div>
                  <div className="text-sm text-slate-600">Time Invested</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
