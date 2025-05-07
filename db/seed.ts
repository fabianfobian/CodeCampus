import { db } from "./index";
import { 
  users, 
  problems, 
  problemTags, 
  problemToTag, 
  userStats, 
  userSkills, 
  submissions, 
  competitions,
  competitionProblems,
  userCompetitions
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// Use Node.js built-in crypto for password hashing
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Beginning database seeding...");

    // Check if we already have data to avoid duplicates
    const existingUsers = await db.query.users.findMany();
    if (existingUsers.length > 0) {
      console.log("Database already contains users, skipping seeding to avoid duplicates.");
      return;
    }

    // 1. Create problem tags
    console.log("Creating problem tags...");
    const tagData = [
      { name: "Arrays", description: "Problems involving array manipulation and traversal" },
      { name: "Strings", description: "String manipulation and parsing problems" },
      { name: "Hash Table", description: "Problems involving hash maps or dictionaries" },
      { name: "Dynamic Programming", description: "Problems using dynamic programming techniques" },
      { name: "Math", description: "Mathematical problems and number theory" },
      { name: "Sorting", description: "Problems involving sorting algorithms" },
      { name: "Greedy", description: "Problems using greedy algorithms" },
      { name: "Depth-First Search", description: "Graph traversal using DFS" },
      { name: "Breadth-First Search", description: "Graph traversal using BFS" },
      { name: "Binary Search", description: "Problems using binary search algorithm" },
      { name: "Tree", description: "Problems involving tree data structures" },
      { name: "Linked List", description: "Problems with linked list data structures" },
      { name: "Recursion", description: "Problems with recursive solutions" },
      { name: "Graph", description: "Problems involving graph theory" },
      { name: "Heap", description: "Problems using heap data structures" }
    ];

    const createdTags = await db.insert(problemTags).values(tagData).returning();
    console.log(`Created ${createdTags.length} problem tags`);

    // 2. Create users
    console.log("Creating users...");
    const userData = [
      { 
        username: "admin", 
        email: "admin@codelearn.com", 
        password: await hashPassword("admin123"), 
        displayName: "Admin User", 
        role: "super_admin" 
      },
      { 
        username: "examiner", 
        email: "examiner@codelearn.com", 
        password: await hashPassword("examiner123"), 
        displayName: "Examiner User", 
        role: "examiner" 
      },
      { 
        username: "john_doe", 
        email: "john@example.com", 
        password: await hashPassword("password123"), 
        displayName: "John Doe", 
        role: "learner" 
      },
      { 
        username: "jane_smith", 
        email: "jane@example.com", 
        password: await hashPassword("password123"), 
        displayName: "Jane Smith", 
        role: "learner" 
      },
      { 
        username: "robert_johnson", 
        email: "robert@example.com", 
        password: await hashPassword("password123"), 
        displayName: "Robert Johnson", 
        role: "learner" 
      }
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`Created ${createdUsers.length} users`);

    // 3. Create user stats for each user
    console.log("Creating user stats...");
    const userStatsData = createdUsers.map((user, index) => {
      // Create more impressive stats for the learner users
      if (user.role === "learner") {
        const rank = index - 1; // Skip admins in the ranking
        return {
          userId: user.id,
          problemsSolved: 50 + Math.floor(Math.random() * 100),
          easySolved: 20 + Math.floor(Math.random() * 30),
          mediumSolved: 15 + Math.floor(Math.random() * 20),
          hardSolved: 5 + Math.floor(Math.random() * 10),
          currentStreak: Math.floor(Math.random() * 14),
          longestStreak: 10 + Math.floor(Math.random() * 20),
          totalSubmissions: 100 + Math.floor(Math.random() * 200),
          acceptedSubmissions: 70 + Math.floor(Math.random() * 100),
          ranking: rank > 0 ? rank : null,
          lastActivityDate: new Date()
        };
      }
      return {
        userId: user.id,
        problemsSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        ranking: null,
        lastActivityDate: new Date()
      };
    });

    await db.insert(userStats).values(userStatsData);
    console.log(`Created stats for ${userStatsData.length} users`);

    // 4. Create problems
    console.log("Creating problems...");
    const problemsData = [
      {
        title: "Two Sum",
        description: `
          <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
          <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
          <p>You can return the answer in any order.</p>
          
          <h3>Example 1:</h3>
          <pre><code>Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</code></pre>
          
          <h3>Example 2:</h3>
          <pre><code>Input: nums = [3,2,4], target = 6
Output: [1,2]</code></pre>
          
          <h3>Example 3:</h3>
          <pre><code>Input: nums = [3,3], target = 6
Output: [0,1]</code></pre>
          
          <h3>Constraints:</h3>
          <ul>
            <li><code>2 &lt;= nums.length &lt;= 10^4</code></li>
            <li><code>-10^9 &lt;= nums[i] &lt;= 10^9</code></li>
            <li><code>-10^9 &lt;= target &lt;= 10^9</code></li>
            <li><strong>Only one valid answer exists.</strong></li>
          </ul>
        `,
        difficulty: "easy",
        createdBy: createdUsers.find(u => u.role === "examiner")?.id,
        starterCode: {
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
}`
        },
        testCases: [
          {
            input: "[2,7,11,15]\n9",
            output: "[0,1]"
          },
          {
            input: "[3,2,4]\n6",
            output: "[1,2]"
          },
          {
            input: "[3,3]\n6",
            output: "[0,1]"
          }
        ],
        timeLimit: 1000,
        memoryLimit: 128,
        acceptanceRate: 47
      },
      {
        title: "Reverse String",
        description: `
          <p>Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.</p>
          <p>You must do this by modifying the input array <a href="https://en.wikipedia.org/wiki/In-place_algorithm">in-place</a> with <code>O(1)</code> extra memory.</p>
          
          <h3>Example 1:</h3>
          <pre><code>Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]</code></pre>
          
          <h3>Example 2:</h3>
          <pre><code>Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]</code></pre>
          
          <h3>Constraints:</h3>
          <ul>
            <li><code>1 <= s.length <= 10^5</code></li>
            <li><code>s[i]</code> is a <a href="https://en.wikipedia.org/wiki/ASCII#Printable_characters">printable ascii character</a>.</li>
          </ul>
        `,
        difficulty: "easy",
        createdBy: createdUsers.find(u => u.role === "examiner")?.id,
        starterCode: {
          javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
function reverseString(s) {
  // Your code here
}`,
          python: `class Solution:
    def reverseString(self, s):
        """
        :type s: List[str]
        :rtype: None Do not return anything, modify s in-place instead.
        """
        # Your code here`
        },
        testCases: [
          {
            input: '["h","e","l","l","o"]',
            output: '["o","l","l","e","h"]'
          },
          {
            input: '["H","a","n","n","a","h"]',
            output: '["h","a","n","n","a","H"]'
          }
        ],
        timeLimit: 1000,
        memoryLimit: 128,
        acceptanceRate: 73
      },
      {
        title: "Merge Intervals",
        description: `
          <p>Given an array of <code>intervals</code> where <code>intervals[i] = [start<sub>i</sub>, end<sub>i</sub>]</code>, merge all overlapping intervals, and return <em>an array of the non-overlapping intervals that cover all the intervals in the input</em>.</p>
          
          <h3>Example 1:</h3>
          <pre><code>Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].</code></pre>
          
          <h3>Example 2:</h3>
          <pre><code>Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]
Explanation: Intervals [1,4] and [4,5] are considered overlapping.</code></pre>
          
          <h3>Constraints:</h3>
          <ul>
            <li><code>1 <= intervals.length <= 10<sup>4</sup></code></li>
            <li><code>intervals[i].length == 2</code></li>
            <li><code>0 <= start<sub>i</sub> <= end<sub>i</sub> <= 10<sup>4</sup></code></li>
          </ul>
        `,
        difficulty: "medium",
        createdBy: createdUsers.find(u => u.role === "examiner")?.id,
        starterCode: {
          javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Your code here
}`,
          python: `class Solution:
    def merge(self, intervals):
        """
        :type intervals: List[List[int]]
        :rtype: List[List[int]]
        """
        # Your code here`
        },
        testCases: [
          {
            input: '[[1,3],[2,6],[8,10],[15,18]]',
            output: '[[1,6],[8,10],[15,18]]'
          },
          {
            input: '[[1,4],[4,5]]',
            output: '[[1,5]]'
          }
        ],
        timeLimit: 1000,
        memoryLimit: 128,
        acceptanceRate: 43
      },
      {
        title: "Valid Parentheses",
        description: `
          <p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>
          <p>An input string is valid if:</p>
          <ol>
            <li>Open brackets must be closed by the same type of brackets.</li>
            <li>Open brackets must be closed in the correct order.</li>
            <li>Every close bracket has a corresponding open bracket of the same type.</li>
          </ol>
          
          <h3>Example 1:</h3>
          <pre><code>Input: s = "()"
Output: true</code></pre>
          
          <h3>Example 2:</h3>
          <pre><code>Input: s = "()[]{}"
Output: true</code></pre>
          
          <h3>Example 3:</h3>
          <pre><code>Input: s = "(]"
Output: false</code></pre>
          
          <h3>Constraints:</h3>
          <ul>
            <li><code>1 <= s.length <= 10<sup>4</sup></code></li>
            <li><code>s</code> consists of parentheses only <code>'()[]{}'</code>.</li>
          </ul>
        `,
        difficulty: "easy",
        createdBy: createdUsers.find(u => u.role === "examiner")?.id,
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your code here
}`,
          python: `class Solution:
    def isValid(self, s):
        """
        :type s: str
        :rtype: bool
        """
        # Your code here`
        },
        testCases: [
          {
            input: '"()"',
            output: 'true'
          },
          {
            input: '"()[]{}"',
            output: 'true'
          },
          {
            input: '"(]"',
            output: 'false'
          }
        ],
        timeLimit: 1000,
        memoryLimit: 128,
        acceptanceRate: 39
      },
      {
        title: "LRU Cache",
        description: `
          <p>Design a data structure that follows the constraints of a <a href="https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU">Least Recently Used (LRU) cache</a>.</p>
          <p>Implement the <code>LRUCache</code> class:</p>
          <ul>
            <li><code>LRUCache(int capacity)</code> Initialize the LRU cache with <em>positive</em> size <code>capacity</code>.</li>
            <li><code>int get(int key)</code> Return the value of the <code>key</code> if the key exists, otherwise return <code>-1</code>.</li>
            <li><code>void put(int key, int value)</code> Update the value of the <code>key</code> if the <code>key</code> exists. Otherwise, add the <code>key-value</code> pair to the cache. If the number of keys exceeds the <code>capacity</code> from this operation, <strong>evict</strong> the least recently used key.</li>
          </ul>
          <p>The functions <code>get</code> and <code>put</code> must each run in <code>O(1)</code> average time complexity.</p>
          
          <h3>Example 1:</h3>
          <pre><code>Input
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
Output
[null, null, null, 1, null, -1, null, -1, 3, 4]

Explanation
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // cache is {1=1}
lRUCache.put(2, 2); // cache is {1=1, 2=2}
lRUCache.get(1);    // return 1
lRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}
lRUCache.get(2);    // returns -1 (not found)
lRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}
lRUCache.get(1);    // return -1 (not found)
lRUCache.get(3);    // return 3
lRUCache.get(4);    // return 4</code></pre>
          
          <h3>Constraints:</h3>
          <ul>
            <li><code>1 <= capacity <= 3000</code></li>
            <li><code>0 <= key <= 10<sup>4</sup></code></li>
            <li><code>0 <= value <= 10<sup>5</sup></code></li>
            <li>At most <code>2 * 10<sup>5</sup></code> calls will be made to <code>get</code> and <code>put</code>.</li>
          </ul>
        `,
        difficulty: "hard",
        createdBy: createdUsers.find(u => u.role === "examiner")?.id,
        starterCode: {
          javascript: `/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
  // Your code here
};

/** 
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function(key) {
  // Your code here
};

/** 
 * @param {number} key 
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function(key, value) {
  // Your code here
};`,
          python: `class LRUCache:
    def __init__(self, capacity: int):
        # Your code here

    def get(self, key: int) -> int:
        # Your code here

    def put(self, key: int, value: int) -> None:
        # Your code here`
        },
        testCases: [
          {
            input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]',
            output: '[null,null,null,1,null,-1,null,-1,3,4]'
          }
        ],
        timeLimit: 1000,
        memoryLimit: 128,
        acceptanceRate: 37
      },
    ];

    const createdProblems = await db.insert(problems).values(problemsData).returning();
    console.log(`Created ${createdProblems.length} problems`);

    // 5. Link problems to tags
    console.log("Linking problems to tags...");
    const problemTagLinks = [
      // Two Sum
      { problemId: createdProblems[0].id, tagId: createdTags.find(t => t.name === "Arrays")!.id },
      { problemId: createdProblems[0].id, tagId: createdTags.find(t => t.name === "Hash Table")!.id },
      // Reverse String
      { problemId: createdProblems[1].id, tagId: createdTags.find(t => t.name === "Strings")!.id },
      { problemId: createdProblems[1].id, tagId: createdTags.find(t => t.name === "Recursion")!.id },
      // Merge Intervals
      { problemId: createdProblems[2].id, tagId: createdTags.find(t => t.name === "Arrays")!.id },
      { problemId: createdProblems[2].id, tagId: createdTags.find(t => t.name === "Sorting")!.id },
      // Valid Parentheses
      { problemId: createdProblems[3].id, tagId: createdTags.find(t => t.name === "Strings")!.id },
      { problemId: createdProblems[3].id, tagId: createdTags.find(t => t.name === "Stack")?.id || createdTags[0].id },
      // LRU Cache
      { problemId: createdProblems[4].id, tagId: createdTags.find(t => t.name === "Hash Table")!.id },
      { problemId: createdProblems[4].id, tagId: createdTags.find(t => t.name === "Linked List")!.id },
    ];

    await db.insert(problemToTag).values(problemTagLinks);
    console.log(`Linked ${problemTagLinks.length} problem-tag associations`);

    // 6. Create submissions
    console.log("Creating sample submissions...");
    const learnerUsers = createdUsers.filter(u => u.role === "learner");
    
    const submissionData = [];
    const languageOptions = ["javascript", "python", "java", "cpp", "go"];
    const statusOptions = ["accepted", "wrong_answer", "time_limit_exceeded", "runtime_error"];
    
    for (const user of learnerUsers) {
      for (const problem of createdProblems) {
        // Create 1-3 submissions per user per problem
        const numSubmissions = 1 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numSubmissions; i++) {
          const isLastSubmission = i === numSubmissions - 1;
          const language = languageOptions[Math.floor(Math.random() * 3)]; // Mostly use the first 3 languages
          const status = isLastSubmission ? 
            (Math.random() > 0.3 ? "accepted" : statusOptions[1 + Math.floor(Math.random() * 3)]) : // 70% chance of success on last try
            statusOptions[Math.floor(Math.random() * statusOptions.length)]; // Random status for earlier tries
          
          const runTime = status === "time_limit_exceeded" ? 
            problem.timeLimit + Math.floor(Math.random() * 500) : // Exceed time limit
            Math.floor(Math.random() * (problem.timeLimit - 100)) + 50; // Under time limit
          
          const memory = Math.floor(Math.random() * 100) + 50; // 50-150 MB
          
          submissionData.push({
            userId: user.id,
            problemId: problem.id,
            language,
            code: `// This is a sample submission for problem ${problem.title}`,
            status,
            runTime: status === "compilation_error" ? null : runTime,
            memory: status === "compilation_error" ? null : memory,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in last 30 days
          });
        }
      }
    }

    await db.insert(submissions).values(submissionData);
    console.log(`Created ${submissionData.length} submissions`);

    // 7. Create competitions
    console.log("Creating competitions...");
    const now = new Date();
    
    const competitionsData = [
      {
        title: "Weekly Challenge #42",
        description: "Solve three algorithmic problems in a limited time window",
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
        createdBy: createdUsers.find(u => u.role === "examiner")?.id
      },
      {
        title: "Dynamic Programming Deep Dive",
        description: "Test your DP skills with these challenging problems",
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
        createdBy: createdUsers.find(u => u.role === "examiner")?.id
      },
      {
        title: "Beginner's Coding Contest",
        description: "A friendly competition for newcomers to algorithmic problem solving",
        startTime: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        endTime: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
        createdBy: createdUsers.find(u => u.role === "admin")?.id
      }
    ];

    const createdCompetitions = await db.insert(competitions).values(competitionsData).returning();
    console.log(`Created ${createdCompetitions.length} competitions`);

    // 8. Add problems to competitions
    console.log("Adding problems to competitions...");
    const competitionProblemData = [
      // Weekly Challenge
      { competitionId: createdCompetitions[0].id, problemId: createdProblems[0].id, points: 100 },
      { competitionId: createdCompetitions[0].id, problemId: createdProblems[2].id, points: 200 },
      { competitionId: createdCompetitions[0].id, problemId: createdProblems[4].id, points: 300 },
      
      // DP Deep Dive
      { competitionId: createdCompetitions[1].id, problemId: createdProblems[2].id, points: 100 },
      { competitionId: createdCompetitions[1].id, problemId: createdProblems[4].id, points: 300 },
      
      // Beginner's Coding Contest
      { competitionId: createdCompetitions[2].id, problemId: createdProblems[0].id, points: 50 },
      { competitionId: createdCompetitions[2].id, problemId: createdProblems[1].id, points: 50 },
      { competitionId: createdCompetitions[2].id, problemId: createdProblems[3].id, points: 100 }
    ];

    await db.insert(competitionProblems).values(competitionProblemData);
    console.log(`Added ${competitionProblemData.length} problems to competitions`);

    // 9. Register users for competitions and add scores for past competition
    console.log("Registering users for competitions...");
    const userCompetitionData = [];
    
    // Register all learners for all competitions
    for (const user of learnerUsers) {
      for (const competition of createdCompetitions) {
        let score = 0;
        let rank = null;
        
        // If competition is in the past, assign a score and rank
        if (new Date(competition.endTime) < now) {
          // Determine the problems in this competition
          const competitionProbs = competitionProblemData.filter(cp => cp.competitionId === competition.id);
          
          // For each problem, 70% chance of solving it
          for (const cp of competitionProbs) {
            if (Math.random() < 0.7) {
              score += cp.points;
            }
          }
          
          // Random rank between 1 and 200
          rank = 1 + Math.floor(Math.random() * 200);
        }
        
        userCompetitionData.push({
          userId: user.id,
          competitionId: competition.id,
          score,
          rank,
          joinedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) // Random date in last week
        });
      }
    }

    await db.insert(userCompetitions).values(userCompetitionData);
    console.log(`Registered ${userCompetitionData.length} user-competition pairs`);

    // 10. Add user skills
    console.log("Adding user skills...");
    const userSkillsData = [];
    
    for (const user of learnerUsers) {
      for (const tag of createdTags) {
        // 60% chance of having a skill entry for each tag
        if (Math.random() < 0.6) {
          userSkillsData.push({
            userId: user.id,
            tagId: tag.id,
            proficiency: 20 + Math.floor(Math.random() * 80), // 20-100 proficiency
            updatedAt: new Date()
          });
        }
      }
    }

    await db.insert(userSkills).values(userSkillsData);
    console.log(`Added ${userSkillsData.length} user skills`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
