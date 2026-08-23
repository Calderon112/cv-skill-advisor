/**
 * employment.js — position-type filtering (Werkstudent, Praktikum, Ausbildung, entry).
 *
 * A module rather than a block inside server.js so the tests exercise the real
 * table instead of a copy of it. RETROSPECTIVE.md entry 10 is about exactly that
 * failure: a duplicate kept beside the code drifts from it silently, and no test
 * catches a stale copy.
 *
 * Matching looks at title AND description on purpose. German postings routinely
 * carry a full-time title and open the role to working students in the body —
 * "IT Security Engineer ... auch als studentische Hilfskraft moeglich" — and a
 * title-only filter drops exactly the postings a student can actually get.
 */
'use strict';

const EMPLOYMENT_TERMS = {
  werkstudent: [
    'werkstudent', 'working student', 'studentische hilfskraft', 'studentischer mitarbeiter',
    'shk', 'hiwi', 'wissenschaftliche hilfskraft', 'student assistant', 'studentenjob',
  ],
  praktikum: [
    'praktikum', 'praktikant', 'internship', 'intern ', 'trainee', 'pflichtpraktikum',
    'praxissemester', 'volontariat',
  ],
  ausbildung: [
    'ausbildung', 'auszubildende', 'azubi', 'duales studium', 'dualer student',
    'apprentice', 'apprenticeship', 'berufsausbildung', 'lehrstelle',
  ],
  entry: [
    'junior', 'einsteiger', 'berufseinsteiger', 'entry level', 'entry-level',
    'absolvent', 'graduate', 'trainee', 'nachwuchs', 'einstieg',
  ],
};

// Keyword hints appended to the query so the sources return these postings at all.
// Filtering a result set that never contained a single working-student role would
// simply return nothing.
const EMPLOYMENT_QUERY_HINT = {
  werkstudent: 'Werkstudent',
  praktikum:   'Praktikum',
  ausbildung:  'Ausbildung',
  entry:       'Junior',
};

function jobMatchesEmployment(job, employment) {
  if (!employment || employment === 'all') return true;
  const terms = EMPLOYMENT_TERMS[employment];
  if (!terms) return true;
  const hay = `${job.title || ''} ${job.description || ''}`.toLowerCase();
  return terms.some(t => hay.includes(t));
}

module.exports = { EMPLOYMENT_TERMS, EMPLOYMENT_QUERY_HINT, jobMatchesEmployment };
