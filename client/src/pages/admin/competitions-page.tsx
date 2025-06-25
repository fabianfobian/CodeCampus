
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Competition } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Search, Plus, Edit, Trash2, CalendarIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format, isPast, isFuture } from "date-fns";

const createCompetitionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be more detailed").optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type CreateCompetitionFormValues = z.infer<typeof createCompetitionSchema>;

export default function AdminCompetitionsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Fetch competitions
  const { data: competitions, isLoading } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create competition form
  const form = useForm<CreateCompetitionFormValues>({
    resolver: zodResolver(createCompetitionSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
    },
  });

  // Create competition mutation
  const createCompetitionMutation = useMutation({
    mutationFn: async (competitionData: CreateCompetitionFormValues) => {
      const response = await apiRequest("POST", "/api/competitions", {
        ...competitionData,
        startTime: new Date(competitionData.startTime).toISOString(),
        endTime: new Date(competitionData.endTime).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Competition created",
        description: "The competition has been created successfully",
      });
      form.reset();
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/competitions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create competition",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: CreateCompetitionFormValues) => {
    createCompetitionMutation.mutate(values);
  };

  // Filter competitions
  const filteredCompetitions = competitions?.filter(competition => 
    searchQuery === "" || 
    competition.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get competition status
  const getCompetitionStatus = (competition: Competition) => {
    const now = new Date();
    const start = new Date(competition.startTime);
    const end = new Date(competition.endTime);

    if (now < start) return { status: "upcoming", color: "bg-blue-100 text-blue-800" };
    if (now >= start && now <= end) return { status: "active", color: "bg-green-100 text-green-800" };
    return { status: "completed", color: "bg-slate-100 text-slate-800" };
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <div className="container mx-auto py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Competition Management</h1>
                <p className="text-slate-500">Create and manage coding competitions</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search competitions..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Create Competition</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Competition</DialogTitle>
                      <DialogDescription>
                        Create a new coding competition for participants.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Competition Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe the competition..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="datetime-local" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="datetime-local" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={createCompetitionMutation.isPending}
                          >
                            {createCompetitionMutation.isPending ? "Creating..." : "Create Competition"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 mb-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !competitions || competitions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No competitions found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompetitions?.map((competition) => {
                        const { status, color } = getCompetitionStatus(competition);
                        const duration = Math.round((new Date(competition.endTime).getTime() - new Date(competition.startTime).getTime()) / (1000 * 60 * 60));
                        
                        return (
                          <TableRow key={competition.id}>
                            <TableCell className="font-medium">{competition.title}</TableCell>
                            <TableCell>
                              <Badge className={color}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {format(new Date(competition.startTime), "MMM dd, yyyy")}
                                <Clock className="ml-2 mr-1 h-3 w-3" />
                                {format(new Date(competition.startTime), "HH:mm")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {format(new Date(competition.endTime), "MMM dd, yyyy")}
                                <Clock className="ml-2 mr-1 h-3 w-3" />
                                {format(new Date(competition.endTime), "HH:mm")}
                              </div>
                            </TableCell>
                            <TableCell>{duration}h</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="flex items-center">
                                  <Edit className="h-3.5 w-3.5 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700 flex items-center"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      
                      {filteredCompetitions?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-500 py-4">
                            No competitions match your search criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
