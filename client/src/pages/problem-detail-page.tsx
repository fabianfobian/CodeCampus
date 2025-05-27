import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import CodeEditor from "@/components/ide/code-editor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Problem } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { SUPPORTED_LANGUAGES, getDefaultCode } from "@/lib/monaco";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Bookmark, HelpCircle, MessageSquare, FileCode, Play, Send, Edit2, Save, Terminal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [output, setOutput] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const { user } = useAuth();

  // Fetch problem details
  const { data: problem, isLoading } = useQuery<Problem>({
    queryKey: ["/api/problems", id],
    queryFn: () => fetch(`/api/problems/${id}`).then(res => res.json()),
  });

  // Update problem mutation
  const updateProblemMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      return apiRequest("PUT", `/api/problems/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/problems", id] });
      setIsEditing(false);
    },
  });

  // Check if user can edit
  const canEdit = user && ['super_admin', 'admin', 'examiner'].includes(user.role);

  useEffect(() => {
    if (problem) {
      setEditedTitle(problem.title);
      setEditedDescription(problem.description);
      const starterCode = problem.starterCode?.[language];
      if (starterCode) {
        setCode(starterCode as string);
      } else {
        setCode(getDefaultCode(language));
      }
    }
  }, [problem, language]);

  const handleSave = async () => {
    updateProblemMutation.mutate({
      title: editedTitle,
      description: editedDescription,
    });
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowOutput(true);
    try {
      setOutput("Running code...\n");
      
      const response = await apiRequest("POST", "/api/execute", {
        language,
        code
      });

      if (response.success) {
        setOutput(prev => prev + response.output + "\n\nExecution completed successfully!");
      } else {
        setOutput(prev => prev + `Error: ${response.error || response.output}`);
      }
    } catch (error) {
      console.error("Error running code:", error);
      setOutput(prev => prev + "\nError: Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;

    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/submissions", {
        problemId: Number(id),
        language,
        code,
        status: "pending"
      });

      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      alert("Solution submitted successfully!");
    } catch (error) {
      console.error("Error submitting solution:", error);
      alert("Failed to submit solution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </main>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Problem not found</h2>
              <p className="text-gray-500 mb-4">The problem you're looking for doesn't exist or has been removed.</p>
              <Link href="/problems">
                <Button>Browse All Problems</Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="h-full flex flex-col">
            {/* Problem navigation header */}
            <div className="bg-white rounded-t-lg shadow-sm border border-slate-200 p-4 mb-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-4">
                  <Link href="/problems">
                    <a className="text-slate-500 hover:text-slate-700">
                      <ArrowLeft className="h-5 w-5" />
                    </a>
                  </Link>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-xl font-bold w-full border rounded px-2 py-1"
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-slate-800">{problem.title}</h2>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full 
                        ${problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                          problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {problem.difficulty ? problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1) : ''}
                      </span>
                      <span className="text-xs text-slate-500">
                        Acceptance Rate: {problem.acceptanceRate || 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => {
                        if (isEditing) {
                          handleSave();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save</span>
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-4 w-4" />
                          <span>Edit</span>
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Bookmark className="h-4 w-4" />
                    <span>Bookmark</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <HelpCircle className="h-4 w-4" />
                    <span>Hint</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Discuss</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <FileCode className="h-4 w-4" />
                    <span>Solution</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Main problem interface */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-1 min-h-0">
              {/* Left panel - Problem description */}
              <div className="bg-white rounded-bl-lg shadow-sm border border-slate-200 overflow-y-auto">
                <div className="p-6">
                    {isEditing ? (
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="min-h-[400px] font-mono"
                      />
                    ) : (
                      <div className="prose prose-slate max-w-none">
                        {problem.description ? (
                          <div>
                            <div className="whitespace-pre-wrap">{problem.description}</div>
                            
                            {/* Show examples if available */}
                            {problem.testCases && problem.testCases.length > 0 && (
                              <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-3">Examples:</h3>
                                {problem.testCases.slice(0, 2).map((testCase: any, index: number) => (
                                  <div key={index} className="mb-4 p-4 bg-slate-50 rounded-lg">
                                    <h4 className="font-medium mb-2">Example {index + 1}:</h4>
                                    <div className="mb-2">
                                      <strong>Input:</strong>
                                      <pre className="mt-1 p-2 bg-slate-100 rounded text-sm overflow-x-auto">{testCase.input}</pre>
                                    </div>
                                    <div className="mb-2">
                                      <strong>Output:</strong>
                                      <pre className="mt-1 p-2 bg-slate-100 rounded text-sm overflow-x-auto">{testCase.output}</pre>
                                    </div>
                                    {testCase.explanation && (
                                      <div>
                                        <strong>Explanation:</strong>
                                        <p className="mt-1 text-sm text-slate-600">{testCase.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Show constraints if available */}
                            {(problem.timeLimit || problem.memoryLimit) && (
                              <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-3">Constraints:</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                  {problem.timeLimit && (
                                    <li>Time Limit: {problem.timeLimit}ms</li>
                                  )}
                                  {problem.memoryLimit && (
                                    <li>Memory Limit: {problem.memoryLimit}MB</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-500">
                            <p>Problem description is loading...</p>
                            <p className="mt-4">If you're seeing this message, there might be a database connectivity issue. Please check the server logs.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
              </div>

              {/* Right panel - Code editor */}
              <div className="bg-white rounded-br-lg shadow-sm border border-slate-200 flex flex-col">
                {/* Editor toolbar */}
                <div className="p-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="text-xs">
                      Editor Settings
                    </Button>
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const starterCode = problem.starterCode?.[language];
                        if (starterCode) {
                          setCode(starterCode as string);
                        } else {
                          setCode(getDefaultCode(language));
                        }
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Code editor area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className={`${showOutput ? 'h-2/3' : 'h-full'} overflow-hidden`}>
                    <CodeEditor 
                      language={language}
                      value={code}
                      onChange={setCode}
                    />
                  </div>

                  {/* Terminal output */}
                  {showOutput && (
                    <div className="h-1/3 border-t border-slate-200 bg-slate-900 text-green-400 font-mono text-sm overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-slate-700 bg-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Terminal Output</span>
                        <button 
                          onClick={() => setShowOutput(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{output}</pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit controls */}
                <div className="p-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center text-xs text-slate-500 space-x-3">
                    <span>Time Complexity: O(n)</span>
                    <span>Space Complexity: O(n)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleRun}
                      disabled={isRunning || isSubmitting}
                      className="flex items-center space-x-1"
                    >
                      {isRunning ? (
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full mr-1" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      <span>Run Code</span>
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting || isRunning}
                      className="flex items-center space-x-1"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full mr-1" />
                      ) : (
                        <Send className="h-4 w-4 mr-1" />
                      )}
                      <span>Submit</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}