# Retrospective — what went wrong, and what it taught

This is not a changelog. It collects the dead ends encountered while building
CareerAI, each with the symptom, the actual cause, and the change that followed.
They are recorded because most of them share a shape, and the shape is the useful
part: **a failure that produces a plausible result is far more expensive than one
that produces an error.**

Every entry below cost real time. Several were found only when someone else read
the code.

---

## 1. Configuration that is read before it exists

**Symptom.** `GRAPH_QUALITY_BAR=99` in `.env`, and the API still reported a quality
bar of 80. The variable was spelled correctly, it was in the file, and it did
nothing. Earlier, the same trap made the OIDC layer offer no sign-in providers at
all on a correctly configured server.

**Cause.** Node evaluates a module the instant it is required. `server.js` parsed
`.env` about forty lines *below* its `require` calls, so every
`const X = process.env.Y` at the top of a module read an environment that had not
been populated yet and quietly took its default.

**First fix, which was not enough.** `server/llm.js` was patched by making its own
reads lazy (`const MODEL = () => process.env.GWDG_MODEL || ...`). That repaired one
module and left the trap armed in four others — ten module-load reads across
`graph.js`, `embeddings.js`, `career-path.js` and `usage.js`. A reviewer found them
months later.

**Real fix.** Move the `.env` parse *above* the application requires, in
`server.js`. One change, all ten sites, and the next module added to the project
inherits the correct behaviour instead of the bug.

**Lesson.** When a bug is fixed at the call site, ask whether the call site is the
cause. Patching the symptom where it hurts leaves the same defect everywhere it has
not hurt yet.

---

## 2. A judge that could not see what it was judging

**Symptom.** Given a CV containing only "Splunk and Python", the pipeline produced
a letter claiming *40+ custom detection rules*, a *22% false-positive reduction*
and *30% triage savings*. The Critic scored it well.

**Cause.** Two compounding errors. The Critic received the job posting and the
letter — but never the CV, so it had no ground truth and was structurally incapable
of noticing an invention. And its rubric awarded 25 points for "Evidence & impact:
backs claims with concrete examples/results", which pays for numbers. The cheapest
way to obtain a number is to invent one.

**Fix.** The Critic now receives the same profile the Writer did. Groundedness
became the largest rubric dimension *and* a disqualifier: any claim the profile does
not support caps the total at 45, below the quality bar, so the loop sends the
letter back instead of delivering it. The cap is enforced in code as well as in the
prompt, because a model that lists fabrications and then awards 88 has contradicted
itself and must not be trusted to arbitrate.

**Lesson.** A verifier without access to the ground truth is theatre. Before asking
whether a check is strict enough, check whether it *can* fail.

---

## 3. A search that advertised sources it never queried

**Symptom.** The UI reported ten platforms. Setting `JOOBLE_API_KEY` changed no
result, ever.

**Cause.** Jooble had a fetcher, a key check and its own endpoint — and no entry in
the source registry the main search actually iterates. The key was read, validated,
and used by nothing.

**Lesson.** An unused credential looks exactly like a working one. Wiring is not
verified by the presence of its parts; only an end-to-end assertion counts.

---

## 4. Truthy strings that are not answers

**Symptom.** The Critic graded letters against postings containing no requirements,
and the scores were meaningless.

**Cause.** Bundesagentur and LinkedIn do not return the posting text — they return a
pointer to it: `"Weitere Infos auf der Jobseite."`, `"Full description on
LinkedIn."`. Those strings are truthy, so `jobDescription || job.title` never fell
back to the title.

**Fix.** `MIN_DESCRIPTION = 120`. Below that length a description carries no
requirement, and is treated as absent.

**Lesson.** In JavaScript, "present" and "useful" are different questions, and `||`
only answers the first.

---

## 5. A persistence layer with an allow-list

**Symptom.** Email confirmation links never resolved. The token was generated, the
mail was sent, and the link reported an unknown token.

**Cause.** `storage.js` wrote an explicit whitelist of four keys. `emailTokens` was
added afterwards and never joined the list, so every write silently discarded it.

**Lesson.** A whitelist in a save path is a data-loss bug waiting for the next
feature. It fails silently, and it fails later — by which point the new feature is
what looks broken.

---

## 6. Aggregation that dropped a source shape

**Symptom.** The salary panel reported "0 of 34 postings stated pay" for roles that
plainly state pay.

**Cause.** The endpoint used `flatMap` over source results and kept only arrays.
Bundesagentur returns `{ jobs: [...] }`, not an array, so the single richest source
was dropped without a word.

**Lesson.** Heterogeneous sources need an explicit adapter per source. A generic
flatten silently keeps whatever happens to fit.

---

## 7. Absence read as presence

**Symptom.** A CV stating "No CISSP" produced CISSP as a detected skill — which the
Writer could then build a sentence on.

**Cause.** The matcher tested whether the surface form appeared in the text. It had
no notion of negation, in any language.

**Fix.** Occurrences preceded by a negation cue (English, German, French) within a
short window are rejected, stopping at sentence boundaries and at contrastive
conjunctions so "No CISSP but Splunk daily" still detects Splunk. Constructions
where the cue denies its own noun — "no problem working with Splunk" — are listed
explicitly rather than guessed at.

**Lesson.** Keyword matching answers "does this string occur", which is not the
question a CV reader is asking.

---

## 8. An interface that only worked in the language it was written in

**Symptom.** On a phone, buttons did nothing. Only on some phones.

**Cause.** The browser's automatic page translation wraps text nodes in `<font>`
elements. Handlers read `e.target.dataset`, and `e.target` was then the injected
`<font>`, which carries no dataset.

**Fix.** `e.currentTarget` — the element the listener is attached to, which
translation does not move.

**Lesson.** The DOM at runtime is not the DOM that was written. Anything that reads
the event target inherits whatever the browser, an extension or a translator has
done to the page.

---

## 9. Packaging that ignored the rules the repository already had

**Symptom.** The submitted archive contained a populated `.env` with eight live
third-party API keys and the Keycloak client secret, plus `storage.json` with 14
real user records and 109 session tokens.

**Cause.** `.gitignore` listed all of them correctly, and had for months. The
archive was produced by zipping the working directory, which never consults it.

**Fix.** `scripts/make-submission.sh` exports through `git archive`, which can only
emit tracked files — an ignored file is not merely filtered out, it is ineligible.
A secret scan then runs over the result and deletes the archive if anything trips
it. Two independent controls, because the first one already looked sufficient.

**Lesson.** A control only protects the paths that consult it. `.gitignore` protects
commits; it never protected the deliverable, and nothing said so.

---

## 10. A fix kept beside the code instead of inside it

**Symptom.** None, which is the point. `PATCH-pdf-fix.js` sat at the repository
root for three sprints: 92 lines of step-by-step instructions for editing
`extractPdfText()`, written while debugging PDFs that Word, Canva and Acrobat
produce.

**Cause.** Writing the fix down was the right instinct. Leaving it as a file was
not. It was applied to `server.js` early on, the README stopped referencing it,
and it became a stale duplicate of a function that had since moved on — 53 lines
describing 40 that no longer matched.

**Fix.** The reasoning it carried — why three extraction attempts exist, and which
real file defeated each preceding one — is now a comment above the function it
explains. The file is deleted.

**Lesson.** Documentation that lives beside the code instead of inside it drifts
from it silently, and there is no test for a stale file. A Sprint-1 reviewer
flagged the workflow; three sprints passed before it was acted on.

---

## The pattern

Eight of these ten produced a *plausible* wrong answer rather than an error: a
default that looked chosen, a score that looked earned, a skill that looked
detected, a search that looked complete. None of them crashed. Most were found by
reading, by someone other than the author, or by measuring something that had been
assumed.

That is the reasoning behind the design decisions this project defends elsewhere —
the deterministic match score that can be re-derived, the `scored: false` flag that
refuses to report a grade nobody computed, the evidence check that rejects an
inferred skill whose quote is not in the CV. They exist because the failures above
were all quiet ones.
