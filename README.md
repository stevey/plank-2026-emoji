# Plank Emoji Wrapped 2026

A story-style "Wrapped" page for every custom Slack emoji announced in #new-emoji during 2026.
Plain HTML/CSS/JS with no build step. Emoji images are local copies in `emoji/`.

- `emoji/`: one image per emoji, named `<emoji-name>.<png|gif|jpg|webp>`.
- `emoji.json`: the dataset (name, first-announced time, original Slack `url`, local `file`, animated, and a hand-checked `pet`: `cat` or `dog`).
- `emoji-data.js`: the same data as `window.EMOJI`, so the page also works without a server.
- `app.js`: computes stats (busiest month and day, name "squads", longest name) and builds the slides.

Controls: tap right or press → for the next slide, tap left or press ← to go back, Space to pause.
The last slide is a grid of every emoji. Hover to see its name. Click to copy it.

## Refresh the data

Update `emoji.json`, then regenerate the script:

```bash
{ printf 'window.EMOJI = '; cat emoji.json; printf ';\n'; } > emoji-data.js
```
