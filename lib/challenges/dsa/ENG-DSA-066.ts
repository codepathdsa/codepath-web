import type { Challenge } from '../types';

// ─── ENG-DSA-066 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-066',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Optimal Server Rack Cooling (Two Pointers)',
        companies: ['Google', 'Meta'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Two Pointers', 'Greedy', 'Arrays'],
        nextChallengeId: 'ENG-DSA-067',
        realWorldContext: `Datacenter aisle containment relies on calculating the physical volume of cold air trapped between server racks of varying heights. To optimally place the heaviest computing workloads, infrastructure engineers must identify the two server racks across a floor plan that create the largest physical containment zone.`,
        desc: 'Given an array of server rack heights, choose two racks such that, combined with the floor between them, they form a container that holds the most volume (area). You cannot slant the container. Return the maximum area.',
        whyItMatters: `This is "Container With Most Water". It introduces a greedy optimization that turns an O(N^2) brute force geometry problem into a beautiful O(N) Two Pointers solution. You must identify that the limiting factor in the area calculation is always the SHORTER line.`,
        approach: `Start with the widest possible container: pointers at the extreme left and right ends. The area is \`width * min(height[left], height[right])\`. To maximize the area, we must seek taller lines. Since the current limiting factor is the shorter line, move the pointer of the shorter line inward. Repeat until left meets right.`,
        solution: 'Two pointers at ends. Calculate area. Move the pointer pointing to the shorter height inward. Keep tracking the maximum area seen.',
        walkthrough: [
            "heights=[1,8,6,2,5,4,8,3,7]",
            "L=0 (val 1), R=8 (val 7). Width=8. Area = 8 * min(1,7) = 8.",
            "L is shorter (1 < 7). Move L to 1 (val 8).",
            "L=1 (val 8), R=8 (val 7). Width=7. Area = 7 * min(8,7) = 49. Max=49.",
            "R is shorter (7 < 8). Move R to 7 (val 3). Area = 6 * min(8,3) = 18.",
            "Continue moving the shorter bar... max area remains 49. ✓"
        ],
        hints: [
            'Start with the maximum possible width (pointers at indices 0 and len-1).',
            'The area is limited by the shorter height. To find a potentially larger area, you MUST replace the shorter line with a potentially taller one.',
            'Therefore, safely move the pointer that points to the smaller height inward.'
        ],
        complexity: { time: 'O(N)', space: 'O(1)' },
        starterCode: `def max_containment_area(heights: list[int]) -> int:
    """
    Returns the maximum area contained by two server racks.
    Area = distance_between_racks * min(rack1_height, rack2_height)
    """
    left = 0
    right = len(heights) - 1
    max_area = 0
    
    while left < right:
        # Calculate current area
        width = right - left
        current_height = min(heights[left], heights[right])
        current_area = width * current_height
        
        # Update max
        max_area = max(max_area, current_area)
        
        # Move the limiting (shorter) pointer inward to seek a taller line
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
            
    return max_area
`,
        testCases: [
            { id: 'tc1', description: 'Classic peaks', input: 'heights=[1,8,6,2,5,4,8,3,7]', expected: '49' },
            { id: 'tc2', description: 'Two identical heights', input: 'heights=[1,1]', expected: '1' },
            { id: 'tc3', description: 'Tall inner peaks', input: 'heights=[1,2,100,100,2,1]', expected: '100' },
            { id: 'tc4', description: 'Decreasing heights', input: 'heights=[9,8,7,6,5]', expected: '20' },
            { id: 'tc5', description: 'Flat landscape', input: 'heights=[5,5,5,5,5]', expected: '20' },
        ],
    };

export default challenge;
