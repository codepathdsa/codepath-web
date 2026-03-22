export const ROADMAP = [
  { id:'l1', level:1, name:'Foundations', desc:'Weeks 1–2 · Build your problem-solving instincts', checkpoint:'No prerequisites. Start here.', topics:[
    { id:'time-complexity', icon:'⏱', name:'Time & Space Complexity', articles:6, problems:15, difficulty:'easy', desc:'Big-O notation, best/worst/average case', problems_list:[
      {num:'—',name:'Analyze Sorting Algorithms',diff:'E',slug:'analyze-sorting'},
      {num:'—',name:'Count Operations in Loop',diff:'E',slug:'count-ops'},
      {num:'—',name:'Recursive Complexity',diff:'M',slug:'recursive-complexity'},
    ]},
    { id:'arrays', icon:'📐', name:'Arrays & Hashing', articles:12, problems:44, difficulty:'easy', desc:'The foundation of everything. Master before moving on.', problems_list:[
      {num:'1',name:'Two Sum',diff:'E',slug:'two-sum'},
      {num:'217',name:'Contains Duplicate',diff:'E',slug:'contains-duplicate'},
      {num:'238',name:'Product of Array Except Self',diff:'M',slug:'product-except-self'},
      {num:'49',name:'Group Anagrams',diff:'M',slug:'group-anagrams'},
      {num:'347',name:'Top K Frequent Elements',diff:'M',slug:'top-k-frequent'},
      {num:'128',name:'Longest Consecutive Sequence',diff:'M',slug:'longest-consecutive'},
    ]},
  ]},
  { id:'l2', level:2, name:'Pointers & Windows', desc:'Weeks 2–3 · Linear scan patterns', checkpoint:'Solve 80% of Level 1 before continuing.', topics:[
    { id:'two-pointers', icon:'⇔️', name:'Two Pointers', articles:8, problems:22, difficulty:'easy', desc:'Shrink/expand pattern. Eliminates one loop.', problems_list:[
      {num:'125',name:'Valid Palindrome',diff:'E',slug:'valid-palindrome'},
      {num:'15',name:'3Sum',diff:'M',slug:'3sum'},
      {num:'11',name:'Container With Most Water',diff:'M',slug:'container-with-most-water'},
      {num:'42',name:'Trapping Rain Water',diff:'H',slug:'trapping-rain-water'},
    ]},
    { id:'sliding-window', icon:'🪟', name:'Sliding Window', articles:7, problems:18, difficulty:'medium', desc:'Maintain a window of elements.', problems_list:[
      {num:'121',name:'Best Time to Buy and Sell Stock',diff:'E',slug:'best-time-to-buy-stock'},
      {num:'3',name:'Longest Substring Without Repeating',diff:'M',slug:'longest-substring-without-repeating'},
      {num:'424',name:'Longest Repeating Character Replacement',diff:'M',slug:'longest-repeating-char-replacement'},
      {num:'76',name:'Minimum Window Substring',diff:'H',slug:'minimum-window-substring'},
    ]},
    { id:'stack', icon:'📚', name:'Stack', articles:8, problems:24, difficulty:'easy', desc:'LIFO structure. Invaluable for matching and parsing.', problems_list:[
      {num:'20',name:'Valid Parentheses',diff:'E',slug:'valid-parentheses'},
      {num:'155',name:'Min Stack',diff:'M',slug:'min-stack'},
      {num:'739',name:'Daily Temperatures',diff:'M',slug:'daily-temperatures'},
      {num:'84',name:'Largest Rectangle in Histogram',diff:'H',slug:'largest-rectangle-histogram'},
    ]},
  ]},
  { id:'l3', level:3, name:'Binary Search & Math', desc:'Weeks 3–4 · Halve your search space', checkpoint:'Be comfortable with Two Pointers before here.', topics:[
    { id:'binary-search', icon:'🔍', name:'Binary Search', articles:9, problems:24, difficulty:'medium', desc:'Not just sorted arrays — apply to any monotonic function.', problems_list:[
      {num:'704',name:'Binary Search',diff:'E',slug:'binary-search'},
      {num:'74',name:'Search a 2D Matrix',diff:'M',slug:'search-2d-matrix'},
      {num:'875',name:'Koko Eating Bananas',diff:'M',slug:'koko-eating-bananas'},
      {num:'33',name:'Search in Rotated Sorted Array',diff:'M',slug:'search-rotated-array'},
      {num:'4',name:'Median of Two Sorted Arrays',diff:'H',slug:'median-two-sorted-arrays'},
    ]},
    { id:'bit-manipulation', icon:'⚙️', name:'Bit Manipulation', articles:5, problems:11, difficulty:'medium', desc:'XOR tricks, bit masking, power-of-2 checks.', problems_list:[
      {num:'136',name:'Single Number',diff:'E',slug:'single-number'},
      {num:'191',name:'Number of 1 Bits',diff:'E',slug:'number-of-1-bits'},
      {num:'338',name:'Counting Bits',diff:'E',slug:'counting-bits'},
      {num:'371',name:'Sum of Two Integers',diff:'M',slug:'sum-two-integers'},
    ]},
  ]},
  { id:'l4', level:4, name:'Linked Lists', desc:'Week 5 · Pointer manipulation mastery', checkpoint:'Two pointers should feel natural by now.', topics:[
    { id:'linked-list', icon:'🔗', name:'Linked Lists', articles:10, problems:31, difficulty:'medium', desc:'Reverse, detect cycles, merge — O(1) space tricks.', problems_list:[
      {num:'206',name:'Reverse Linked List',diff:'E',slug:'reverse-linked-list'},
      {num:'21',name:'Merge Two Sorted Lists',diff:'E',slug:'merge-two-sorted-lists'},
      {num:'141',name:'Linked List Cycle',diff:'E',slug:'linked-list-cycle'},
      {num:'143',name:'Reorder List',diff:'M',slug:'reorder-list'},
      {num:'19',name:'Remove Nth Node From End of List',diff:'M',slug:'remove-nth-node'},
      {num:'146',name:'LRU Cache',diff:'M',slug:'lru-cache'},
      {num:'25',name:'Reverse Nodes in k-Group',diff:'H',slug:'reverse-nodes-k-group'},
    ]},
  ]},
  { id:'l5', level:5, name:'Trees', desc:'Weeks 6–7 · Recursive thinking unlocked', checkpoint:'You must be comfortable with recursion.', topics:[
    { id:'binary-trees', icon:'🌳', name:'Binary Trees', articles:12, problems:45, difficulty:'medium', desc:'DFS (pre/in/post-order) and BFS traversals.', problems_list:[
      {num:'226',name:'Invert Binary Tree',diff:'E',slug:'invert-binary-tree'},
      {num:'104',name:'Maximum Depth of Binary Tree',diff:'E',slug:'max-depth-binary-tree'},
      {num:'543',name:'Diameter of Binary Tree',diff:'E',slug:'diameter-binary-tree'},
      {num:'102',name:'Binary Tree Level Order Traversal',diff:'M',slug:'level-order-traversal'},
      {num:'235',name:'Lowest Common Ancestor of BST',diff:'M',slug:'lca-bst'},
      {num:'124',name:'Binary Tree Maximum Path Sum',diff:'H',slug:'binary-tree-max-path-sum'},
    ]},
    { id:'heap', icon:'⛏️', name:'Heap / Priority Queue', articles:6, problems:20, difficulty:'medium', desc:'Top K problems. Min-heap and max-heap.', problems_list:[
      {num:'703',name:'Kth Largest Element in a Stream',diff:'E',slug:'kth-largest-stream'},
      {num:'215',name:'Kth Largest Element in Array',diff:'M',slug:'kth-largest-array'},
      {num:'295',name:'Find Median from Data Stream',diff:'H',slug:'find-median-data-stream'},
    ]},
    { id:'tries', icon:'🔤', name:'Tries', articles:4, problems:12, difficulty:'medium', desc:'Prefix trees. Indispensable for autocomplete.', problems_list:[
      {num:'208',name:'Implement Trie',diff:'M',slug:'implement-trie'},
      {num:'211',name:'Design Add and Search Words DS',diff:'M',slug:'add-search-words'},
      {num:'212',name:'Word Search II',diff:'H',slug:'word-search-ii'},
    ]},
  ]},
  { id:'l6', level:6, name:'Graphs', desc:'Weeks 8–9 · The most versatile data structure', checkpoint:'Tree DFS/BFS must be solid. Graphs generalise trees.', topics:[
    { id:'graphs', icon:'🗺️', name:'Graphs — BFS & DFS', articles:10, problems:32, difficulty:'medium', desc:'BFS for shortest path, DFS for connectivity.', problems_list:[
      {num:'200',name:'Number of Islands',diff:'M',slug:'number-of-islands'},
      {num:'133',name:'Clone Graph',diff:'M',slug:'clone-graph'},
      {num:'207',name:'Course Schedule',diff:'M',slug:'course-schedule'},
      {num:'323',name:'Number of Connected Components',diff:'M',slug:'connected-components'},
      {num:'127',name:'Word Ladder',diff:'H',slug:'word-ladder'},
    ]},
    { id:'backtracking', icon:'🔄', name:'Backtracking', articles:7, problems:22, difficulty:'hard', desc:'Explore all possibilities, prune early.', problems_list:[
      {num:'78',name:'Subsets',diff:'M',slug:'subsets'},
      {num:'39',name:'Combination Sum',diff:'M',slug:'combination-sum'},
      {num:'46',name:'Permutations',diff:'M',slug:'permutations'},
      {num:'79',name:'Word Search',diff:'M',slug:'word-search'},
      {num:'51',name:'N-Queens',diff:'H',slug:'n-queens'},
    ]},
  ]},
  { id:'l7', level:7, name:'Dynamic Programming', desc:'Weeks 10–12 · The hardest, most rewarding topic', checkpoint:'Be solid on recursion and backtracking first.', topics:[
    { id:'dp-1d', icon:'🧩', name:'DP — 1D Problems', articles:8, problems:28, difficulty:'medium', desc:'Fibonacci variants, house robber, climbing stairs.', problems_list:[
      {num:'70',name:'Climbing Stairs',diff:'E',slug:'climbing-stairs'},
      {num:'198',name:'House Robber',diff:'M',slug:'house-robber'},
      {num:'5',name:'Longest Palindromic Substring',diff:'M',slug:'longest-palindromic-substring'},
      {num:'322',name:'Coin Change',diff:'M',slug:'coin-change'},
      {num:'300',name:'Longest Increasing Subsequence',diff:'M',slug:'longest-increasing-subsequence'},
    ]},
    { id:'dp-2d', icon:'🧠', name:'DP — 2D Problems', articles:9, problems:22, difficulty:'hard', desc:'Grid DP, edit distance, knapsack. The hard tier.', problems_list:[
      {num:'62',name:'Unique Paths',diff:'M',slug:'unique-paths'},
      {num:'1143',name:'Longest Common Subsequence',diff:'M',slug:'longest-common-subsequence'},
      {num:'72',name:'Edit Distance',diff:'H',slug:'edit-distance'},
      {num:'312',name:'Burst Balloons',diff:'H',slug:'burst-balloons'},
    ]},
  ]},
  { id:'l8', level:8, name:'Interview Sprint', desc:'Weeks 13–16 · Final prep — revision + CS fundamentals', checkpoint:'All previous levels at 70%+ before sprinting.', topics:[
    { id:'greedy', icon:'⚡', name:'Greedy', articles:5, problems:14, difficulty:'medium', desc:'Make the locally optimal choice.', problems_list:[
      {num:'53',name:"Maximum Subarray (Kadane's)",diff:'M',slug:'maximum-subarray'},
      {num:'55',name:'Jump Game',diff:'M',slug:'jump-game'},
      {num:'134',name:'Gas Station',diff:'M',slug:'gas-station'},
    ]},
    { id:'intervals', icon:'📏', name:'Intervals', articles:4, problems:12, difficulty:'medium', desc:'Sort by start, sweep line, merge overlaps.', problems_list:[
      {num:'57',name:'Insert Interval',diff:'M',slug:'insert-interval'},
      {num:'56',name:'Merge Intervals',diff:'M',slug:'merge-intervals'},
      {num:'435',name:'Non-overlapping Intervals',diff:'M',slug:'non-overlapping-intervals'},
    ]},
    { id:'cs-fundamentals', icon:'🖥️', name:'CS Fundamentals', articles:20, problems:0, difficulty:'easy', desc:'OS, DBMS, CN, OOPs — the non-DSA interviews.', problems_list:[
      {num:'—',name:'OS: Processes, Threads, Scheduling',diff:'E',slug:'os-fundamentals'},
      {num:'—',name:'DBMS: Normalisation, Indexing, ACID',diff:'E',slug:'dbms-fundamentals'},
      {num:'—',name:'CN: TCP/IP, DNS, HTTP',diff:'E',slug:'cn-fundamentals'},
      {num:'—',name:'OOPs: SOLID, Design Patterns',diff:'M',slug:'oops-fundamentals'},
    ]},
  ]},
];

export const ROADMAP_SD = [
  { id: 'sd-l1', level: 1, name: 'System Design Foundations', desc: 'Weeks 1–4 · Core distributed systems concepts', checkpoint: 'Start here.', topics: [
    { id: 'system-design-core', icon: '🏗️', name: 'System Design', articles: 15, problems: 10, difficulty: 'hard', desc: 'Architecting scalable distributed systems.', problems_list: [
      {num:'—',name:'Design a URL Shortener',diff:'M',slug:'url-shortener'},
    ]},
  ]},
];

export const PATTERN_LIBRARY = [...ROADMAP, ...ROADMAP_SD]
  .flatMap(lvl => lvl.topics)
  .sort((a, b) => a.name.localeCompare(b.name));

