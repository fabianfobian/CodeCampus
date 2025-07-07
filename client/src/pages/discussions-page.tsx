
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Search, ThumbsUp, Reply, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Discussion {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
    role: string;
  };
  category: string;
  tags: string[];
  replies: number;
  likes: number;
  createdAt: Date;
  lastActivity: Date;
  isLiked?: boolean;
}

interface NewDiscussion {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

// Sample discussions data
const sampleDiscussions: Discussion[] = [
  {
    id: 1,
    title: "Best practices for solving dynamic programming problems",
    content: "I've been struggling with DP problems lately. What are some systematic approaches you recommend for breaking down complex DP problems?",
    author: {
      id: 2,
      username: "coder_mike",
      role: "learner"
    },
    category: "algorithms",
    tags: ["dynamic-programming", "algorithms", "interview-prep"],
    replies: 12,
    likes: 23,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    lastActivity: new Date("2024-01-16T14:20:00Z"),
    isLiked: false
  },
  {
    id: 2,
    title: "JavaScript closure concept explanation needed",
    content: "Can someone explain closures in JavaScript with practical examples? I understand the theory but struggle with real-world applications.",
    author: {
      id: 3,
      username: "js_newbie",
      role: "learner"
    },
    category: "javascript",
    tags: ["javascript", "closures", "fundamentals"],
    replies: 8,
    likes: 15,
    createdAt: new Date("2024-01-14T16:45:00Z"),
    lastActivity: new Date("2024-01-15T09:10:00Z"),
    isLiked: true
  },
  {
    id: 3,
    title: "Competitive Programming Tips for Beginners",
    content: "Starting my competitive programming journey. What platforms do you recommend and how should I structure my practice routine?",
    author: {
      id: 4,
      username: "aspiring_coder",
      role: "learner"
    },
    category: "competitive-programming",
    tags: ["competitive-programming", "beginner-tips", "practice"],
    replies: 18,
    likes: 34,
    createdAt: new Date("2024-01-13T12:00:00Z"),
    lastActivity: new Date("2024-01-16T11:30:00Z"),
    isLiked: false
  },
  {
    id: 4,
    title: "Code Review: Binary Search Implementation",
    content: "Could someone review my binary search implementation? I think there might be edge cases I'm missing.",
    author: {
      id: 5,
      username: "debug_master",
      role: "learner"
    },
    category: "code-review",
    tags: ["binary-search", "algorithms", "code-review"],
    replies: 6,
    likes: 9,
    createdAt: new Date("2024-01-12T20:15:00Z"),
    lastActivity: new Date("2024-01-14T08:45:00Z"),
    isLiked: false
  }
];

const categories = [
  { value: "algorithms", label: "Algorithms" },
  { value: "data-structures", label: "Data Structures" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "competitive-programming", label: "Competitive Programming" },
  { value: "code-review", label: "Code Review" },
  { value: "career", label: "Career Advice" },
  { value: "general", label: "General Discussion" }
];

export default function DiscussionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState<NewDiscussion>({
    title: "",
    content: "",
    category: "",
    tags: []
  });

  // In a real app, this would be an API call
  const { data: discussions = sampleDiscussions, isLoading } = useQuery({
    queryKey: ["discussions"],
    queryFn: async () => {
      // Simulate API call
      return sampleDiscussions;
    }
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async (discussionData: NewDiscussion) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Discussion created!",
        description: "Your discussion has been posted successfully."
      });
      setIsCreateDialogOpen(false);
      setNewDiscussion({ title: "", content: "", category: "", tags: [] });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
    onError: () => {
      toast({
        title: "Failed to create discussion",
        description: "There was an error posting your discussion.",
        variant: "destructive"
      });
    }
  });

  const likeDiscussionMutation = useMutation({
    mutationFn: async (discussionId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    }
  });

  const filteredDiscussions = discussions
    .filter(discussion => {
      const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || discussion.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case "popular":
          return (b.likes + b.replies) - (a.likes + a.replies);
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

  const handleCreateDiscussion = () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim() || !newDiscussion.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    createDiscussionMutation.mutate(newDiscussion);
  };

  const handleLike = (discussionId: number) => {
    likeDiscussionMutation.mutate(discussionId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Discussions</h1>
          <p className="text-muted-foreground mt-2">
            Connect with fellow learners and share knowledge
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start New Discussion</DialogTitle>
              <DialogDescription>
                Share your questions, insights, or start a conversation with the community.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <Input
                  placeholder="What's your discussion about?"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Category *</label>
                <Select
                  value={newDiscussion.category}
                  onValueChange={(value) => setNewDiscussion(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Content *</label>
                <Textarea
                  placeholder="Share your thoughts, questions, or insights..."
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-32"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateDiscussion}
                disabled={createDiscussionMutation.isPending}
              >
                {createDiscussionMutation.isPending ? "Posting..." : "Post Discussion"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card key={discussion.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 hover:text-primary cursor-pointer">
                    {discussion.title}
                  </CardTitle>
                  <CardDescription className="text-sm mb-3">
                    {discussion.content.length > 200 
                      ? `${discussion.content.substring(0, 200)}...` 
                      : discussion.content}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{discussion.category}</Badge>
                    {discussion.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {discussion.author.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {discussion.author.username}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {discussion.author.role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(discussion.createdAt, { addSuffix: true })}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(discussion.id)}
                    className={discussion.isLiked ? "text-red-500" : ""}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {discussion.likes}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Reply className="h-4 w-4 mr-1" />
                    {discussion.replies}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiscussions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No discussions found matching your criteria.</p>
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              Start the first discussion
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
