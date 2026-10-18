# Working on this site

- **Voice:** every word on the site follows [VOICE.md](VOICE.md). Read it before writing or editing any copy: pages, notes, labels, buttons, captions, meta tags.
- **Facts only:** never invent clients, quotes, numbers or stories. Ask Ifti if something is missing.
- **Structure:** single file, `index.html`. The README lists every `UPDATE` block and how themes work.
- **Location:** Dhaka everywhere.
- **Notes from podcasts, videos and books:** summarise what was said, attributed to the speakers. Do not add a "What I'm taking into client work" section or tie the note back to client work unless Ifti asks for it. Not everything he listens to is about work.
- **Roadmap:** [ROADMAP.md](ROADMAP.md) lists what's live, next and waiting on Ifti. When you ship or open an issue, update it in the same commit.
- **Changelog:** when a change adds a page, a note, a feature or a redesign, add one entry to the `CHANGELOG UPDATE` block in the same commit. Skip copy edits, fixes and small tweaks.

## Daily routine: "next issue"

When Ifti says "next issue":
1. **Pick** the oldest open issue in the lowest milestone (1, then 2, then 3) that has `20-min` (or `2x20-min` if he says there's time) and neither `needs-info` nor `needs-backend`. Read it with `gh api repos/MehediIfti/Ifti/issues/N` (GraphQL is not available).
2. **Build** it in about 20 minutes. If it runs long, stop at a working point and comment on the issue with what's left.
3. **Verify:** `node scripts/check.mjs` and `node scripts/check-layout.mjs`, then Playwright screenshots at 1440px and 390px with no page errors, in Cropmark and one other theme.
4. **Ship** straight to `main`: add a `CHANGELOG UPDATE` entry if it's a page, note, feature or redesign; put `Closes #N` in the commit message.
5. **Report** in a few lines: what shipped, the live link, and the next issue up.

If an issue needs a fact, ask Ifti instead of guessing, and add `needs-info`.
