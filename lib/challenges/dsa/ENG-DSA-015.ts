import type { Challenge } from '../types';

// ─── ENG-DSA-015 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-015',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Microservice Blast Radius (Graph BFS)',
        companies: ['Netflix', 'Uber'],
        timeEst: '~35 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Graphs', 'BFS', 'Hash Map'],
        nextChallengeId: 'ENG-DSA-016',
        realWorldContext: `Netflix's chaos engineering team uses blast radius analysis before running Chaos Monkey experiments. Before intentionally taking down a service, they need to know exactly which downstream services will be affected. This prevents accidental customer impact. The analysis runs as a BFS through the service dependency graph.`,
        desc: 'A critical vulnerability was found in the "Auth" microservice. We have a graph representing which microservices depend on which others. Calculate the total number of services affected (the blast radius) if "Auth" goes down.',
        whyItMatters: `BFS (Breadth-First Search) is the correct algorithm for "find all reachable nodes" and "shortest path in unweighted graph" problems. Blast radius analysis, social network "degrees of separation," web crawling, and network routing all use BFS. The visited set is non-optional — microservice graphs frequently have circular dependencies.`,
        approach: `Model the system as a directed graph where an edge A→B means "A depends on B." When B fails, all of A's users lose functionality — so we need to traverse the REVERSE edges (B→A). Build an adjacency list of dependency→dependents. BFS from the failed service, adding all reachable dependents. The visited set prevents infinite loops in circular dependency graphs.`,
        solution: 'This is a Graph traversal problem. Build an adjacency list representing the dependencies. Use Breadth-First Search (BFS) starting from the compromised service. Maintain a `visited` set to avoid infinite loops from circular dependencies. Return the size of the visited set.',
        walkthrough: [
            "deps=[('Cart','Auth'),('Order','Cart'),('Notif','Auth')], compromised='Auth'",
            "Build graph: Auth→[Cart, Notif], Cart→[Order]",
            "BFS: queue=['Auth'], visited={'Auth'}",
            "Process 'Auth': neighbors=[Cart, Notif]. Add both. queue=['Cart','Notif'], visited={'Auth','Cart','Notif'}",
            "Process 'Cart': neighbors=[Order]. Add. queue=['Notif','Order'], visited={'Auth','Cart','Notif','Order'}",
            "Process 'Notif': no unvisited neighbors. Process 'Order': no neighbors.",
            "Return len(visited) = 4 ✓"
        ],
        hints: [
            'If A depends on B, and B depends on C, then if C fails, A and B both fail.',
            'Use a queue (deque) to perform Breadth-First Search. Start by pushing the compromised service onto the queue.',
            'Microservices often have circular dependencies (A -> B -> A). You MUST use a `visited` Set to avoid infinite loops.'
        ],
        complexity: { time: 'O(V + E)', space: 'O(V)' },
        starterCode: `from collections import deque, defaultdict

def calculate_blast_radius(dependencies: list[tuple[str, str]], compromised_svc: str) -> int:
    """
    dependencies: list of (Dependent, Dependency) pairs. 
                  e.g., ("Cart", "Auth") means Cart depends on Auth.
    Returns the total number of services affected, including the compromised one.
    
    Example:[("Cart","Auth"),("Order","Cart")], compromised="Auth" → 3
    """
    # Build adjacency list: Dependency → [List of Dependents]
    graph = defaultdict(list)
    for dependent, dependency in dependencies:
        graph[dependency].append(dependent)
        
    # BFS from compromised service
    queue = deque([compromised_svc])
    visited = {compromised_svc}
    
    while queue:
        current = queue.popleft()
        for dependent in graph[current]:
            if dependent not in visited:
                visited.add(dependent)
                queue.append(dependent)
                
    return len(visited)
`,
        testCases: [
            { id: 'tc1', description: 'Linear cascade', input: 'deps=[("A","B"),("B","C")], compromised="C"', expected: '3 (C affects B, B affects A)' },
            { id: 'tc2', description: 'No dependents', input: 'deps=[("A","B"),("C","D")], compromised="A"', expected: '1 (Only A)' },
            { id: 'tc3', description: 'Circular dependencies', input: 'deps=[("A","B"),("B","A")], compromised="A"', expected: '2' },
            { id: 'tc4', description: 'Hub and spoke', input: 'deps=[("A","Auth"),("B","Auth"),("C","Auth")], compromised="Auth"', expected: '4' },
            { id: 'tc5', description: 'Service not in graph', input: 'deps=[("A","B")], compromised="X"', expected: '1 (Just X itself)' },
        ],
    };

export default challenge;
