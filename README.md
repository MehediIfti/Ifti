# Ifti

Personal notebook site: notes, a monthly now page, work and bookshelf.

Single static file (`index.html`), served with GitHub Pages.

**Voice:** all copy follows [VOICE.md](VOICE.md): plain words, the claim first, strong but true, facts only. Read it before adding a page, a note or a button. `CLAUDE.md` points Claude Code at it automatically.

**Monthly update:** edit the block marked `MONTHLY UPDATE` in `index.html` and the "Updated" date in the sidebar.

**Stats radar:** edit the `STATS UPDATE` array in the script at the bottom of `index.html`. Each row is `[chart label, full name, strength, interest]`, scored 0–100. OVR, MVP and Grinding are calculated from it.

**Calendar activity:** the `ACTIVITY UPDATE` block holds meetings per day from the calendar (counts only, no titles). `from` is the first day (a Sunday); each row of `counts` is one week.

**Note tags:** each note's `<article>` has a `data-tags` attribute (space-separated). Tags show in the note's Properties block, and notes that share a tag link to each other in the right column's local graph and linked mentions.

**Research:** the `RESEARCH UPDATE` block in `index.html`. One `<li>` per paper, newest first; each card links to the paper's DOI. The index tiles (Research Interest, citations, h-index, papers, preprints, first author) are copied from ResearchGate by hand.

**Education:** the `EDUCATION UPDATE` block in `index.html`, one `<li>` per school, newest first. It sits under the Academia heading in the left rail with Research.

**Playground:** agent and workflow pages (Paperclip, Hermes Agent), under the Playground heading in the left rail, above Academia. Playground and Academia fold shut by default; clicking the heading opens them, the choice is saved per visitor, and the group holding the current page always opens. The Theme tab snaps to just below the rail's last line (the Updated date) and shrinks to a dots-only pill when the screen is too short. On phones, the tab bar's More button opens the full index with Playground and Academia.

**Social links:** the `SOCIALS UPDATE` list in the script. Each profile appears as a pill on the homepage (Let's talk), in the phone index menu, and as an icon tile under "Find me" in the right column. The footer links are plain HTML.

**Booking:** the booking link (Google Calendar) is `var CALENDLY` (the `BOOKING` comment in the script). Every `data-book` button points to it.

**Contact form:** posts to FormSubmit and lands in mh.hasan884@gmail.com. The first submission sends a one-time activation email; click it once and every later message comes through. The endpoint is `SUGGEST_ENDPOINT` in the script.

**Share preview and domain:** the `SHARE PREVIEW` block in `<head>` holds the canonical URL, Open Graph / X tags and the Person schema. When the custom domain is connected, replace `https://mehediifti.github.io/Ifti/` there (and in the schema) with the new domain. The preview image is `og.png` (1200×630).

**CV:** `cv.pdf`, one A4 page, linked from the homepage and the Work page.

**Themes:** current themes are Cropmark (week 43, the default), Lights Out (F1, Red Bull colours, plays start lights when picked) and Midnight Ledger (week 42). `THEME_DEFAULT` in the script sets what new visitors get. Cropmark's extra styling lives in the `THEME: CROPMARK` block at the end of the CSS. The list is the `THEME UPDATE` list (`THEMES`) in the script. Each theme is a named bundle of colours, background, pattern, layout and text. The first entry is what new visitors get, so add each week's theme at the top. Visitors can edit any theme with the controls under it; edits are saved per theme on their device, and Reset puts that theme back to how it shipped. For styling beyond the panel's options, target `:root[data-theme="<id>"]` in the CSS. Also update the `data-*` attributes on `<html>` to match the new default so there's no flash on load.

**Off the clock pop-ups:** each card with `data-pop` opens a pop-up built in `POPS` in the script. The F1 numbers live in the `F1 UPDATE` block (standings, career stats, records). Refresh them after each race and change `asOf`.

**Terminal:** press `~`, or click the `>_ Terminal` button in the bottom-left corner (bottom-right on phones). Commands live in `CMDS` in the script: `help`, `ls`, `cd`, `cat`, `whoami`, `now`, `f1`, `theme`, `book`, `email`, `cv`, `socials`, `clear`, `exit`, plus `sudo hire ifti`.

**Hover previews:** on a desktop, hovering any link to another page or note shows its title and first lines. Nothing to update; it reads the page itself.

**Speed:** keep it fast by following these rules.
- Fonts are self-hosted in `fonts/` (Latin only, `font-display: swap`). Don't add Google Fonts links. To add a font, download its Latin woff2 into `fonts/` and add an `@font-face` at the top of the `<style>`. Only the default theme's fonts are preloaded.
- A tiny script in `<head>` shows only the page being opened and applies the visitor's saved theme before the first paint. Keep it small.
- Homepage blocks below the fold use `content-visibility: auto`. Add new long homepage sections to that rule.
- Heavy visuals (like the hero map) build right after the first paint. Do the same for anything new and expensive.
- No images in the page itself. `og.png` and `cv.pdf` only load when shared or clicked.

**Whiteboard (Playground, key 0):** the app lives in its own repo, `MehediIfti/whiteboard`, served at `mehediifti.github.io/whiteboard/`. The `#whiteboard` page loads it in a frame (`WB_URL` in the script) the first time the page opens, on computers only; phones see a short note instead. Change the tool in that repo, not here. If the site moves to a custom domain, give the app a subdomain (e.g. `board.yourdomain.com`) and update `WB_URL`, so boards and full screen keep working.