
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Clock,
  Users,
  TrendingUp
} from "lucide-react";

interface Discussion {
  id: number;
  title: string;
  content: string;
  author: {
    username: string;
    avatar?: string;
  };
  category: string;
  replies: number;
  views: number;
  likes: number;
  createdAt: string;
  lastActivity: string;
  tags: string[];
  isPinned?: boolean;
}

// Mock data for discussions
const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 1,
    title: "How to optimize recursive solutions?",
    content: "I'm struggling with optimizing recursive algorithms. Any tips on when to use memoization vs iteration?",
    author: { username: "coder123", avatar: "" },
    category: "Algorithm Help",
    replies: 15,
    views: 234,
    likes: 8,
    createdAt: "2024-01-15",
    lastActivity: "2 hours ago",
    tags: ["recursion", "optimization", "algorithms"],
    isPinned: true
  },
  {
    id: 2,
    title: "Best practices for handling large datasets",
    content: "Working with datasets larger than memory. What are the best approaches?",
    author: { username: "datadev", avatar: "" },
    category: "Data Structures",
    replies: 23,
    views: 456,
    likes: 12,
    createdAt: "2024-01-14",
    lastActivity: "1 day ago",
    tags: ["data", "performance", "memory"]
  },
  {
    id: 3,
    title: "Understanding time complexity",
    content: "Can someone explain why this solution is O(n log n) instead of O(n²)?",
    author: { username: "student99", avatar: "" },
    category: "Theory",
    replies: 7,
    views: 189,
    likes: 5,
    createdAt: "2024-01-13",
    lastActivity: "3 days ago",
    tags: ["complexity", "theory", "big-o"]
  }
];

const CATEGORIES = [
  "All Categories",
  "Algorithm Help", 
  "Data Structures",
  "Theory",
  "Implementation",
  "Code Review",
  "General Discussion"
];

function DiscussionCard({ discussion }: { discussion: Discussion }) {
  return (
    <Card className={`mb-4 ${discussion.isPinned ? 'border-amber-200 bg-amber-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {discussion.isPinned && (
                <Badge variant="secondary" className="text-xs">
                  Pinned
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {discussion.category}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-slate-800 hover:text-blue-600 cursor-pointer">
              {discussion.title}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
              {discussion.content}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {discussion.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {discussion.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{discussion.author.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{discussion.lastActivity}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{discussion.replies}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{discussion.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{discussion.likes}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeTab, setActiveTab] = useState("recent");

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Discussions</h1>
                <p className="text-slate-600">
                  Connect with the community, ask questions, and share knowledge
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Discussion
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md bg-white text-sm"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="popular">Popular</TabsTrigger>
                    <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                    <TabsTrigger value="following">Following</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recent" className="space-y-4 mt-6">
                    {MOCK_DISCUSSIONS.map((discussion) => (
                      <DiscussionCard key={discussion.id} discussion={discussion} />
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="popular" className="space-y-4 mt-6">
                    {MOCK_DISCUSSIONS
                      .sort((a, b) => b.likes - a.likes)
                      .map((discussion) => (
                        <DiscussionCard key={discussion.id} discussion={discussion} />
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="unanswered" className="space-y-4 mt-6">
                    {MOCK_DISCUSSIONS
                      .filter((d) => d.replies === 0)
                      .map((discussion) => (
                        <DiscussionCard key={discussion.id} discussion={discussion} />
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="following" className="space-y-4 mt-6">
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">
                        No followed discussions yet
                      </h3>
                      <p className="text-slate-500">
                        Follow discussions to see them here
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Discussions</span>
                      <span className="font-semibold">1,234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Active Members</span>
                      <span className="font-semibold">456</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Solved Today</span>
                      <span className="font-semibold">89</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Trending Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {["algorithms", "dynamic-programming", "graphs", "arrays", "recursion"].map((topic) => (
                        <Badge key={topic} variant="secondary" className="mr-2 mb-2">
                          #{topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Guidelines */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Community Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600 space-y-2">
                    <p>• Be respectful and constructive</p>
                    <p>• Search before posting</p>
                    <p>• Provide context and examples</p>
                    <p>• Use clear, descriptive titles</p>
                    <p>• Tag your posts appropriately</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
