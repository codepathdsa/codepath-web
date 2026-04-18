import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-014 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-014',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'The Hidden N+1 (ORM Edition)',
    companies: ['Shopify', 'Instacart'],
    timeEst: '~12 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'A dev added a "Recent Activity" feed. In staging (5 users), it is instant. In production (100k users), the database CPU spikes to 100% and the API times out. Logs show 50+ SQL queries per single API request.',
    solution: 'This is a classic N+1 query problem. The ORM (TypeORM/Sequelize) is fetching the "Posts", but the "Author" relationship is lazily loaded. When the code loops through posts to return JSON, the ORM triggers a separate SELECT for every single author. Fix: Use Eager Loading (e.g., `.find({ relations: ["author"] })`).',
    prReview: {
        prNumber: 551,
        prBranch: 'feature/activity-feed',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/services/post.service.ts',
        background: 'Fetching the latest 50 posts for the global discovery feed.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'Look at how the author data is accessed in the return statement.',
            'How many queries are executed if `posts` contains 50 items?',
            'What ORM feature allows you to JOIN the authors table in the initial query?'
        ],
        diff: [
            { lineNumL: 5, lineNumR: 5, type: 'normal', text: 'export async function getRecentPosts() {' },
            { lineNumL: 6, lineNumR: 6, type: 'deletion', text: '  const posts = await PostRepository.find({ take: 50 });' },
            { lineNumL: null, lineNumR: 6, type: 'addition', text: '  const posts = await PostRepository.createQueryBuilder("post")' },
            { lineNumL: null, lineNumR: 7, type: 'addition', text: '    .orderBy("post.createdAt", "DESC")' },
            { lineNumL: null, lineNumR: 8, type: 'addition', text: '    .limit(50)' },
            { lineNumL: null, lineNumR: 9, type: 'addition', text: '    .getMany();' },
            { lineNumL: 7, lineNumR: 10, type: 'normal', text: '  return posts.map(p => ({' },
            { lineNumL: 8, lineNumR: 11, type: 'normal', text: '    id: p.id,' },
            { lineNumL: 9, lineNumR: 12, type: 'normal', text: '    title: p.title,' },
            { lineNumL: 10, lineNumR: 13, type: 'normal', text: '    authorName: p.author.name // Accessing relation' },
            { lineNumL: 11, lineNumR: 14, type: 'normal', text: '  }));' },
            { lineNumL: 12, lineNumR: 15, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'n_plus_one', label: 'N+1 Query', sub: 'Relations loaded lazily in a loop' },
            { value: 'missing_index', label: 'Missing DB Index', sub: 'Slow sort on createdAt column' },
            { value: 'memory_leak', label: 'Memory Bloat', sub: 'Fetching too many columns from DB' },
            { value: 'unbounded_query', label: 'Unbounded Result Set', sub: 'Missing pagination logic' },
        ],
        correctBugType: 'n_plus_one',
        successExplanation: "Correct. Since `p.author` is accessed inside the `.map()`, and the `createQueryBuilder` didn't explicitly `.leftJoinAndSelect` the author, the ORM issues a new SQL query for every single post to find its author. 1 query for posts + 50 queries for authors = 51 queries. This kills DB performance. Use `.leftJoinAndSelect('post.author', 'author')` to solve it in one query.",
        failExplanation: "The bug is the N+1 query on line 13. The ORM fetches the 50 posts, but the author data isn't there yet. When you access `p.author.name`, the ORM 'helpfully' does a separate query for that specific author. Because it's in a loop, you do 51 queries instead of 1. Fix: Eager load the relation."
    },
};
export default challenge;