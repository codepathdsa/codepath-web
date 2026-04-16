import type { Challenge } from '../types';

// ─── ENG-DSA-076 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-DSA-076',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Market Trend Analysis (Monotonic Stack)',
                    companies: ['Bloomberg', 'Coinbase'],
                        timeEst: '~35 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Stack', 'Monotonic Stack', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-077',
                                            realWorldContext: `In quantitative trading platforms, analysts visualize historical stock data to see "how long would I have had to hold this asset before I made a profit?" Calculating the exact distance to the next greater price for millions of data points must happen in O(N) time.`,
                                                desc: 'Given an array of integers `temperatures` (or asset prices), return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`th day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0`.',
                                                    whyItMatters: `This introduces the "Monotonic Stack" (a stack that maintains a strictly increasing or decreasing order). It is specifically used for "Next Greater Element" problems. Instead of an O(N^2) double-loop, elements wait inside the stack until their "next greater element" arrives to pop them out.`,
                                                        approach: `Iterate through the array. Keep a stack of indices. While the stack is not empty and the current temperature is GREATER than the temperature at the index on the top of the stack: we have found the "next warmer day" for that top index! Pop the index, calculate the distance (\`current_index - popped_index\`), and store it in the output. Push the current index to the stack.`,
                                                            solution: 'Use a decreasing Monotonic Stack storing indices. Iterate elements: while current > element at stack.top, pop stack and update output array. Push current index.',
                                                                walkthrough: [
                                                                    "temps =[73, 74, 75, 71, 69, 72, 76]",
                                                                    "i=0 (73): Stack=[0]",
                                                                    "i=1 (74): 74 > temps[stack.top(0)]. Pop 0. out[0] = 1-0 = 1. Stack=[1]",
                                                                    "i=2 (75): 75 > temps[1]=74. Pop 1. out[1] = 2-1 = 1. Stack=[2]",
                                                                    "i=3 (71): 71 < 75. Stack=[2, 3]",
                                                                    "i=4 (69): 69 < 71. Stack=[2, 3, 4]",
                                                                    "i=5 (72): 72 > temps[4]=69. Pop 4. out[4] = 5-4 = 1. 72 > temps[3]=71. Pop 3. out[3] = 5-3 = 2. Stack=[2, 5]",
                                                                    "i=6 (76): 76 pops 5 (out[5]=1) and pops 2 (out[2]=4). Stack=[6]"
                                                                ],
                                                                    hints: [
                                                                        'Brute force checking every future day takes O(N^2).',
                                                                        'Use a stack to keep track of the *indices* of days that haven\'t found a warmer day yet.',
                                                                        'If the current day is warmer than the day at the top of the stack, you resolve the top of the stack. Keep popping until the current day is no longer warmer.'
                                                                    ],
                                                                        complexity: { time: 'O(N)', space: 'O(N)' },
    starterCode: `def daily_temperatures(temperatures: list[int]) -> list[int]:
    """
    Returns an array showing how many days to wait until a warmer temperature.
    """
    n = len(temperatures)
    answer = [0] * n
    stack =[]  # Stores indices
    
    for i, t in enumerate(temperatures):
        # Resolve all previous days that are colder than today
        while stack and temperatures[stack[-1]] < t:
            prev_index = stack.pop()
            answer[prev_index] = i - prev_index
            
        # Add today to the stack, waiting for a future warmer day
        stack.append(i)
        
    return answer
`,
        testCases: [
            { id: 'tc1', description: 'Warming up and cooling down', input: 'temps=[73,74,75,71,69,72,76,73]', expected: '[1,1,4,2,1,1,0,0]' },
            { id: 'tc2', description: 'Monotonically decreasing', input: 'temps=[30,29,28]', expected: '[0,0,0]' },
            { id: 'tc3', description: 'Monotonically increasing', input: 'temps=[10,20,30]', expected: '[1,1,0]' },
            { id: 'tc4', description: 'Single peak', input: 'temps=[30,30,40,30]', expected: '[2,1,0,0]' },
            { id: 'tc5', description: 'All equal', input: 'temps=[25,25,25]', expected: '[0,0,0]' },
        ],
    };

export default challenge;
