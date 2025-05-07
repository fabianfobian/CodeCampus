import { loader } from '@monaco-editor/react';

// Load Monaco globally
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/min/vs'
  }
});

// Define supported languages
export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'ruby', name: 'Ruby', extension: 'rb' },
];

// Common editor options
export const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontFamily: '"Fira Code", monospace',
  fontSize: 14,
  lineNumbersMinChars: 3,
  fontLigatures: true,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on',
  padding: { top: 10 },
};

// Default code templates for each language
export const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
}`,
  python: `class Solution:
    def twoSum(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: List[int]
        """
        # Your code here`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
    }
};`,
  csharp: `public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        // Your code here
    }
}`,
  go: `func twoSum(nums []int, target int) []int {
    // Your code here
}`,
  ruby: `# @param {Integer[]} nums
# @param {Integer} target
# @return {Integer[]}
def two_sum(nums, target)
    # Your code here
end`,
};

// Helper to get language data by ID
export function getLanguageById(id: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.id === id);
}

// Helper to get language data by name
export function getLanguageByName(name: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.name.toLowerCase() === name.toLowerCase());
}

// Helper to get default code for a language
export function getDefaultCode(languageId: string) {
  return DEFAULT_CODE_TEMPLATES[languageId] || '// Start coding here';
}
