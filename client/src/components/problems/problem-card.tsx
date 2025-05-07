import { Link } from "wouter";
import { Problem } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

type ProblemCardProps = {
  problem: Problem;
  solved?: boolean;
  attempted?: boolean;
};

export default function ProblemCard({ 
  problem, 
  solved = false, 
  attempted = false 
}: ProblemCardProps) {
  const { id, title, difficulty, tags, acceptanceRate } = problem;
  
  // Determine status icon
  const renderStatusIcon = () => {
    if (solved) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (attempted) {
      return <Circle className="h-5 w-5 text-yellow-500 fill-yellow-100" />;
    }
    return <Circle className="h-5 w-5 text-slate-300" />;
  };

  // Determine difficulty styling
  const getDifficultyStyle = () => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center justify-center">
          {renderStatusIcon()}
        </div>
      </td>
      <td className="px-4 py-3">
        <Link href={`/problem/${id}`}>
          <a className="font-medium text-primary hover:text-primary-700 hover:underline">
            {title}
          </a>
        </Link>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyStyle()}`}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {acceptanceRate ? `${acceptanceRate}%` : 'N/A'}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {problem.tags && problem.tags.slice(0, 3).map((tag: any) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
          {problem.tags && problem.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{problem.tags.length - 3} more
            </Badge>
          )}
        </div>
      </td>
    </tr>
  );
}
