
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, Users } from "lucide-react";

interface LearningPathCardProps {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  progress: number;
  topics: string[];
  enrolled: number;
  onEnroll: (id: number) => void;
}

export function LearningPathCard({
  id,
  title,
  description,
  difficulty,
  estimatedTime,
  progress,
  topics,
  enrolled,
  onEnroll
}: LearningPathCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{enrolled} enrolled</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">Topics Covered</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {topics.slice(0, 3).map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
            {topics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{topics.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <Button 
            onClick={() => onEnroll(id)} 
            className="w-full"
            variant={progress > 0 ? "outline" : "default"}
          >
            {progress > 0 ? "Continue Learning" : "Start Learning"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
