#!/usr/bin/env node
/**
 * measure-critic.js — how often does the Critic actually send a letter back?
 *
 * The Writer/Critic loop is the project's central claim, and it was defended with
 * its design rather than its numbers. A Sprint-3 reviewer put the objection
 * precisely: if the Critic rarely rejects, the loop is expensive for little
 * return; if it often does, that is a strong result. Either way the number was
 * missing, and this project measures its other claims — the salary panel reports
 * how many postings actually stated pay.
 *
 * So this measures the loop on fixtures spanning the range the app really sees:
 * thin CVs, strong CVs, postings with real requirements and postings without.
 *
 * Usage:  node scripts/measure-critic.js [runs-per-fixture]
 * Needs an LLM key. Prints a table and the aggregate.
 */
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([^#][^=]+?)\s*=\s*(.*)$/);
    if (m && m[2].trim() && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  });
}

const graph = require(path.join(root, 'server/graph.js'));
const llm = require(path.join(root, 'server/llm.js'));

const CV_THIN = 'Informatikstudent, 3. Semester. Kenntnisse: Python, Linux.';
const CV_MID = 'Informatikstudium, 5. Semester, Schwerpunkt IT-Sicherheit an der Westfaelischen Hochschule '
  + 'Gelsenkirchen. Heimlabor mit pfSense, Netzwerk in VLANs segmentiert. Wireshark fuer PCAP-Analyse. '
  + 'Projekt: Bewerbungsplattform mit Node.js. Kenntnisse: Python, Linux, Wireshark, Grundlagen SIEM.';
const CV_STRONG = 'IT-Security-Analyst, 3 Jahre Berufserfahrung bei der Muster GmbH. Betrieb eines Splunk-SIEM, '
  + 'Bearbeitung von Sicherheitsvorfaellen im SOC, Mitarbeit an zwei ISO-27001-Audits. Zertifizierung: '
  + 'CompTIA Security+. Kenntnisse: Splunk, Python, Linux, Wireshark, MITRE ATT&CK, Incident Response.';

const JOB_RICH = 'Werkstudent IT-Security (m/w/d) in Remscheid. Du unterstuetzt das Security Operations Center '
  + 'bei der taeglichen Log-Analyse mit Splunk, bearbeitest Alarme nach Vorgabe und wirkst an der Vorbereitung '
  + 'von ISO-27001-Audits mit. Erwartet werden erste Kenntnisse in Python und Linux sowie Interesse an '
  + 'Netzwerksicherheit. Gute Deutschkenntnisse sind erforderlich.';
const JOB_THIN = 'IT Security Analyst gesucht.';

const FIXTURES = [
  { name: 'thin CV   / rich posting',  cvText: CV_THIN,   jobDescription: JOB_RICH, title: 'Werkstudent IT-Security' },
  { name: 'mid CV    / rich posting',  cvText: CV_MID,    jobDescription: JOB_RICH, title: 'Werkstudent IT-Security' },
  { name: 'strong CV / rich posting',  cvText: CV_STRONG, jobDescription: JOB_RICH, title: 'IT Security Analyst' },
  { name: 'mid CV    / thin posting',  cvText: CV_MID,    jobDescription: JOB_THIN, title: 'IT Security Analyst' },
];

const deps = {
  findSkills: () => [], analyzeRoles: () => [{ name: 'IT Security', missing: [] }],
  allSkills: () => [], scoreJob: () => ({ score: 0.75, breakdown: {} }), recommend: () => [],
};

(async () => {
  if (!llm.isAvailable()) { console.error('No LLM key configured — nothing to measure.'); process.exit(1); }
  const perFixture = Number(process.argv[2]) || 3;
  console.log(`provider: ${llm.provider()}   runs per fixture: ${perFixture}\n`);
  console.log('  fixture                       run  revisions  score  cleared  unsupported');
  console.log('  ' + '-'.repeat(72));

  const rows = [];
  for (const f of FIXTURES) {
    for (let i = 1; i <= perFixture; i++) {
      const job = { title: f.title, company: 'Beispiel GmbH', description: f.jobDescription };
      const r = await graph.runGraph(
        { cvText: f.cvText, jobs: [job], job, jobDescription: f.jobDescription, profile: {} },
        deps, llm, null);
      const cleared = r.scored && r.score >= r.qualityBar;
      rows.push({ fixture: f.name, revisions: r.revisions, score: r.score, cleared, unsupported: r.unsupported.length });
      console.log(`  ${f.name.padEnd(28)}  ${i}      ${String(r.revisions).padEnd(9)}${String(r.score ?? '—').padEnd(7)}${(cleared ? 'yes' : 'NO').padEnd(9)}${r.unsupported.length}`);
    }
  }

  const n = rows.length;
  // revisions > 1 means the Critic rejected at least once: the first pass is
  // revision 1, so anything above it was sent back.
  const sentBack = rows.filter(r => r.revisions > 1).length;
  const failed = rows.filter(r => !r.cleared).length;
  const flagged = rows.filter(r => r.unsupported > 0).length;
  const scores = rows.map(r => r.score).filter(s => typeof s === 'number');
  const mean = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  console.log('\n  ' + '-'.repeat(72));
  console.log(`  runs                                  ${n}`);
  console.log(`  letters the Critic sent back          ${sentBack}  (${Math.round(sentBack / n * 100)} %)`);
  console.log(`  letters still below the bar at the end ${failed}  (${Math.round(failed / n * 100)} %)`);
  console.log(`  runs with an unsupported claim        ${flagged}  (${Math.round(flagged / n * 100)} %)`);
  console.log(`  mean final score                      ${mean.toFixed(1)} / 100`);
  console.log(`  extra model calls spent on revision   ${rows.reduce((a, r) => a + (r.revisions - 1), 0) * 2}`);
})();
