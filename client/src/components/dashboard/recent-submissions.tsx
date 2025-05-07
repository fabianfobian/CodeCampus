import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Submission, Problem } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type SubmissionWithProblem = Submission & {
  problem: Problem;
};

type RecentSubmissionsProps = {
  submissions: SubmissionWithProblem[];
};

export default function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  // Get language display name
  const getLanguageDisplay = (language: string) => {
    const languageMap: Record<string, { name: string, color: string }> = {
      'javascript': { name: 'JavaScript', color: 'bg-yellow-100 text-yellow-800' },
      'python': { name: 'Python', color: 'bg-blue-100 text-blue-800' },
      'java': { name: 'Java', color: 'bg-indigo-100 text-indigo-800' },
      'cpp': { name: 'C++', color: 'bg-purple-100 text-purple-800' },
      'go': { name: 'Go', color: 'bg-cyan-100 text-cyan-800' },
      'csharp': { name: 'C#', color: 'bg-green-100 text-green-800' },
      'ruby': { name: 'Ruby', color: 'bg-red-100 text-red-800' }
    };
    
    return languageMap[language] || { name: language, color: 'bg-slate-100 text-slate-800' };
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { name: string, color: string }> = {
      'accepted': { name: 'Accepted', color: 'bg-green-100 text-green-800' },
      'wrong_answer': { name: 'Wrong Answer', color: 'bg-red-100 text-red-800' },
      'time_limit_exceeded': { name: 'Time Limit', color: 'bg-orange-100 text-orange-800' },
      'runtime_error': { name: 'Runtime Error', color: 'bg-rose-100 text-rose-800' },
      'compilation_error': { name: 'Compilation Error', color: 'bg-purple-100 text-purple-800' }
    };
    
    return statusMap[status] || { name: status, color: 'bg-slate-100 text-slate-800' };
  };

  // Format time
  const formatTime = (date: string | Date) => {
    try {
      if (!date) return 'N/A';
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-slate-800">Recent Submissions</CardTitle>
          <Link href="/submissions">
            <a className="text-sm text-primary hover:text-primary-800">View all</a>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No submissions yet. Start solving problems!
                  </TableCell>
                </TableRow>
              ) : (
                submissions.slice(0, 5).map((submission) => {
                  const language = getLanguageDisplay(submission.language);
                  const status = getStatusDisplay(submission.status);
                  
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Link href={`/problem/${submission.problemId}`}>
                          <a className="font-medium text-slate-900 hover:text-primary">
                            {submission.problem?.title || `Problem #${submission.problemId}`}
                          </a>
                        </Link>
                        <div className="text-xs text-slate-500">
                          {submission.problem?.difficulty ? (
                            <span className="capitalize">{submission.problem.difficulty}</span>
                          ) : 'Unknown difficulty'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={language.color} variant="secondary">
                          {language.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color} variant="secondary">
                          {status.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-500">
                        {formatTime(submission.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
