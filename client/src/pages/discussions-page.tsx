
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
import { Loader2 } from "lucide-react";
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
    id: number;
    username: string;
    displayName?: string;
  };
  category: string;
  replyCount: number;
  views: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPinned?: boolean;
}

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) {
      return diffHours === 0 ? 'Just now' : `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

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
              {Array.isArray(discussion.tags) && discussion.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
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
              <span>{discussion.author.displayName || discussion.author.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(discussion.updatedAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{discussion.replyCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{discussion.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{discussion.likeCount}</span>
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

  // Fetch discussions
  const { data: discussions, isLoading } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions", selectedCategory, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "All Categories") {
        params.append("category", selectedCategory);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      return fetch(`/api/discussions?${params.toString()}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch discussions");
          return res.json();
        });
    },
  });

  const filteredDiscussions = discussions || [];

  const getFilteredDiscussions = () => {
    let filtered = [...filteredDiscussions];

    switch (activeTab) {
      case "popular":
        return filtered.sort((a, b) => b.likeCount - a.likeCount);
      case "unanswered":
        return filtered.filter((d) => d.replyCount === 0);
      case "following":
        return []; // Would need user following data
      default:
        return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  };

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
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : getFilteredDiscussions().length > 0 ? (
                      getFilteredDiscussions().map((discussion) => (
                        <DiscussionCard key={discussion.id} discussion={discussion} />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-600 mb-2">
                          No discussions found
                        </h3>
                        <p className="text-slate-500">
                          Be the first to start a discussion!
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="popular" className="space-y-4 mt-6">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : getFilteredDiscussions().length > 0 ? (
                      getFilteredDiscussions().map((discussion) => (
                        <DiscussionCard key={discussion.id} discussion={discussion} />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-600 mb-2">
                          No popular discussions yet
                        </h3>
                        <p className="text-slate-500">
                          Discussions will appear here as they gain popularity
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="unanswered" className="space-y-4 mt-6">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : getFilteredDiscussions().length > 0 ? (
                      getFilteredDiscussions().map((discussion) => (
                        <DiscussionCard key={discussion.id} discussion={discussion} />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-600 mb-2">
                          No unanswered discussions
                        </h3>
                        <p className="text-slate-500">
                          All discussions have been answered!
                        </p>
                      </div>
                    )}
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
                      <span className="font-semibold">{discussions?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Replies</span>
                      <span className="font-semibold">
                        {discussions?.reduce((sum, d) => sum + d.replyCount, 0) || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Views</span>
                      <span className="font-semibold">
                        {discussions?.reduce((sum, d) => sum + d.views, 0) || 0}
                      </span>
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
                      {discussions && discussions.length > 0 ? (
                        (() => {
                          const allTags = discussions.flatMap(d => Array.isArray(d.tags) ? d.tags : []);
                          const tagCounts = allTags.reduce((acc, tag) => {
                            acc[tag] = (acc[tag] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                          return Object.entries(tagCounts)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([tag]) => (
                              <Badge key={tag} variant="secondary" className="mr-2 mb-2">
                                #{tag}
                              </Badge>
                            ));
                        })()
                      ) : (
                        ["algorithms", "data-structures", "problem-solving", "coding", "help"].map((topic) => (
                          <Badge key={topic} variant="secondary" className="mr-2 mb-2">
                            #{topic}
                          </Badge>
                        ))
                      )}
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
