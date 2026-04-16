import type { Challenge } from '../types';

// ─── ENG-DSA-060 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-060',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Packet Data Compression (Sliding Window)',
        companies: ['Cisco', 'Amazon'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Sliding Window', 'Hash Map', 'Strings'],
        nextChallengeId: 'ENG-DSA-061',
        realWorldContext: `LZ77 and LZ78 compression algorithms (used in gzip and PNG formats) scan streams of bytes looking for the longest sequences without duplicate characters. Efficiently finding the longest substring without repeating characters is a core sub-routine in stream compression logic.`,
        desc: 'Given a string `s`, find the length of the longest substring without repeating characters.',
        whyItMatters: `This is arguably the most famous Sliding Window problem. It bridges the gap between fixed-size windows and dynamically resizing windows. Instead of recalculating from scratch, the left pointer "jumps" forward to bypass duplicates, achieving O(N) time.`,
        approach: `Use two pointers (left and right) and a Hash Map tracking the last seen index of every character. Expand the right pointer. If the character at right is already in the map AND its stored index is >= left pointer, we found a duplicate inside our current window. Instantly shrink the window by jumping the left pointer to last_seen_index + 1. Update max length.`,
        solution: 'Sliding window with Hash Map. Map stores char -> latest_index. If char is in map and index >= left_pointer, move left_pointer to map[char] + 1. Update map[char] = right. Max length = max(max, right - left + 1).',
        walkthrough: [
            "s='abcabcbb'. Map={}, left=0, max_len=0",
            "r=0 ('a'): Map={'a':0}, max=1. Window='a'",
            "r=1 ('b'): Map={'a':0, 'b':1}, max=2. Window='ab'",
            "r=2 ('c'): Map={'a':0, 'b':1, 'c':2}, max=3. Window='abc'",
            "r=3 ('a'): 'a' is in map at idx 0 (>= left). Jump left to 0+1=1. Map={'a':3}, max=3. Window='bca'",
            "r=4 ('b'): 'b' in map at idx 1 (>= left). Jump left to 1+1=2. Map={'b':4}. Window='cab'"
        ],
        hints: [
            'Use a Hash Map to store the last seen index of each character.',
            'Keep a `left` pointer for the start of your window. Iterate a `right` pointer.',
            'If `s[right]` is in your map AND its stored index is >= `left`, you must move `left` to `stored_index + 1` to exclude the duplicate.'
        ],
        complexity: { time: 'O(N)', space: 'O(min(N, charset))' },
        starterCode: `def length_of_longest_substring(s: str) -> int:
    """
    Returns the length of the longest substring without repeating characters.
    """
    char_map = {}  # Stores char -> last seen index
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        char = s[right]
        
        # If we've seen this character and it's inside our current window,
        # shrink the window by moving the left pointer past the old duplicate.
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
            
        # Update the latest index of this character
        char_map[char] = right
        
        # Calculate current window size
        max_len = max(max_len, right - left + 1)
        
    return max_len
`,
        testCases: [
            { id: 'tc1', description: 'Standard repeating', input: "s='abcabcbb'", expected: '3 ("abc")' },
            { id: 'tc2', description: 'All same chars', input: "s='bbbbb'", expected: '1 ("b")' },
            { id: 'tc3', description: 'Sequence in middle', input: "s='pwwkew'", expected: '3 ("wke")' },
            { id: 'tc4', description: 'Empty string', input: "s=''", expected: '0' },
            { id: 'tc5', description: 'No repeats', input: "s='abcdef'", expected: '6' },
        ],
    };

export default challenge;
