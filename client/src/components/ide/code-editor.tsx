import { useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { EDITOR_OPTIONS } from "@/lib/monaco";
import { Skeleton } from "@/components/ui/skeleton";

type CodeEditorProps = {
  language: string;
  value: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
  height?: string;
};

export default function CodeEditor({
  language,
  value,
  onChange,
  readOnly = false,
  height = "100%",
}: CodeEditorProps) {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor) => {
    setIsEditorReady(true);
    
    // Focus the editor
    editor.focus();
    
    // Add custom command for running code with Ctrl+Enter
    editor.addCommand(
      // Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.Enter
      2048 | 3, // KeyMod.CtrlCmd | KeyCode.Enter
      () => {
        const event = new CustomEvent("run-code", { detail: editor.getValue() });
        window.dispatchEvent(event);
      }
    );
  };

  // Update editor when language changes
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return (
    <div className="h-full w-full overflow-hidden rounded code-editor">
      {!isEditorReady && (
        <div className="h-full w-full p-4 bg-gray-50">
          <div className="flex">
            <Skeleton className="w-10 h-full bg-gray-200" />
            <div className="flex-1 space-y-2 pl-4">
              <Skeleton className="h-4 w-3/4 bg-gray-200" />
              <Skeleton className="h-4 w-1/2 bg-gray-200" />
              <Skeleton className="h-4 w-5/6 bg-gray-200" />
              <Skeleton className="h-4 w-2/3 bg-gray-200" />
            </div>
          </div>
        </div>
      )}

      {isMounted && (
        <Editor
          height={height}
          language={language}
          value={value}
          options={{
            ...EDITOR_OPTIONS,
            readOnly,
          }}
          onChange={(value) => onChange(value || "")}
          onMount={handleEditorDidMount}
          loading={<span className="text-sm text-slate-500">Loading editor...</span>}
          theme="vs-light"
        />
      )}
    </div>
  );
}
