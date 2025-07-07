
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LearningPathCard } from "@/components/learning/learning-path-card";
import { Search, Filter, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  progress: number;
  topics: string[];
  enrolled: number;
  createdBy: number;
}

// Sample learning paths data - in a real app, this would come from the API
const sampleLearningPaths: LearningPath[] = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Master the basics of JavaScript programming, from variables to functions and beyond.",
    difficulty: "Beginner",
    estimatedTime: "4 weeks",
    progress: 65,
    topics: ["Variables", "Functions", "Objects", "Arrays", "DOM Manipulation"],
    enrolled: 324,
    createdBy: 1
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    description: "Deep dive into essential data structures and algorithms for coding interviews.",
    difficulty: "Intermediate",
    estimatedTime: "8 weeks",
    progress: 30,
    topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Sorting", "Dynamic Programming"],
    enrolled: 156,
    createdBy: 1
  },
  {
    id: 3,
    title: "Advanced React Patterns",
    description: "Learn advanced React concepts and patterns used in production applications.",
    difficulty: "Advanced",
    estimatedTime: "6 weeks",
    progress: 0,
    topics: ["Hooks", "Context", "Higher-Order Components", "Render Props", "Performance"],
    enrolled: 89,
    createdBy: 1
  },
  {
    id: 4,
    title: "Python for Data Science",
    description: "Introduction to Python programming with focus on data analysis and visualization.",
    difficulty: "Beginner",
    estimatedTime: "5 weeks",
    progress: 0,
    topics: ["Python Basics", "NumPy", "Pandas", "Matplotlib", "Jupyter"],
    enrolled: 267,
    createdBy: 1
  }
];

export default function LearningPathsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");

  // In a real app, this would be an API call
  const { data: learningPaths = sampleLearningPaths, isLoading } = useQuery({
    queryKey: ["learning-paths"],
    queryFn: async () => {
      // Simulate API call
      return sampleLearningPaths;
    }
  });

  const enrollMutation = useMutation({
    mutationFn: async (pathId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Enrolled successfully!",
        description: "You have been enrolled in the learning path."
      });
      queryClient.invalidateQueries({ queryKey: ["learning-paths"] });
    },
    onError: () => {
      toast({
        title: "Enrollment failed",
        description: "There was an error enrolling in the learning path.",
        variant: "destructive"
      });
    }
  });

  const filteredPaths = learningPaths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || 
                             path.difficulty.toLowerCase() === difficultyFilter;
    const matchesProgress = progressFilter === "all" ||
                           (progressFilter === "not-started" && path.progress === 0) ||
                           (progressFilter === "in-progress" && path.progress > 0 && path.progress < 100) ||
                           (progressFilter === "completed" && path.progress === 100);
    
    return matchesSearch && matchesDifficulty && matchesProgress;
  });

  const handleEnroll = (pathId: number) => {
    enrollMutation.mutate(pathId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Learning Paths</h1>
          <p className="text-muted-foreground mt-2">
            Structured learning journeys to master programming concepts
          </p>
        </div>
        
        {user?.role === "admin" || user?.role === "examiner" ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Learning Path
          </Button>
        ) : null}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Your Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search learning paths..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={progressFilter} onValueChange={setProgressFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Progress" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Progress</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path) => (
          <LearningPathCard
            key={path.id}
            id={path.id}
            title={path.title}
            description={path.description}
            difficulty={path.difficulty}
            estimatedTime={path.estimatedTime}
            progress={path.progress}
            topics={path.topics}
            enrolled={path.enrolled}
            onEnroll={handleEnroll}
          />
        ))}
      </div>

      {filteredPaths.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No learning paths found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
