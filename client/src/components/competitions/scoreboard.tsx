import { useEffect, useState } from "react";
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
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

type Participant = {
  id: number;
  score: number;
  rank: number;
  userId: number;
  user: User;
};

type ScoreboardProps = {
  participants: Participant[];
  competitionId: number;
};

export default function Scoreboard({ participants, competitionId }: ScoreboardProps) {
  const { user } = useAuth();
  const [sortedParticipants, setSortedParticipants] = useState<Participant[]>([]);
  
  // Sort participants by score (descending) and update ranks
  useEffect(() => {
    if (participants) {
      const sorted = [...participants].sort((a, b) => {
        // First by score (descending)
        if (b.score !== a.score) return b.score - a.score;
        // Then by time if available
        return 0;
      });
      
      // Update ranks
      const withRanks = sorted.map((participant, index) => ({
        ...participant,
        rank: index + 1,
      }));
      
      setSortedParticipants(withRanks);
    }
  }, [participants]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">Competition Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedParticipants.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500">No participants in this competition yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedParticipants.map((participant) => {
                  const isCurrentUser = user && participant.userId === user.id;
                  
                  return (
                    <TableRow key={participant.id} className={isCurrentUser ? "bg-primary-50" : ""}>
                      <TableCell className="font-medium">{participant.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-semibold mr-3">
                            {participant.user.displayName
                              ? participant.user.displayName.substring(0, 2)
                              : participant.user.username.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-medium">
                              {participant.user.displayName || participant.user.username}
                              {isCurrentUser && <span className="ml-2">(You)</span>}
                            </span>
                            {participant.rank <= 3 && (
                              <Badge
                                className={
                                  participant.rank === 1
                                    ? "bg-yellow-100 text-yellow-800 ml-2"
                                    : participant.rank === 2
                                    ? "bg-slate-100 text-slate-800 ml-2"
                                    : "bg-amber-100 text-amber-800 ml-2"
                                }
                              >
                                {participant.rank === 1
                                  ? "1st"
                                  : participant.rank === 2
                                  ? "2nd"
                                  : "3rd"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {participant.score} pts
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
