/**
 * security-learning.js — Concrete, explained skill-gap recommendations.
 *
 * Sprint-2 response to the Sprint-1 review note:
 *   "konkretere, erklärte Skill-Gap-Empfehlungen – nicht nur ein Score,
 *    sondern 'Du fehlst in Bereich X, lerne Y'."
 *
 * Instead of only flagging a missing skill, every gap is turned into an
 * actionable recommendation: WHY it matters + HOW to learn it (a concrete,
 * named resource — course, certification or hands-on platform relevant to
 * IT-Security students in Germany).
 *
 * UMD: works server-side (require) and in the browser (window.SecurityLearning).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SecurityLearning = api;
})(typeof self !== 'undefined' ? self : this, function () {
  // Per-skill learning resource. `how` = imperative action, `resource` = a
  // concrete, named place to learn it. Keyed by the same lowercase skill keys
  // used in security-skills.js so a missing key maps straight to advice.
  const LEARNING_RESOURCES = {
    // ── Defensive / SOC ──────────────────────────────────────────────
    'siem': { how: 'Correlate and hunt in logs hands-on', resource: 'free Splunk Fundamentals 1 or Microsoft Sentinel labs (MS Learn)' },
    'splunk': { how: 'Learn SPL queries and dashboards', resource: 'Splunk free training + the "Boss of the SOC" (BOTS) dataset' },
    'log analysis': { how: 'Practice parsing and triaging real logs', resource: 'TryHackMe "SOC Level 1" path' },
    'incident response': { how: 'Learn the detect→contain→eradicate→recover lifecycle', resource: 'SANS Incident Handler\'s Handbook + TryHackMe IR rooms' },
    'security monitoring': { how: 'Build detection use-cases against MITRE ATT&CK', resource: 'TryHackMe "SOC Level 1" + the MITRE ATT&CK Navigator' },
    'threat hunting': { how: 'Hypothesis-driven hunting over EDR/SIEM data', resource: 'TryHackMe Threat Hunting rooms + ATT&CK' },
    'threat intelligence': { how: 'Track TTPs and IOCs from threat reports', resource: 'MITRE ATT&CK + free MISP threat-sharing tutorials' },
    'mitre att&ck': { how: 'Map detections and adversary TTPs', resource: 'official MITRE ATT&CK training (attack.mitre.org)' },
    'edr': { how: 'Learn endpoint telemetry and response', resource: 'TryHackMe endpoint-security rooms / vendor (CrowdStrike, Defender) labs' },

    // ── Offensive / Pentest ──────────────────────────────────────────
    'penetration testing': { how: 'Build a structured pentest methodology', resource: 'TryHackMe "Jr Penetration Tester" then HackTheBox; aim for CompTIA PenTest+ or OSCP' },
    'ethical hacking': { how: 'Practice the full attack chain legally', resource: 'TryHackMe / HackTheBox Academy; consider CEH or OSCP' },
    'metasploit': { how: 'Exploit and post-exploit in a lab', resource: 'TryHackMe "Metasploit" rooms (Metasploitable target)' },
    'nmap': { how: 'Master host/service/version scanning', resource: 'TryHackMe "Nmap" room + the official Nmap reference guide' },
    'burp suite': { how: 'Intercept and test web requests', resource: 'free PortSwigger Web Security Academy (built around Burp)' },
    'privilege escalation': { how: 'Practice Linux & Windows privesc', resource: 'TryHackMe privesc rooms + the GTFOBins / LOLBAS references' },
    'web application security': { how: 'Exploit and fix the OWASP Top 10', resource: 'PortSwigger Web Security Academy + OWASP Juice Shop' },
    'exploit development': { how: 'Learn memory corruption fundamentals', resource: 'pwn.college / "Nightmare" CTF series; OSED for depth' },
    'vulnerability analysis': { how: 'Scan, validate and prioritise findings', resource: 'hands-on with OpenVAS/Nessus Essentials + CVSS scoring' },
    'vulnerability scanning': { how: 'Run and interpret authenticated scans', resource: 'Nessus Essentials (free) or OpenVAS in a home lab' },

    // ── AppSec ───────────────────────────────────────────────────────
    'owasp': { how: 'Learn the OWASP Top 10 by exploiting it', resource: 'OWASP Juice Shop + the OWASP Top 10 docs' },
    'secure coding': { how: 'Apply secure-by-default coding patterns', resource: 'OWASP Cheat Sheet Series + Secure Code Warrior' },
    'sast': { how: 'Run static analysis in a CI pipeline', resource: 'Semgrep / SonarQube on one of your own repos' },
    'dast': { how: 'Automate dynamic scanning of a web app', resource: 'OWASP ZAP against a deliberately vulnerable app' },
    'threat modeling': { how: 'Model attacks before writing code', resource: 'OWASP Threat Dragon + the STRIDE methodology' },
    'api security': { how: 'Secure and test REST/GraphQL APIs', resource: 'OWASP API Security Top 10 + PortSwigger API labs' },

    // ── Cloud ────────────────────────────────────────────────────────
    'cloud security': { how: 'Secure cloud workloads and identities', resource: 'free AWS/Azure security learning paths; target AZ-500 or AWS Security' },
    'aws security': { how: 'Lock down IAM, S3, VPC and logging', resource: 'AWS Skill Builder "Security" path + the free tier for labs' },
    'azure security': { how: 'Secure Entra ID, Defender and policies', resource: 'Microsoft Learn AZ-500 path (free)' },
    'kubernetes security': { how: 'Harden clusters and workloads', resource: 'killer.sh + the CKS (Certified Kubernetes Security) curriculum' },
    'iam policies': { how: 'Write least-privilege cloud IAM', resource: 'AWS IAM workshops / the "policy simulator"' },
    'terraform': { how: 'Provision infra-as-code securely', resource: 'HashiCorp "Terraform Associate" tutorials + tfsec scanning' },
    'container security': { how: 'Scan and harden images and runtime', resource: 'Trivy/Docker Bench + the "Container Security" TryHackMe rooms' },

    // ── Crypto / IAM ─────────────────────────────────────────────────
    'cryptography': { how: 'Understand symmetric/asymmetric crypto & hashing', resource: 'Cryptopals challenges + Dan Boneh\'s free Coursera "Cryptography I"' },
    'public key infrastructure': { how: 'Learn certificates, CAs and trust chains', resource: 'build a small CA with OpenSSL end-to-end' },
    'active directory': { how: 'Learn AD structure, then attack & defend it', resource: 'TryHackMe AD rooms + a local lab with BadBlood' },
    'identity and access management': { how: 'Design authn/authz and lifecycle', resource: 'NIST 800-63 Digital Identity Guidelines + an Okta/Keycloak lab' },

    // ── GRC / Compliance ─────────────────────────────────────────────
    'risk assessment': { how: 'Run a structured risk analysis', resource: 'NIST RMF (SP 800-30) or ISO 27005 + a worked example' },
    'iso 27001': { how: 'Learn the ISMS controls and audit cycle', resource: 'free ISO 27001 Foundation course; aim for Lead Implementer' },
    'gdpr': { how: 'Apply data-protection principles in practice', resource: 'the official GDPR text + the German BfDI guidance (DSGVO)' },
    'bsi grundschutz': { how: 'Apply the German baseline-protection method', resource: 'free BSI IT-Grundschutz-Kompendium + Grundschutz-Praktiker' },
    'audit': { how: 'Plan and run a risk-based security audit', resource: 'ISACA CISA study material + a mock audit checklist' },
    'security policies': { how: 'Draft enforceable security policies', resource: 'SANS free security-policy templates' },
    'compliance': { how: 'Map controls to frameworks', resource: 'compare NIST CSF, ISO 27001 and BSI Grundschutz side by side' },

    // ── DFIR / Malware ───────────────────────────────────────────────
    'digital forensics': { how: 'Acquire and analyse evidence soundly', resource: 'TryHackMe DFIR path + Autopsy/Sleuth Kit hands-on' },
    'memory forensics': { how: 'Analyse RAM captures for artefacts', resource: 'Volatility 3 + the public memory-sample challenges' },
    'malware analysis': { how: 'Triage samples statically and dynamically', resource: '"Practical Malware Analysis" labs in an isolated VM' },
    'reverse engineering': { how: 'Read disassembly and trace logic', resource: 'free Ghidra course (NSA) + crackme challenges' },
    'ghidra': { how: 'Reverse binaries with a free tool', resource: 'the official Ghidra course material' },
    'assembly': { how: 'Read x86-64 to follow exploits/RE', resource: 'pwn.college "Assembly Crash Course"' },
    'static analysis': { how: 'Inspect code/binaries without running them', resource: 'Ghidra + Semgrep on real samples' },

    // ── Infra / OS / scripting ───────────────────────────────────────
    'network security': { how: 'Master firewalls, VPNs, IDS/IPS and segmentation', resource: 'TryHackMe "Network Security" + Wireshark hands-on' },
    'linux': { how: 'Build comfortable command-line & hardening skills', resource: 'OverTheWire "Bandit" + Linux Foundation intro' },
    'python': { how: 'Automate security tasks with scripts', resource: '"Automate the Boring Stuff" + write your own scanner/parser' },
    'powershell': { how: 'Automate Windows admin & detection', resource: 'Microsoft Learn PowerShell + "Under the Wire" labs' },
    'documentation': { how: 'Write clear runbooks and reports', resource: 'practise writing one incident report and one pentest finding' },
    'communication': { how: 'Explain risk to non-technical stakeholders', resource: 'present a security topic; practise a 1-page exec summary' },
    'problem solving': { how: 'Sharpen analytical, structured thinking', resource: 'pick CTFs on TryHackMe/HackTheBox and write up your reasoning' },
  };

  // Fallback per taxonomy category when a specific skill has no entry.
  const CATEGORY_FALLBACK = {
    'Network Security': { how: 'Get hands-on in a packet/lab environment', resource: 'TryHackMe network rooms + Wireshark' },
    'Application & Web Security': { how: 'Exploit then fix a vulnerable app', resource: 'PortSwigger Web Security Academy + OWASP' },
    'Offensive Security / Pentesting': { how: 'Practise on intentionally vulnerable targets', resource: 'TryHackMe / HackTheBox' },
    'Defensive Security / Blue Team / SOC': { how: 'Build detections against real telemetry', resource: 'TryHackMe "SOC Level 1" + MITRE ATT&CK' },
    'Cloud Security': { how: 'Secure workloads in a free-tier cloud account', resource: 'AWS Skill Builder / Microsoft Learn security paths' },
    'Cryptography & PKI': { how: 'Learn the maths and the tooling', resource: 'Cryptopals + OpenSSL exercises' },
    'Identity & Access Management': { how: 'Design and test access control', resource: 'a Keycloak/Okta lab + NIST 800-63' },
    'GRC, Compliance & Frameworks': { how: 'Map controls to a recognised framework', resource: 'ISO 27001 / NIST CSF / BSI Grundschutz docs' },
    'DFIR & Forensics': { how: 'Work real evidence in a lab', resource: 'TryHackMe DFIR path + Autopsy/Volatility' },
    'Malware Analysis & Reverse Engineering': { how: 'Analyse samples safely in a VM', resource: 'free Ghidra course + "Practical Malware Analysis"' },
    'Operating Systems & Infrastructure': { how: 'Harden and automate systems', resource: 'CIS Benchmarks + a home lab' },
    'OT / IoT / Mobile Security': { how: 'Study the domain-specific attack surface', resource: 'OWASP IoT/Mobile Top 10 + vendor security guides' },
    'Certifications': { how: 'Pick one entry-level certification to anchor study', resource: 'CompTIA Security+ is the common starting point' },
    'Professional & Soft Skills': { how: 'Practise on real deliverables', resource: 'write reports, present, and get feedback' },
  };

  const DEFAULT = { how: 'Build hands-on experience', resource: 'a guided TryHackMe path or a focused online course' };

  /**
   * Turn a single (missing) skill into a concrete recommendation.
   * @param {{key:string,label?:string,category?:string}} skill
   * @returns {{key,label,category,how,resource}}
   */
  function learningFor(skill) {
    skill = skill || {};
    const key = String(skill.key || '').toLowerCase();
    const res = LEARNING_RESOURCES[key] || CATEGORY_FALLBACK[skill.category] || DEFAULT;
    return {
      key,
      label: skill.label || skill.key || '',
      category: skill.category || '',
      how: res.how,
      resource: res.resource,
    };
  }

  /**
   * Build a prioritised skill-gap roadmap from analysed roles.
   * Skills required by MORE of the top target roles rank first, so the learner
   * sees the highest-leverage gaps to close. Returns concrete, explained items.
   *
   * @param {Array<{name,score,missing:string[]}>} roles  analyzeRoles() output
   * @param {object} [opts]
   * @param {(key:string)=>{key,label,category}} [opts.lookup]  resolve a key → skill meta
   * @param {number} [opts.topRoles=2]  how many top roles to draw gaps from
   * @param {number} [opts.limit=8]     max recommendations returned
   * @returns {Array<{key,label,category,how,resource,priority,forRoles:string[]}>}
   */
  function recommendGaps(roles, opts) {
    opts = opts || {};
    const lookup = opts.lookup || (k => ({ key: k, label: k, category: '' }));
    const topRoles = opts.topRoles || 2;
    const limit = opts.limit || 8;

    const considered = (roles || []).slice(0, topRoles);
    const byKey = new Map(); // key → { count, forRoles[] }
    considered.forEach(role => {
      (role.missing || []).forEach(key => {
        const k = String(key).toLowerCase();
        const entry = byKey.get(k) || { count: 0, forRoles: [] };
        entry.count += 1;
        entry.forRoles.push(role.name);
        byKey.set(k, entry);
      });
    });

    return [...byKey.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([key, meta]) => {
        const rec = learningFor(lookup(key));
        return { ...rec, priority: meta.count, forRoles: meta.forRoles };
      });
  }

  return { LEARNING_RESOURCES, CATEGORY_FALLBACK, learningFor, recommendGaps };
});
