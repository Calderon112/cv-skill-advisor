# Demo video — shot list and narration

**Target: 2:00.** The submission asks for two to three minutes; the existing
recording runs 5:08. This is not a trim of that take, it is a shorter film — the
cuts below drop whole scenes rather than shortening each one.

**Principle.** Every shot must show something the viewer could not have assumed.
A form being filled in is assumable. A number being justified is not.

Narration is written to be read at a normal pace, roughly 150 words per minute.
The whole script is about 300 words on purpose.

---

## 0:00–0:12 · The problem

**On screen.** Three browser tabs side by side: Bundesagentur, StepStone, LinkedIn,
each showing a different result list for the same search. Then cut to a posting
with a long requirements list, and scroll it.

> Applying for a security job in Germany means doing the same work over and over.
> Different portals, no shared interface. Twenty requirements per posting, and no
> indication which ones you already meet.

**Why it opens here.** The viewer has to feel the cost before the solution means
anything. Twelve seconds, no product.

---

## 0:12–0:30 · The CV goes in

**On screen.** Drag a PDF onto the upload area. Skills appear as tags. Hold on the
detected list for two seconds.

> You upload your CV once. The system reads it — including scanned PDFs — and
> extracts what you can actually demonstrate.

**Do not narrate the upload.** The viewer can see it. Say what is being extracted.

---

## 0:30–0:50 · One search, every portal

**On screen.** Press search. The per-source counters tick up. Land on the merged
result list, then point at a card marked as also appearing on another board.

> One search reaches every configured portal — eight without any API key, eleven
> with them. The same vacancy posted three times is merged into one card.

---

## 0:50–1:15 · The number you can argue with

**On screen.** Hover a job card at, say, 72 %. Open the breakdown. Let the six
weights sit on screen — do not rush this. Then show the missing-skills line.

> Every posting gets a match score. Not from a language model — from a published
> formula: skills forty-five, role twenty, location ten, remote ten, seniority ten,
> pay five. Same CV, same posting, same number tomorrow. And it names the exact
> skills standing between you and that job.

**This is the most important shot in the film.** It is the claim no competitor
makes, and the one a technical viewer will test. Give it twenty-five seconds.

---

## 1:15–1:45 · The letter that is graded before you see it

**On screen.** Click generate. Show the agent trace as it runs: Scout, Matcher,
Writer, Critic. Then the finished letter, with the score and revision count
visible beside it.

> The cover letter is written by one agent and graded by another, out of a hundred,
> against the posting itself. Below the bar, it goes back for revision. In testing,
> half the letters were sent back at least once — and a letter claiming something
> your CV does not support cannot pass at all.

**Show the score even if it is 85, not 98.** A visible imperfect number is the
point; it is what makes the rest credible.

---

## 1:45–2:00 · Close

**On screen.** The kanban board with a few applications in different columns. Hold.
Cut to the URL on a plain background.

> From there you track every application through to the interview.
>
> CareerAI. Live at careerai-jk.duckdns.org.

---

## Cuts from the 5:08 take

Drop entirely, in this order, until the running time fits:

1. **Registration and sign-in.** Nobody doubts a login form works. Start signed in.
2. **Profile fields being typed.** Show the finished profile for one second instead.
3. **Filter menus being opened.** State the filters in narration if they matter.
4. **The settings and admin pages.** Not part of the promise being made.
5. **Any wait longer than two seconds.** Cut on the action, land on the result.

---

## Production notes

**Record at 1920×1080**, browser zoomed to about 110 % — text that is comfortable
on your monitor is unreadable in an embedded player.

**Record the narration separately** from the screen. Reading while clicking
produces both a worse take and worse timing, and a separate audio track can be
re-recorded without redoing the capture.

**Hide anything personal** before recording: real email addresses, the admin
account, browser bookmarks. Use a clean profile.

**Export as MP4, H.264.** Under 100 MB embeds directly in the GitHub README as a
player; above that it has to go to YouTube, and GitHub will only render a
thumbnail link.

**The source recording** referenced by the openscreen project file is at
`recording-1785529253499.mp4` in `%APPDATA%\openscreen\recordings\`. That is the
file to edit — the `.mp4` currently linked from GitHub is the 4.5 KB project
descriptor, not video.

---

## Where it goes when it is done

1. `README.md`, the `## Demo` section — drag the file into the GitHub web editor
   and leave the resulting URL bare on its own line. Wrapping it in link syntax
   turns the player back into a link.
2. `docs/index.html`, the `#video` section — a `<video controls>` tag, with the
   file in `docs/`.

Both placeholders are already in the files, with instructions in the comments.
