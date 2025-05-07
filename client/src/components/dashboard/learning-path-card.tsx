import { Link } from "wouter";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RocketIcon } from "lucide-react";

type LearningPathCardProps = {
  title: string;
  progress: number;
  completed: number;
  total: number;
  nextLesson: string;
  nextLessonDescription: string;
};

export default function LearningPathCard({
  title,
  progress,
  completed,
  total,
  nextLesson,
  nextLessonDescription
}: LearningPathCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Current Learning Path</h3>
        <div className="p-3 border border-slate-200 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <RocketIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h4 className="font-medium text-slate-800">{title}</h4>
              <p className="text-xs text-slate-500">{completed} of {total} lessons completed</p>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-4 text-sm">
            <p className="font-medium text-slate-700">Next up: {nextLesson}</p>
            <p className="text-slate-500 text-xs mt-1">{nextLessonDescription}</p>
          </div>
          <Link href="/learning-paths">
            <Button className="w-full mt-3">
              Continue Learning
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
