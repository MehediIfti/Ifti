# Ifti

Personal notebook site: notes, a monthly now page, work and bookshelf.

Single static file (`index.html`), served with GitHub Pages.

**Voice:** all copy follows [VOICE.md](VOICE.md): plain words, the claim first, strong but true, facts only. Read it before adding a page, a note or a button. `CLAUDE.md` points Claude Code at it automatically.

**Monthly update:** edit the block marked `MONTHLY UPDATE` in `index.html` and the "Updated" date in the sidebar.

**Shelf and Now lists:** everything watched, read, listened to and explored lives in the `SHELF UPDATE` block, one list per section (Exploring, Watching, Reading, Listening), newest at the top. Add new items at the top. The Now page shows the first few of each list, set by the list's `data-now` count; older items stay on the Shelf, and each Now list links to its section there. The right rail's "Right now", the phone menu and the terminal's `now` read the top item of each.

**Moving things around (computer only):** drag the Theme tab or the Terminal button anywhere on screen; the spot is saved in that browser, and dropping it back at its old edge or corner puts it home. Hover a section heading and drag the dotted grip to move that section within the page, or drag a link in the left rail to reorder the pages (Previous/Next follows the rail). The Theme tab and Terminal button snap to the nearest screen edge when let go; the Theme tab can also snap beside the column line next to either rail (three-column layout). Section and page order are not saved: a reload puts them back. The code is the `MOVE THINGS AROUND` block in the script.

**Coffee counter:** the pill above the Terminal button estimates cups of coffee this year: workdays so far (Sunday to Thursday, Dhaka time) times cups per workday, plus today's share by the hour. Change `CUPS_PER_DAY` (2.5) or `WORKWEEK` in the `COFFEE UPDATE` block. It follows the Terminal button when dragged and is hidden on phones.

**Search (Ctrl K / ⌘K):** finds pages, sections, notes, Shelf items, themes and a few actions (book a call, copy email, tour, terminal, print, random note). It indexes the page as it is, so new content shows up on its own. Also the Search button in the rail and the search icon on phones.

**Share cards:** select any line in a note and a "Share quote" button appears. It draws a card in the current theme (wide or square) to download, copy or share, with links to post on X or LinkedIn.

**Tour:** the square button beside the Terminal button (or "Take the tour" in search) walks through the site in a few stops. The button follows the Terminal button wherever it is dragged, and is hidden on phones, where search starts the tour. Steps that aren't on screen, like the right rail on phones, are skipped. The steps live in `STEPS` in the script.

**Print:** printing any page gives just that page, black on white, with my name, email and the page link at the top. The Work page prints as a CV. Add `class="no-print"` to anything that shouldn't print.

**Changelog:** the `CHANGELOG UPDATE` block (the `#changelog` page, linked in the footer). Written by hand, newest first, one heading per day. Only what a visitor would notice goes in: a new page, a new note, a new feature or a redesign. Copy edits, fixes and small tweaks stay out. Tag each entry Page, Note, Feature or Design.

**Stats radar:** edit the `STATS UPDATE` array in the script at the bottom of `index.html`. Each row is `[chart label, full name, strength, interest]`, scored 0–100. OVR, MVP and Grinding are calculated from it.

**Calendar activity:** the `ACTIVITY UPDATE` block holds meetings per day from the calendar (counts only, no titles). `from` is the first day (a Sunday); each row of `counts` is one week.

**Note tags:** each note's `<article>` has a `data-tags` attribute (space-separated). Tags show in the note's Properties block, and notes that share a tag link to each other in the right column's local graph and linked mentions.

**Research:** the `RESEARCH UPDATE` block in `index.html`. One `<li>` per paper, newest first; each title links to the paper. A preprint of a published paper goes under that paper as a `pp-alt` line. The stat line under the lede (papers, preprints, citations, h-index, first author) is copied from ResearchGate by hand; update the month in the caption too.

**Education:** the `EDUCATION UPDATE` block in `index.html`, one `<li>` per school, newest first. It sits under the Academia heading in the left rail with Research.

**Playground:** tool, agent and workflow pages (Whiteboard, Paperclip, Hermes Agent, in that order), under the Playground heading in the left rail, above Academia. Playground starts open and Academia starts folded (the `data-shut` attribute on its rail group); clicking a heading toggles it, the choice is saved per visitor, and the group holding the current page always opens. The Theme tab snaps to just below the rail's last line (the Updated date) and shrinks to a dots-only pill when the screen is too short. On phones, the tab bar's More button opens the full index with Playground and Academia.

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

**Whiteboard (Playground, key 6):** the app lives in its own repo, `MehediIfti/whiteboard`, served at `mehediifti.github.io/whiteboard/`. The `#whiteboard` page loads it in a frame (`WB_URL` in the script) the first time the page opens, on computers only; phones see a short note instead. Change the tool in that repo, not here. If the site moves to a custom domain, give the app a subdomain (e.g. `board.yourdomain.com`) and update `WB_URL`, so boards and full screen keep working.