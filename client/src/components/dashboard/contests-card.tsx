import { Link } from "wouter";
import { formatDistance, formatRelative } from "date-fns";
import { Competition } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ContestsCardProps = {
  contests: Competition[];
};

export default function ContestsCard({ contests }: ContestsCardProps) {
  // Format dates relatively
  const formatTimeUntil = (date: string | Date) => {
    try {
      const targetDate = new Date(date);
      const now = new Date();
      
      if (targetDate > now) {
        return `In ${formatDistance(targetDate, now)}`;
      } else {
        return `Started ${formatDistance(targetDate, now)} ago`;
      }
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Format time for display
  const formatEventTime = (date: string | Date) => {
    try {
      return formatRelative(new Date(date), new Date());
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Calculate duration in hours
  const calculateDuration = (start: string | Date, end: string | Date) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const durationMs = endDate.getTime() - startDate.getTime();
      const hours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } catch (e) {
      return 'Unknown duration';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">Upcoming Contests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contests.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-500 mb-2">No active contests at the moment</p>
              <p className="text-xs text-slate-400">Check back later for upcoming competitions</p>
            </div>
          ) : (
            contests.slice(0, 3).map(contest => (
              <div key={contest.id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex justify-between">
                  <h4 className="font-medium text-slate-800">{contest.title}</h4>
                  <span className="text-xs px-2 rounded-full bg-primary-100 text-primary-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatTimeUntil(contest.startTime)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formatEventTime(contest.startTime)} • Duration: {calculateDuration(contest.startTime, contest.endTime)}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-slate-500">312 participants registered</span>
                  <Link href={`/competition/${contest.id}`}>
                    <Button size="sm" className="text-xs rounded-full">
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
          <Link href="/competitions">
            <a className="text-center block text-sm text-primary-600 hover:text-primary-800">View all contests</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
