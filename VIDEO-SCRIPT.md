# Demo video — shot list and narration

**Target: 2:00.** Two minutes is what a prospect will give an unfamiliar product
before deciding; the existing recording runs 5:08. This is not a trim of that take, it is a shorter film — the
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

---

## Voiceover, ready to paste

The narration above, with the stage directions stripped out, in one block. Paste
it into a text-to-speech tool and record the screen separately, then lay the two
together.

The bracketed markers are pauses, not words. ElevenLabs and most others honour a
line break as a short breath; the marks are there so you can hear where the shot
changes even before the picture is cut.

**201 words — about 80 seconds of voice.** The remaining forty seconds are shot holds
and breathing room. If a take runs long, cut the third paragraph, not the fourth.

```
Applying for a security job in Germany means doing the same work over and over.
Different portals, no shared interface. Twenty requirements per posting, and no
indication which ones you already meet.

[pause]

You upload your CV once. The system reads it, including scanned PDFs, and extracts
what you can actually demonstrate.

One search reaches every configured portal. Eight without any API key, eleven with
them. The same vacancy posted three times is merged into one card.

[pause]

Every posting gets a match score. Not from a language model. From a published
formula: skills forty-five, role twenty, location ten, remote ten, seniority ten,
pay five. The same CV and the same posting give the same number tomorrow. And it
names the exact skills standing between you and that job.

[pause]

The cover letter is written by one agent and graded by another, out of a hundred,
against the posting itself. Below the bar, it goes back for revision. In testing,
half the letters were sent back at least once. And a letter claiming something
your CV does not support cannot pass at all.

[pause]

From there you track every application through to the interview.

CareerAI. Live at careerai dash j k dot duckdns dot org.
```

**On the last line.** Spell the URL out phonetically as written above, or the
synthetic voice will read "careerai-jk.duckdns.org" as one unpronounceable word.
Show the URL on screen at the same time; nobody types a domain from audio alone.

**On the numbers.** "Forty-five, twenty, ten, ten, ten, five" read as words is
deliberate — a TTS engine given "45%" often produces "forty-five percent sign".
Check that one line before recording the whole take.

**Voice choice.** Pick one and stay with it across the whole video. A warm, level
delivery suits this material; anything with sales energy fights the content, which
is arguing that the numbers can be checked.

---

## Generating the atmosphere shots with Veo

Veo 3.1 does text-to-video and image-to-video with native audio, in clips of about
eight seconds. A ninety-second film is therefore assembled, not generated: roughly
five generated clips carrying atmosphere and transitions, and the product shown by
real screen capture in between.

**The split is not a matter of taste.** Generative video cannot render legible
interface text — labels come out as plausible-looking nonsense. A film arguing that
this product's numbers can be checked, illustrated with a fabricated interface,
refutes itself in the one place a viewer looks closely. So:

| Beat | Source |
|---|---|
| 0:00–0:12 · the problem | **Veo** — no product on screen yet |
| 0:12–0:30 · the CV goes in | **Capture** — the real upload and the extracted skills |
| 0:30–0:50 · one search | **Veo** for a 3s transition, then **capture** for the merged list |
| 0:50–1:15 · the score | **Capture only.** This is the shot the film exists for |
| 1:15–1:45 · the graded letter | **Capture** — the agent trace and the visible score |
| 1:45–2:00 · close | **Veo** — one atmospheric hold under the closing line |

Never generate a shot of the product. Generate the world around it.

### Writing prompts Veo responds to

Six things, in this order: subject, action, camera, lens and framing, lighting, and
audio. Vague prompts produce stock-looking results; the specificity is what buys
the cinematic quality. Keep one sentence per element rather than one long clause.

Say what the camera does. "Slow dolly in" and "static wide, no camera movement" are
instructions Veo follows; "cinematic" on its own is not.

---

### Clip 1 — the problem, opening (8s)

```
A young woman sits alone at a kitchen table late at night, laptop open, three
browser windows overlapping on the screen. She scrolls, stops, rubs her eyes, and
scrolls again. Her expression is tired rather than dramatic.

Camera: slow push in from a medium-wide shot to a medium shot, ending slightly
above her eyeline.
Lens: 35mm, shallow depth of field, the room falling out of focus behind her.
Lighting: single warm lamp off-frame left, cool blue laptop glow on her face, deep
shadow in the rest of the room.
Mood: quiet fatigue, not despair.
Audio: room tone, a fridge hum, occasional keyboard clicks. No music, no dialogue.
```

**On the laptop screen:** ask for it out of focus or angled away. A readable screen
here is a screen Veo will get wrong.

### Clip 2 — the problem, the pile (8s)

```
Extreme close-up of a printed job advertisement on a desk, dense paragraphs of
requirements running off the bottom of the frame. A hand slides a second printed
page on top of it, then a third, then a fourth. The pile grows unevenly.

Camera: static top-down shot, locked off, no movement.
Lens: 50mm macro, the paper texture visible, edges soft.
Lighting: hard directional desk lamp from the right, sharp shadows between the
sheets.
Mood: accumulating weight.
Audio: paper sliding on paper, the dry sound of pages settling. Nothing else.
```

Printed pages rather than screens: real paper is a thing Veo renders well, and the
requirements do not need to be legible for the shot to say "twenty of these".

### Clip 3 — transition into the search (3s, trim from 8s)

```
Abstract shot of many small points of light drifting in dark space, slowly
converging toward a single brighter point at the centre of frame. The motion is
smooth and unhurried, suggesting consolidation rather than speed.

Camera: slow orbit around the convergence point.
Lens: 85mm, heavy bokeh on the out-of-focus points.
Lighting: the points are the only light source; the background is near-black.
Mood: order emerging from scatter.
Audio: a low sustained tone rising slightly in pitch. No percussion.
```

This is the one place a generated abstract shot beats a screen recording: eleven
sources merging into one list is an idea, not a picture. Trim to three seconds — an
abstract shot outlives its welcome quickly.

### Clip 4 — the close (8s)

```
A man in his late twenties closes a laptop on a desk by a window, picks up a coat
from the back of the chair and walks out of frame. Morning light. The desk is left
tidy. He does not look back at the laptop.

Camera: static medium-wide, locked off. He exits frame right.
Lens: 35mm, deep focus, the window blown out slightly.
Lighting: natural morning sun through the window, cool fill from the left.
Mood: resolved, unhurried. The work is finished.
Audio: a chair moving, a door, distant street noise. No music.
```

The close mirrors the open deliberately: same kind of room, same kind of desk,
opposite posture. Night to morning, alone and stuck to finished and leaving.

---

### Two things to check on every generated clip

**Hands and text.** These are where generative video still fails visibly. Reject a
take with six fingers or with signage in it, however good the rest looks — a viewer
who notices stops watching the argument and starts watching the artefact.

**Continuity of person.** Veo has no memory between clips. The woman in clip 1 and
the man in clip 4 are different people on purpose; if you want the same person
twice, generate from a reference image rather than from text, or the audience will
read two characters as a continuity error.

### Audio

Veo 3.1 generates audio with the picture, which is useful for room tone and
incidental sound and unreliable for narration — you cannot iterate on one word of a
line without regenerating the shot.

Generate ambience only, keep the narration on a separate text-to-speech track, and
duck the ambience under the voice in the edit. The voiceover text is above, already
written for that workflow.

---

## Step 2 — the three reference images

Generate these as stills first, approve them, and only then feed them to Veo as
image-to-video inputs. Veo carries no memory between clips: a text prompt run twice
produces two different people, and an audience reads that as a continuity error
rather than as two characters.

Three images cover the whole film because only two locations and one person recur.

**Frame wider than the shot you want.** Veo moves the camera inside the image it is
given, and a tightly framed still leaves it nothing to move into. Every prompt below
asks for headroom and space on one side.

**No text anywhere in frame.** No signage, no book spines, no visible screen
content, no logos. Generated lettering is the single most obvious artefact, and once
a viewer notices it they stop watching the argument.

---

### Reference A — the candidate

Used in the opening and, with a changed pose, in the close.

```
Photorealistic portrait of a woman in her mid-twenties seated at a plain wooden
table, facing three-quarters toward camera, hands resting near a closed notebook.
Neutral expression, relaxed shoulders, looking slightly off-camera to the left.
Dark curly hair, simple dark green sweater, no jewellery, no visible branding.

Framing: medium shot from chest up, generous headroom, empty space to her right.
Lens: 35mm, aperture f/2.8, subject sharp and background gently soft.
Lighting: single warm key light from camera left at 45 degrees, soft cool fill from
the right, no hard shadow across the face.
Colour: muted, slightly desaturated, warm skin tones against a cool background.
Background: an out-of-focus domestic interior, no text, no posters, no screens.
```

Check before approving: **both hands fully visible and correct**, symmetrical eyes,
no melted detail where the sweater meets the neck. Regenerate rather than accept a
near miss — every clip inherits whatever is wrong here.

### Reference B — the desk at night

The opening location. This is where the problem is felt.

```
Photorealistic interior of a small kitchen at night, seen from across the room. A
plain wooden table by a window, a closed laptop on it, one warm desk lamp lit at the
left edge of frame, a cold mug beside the laptop. The room is otherwise dark. No
person in frame.

Framing: wide shot, the table occupying the lower right third, the empty room
falling away to the left.
Lens: 28mm, deep focus, slight vignetting at the corners.
Lighting: the lamp is the only practical source, pooling warm light on the table;
the window is black; deep shadow fills the upper left.
Colour: warm amber against near-black, high contrast.
Mood: late, quiet, unfinished.
```

The laptop is **closed** on purpose. An open one means a screen, and a screen means
generated text.

### Reference C — the desk in the morning

The closing location. The same room, answered.

```
Photorealistic interior of the same small kitchen in the morning, seen from the same
position across the room. The same wooden table by the window, now with a closed
laptop pushed to one side and a coat over the back of the chair. Bright daylight
through the window. No person in frame.

Framing: wide shot, identical camera position and height to the night version, the
table in the lower right third.
Lens: 28mm, deep focus.
Lighting: natural morning sun through the window, slightly blown out, soft bounce
filling the room evenly. No lamp.
Colour: cool daylight, low contrast, clean.
Mood: resolved, unhurried.
```

Generate C **from B as an input image** if the tool allows it, rather than from text.
The whole point of the pair is that a viewer recognises the same room; two
independently generated kitchens will not read as one place, and the reversal —
night and stuck, morning and leaving — is the only structural idea the film has.

---

### Approving the set

Put the three side by side before generating a single clip and check:

**Light direction agrees.** If the key light falls from camera left in A, it must
fall from camera left in B, or the candidate will look composited into her own
kitchen.

**Colour temperature is deliberate.** A and B share warm-against-dark; C breaks to
cool daylight. That break is the point and should be visible when the three are seen
together.

**The same room twice.** Window in the same place, table the same wood, chair the
same shape. This is the check that most often fails, and the one worth regenerating
for.

Only then move to step 3.
