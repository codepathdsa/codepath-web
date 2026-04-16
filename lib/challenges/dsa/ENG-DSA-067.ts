import type { Challenge } from '../types';

// ─── ENG-DSA-067 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-067',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Build Order Execution (Topological Sort)',
        companies: ['GitHub', 'Atlassian'],
        timeEst: '~40 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Graphs', 'Topological Sort', 'BFS'],
        nextChallengeId: 'ENG-DSA-068',
        realWorldContext: `GitHub Actions and other CI/CD runners must execute jobs in the correct order based on "needs" dependencies. Unlike just checking if a build is possible (cycle detection), the engine must produce the exact sequence of jobs to pass to the worker nodes.`,
        desc: 'Given an integer `num_jobs` and an array of `dependencies` where `[a, b]` means job `a` depends on job `b` finishing first, return the exact order jobs should be executed. If there is a cycle, return an empty array.',
        whyItMatters: `This is "Course Schedule II". While cycle detection (DFS/Coloring) just returns a boolean, Kahn's Algorithm (BFS) naturally yields the topological ordering of the graph. This is the exact algorithm package managers (npm, pip) use to install dependencies.`,
        approach: `Count the "in-degree" (number of prerequisites) for every job. Put all jobs with 0 in-degree into a queue (they are ready to run). Pop a job, add it to the execution order, and decrement the in-degree of all jobs that depend on it. If a dependent job reaches 0 in-degree, push it to the queue. If the final order length equals num_jobs, return it. Otherwise, a cycle exists.`,
        solution: 'Use Kahn\'s Algorithm. Build an adjacency list and in-degree array. Queue nodes with 0 in-degree. Pop, append to result, decrement neighbors. Return result if it contains all nodes, else [].',
        walkthrough: [
            "num_jobs=4, deps=[[1,0], [2,0], [3,1], [3,2]]",
            "In-degrees: 0:0, 1:1, 2:1, 3:2. Queue=[0]",
            "Pop 0. Result=[0]. Decrement 1 and 2. In-degrees: 1:0, 2:0. Queue=[1, 2]",
            "Pop 1. Result=[0, 1]. Decrement 3. In-degree 3:1. Queue=[2]",
            "Pop 2. Result=[0, 1, 2]. Decrement 3. In-degree 3:0. Queue=[3]",
            "Pop 3. Result=[0, 1, 2, 3]. Queue empty.",
            "Len(Result) == 4. Return [0, 1, 2, 3] ✓"
        ],
        hints: [
            'Create an array `in_degree` of size `num_jobs` initialized to 0.',
            'Create an adjacency list `graph` mapping `prereq -> list of dependent jobs`.',
            'Use a queue to process all jobs that currently have 0 prerequisites.'
        ],
        complexity: { time: 'O(V + E)', space: 'O(V + E)' },
        starterCode: `from collections import deque, defaultdict

def find_execution_order(num_jobs: int, dependencies: list[list[int]]) -> list[int]:
    """
    dependencies: [dependent_job, prerequisite_job]
    Returns an array of the job execution order.
    Returns[] if impossible due to cycles.
    """
    adj = defaultdict(list)
    in_degree = [0] * num_jobs
    
    for job, prereq in dependencies:
        adj[prereq].append(job)
        in_degree[job] += 1
        
    queue = deque([i for i in range(num_jobs) if in_degree[i] == 0])
    order =[]
    
    while queue:
        current = queue.popleft()
        order.append(current)
        
        for neighbor in adj[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    if len(order) == num_jobs:
        return order
    return []
`,
        testCases: [
            { id: 'tc1', description: 'Linear dependency', input: 'num_jobs=2, deps=[[1,0]]', expected: '[0, 1]' },
            { id: 'tc2', description: 'Fork and join', input: 'num_jobs=4, deps=[[1,0],[2,0],[3,1],[3,2]]', expected: '[0, 1, 2, 3] or [0, 2, 1, 3]' },
            { id: 'tc3', description: 'Impossible cycle', input: 'num_jobs=2, deps=[[1,0],[0,1]]', expected: '[]' },
            { id: 'tc4', description: 'No dependencies', input: 'num_jobs=3, deps=[]', expected: '[0, 1, 2]' },
            { id: 'tc5', description: 'Disconnected components', input: 'num_jobs=4, deps=[[1,0],[3,2]]', expected: '[0, 2, 1, 3] (any valid topological order)' },
        ],
    };

export default challenge;
