import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Submission } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SubmissionsPage() {
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch user submissions
  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Format date for display
  const formatTime = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get language display info
  const getLanguageInfo = (language: string) => {
    const languageMap: Record<string, { name: string, bgColor: string, textColor: string }> = {
      'javascript': { name: 'JavaScript', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      'python': { name: 'Python', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      'java': { name: 'Java', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
      'cpp': { name: 'C++', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
      'go': { name: 'Go', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' },
      'csharp': { name: 'C#', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      'ruby': { name: 'Ruby', bgColor: 'bg-red-100', textColor: 'text-red-800' }
    };
    
    return languageMap[language] || { name: language, bgColor: 'bg-slate-100', textColor: 'text-slate-800' };
  };

  // Get status display info
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { icon: React.ReactNode, label: string, bgColor: string, textColor: string }> = {
      'accepted': { 
        icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />, 
        label: 'Accepted', 
        bgColor: 'bg-green-100', 
        textColor: 'text-green-800' 
      },
      'wrong_answer': { 
        icon: <XCircle className="h-4 w-4 mr-1.5" />, 
        label: 'Wrong Answer', 
        bgColor: 'bg-red-100', 
        textColor: 'text-red-800' 
      },
      'time_limit_exceeded': { 
        icon: <Clock className="h-4 w-4 mr-1.5" />, 
        label: 'Time Limit', 
        bgColor: 'bg-orange-100', 
        textColor: 'text-orange-800' 
      },
      'runtime_error': { 
        icon: <AlertTriangle className="h-4 w-4 mr-1.5" />, 
        label: 'Runtime Error', 
        bgColor: 'bg-rose-100', 
        textColor: 'text-rose-800' 
      },
      'compilation_error': { 
        icon: <AlertTriangle className="h-4 w-4 mr-1.5" />, 
        label: 'Compilation Error', 
        bgColor: 'bg-purple-100', 
        textColor: 'text-purple-800' 
      }
    };
    
    return statusMap[status] || { 
      icon: <AlertTriangle className="h-4 w-4 mr-1.5" />, 
      label: status, 
      bgColor: 'bg-slate-100', 
      textColor: 'text-slate-800' 
    };
  };

  // Filter submissions
  const filteredSubmissions = submissions?.filter(submission => {
    // Filter by language
    const matchesLanguage = languageFilter === "all" || submission.language === languageFilter;
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    
    // Filter by search query (problem title or id)
    const matchesSearch = searchQuery.trim() === "" || 
      (submission.problem && 
        submission.problem.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      submission.problemId.toString().includes(searchQuery);
    
    return matchesLanguage && matchesStatus && matchesSearch;
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
                <h1 className="text-2xl font-bold text-slate-800">Your Submissions</h1>
                <p className="text-slate-500">View your submission history and results</p>
              </div>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by problem..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 mb-6">
              <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
                <div className="w-full sm:w-auto flex items-center space-x-2">
                  <span className="text-sm text-slate-500 whitespace-nowrap">Language:</span>
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-auto flex items-center space-x-2">
                  <span className="text-sm text-slate-500 whitespace-nowrap">Status:</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="wrong_answer">Wrong Answer</SelectItem>
                      <SelectItem value="time_limit_exceeded">Time Limit</SelectItem>
                      <SelectItem value="runtime_error">Runtime Error</SelectItem>
                      <SelectItem value="compilation_error">Compilation Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !submissions || submissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">You haven't made any submissions yet.</p>
                  <Link href="/problems">
                    <a className="text-primary hover:text-primary-600 mt-2 inline-block">
                      Start solving problems
                    </a>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Problem</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Runtime</TableHead>
                        <TableHead>Memory</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions?.map((submission) => {
                        const languageInfo = getLanguageInfo(submission.language);
                        const statusInfo = getStatusInfo(submission.status);
                        
                        return (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <Link href={`/problem/${submission.problemId}`}>
                                <a className="font-medium text-primary hover:text-primary-700 hover:underline">
                                  {submission.problem?.title || `Problem #${submission.problemId}`}
                                </a>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} flex items-center w-fit`}>
                                {statusInfo.icon}
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${languageInfo.bgColor} ${languageInfo.textColor}`}>
                                {languageInfo.name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {submission.runTime ? `${submission.runTime} ms` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {submission.memory ? `${submission.memory} KB` : 'N/A'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-slate-500">
                              {formatTime(submission.createdAt)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      
                      {filteredSubmissions?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-500 py-4">
                            No submissions match your filters
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
