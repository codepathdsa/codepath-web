import type { Challenge } from '../types';

// ─── ENG-WAR-018 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-018',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'CrowdStrike-style Kernel Panic (Faulty Driver Update)',
          companies: ['Microsoft', 'Delta Airlines'],
            timeEst: '~30 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `The July 2024 CrowdStrike Falcon sensor update caused 8.5 million Windows machines to BSOD (Blue Screen of Death) globally. The faulty kernel-level driver caused an out-of-bounds memory read during boot, making machines unbootable. The fix required booting into Safe Mode or WinRE and manually deleting a single file — there was no remote fix because the machines couldn't boot far enough to receive commands.`,
                    desc: `After a security software update was pushed to your entire Windows fleet via your MDM (Mobile Device Management) tool at 2am, 3,000 Windows servers and 8,000 employee laptops are stuck in a BSOD boot loop. The machines reboot into a crash, reboot again, crash again. Remote management tools cannot connect because the machines never boot completely. The culprit is a kernel driver file dropped by the security software update.`,
                      solution: `Boot machines into Windows Recovery Environment (WinRE) or Safe Mode, navigate to the security software's driver directory, and delete the faulty .sys file. For servers: use Azure Serial Console, AWS Systems Manager Run Command via EC2 Serial Console, or out-of-band management (IPMI/iLO) to access the machine before the OS boots. For cloud VMs, detach the OS disk, mount it on a healthy VM, delete the file, reattach.`,
                        explanation: `Kernel-level security drivers load during boot before any remote management agent can initialize. This is why there's no "remote fix" — the machine never reaches the point where RDP, SSH, or agents work. The recovery playbook: (1) use out-of-band management (IPMI, serial console) or cloud disk attachment to access the filesystem without booting the OS fully, (2) delete the offending driver file, (3) reboot normally. Prevention: stage security software updates through rings — 1% of fleet, wait 24h, then 10%, then 100%.`,
                          options: [
                            { label: 'A', title: 'Push a remediation script via the MDM tool to all affected machines', sub: 'Deploy script: del C:\\Windows\\System32\\drivers\\bad_driver.sys', isCorrect: false },
                            { label: 'B', title: 'Roll back the security software update via MDM to all machines', sub: 'MDM: Rollback package version to previous build', isCorrect: false },
                            { label: 'C', title: 'Use out-of-band/serial console access to boot WinRE and delete the faulty driver', sub: 'EC2 Serial Console / IPMI → WinRE → del %windir%\\System32\\drivers\\bad.sys', isCorrect: true },
                            { label: 'D', title: 'Restore all VMs from yesterday\'s snapshots', sub: 'aws ec2 create-image + restore from AMI for all instances', isCorrect: false },
                          ]
};

export default challenge;
