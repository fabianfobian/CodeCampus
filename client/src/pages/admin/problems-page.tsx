import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Problem, ProblemTag } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Search, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import CodeEditor from "@/components/ide/code-editor";
import { getLanguageById, SUPPORTED_LANGUAGES } from "@/lib/monaco";

const createProblemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be more detailed"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  starterCode: z.record(z.string(), z.string()),
  testCases: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional()
  })).min(1, "At least one test case is required"),
  timeLimit: z.number().int().min(500, "Time limit must be at least 500ms"),
  memoryLimit: z.number().int().min(16, "Memory limit must be at least 16MB"),
  tags: z.array(z.number()).optional()
});

type CreateProblemFormValues = z.infer<typeof createProblemSchema>;

type TestCase = {
  input: string;
  output: string;
  explanation?: string;
};

type LanguageCode = {
  languageId: string;
  code: string;
};

export default function AdminProblemsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [currentLanguage, setCurrentLanguage] = useState<string>("javascript");
  const [languageCodes, setLanguageCodes] = useState<LanguageCode[]>([
    { languageId: "javascript", code: "function solution() {\n    // Your code here\n}" },
    { languageId: "python", code: "def solution():\n    # Your code here\n    pass" },
    { languageId: "java", code: "public class Solution {\n    public void solution() {\n        // Your code here\n    }\n}" },
    { languageId: "cpp", code: "#include <iostream>\nusing namespace std;\n\nint solution() {\n    // Your code here\n    return 0;\n}" },
    { languageId: "go", code: "package main\n\nimport \"fmt\"\n\nfunc solution() {\n    // Your code here\n}" }
  ]);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", output: "" }
  ]);
  
  // Fetch problems
  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ["/api/problems"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch problem tags
  const { data: tags } = useQuery<ProblemTag[]>({
    queryKey: ["/api/problem-tags"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Create problem form
  const form = useForm<CreateProblemFormValues>({
    resolver: zodResolver(createProblemSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "medium",
      starterCode: {
        javascript: "function solution() {\n    // Your code here\n}",
        python: "def solution():\n    # Your code here\n    pass",
        java: "public class Solution {\n    public void solution() {\n        // Your code here\n    }\n}",
        cpp: "#include <iostream>\nusing namespace std;\n\nint solution() {\n    // Your code here\n    return 0;\n}",
        go: "package main\n\nimport \"fmt\"\n\nfunc solution() {\n    // Your code here\n}"
      },
      testCases: [{ input: "", output: "" }],
      timeLimit: 1000,
      memoryLimit: 128,
      tags: []
    },
  });

  // Create problem mutation
  const createProblemMutation = useMutation({
    mutationFn: async (problemData: CreateProblemFormValues) => {
      const response = await apiRequest("POST", "/api/problems", problemData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Problem created",
        description: "The problem has been created successfully",
      });
      form.reset();
      setTestCases([{ input: "", output: "" }]);
      setLanguageCodes([
        { languageId: "javascript", code: "function solution() {\n    // Your code here\n}" },
        { languageId: "python", code: "def solution():\n    # Your code here\n    pass" },
        { languageId: "java", code: "public class Solution {\n    public void solution() {\n        // Your code here\n    }\n}" },
        { languageId: "cpp", code: "#include <iostream>\nusing namespace std;\n\nint solution() {\n    // Your code here\n    return 0;\n}" },
        { languageId: "go", code: "package main\n\nimport \"fmt\"\n\nfunc solution() {\n    // Your code here\n}" }
      ]);
      setCurrentLanguage("javascript");
      setActiveTab("details");
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/problems"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create problem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete problem mutation
  const deleteProblemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/problems/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Problem deleted",
        description: "The problem has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/problems"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete problem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: CreateProblemFormValues) => {
    // Create starter code object from state
    const starterCode: Record<string, string> = {};
    languageCodes.forEach(lc => {
      starterCode[lc.languageId] = lc.code;
    });
    
    // Submit with complete data
    createProblemMutation.mutate({
      ...values,
      starterCode,
      testCases
    });
  };

  // Add a test case
  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "" }]);
  };

  // Update test case
  const updateTestCase = (index: number, key: keyof TestCase, value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index] = { ...newTestCases[index], [key]: value };
    setTestCases(newTestCases);
  };

  // Remove test case
  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      const newTestCases = testCases.filter((_, i) => i !== index);
      setTestCases(newTestCases);
    }
  };

  // Update code for current language
  const updateLanguageCode = (code: string) => {
    const newLanguageCodes = [...languageCodes];
    const index = newLanguageCodes.findIndex(lc => lc.languageId === currentLanguage);
    
    if (index !== -1) {
      newLanguageCodes[index].code = code;
    } else {
      newLanguageCodes.push({ languageId: currentLanguage, code });
    }
    
    setLanguageCodes(newLanguageCodes);
  };

  // Get code for current language
  const getCurrentLanguageCode = () => {
    const langCode = languageCodes.find(lc => lc.languageId === currentLanguage);
    return langCode?.code || getDefaultStarterCode(currentLanguage);
  };

  // Get default starter code for different languages
  const getDefaultStarterCode = (lang: string) => {
    const templates = {
      javascript: "function solution() {\n    // Your code here\n}",
      python: "def solution():\n    # Your code here\n    pass",
      java: "public class Solution {\n    public void solution() {\n        // Your code here\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\n\nint solution() {\n    // Your code here\n    return 0;\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc solution() {\n    // Your code here\n}"
    };
    return templates[lang] || "// Your code here";
  };

  // Filter problems
  const filteredProblems = problems?.filter(problem => {
    const matchesSearch = 
      searchQuery === "" || 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  // Get color for difficulty badge
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
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
                <h1 className="text-2xl font-bold text-slate-800">Problem Management</h1>
                <p className="text-slate-500">Create and manage coding problems</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search problems..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Create Problem</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Problem</DialogTitle>
                      <DialogDescription>
                        Create a new coding problem with descriptions, test cases, and starter code.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="details">Problem Details</TabsTrigger>
                        <TabsTrigger value="starter-code">Starter Code</TabsTrigger>
                        <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
                      </TabsList>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                          <TabsContent value="details" className="space-y-4 py-4">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Problem Title</FormLabel>
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
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      className="min-h-[200px]"
                                      placeholder="Write your problem description here. You can use HTML for formatting."
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Provide a clear explanation of the problem, constraints, and examples.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="difficulty"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Difficulty</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="timeLimit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Time Limit (ms)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field}
                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="memoryLimit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Memory Limit (MB)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field}
                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="tags"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tags</FormLabel>
                                  <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                                    {tags && tags.map(tag => (
                                      <Badge 
                                        key={tag.id}
                                        variant={field.value?.includes(tag.id) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                          const currentTags = field.value || [];
                                          if (currentTags.includes(tag.id)) {
                                            field.onChange(currentTags.filter(id => id !== tag.id));
                                          } else {
                                            field.onChange([...currentTags, tag.id]);
                                          }
                                        }}
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                    {!tags || tags.length === 0 && (
                                      <span className="text-sm text-slate-500">No tags available</span>
                                    )}
                                  </div>
                                  <FormDescription>
                                    Select relevant tags to categorize the problem.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TabsContent>
                          
                          <TabsContent value="starter-code" className="py-4">
                            <div className="mb-4">
                              <FormLabel>Language</FormLabel>
                              <Select 
                                value={currentLanguage} 
                                onValueChange={setCurrentLanguage}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SUPPORTED_LANGUAGES.map(lang => (
                                    <SelectItem key={lang.id} value={lang.id}>
                                      {lang.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-sm text-slate-500 mt-1">
                                Provide starter code templates for each supported language.
                              </p>
                            </div>
                            
                            <div className="h-96 border rounded-md overflow-hidden">
                              <CodeEditor
                                language={currentLanguage}
                                value={getCurrentLanguageCode()}
                                onChange={updateLanguageCode}
                              />
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="test-cases" className="py-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">Test Cases</h3>
                              <Button 
                                type="button"
                                variant="outline" 
                                onClick={addTestCase}
                              >
                                Add Test Case
                              </Button>
                            </div>
                            
                            <div className="space-y-6">
                              {testCases.map((testCase, index) => (
                                <div key={index} className="p-4 border rounded-md">
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium">Test Case #{index + 1}</h4>
                                    {testCases.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeTestCase(index)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <FormLabel>Input</FormLabel>
                                      <Textarea
                                        value={testCase.input}
                                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                        placeholder="Input data for test case"
                                        className="font-mono"
                                      />
                                    </div>
                                    
                                    <div>
                                      <FormLabel>Expected Output</FormLabel>
                                      <Textarea
                                        value={testCase.output}
                                        onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                                        placeholder="Expected output for test case"
                                        className="font-mono"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3">
                                    <FormLabel>Explanation (Optional)</FormLabel>
                                    <Textarea
                                      value={testCase.explanation || ''}
                                      onChange={(e) => updateTestCase(index, 'explanation', e.target.value)}
                                      placeholder="Explain why this is the expected output"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <DialogFooter className="mt-6">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsCreateDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={createProblemMutation.isPending}
                            >
                              {createProblemMutation.isPending ? "Creating..." : "Create Problem"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
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
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !problems || problems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No problems found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Acceptance Rate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProblems?.map((problem) => (
                        <TableRow key={problem.id}>
                          <TableCell>{problem.id}</TableCell>
                          <TableCell className="font-medium">{problem.title}</TableCell>
                          <TableCell>
                            <Badge className={getDifficultyColor(problem.difficulty)}>
                              {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>Admin</TableCell>
                          <TableCell>
                            {problem.acceptanceRate ? `${problem.acceptanceRate}%` : 'N/A'}
                          </TableCell>
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
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this problem?")) {
                                    deleteProblemMutation.mutate(problem.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredProblems?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-500 py-4">
                            No problems match your search or filter criteria
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
