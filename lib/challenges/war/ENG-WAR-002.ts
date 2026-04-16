import type { Challenge } from '../types';

// ─── ENG-WAR-002 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-002',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Disk 100% Full (No Space Left on Device)',
    companies: ['AWS', 'DigitalOcean'],
    timeEst: '~15 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'The database server suddenly stopped accepting writes. `df -h` shows `/var/log` is at 100% capacity.',
    solution: 'Application debug logs were left on in production, and log rotation (logrotate) was not configured. Find the massive log file, truncate it (`> app.log`), and setup logrotate.',
    options: [
      { label: 'A', title: 'Reboot the database server', sub: 'sudo reboot', isCorrect: false },
      { label: 'B', title: 'Increase EBS volume size immediately', sub: 'aws ec2 modify-volume --size 500', isCorrect: false },
      { label: 'C', title: 'Truncate the giant log file and configure logrotate', sub: '> /var/log/app.log && nano /etc/logrotate.d/app', isCorrect: true },
      { label: 'D', title: 'Restart the Postgres service', sub: 'sudo systemctl restart postgresql', isCorrect: false },
    ]
  };

export default challenge;
