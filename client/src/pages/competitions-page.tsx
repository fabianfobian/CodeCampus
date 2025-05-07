import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, isPast, isFuture } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Competition } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Star, 
  CalendarIcon, 
  UserIcon, 
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export default function CompetitionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Fetch competitions
  const { data: competitions, isLoading: isLoadingCompetitions } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Categorize competitions
  const upcomingCompetitions = competitions?.filter(comp => 
    isFuture(new Date(comp.startTime))
  ) || [];
  
  const activeCompetitions = competitions?.filter(comp => 
    isPast(new Date(comp.startTime)) && 
    isFuture(new Date(comp.endTime))
  ) || [];
  
  const pastCompetitions = competitions?.filter(comp => 
    isPast(new Date(comp.endTime))
  ) || [];

  // Register for competition
  const handleRegister = async (competitionId: number) => {
    try {
      await apiRequest("POST", `/api/competitions/${competitionId}/register`);
      queryClient.invalidateQueries({ queryKey: ["/api/competitions"] });
    } catch (error) {
      console.error("Failed to register for competition:", error);
    }
  };

  // Format date for display
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "PPp"); // e.g. "Apr 29, 2021, 9:30 AM"
  };

  // Calculate duration in hours and minutes
  const calculateDuration = (start: string | Date, end: string | Date) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let result = "";
    if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) {
      if (result) result += " ";
      result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return result || "0 minutes";
  };

  // Render competition card
  const renderCompetitionCard = (competition: Competition, status: 'upcoming' | 'active' | 'past') => {
    const isRegistered = false; // In a real implementation, this would check if the user is registered
    const isCreator = user && competition.createdBy === user.id;
    
    return (
      <Card key={competition.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{competition.title}</CardTitle>
              <CardDescription className="mt-1">
                {competition.description || "No description provided"}
              </CardDescription>
            </div>
            {status === 'active' && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            )}
            {status === 'upcoming' && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                Upcoming
              </Badge>
            )}
            {status === 'past' && (
              <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Starts: {formatDate(competition.startTime)}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <ClockIcon className="mr-2 h-4 w-4" />
                <span>Duration: {calculateDuration(competition.startTime, competition.endTime)}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>
                  {isCreator ? (
                    <span className="text-primary-700">You are the creator</span>
                  ) : (
                    <span>Created by: Admin</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-row md:flex-col gap-2 justify-end">
              {status === 'upcoming' && (
                <Button
                  className="flex items-center"
                  onClick={() => handleRegister(competition.id)}
                  disabled={isRegistered}
                >
                  {isRegistered ? (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Registered
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Register
                    </>
                  )}
                </Button>
              )}
              {status === 'active' && (
                <Link href={`/competition/${competition.id}`}>
                  <Button className="flex items-center">
                    Enter Competition
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              {status === 'past' && (
                <Link href={`/competition/${competition.id}/leaderboard`}>
                  <Button variant="outline" className="flex items-center">
                    View Results
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <div className="container mx-auto py-6 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Coding Competitions</h1>
                <p className="text-slate-500">Participate in challenges and compete with other programmers</p>
              </div>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingCompetitions.length})
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active ({activeCompetitions.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastCompetitions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-4">
                {isLoadingCompetitions ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : upcomingCompetitions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <Star className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-medium text-slate-800">No upcoming competitions</h3>
                    <p className="mt-2 text-slate-500">Check back later for new competitions</p>
                  </div>
                ) : (
                  upcomingCompetitions.map((competition) => 
                    renderCompetitionCard(competition, 'upcoming')
                  )
                )}
              </TabsContent>
              
              <TabsContent value="active" className="mt-4">
                {isLoadingCompetitions ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : activeCompetitions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <Star className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-medium text-slate-800">No active competitions</h3>
                    <p className="mt-2 text-slate-500">There are no competitions running right now</p>
                  </div>
                ) : (
                  activeCompetitions.map((competition) => 
                    renderCompetitionCard(competition, 'active')
                  )
                )}
              </TabsContent>
              
              <TabsContent value="past" className="mt-4">
                {isLoadingCompetitions ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pastCompetitions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <Star className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-medium text-slate-800">No past competitions</h3>
                    <p className="mt-2 text-slate-500">Past competitions will appear here</p>
                  </div>
                ) : (
                  pastCompetitions.map((competition) => 
                    renderCompetitionCard(competition, 'past')
                  )
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
