import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-016 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-016',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'SSRF via URL Preview',
    companies: ['Slack', 'Discord'],
    timeEst: '~15 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'A dev built a "Link Preview" feature. Users can post a URL, and our server fetches the page title and favicon to display. A security audit shows that an attacker can use this to scan our internal network and steal AWS metadata.',
    solution: 'This is a Server-Side Request Forgery (SSRF) vulnerability. By passing an internal IP (like 169.254.169.254 or localhost), the attacker forces our server to fetch data from our own internal infrastructure that isnâ€™t exposed to the internet. Fix: Implement an allow-list for protocols (HTTP/HTTPS only) and validate that the resolved IP address of the URL is not a private/internal range.',
    prReview: {
        prNumber: 99,
        prBranch: 'feat/link-previews',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/utils/scraper.ts',
        background: 'Scraping metadata from user-provided links.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'What happens if a user submits a URL like "http://localhost:5432" or "http://169.254.169.254/latest/meta-data/"?',
            'Does our server have access to internal services that the public internet doesn\'t?',
            'How do we ensure the URL points to a public, external address?'
        ],
        diff: [
            { lineNumL: 1, lineNumR: 1, type: 'normal', text: 'import axios from "axios";' },
            { lineNumL: 2, lineNumR: 2, type: 'normal', text: '' },
            { lineNumL: 3, lineNumR: 3, type: 'normal', text: 'export async function getLinkPreview(userUrl: string) {' },
            { lineNumL: null, lineNumR: 4, type: 'addition', text: '  // Basic validation' },
            { lineNumL: null, lineNumR: 5, type: 'addition', text: '  if (!userUrl.startsWith("http")) throw new Error("Invalid protocol");' },
            { lineNumL: 4, lineNumR: 6, type: 'normal', text: '' },
            { lineNumL: 5, lineNumR: 7, type: 'normal', text: '  const response = await axios.get(userUrl, { timeout: 2000 });' },
            { lineNumL: 6, lineNumR: 8, type: 'normal', text: '  return { title: extractTitle(response.data) };' },
            { lineNumL: 7, lineNumR: 9, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'ssrf', label: 'SSRF', sub: 'Internal network exposed to user' },
            { value: 'dos', label: 'Denial of Service', sub: 'Server can be tricked into slow loops' },
            { value: 'rce', label: 'Remote Code Execution', sub: 'Attacker executes code on server' },
            { value: 'data_exfiltration', label: 'Data Exfiltration', sub: 'Sensitive files read from local disk' },
        ],
        correctBugType: 'ssrf',
        successExplanation: "Exactly. This is a critical SSRF. An attacker could query `http://169.254.169.254/latest/meta-data/iam/security-credentials/` on AWS to steal the server's identity tokens. You must resolve the DNS of the URL and block any IPs in private ranges (10.x.x.x, 172.16.x.x, 192.168.x.x, etc.) before making the request.",
        failExplanation: "The vulnerability is SSRF (Server-Side Request Forgery). By trusting the `userUrl` blindly, you allow users to reach internal resources (like databases or cloud metadata services) that your server can see but the user can't. You need to validate the destination IP address."
    },
};

export default challenge;