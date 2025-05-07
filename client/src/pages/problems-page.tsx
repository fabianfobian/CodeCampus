import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ProblemCard from "@/components/problems/problem-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, FilterIcon } from "lucide-react";
import { Problem } from "@shared/schema";

export default function ProblemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch problems
  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ["/api/problems", difficultyFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (difficultyFilter !== "all") {
        params.append("difficulty", difficultyFilter);
      }
      return fetch(`/api/problems?${params.toString()}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch problems");
          return res.json();
        });
    },
  });

  // Fetch problem tags for filtering
  const { data: tags } = useQuery({
    queryKey: ["/api/problem-tags"],
    queryFn: () => fetch("/api/problem-tags").then(res => res.json()),
  });

  // Filter problems based on search query, difficulty, and tags
  const filteredProblems = problems?.filter(problem => {
    const matchesSearch = searchQuery.trim() === "" || 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === "all" || 
      problem.difficulty === difficultyFilter;
    
    const matchesTag = tagFilter === "all" || 
      problem.tags?.some(tag => tag.id.toString() === tagFilter);
    
    // Status filter would work with user-specific data (solved/unsolved)
    // For now, we'll include all problems for any status filter
    
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <div className="container mx-auto py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Problems</h1>
                <p className="text-slate-500">Explore and solve coding challenges</p>
              </div>
              
              <div className="flex w-full md:w-auto space-x-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search problems..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Filters and Tabs */}
            <div className="bg-white rounded-lg border border-slate-200 mb-6">
              <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
                <div className="w-full sm:w-auto flex items-center space-x-2">
                  <span className="text-sm text-slate-500 whitespace-nowrap">Difficulty:</span>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-auto flex items-center space-x-2">
                  <span className="text-sm text-slate-500 whitespace-nowrap">Tag:</span>
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Topics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {tags?.map((tag: any) => (
                        <SelectItem key={tag.id} value={tag.id.toString()}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-auto flex items-center space-x-2">
                  <span className="text-sm text-slate-500 whitespace-nowrap">Status:</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="solved">Solved</SelectItem>
                      <SelectItem value="unsolved">Unsolved</SelectItem>
                      <SelectItem value="attempted">Attempted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="px-4">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">All</TabsTrigger>
                    <TabsTrigger value="arrays" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Arrays</TabsTrigger>
                    <TabsTrigger value="strings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Strings</TabsTrigger>
                    <TabsTrigger value="linked-lists" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Linked Lists</TabsTrigger>
                    <TabsTrigger value="trees" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Trees</TabsTrigger>
                    <TabsTrigger value="dp" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Dynamic Programming</TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Problem List */}
                <TabsContent value="all" className="m-0">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredProblems?.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No problems found matching your filters.</p>
                      <Button variant="link" onClick={() => {
                        setSearchQuery("");
                        setDifficultyFilter("all");
                        setTagFilter("all");
                        setStatusFilter("all");
                      }}>
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-t border-b border-slate-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Difficulty</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acceptance</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tags</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredProblems?.map(problem => (
                            <ProblemCard key={problem.id} problem={problem} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
                
                {/* Other tabs would have similar content, filtered by category */}
                <TabsContent value="arrays" className="m-0">
                  <div className="text-center py-12">
                    <p className="text-slate-500">Array problems would appear here.</p>
                  </div>
                </TabsContent>
                <TabsContent value="strings" className="m-0">
                  <div className="text-center py-12">
                    <p className="text-slate-500">String problems would appear here.</p>
                  </div>
                </TabsContent>
                <TabsContent value="linked-lists" className="m-0">
                  <div className="text-center py-12">
                    <p className="text-slate-500">Linked List problems would appear here.</p>
                  </div>
                </TabsContent>
                <TabsContent value="trees" className="m-0">
                  <div className="text-center py-12">
                    <p className="text-slate-500">Tree problems would appear here.</p>
                  </div>
                </TabsContent>
                <TabsContent value="dp" className="m-0">
                  <div className="text-center py-12">
                    <p className="text-slate-500">Dynamic Programming problems would appear here.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
