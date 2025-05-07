import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { getQueryFn } from "@/lib/queryClient";
import {
  Loader2,
  RefreshCw,
  Calendar,
  ChevronDown,
  Users,
  Award,
  CheckCircle,
  Clock
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
} from "recharts";

// Sample data for top users - would come from API in real implementation
const topUsers = [
  { id: 1, username: "sophia_dev", displayName: "Sophia Chen", problemsSolved: 245, rank: 1, acceptance: 82 },
  { id: 2, username: "algo_master", displayName: "James Wilson", problemsSolved: 232, rank: 2, acceptance: 78 },
  { id: 3, username: "code_ninja", displayName: "Alex Kumar", problemsSolved: 217, rank: 3, acceptance: 75 },
  { id: 4, username: "dev_warrior", displayName: "Olivia Martinez", problemsSolved: 198, rank: 4, acceptance: 71 },
  { id: 5, username: "binary_guru", displayName: "Daniel Lee", problemsSolved: 185, rank: 5, acceptance: 69 },
];

// Sample data for problem categories - would come from API in real implementation
const submissionStats = [
  { name: "Arrays", total: 1245, accepted: 876, percentage: 70.4 },
  { name: "Strings", total: 953, accepted: 723, percentage: 75.9 },
  { name: "Linked Lists", total: 762, accepted: 451, percentage: 59.2 },
  { name: "Trees", total: 642, accepted: 392, percentage: 61.1 },
  { name: "Dynamic Programming", total: 520, accepted: 287, percentage: 55.2 },
  { name: "Graphs", total: 325, accepted: 198, percentage: 60.9 },
  { name: "Sorting", total: 421, accepted: 318, percentage: 75.5 },
  { name: "Recursion", total: 218, accepted: 142, percentage: 65.1 },
];

// Sample data for monthly solved problems - would come from API in real implementation
const monthlySolvedProblems = [
  { month: "Jan", easy: 245, medium: 125, hard: 52 },
  { month: "Feb", easy: 284, medium: 143, hard: 68 },
  { month: "Mar", easy: 301, medium: 162, hard: 75 },
  { month: "Apr", easy: 350, medium: 187, hard: 83 },
  { month: "May", easy: 376, medium: 218, hard: 92 },
  { month: "Jun", easy: 412, medium: 237, hard: 101 },
];

// Sample data for difficulty distribution - would come from API in real implementation
const difficultyDistribution = [
  { name: "Easy", value: 42, color: "#4ade80" },
  { name: "Medium", value: 38, color: "#facc15" },
  { name: "Hard", value: 20, color: "#f87171" },
];

// Sample data for language distribution - would come from API in real implementation
const languageDistribution = [
  { name: "JavaScript", value: 28, color: "#facc15" },
  { name: "Python", value: 32, color: "#3b82f6" },
  { name: "Java", value: 18, color: "#ef4444" },
  { name: "C++", value: 12, color: "#a855f7" },
  { name: "Go", value: 5, color: "#22d3ee" },
  { name: "Others", value: 5, color: "#94a3b8" },
];

// Sample data for recent competitions - would come from API in real implementation
const recentCompetitions = [
  { 
    id: 1, 
    title: "Weekly Challenge #42", 
    participants: 312, 
    date: "2023-06-15", 
    duration: "2 hours", 
    winner: "sophia_dev", 
    winnerDisplayName: "Sophia Chen" 
  },
  { 
    id: 2, 
    title: "Dynamic Programming Deep Dive", 
    participants: 186, 
    date: "2023-06-08", 
    duration: "3 hours", 
    winner: "algo_master", 
    winnerDisplayName: "James Wilson" 
  },
  { 
    id: 3, 
    title: "Graph Algorithms Contest", 
    participants: 245, 
    date: "2023-05-28", 
    duration: "2.5 hours", 
    winner: "code_ninja", 
    winnerDisplayName: "Alex Kumar" 
  },
  { 
    id: 4, 
    title: "Monthly Coding Marathon", 
    participants: 523, 
    date: "2023-05-15", 
    duration: "4 hours", 
    winner: "binary_guru", 
    winnerDisplayName: "Daniel Lee" 
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");
  
  // Fetch stats data - this would normally come from the API
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["/api/stats/overview", timeRange],
    queryFn: () => {
      // In a real implementation, this would call the API with the selected time range
      // For now, we'll return some static data
      return {
        totalUsers: 8423,
        activeUsers: 3256,
        totalProblems: 543,
        totalSubmissions: 125634,
        acceptedSubmissions: 76345,
        acceptanceRate: 60.8,
        newUsersToday: 34,
        newSubmissionsToday: 1256,
      };
    },
  });

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
                <p className="text-slate-500">Track platform usage, user progress, and problem statistics</p>
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {timeRange === "week" ? "Past Week" : 
                       timeRange === "month" ? "Past Month" : 
                       timeRange === "quarter" ? "Past 3 Months" : 
                       "Past Year"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setTimeRange("week")}>
                      Past Week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeRange("month")}>
                      Past Month
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeRange("quarter")}>
                      Past 3 Months
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeRange("year")}>
                      Past Year
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="problems">Problems</TabsTrigger>
                <TabsTrigger value="competitions">Competitions</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                              <h3 className="text-2xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</h3>
                              <p className="text-xs text-green-600 mt-1 flex items-center">
                                <span className="flex items-center mr-1">↑</span>
                                {stats.newUsersToday} new today
                              </p>
                            </div>
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                              <Users size={20} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                              <h3 className="text-2xl font-bold mt-2">{stats.activeUsers.toLocaleString()}</h3>
                              <p className="text-xs text-blue-600 mt-1">
                                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
                              </p>
                            </div>
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                              <Award size={20} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Accepted Rate</p>
                              <h3 className="text-2xl font-bold mt-2">{stats.acceptanceRate}%</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {stats.acceptedSubmissions.toLocaleString()} / {stats.totalSubmissions.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                              <CheckCircle size={20} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Submissions Today</p>
                              <h3 className="text-2xl font-bold mt-2">{stats.newSubmissionsToday.toLocaleString()}</h3>
                              <p className="text-xs text-blue-600 mt-1 flex items-center">
                                <span className="flex items-center mr-1">↑</span>
                                9.2% from yesterday
                              </p>
                            </div>
                            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                              <Clock size={20} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Submissions by Difficulty</CardTitle>
                          <CardDescription>
                            Total problem submissions grouped by difficulty level
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={monthlySolvedProblems}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="easy" name="Easy" fill="#4ade80" />
                                <Bar dataKey="medium" name="Medium" fill="#facc15" />
                                <Bar dataKey="hard" name="Hard" fill="#f87171" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Submissions by Difficulty</CardTitle>
                            <CardDescription>
                              Distribution of problem difficulty levels
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex justify-center">
                            <div className="h-[200px] w-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={difficultyDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                  >
                                    {difficultyDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Language Usage</CardTitle>
                            <CardDescription>
                              Most popular programming languages
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex justify-center">
                            <div className="h-[200px] w-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={languageDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                  >
                                    {languageDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    {/* Top Users Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Performing Users</CardTitle>
                        <CardDescription>
                          Users with the most problems solved and highest acceptance rates
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rank</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Problems Solved</TableHead>
                              <TableHead>Acceptance Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">#{user.rank}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-semibold mr-3">
                                      {user.displayName.substring(0, 2)}
                                    </div>
                                    <div>
                                      <div className="font-medium">{user.displayName}</div>
                                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{user.problemsSolved}</TableCell>
                                <TableCell>
                                  <Badge className={user.acceptance > 75 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                                    {user.acceptance}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
              
              {/* Problems Tab */}
              <TabsContent value="problems">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Problem Categories Performance</CardTitle>
                      <CardDescription>
                        Acceptance rates by problem category
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={submissionStats}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                          >
                            <XAxis type="number" domain={[0, 100]} unit="%" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <RechartsTooltip 
                              formatter={(value, name) => [`${value}%`, 'Acceptance Rate']}
                              labelFormatter={(label) => `${label} Category`}
                            />
                            <Bar 
                              dataKey="percentage" 
                              name="Acceptance Rate"
                              fill="#3b82f6"
                              radius={[0, 4, 4, 0]}
                              label={{ position: 'right', formatter: (value) => `${value.toFixed(1)}%` }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Most Attempted Problems</CardTitle>
                        <CardDescription>
                          Problems with the highest number of submissions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Problem</TableHead>
                              <TableHead>Difficulty</TableHead>
                              <TableHead>Attempts</TableHead>
                              <TableHead>Success %</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Two Sum</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">Easy</Badge>
                              </TableCell>
                              <TableCell>12,458</TableCell>
                              <TableCell>75.3%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Valid Parentheses</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">Easy</Badge>
                              </TableCell>
                              <TableCell>10,874</TableCell>
                              <TableCell>68.9%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Merge Intervals</TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                              </TableCell>
                              <TableCell>9,321</TableCell>
                              <TableCell>51.2%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Maximum Subarray</TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                              </TableCell>
                              <TableCell>8,754</TableCell>
                              <TableCell>63.7%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">LRU Cache</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">Hard</Badge>
                              </TableCell>
                              <TableCell>6,932</TableCell>
                              <TableCell>42.1%</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Hardest Problems</CardTitle>
                        <CardDescription>
                          Problems with the lowest success rates
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Problem</TableHead>
                              <TableHead>Difficulty</TableHead>
                              <TableHead>Attempts</TableHead>
                              <TableHead>Success %</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Regular Expression Matching</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">Hard</Badge>
                              </TableCell>
                              <TableCell>3,256</TableCell>
                              <TableCell>18.7%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Median of Two Sorted Arrays</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">Hard</Badge>
                              </TableCell>
                              <TableCell>4,128</TableCell>
                              <TableCell>22.4%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Trapping Rain Water</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">Hard</Badge>
                              </TableCell>
                              <TableCell>5,321</TableCell>
                              <TableCell>27.8%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Alien Dictionary</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">Hard</Badge>
                              </TableCell>
                              <TableCell>2,908</TableCell>
                              <TableCell>31.2%</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Word Break II</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">Hard</Badge>
                              </TableCell>
                              <TableCell>3,754</TableCell>
                              <TableCell>34.5%</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Competitions Tab */}
              <TabsContent value="competitions">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Competition Participation</CardTitle>
                      <CardDescription>
                        Number of participants in recent competitions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={recentCompetitions.map(comp => ({
                              name: comp.title,
                              participants: comp.participants,
                            }))}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <XAxis 
                              dataKey="name" 
                              angle={-45} 
                              textAnchor="end" 
                              height={70}
                              interval={0}
                            />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar 
                              dataKey="participants" 
                              name="Participants" 
                              fill="#8b5cf6"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Competitions</CardTitle>
                      <CardDescription>
                        Summary of recently completed competitions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Competition</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead>Winner</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentCompetitions.map((comp) => (
                            <TableRow key={comp.id}>
                              <TableCell className="font-medium">{comp.title}</TableCell>
                              <TableCell>{formatDate(comp.date)}</TableCell>
                              <TableCell>{comp.duration}</TableCell>
                              <TableCell>{comp.participants}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-7 h-7 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-semibold mr-2">
                                    {comp.winnerDisplayName.substring(0, 2)}
                                  </div>
                                  <span>{comp.winnerDisplayName}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
