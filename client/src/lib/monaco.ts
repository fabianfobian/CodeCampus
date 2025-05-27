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
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'c', name: 'C', extension: 'c' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs' },
  { id: 'ruby', name: 'Ruby', extension: 'rb' },
  { id: 'php', name: 'PHP', extension: 'php' },
  { id: 'swift', name: 'Swift', extension: 'swift' },
  { id: 'kotlin', name: 'Kotlin', extension: 'kt' },
  { id: 'dart', name: 'Dart', extension: 'dart' },
  { id: 'scala', name: 'Scala', extension: 'scala' },
  { id: 'perl', name: 'Perl', extension: 'pl' },
  { id: 'objective-c', name: 'Objective-C', extension: 'm' },
  { id: 'fsharp', name: 'F#', extension: 'fs' },
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
  typescript: `function solution(): any {
    // Write your code here
    return null;
}

console.log(solution());`,
  c: `#include <stdio.h>

int main() {
    // Write your code here
    return 0;
}`,
  rust: `fn main() {
    // Write your code here
}`,
  php: `<?php
// Write your code here
echo "Hello, World!";
?>`,
  swift: `import Foundation

// Write your code here
print("Hello, World!")`,
  kotlin: `fun main() {
    // Write your code here
    println("Hello, World!")
}`,
  dart: `void main() {
    // Write your code here
    print('Hello, World!');
}`,
  scala: `object Main {
    def main(args: Array[String]): Unit = {
        // Write your code here
        println("Hello, World!")
    }
}`,
  perl: `#!/usr/bin/perl
use strict;
use warnings;

# Write your code here
print "Hello, World!\\n";`,
  'objective-c': `#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // Write your code here
        NSLog(@"Hello, World!");
    }
    return 0;
}`,
  fsharp: `// Write your code here
printfn "Hello, World!"`
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