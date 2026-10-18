# Ifti

Personal notebook site: notes, a monthly now page, work and bookshelf.

**Live:** https://ifti-gold.vercel.app/ (the old address, mehediifti.github.io/Ifti, forwards here)

Single static file (`index.html`), hosted on Vercel. `package.json` only holds packages for the server functions in `api/`.

## Hosting

- **Vercel** deploys `main` on every push; every other branch gets its own preview link. Setup lives in `vercel.json`.
- **Whiteboard:** `/whiteboard/` is passed through to the whiteboard's own Vercel project, so it loads from the same address as the site.
- **Server functions** live in `api/` (e.g. `/api/ping`). API keys go in Vercel → Project → Settings → Environment Variables, never in the page.
- **Analytics:** Vercel Web Analytics, page views only, no cookies. It loads only on Vercel.
- **Old address:** set `LIVE` in the `HOSTING` block at the top of `index.html` to the Vercel address and GitHub Pages forwards visitors there, keeping the `#page`.

## How we work

- **Backlog:** ideas live as [issues](https://github.com/MehediIfti/Ifti/issues), grouped into milestones in play order: *1 · Easter eggs & delight*, *2 · Interaction polish*, *3 · Content & pages*, *Later · Needs a backend*. The [project board](https://github.com/MehediIfti/Ifti/projects) shows them as Ready, In progress, Done and Parked.
- **Labels:** `fun`, `feature`, `design`, `content`, `chore`, `bug` say what it is. `20-min` / `2x20-min` say how long. `needs-info` waits on a fact or decision from me; `needs-backend` waits on a small server.
- **Daily 20 minutes:** I open a session and say "next issue". The rules are in `CLAUDE.md`.
- **Safety check:** every push runs `scripts/check.mjs` (GitHub Actions): the scripts must parse and every `#link` must point somewhere. Run it locally with `node scripts/check.mjs`.
- **New ideas:** use the Idea or Bug template on the New issue page.

**Voice:** all copy follows [VOICE.md](VOICE.md): plain words, the claim first, strong but true, facts only. Read it before adding a page, a note or a button. `CLAUDE.md` points Claude Code at it automatically.

**Monthly update:** edit the block marked `MONTHLY UPDATE` in `index.html` and the "Updated" date in the sidebar.

**Shelf and Now lists:** everything watched, read, listened to and explored lives in the `SHELF UPDATE` block, one list per section (Exploring, Watching, Reading, Listening), newest at the top. Add new items at the top. The Now page shows the first few of each list, set by the list's `data-now` count; older items stay on the Shelf, and each Now list links to its section there. The right rail's "Right now", the phone menu and the terminal's `now` read the top item of each. Watch list and books also live in Notion (Dashboard → Watch List → OverView, and Self-Help → Books); to refresh, ask a session to "sync the Shelf from Notion". Items not finished get a small `state` label (Watching, Up next, Dropped, Unfinished); friends' names from Notion's Suggested column stay off the site.

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

**Spotify stereo:** on every page but the homepage, the right column gets a second section, pinned to the bottom of the screen (the page details above it scroll on their own when long): a turntable (the default) or a cassette, switched under the player and remembered per visitor. It shows what I'm playing on Spotify (song or podcast episode), or the last thing I played. The markup is `#stereo` after the right column; the styles and script are marked `Spotify stereo` and `SPOTIFY`. Where the right column isn't shown (phones, tablets, the 2-column layout), a compact player (`#stereo-m`) floats at the bottom instead, above the tab bar on phones; × hides it for the visit. `api/now-playing.js` asks Spotify; the page asks it every 30 seconds while the Now page is open, and Vercel's cache answers most of those. The player stays hidden until Spotify is connected. Add `?player=demo` to the address to preview it with placeholder text. To connect, once:
1. At developer.spotify.com/dashboard, create an app (any name). Redirect URI: `https://ifti-gold.vercel.app/api/spotify-callback`. API: Web API.
2. In Vercel → Settings → Environment Variables, add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from that app, and `SPOTIFY_SETUP_KEY` set to any long random word. Redeploy.
3. Open `https://ifti-gold.vercel.app/api/spotify-login?key=<that word>`, sign in to Spotify and agree. The page shows a refresh token.
4. Add it in Vercel as `SPOTIFY_REFRESH_TOKEN`, delete `SPOTIFY_SETUP_KEY`, and redeploy. The deck appears on the Now page.

**Calendar status:** under my name on every page (and next to it in the phone top bar): **Door's open · Book a call** when my calendar is free, **In a meeting · free at 3:30 pm** when it's busy, **Off the clock · back Sun 10 am** outside working hours (Sunday to Thursday, 10:00 to 19:00 Dhaka; change `HOURS` in `api/status.js`). Times show in the visitor's own time zone. Back-to-back meetings count as one; all-day events, events marked Free, cancelled ones and ones I declined don't count. `api/status.js` reads my work calendar through its secret iCal address and passes on only free, busy-until or off; titles and details never reach the page. It uses one package, `node-ical` (in `package.json`; Vercel installs it). Hidden until connected; add `?status=free`, `busy` or `off` to the address to preview. To connect, once: in Google Calendar (work account) → Settings → my calendar → Integrate calendar, copy **Secret address in iCal format**, add it in Vercel as `GOOGLE_ICS_URL`, and redeploy. Treat that link like a password: anyone with it can read the whole calendar. If it ever leaks, reset it on the same page and paste the new one.

**Social links:** the `SOCIALS UPDATE` list in the script. Each profile appears as a pill on the homepage (Let's talk), in the phone index menu, and as an icon tile under "Find me" in the right column. The footer links are plain HTML.

**Booking:** the booking link (Google Calendar) is `var CALENDLY` (the `BOOKING` comment in the script). Every `data-book` button points to it.

**Contact form:** posts to FormSubmit and lands in mh.hasan884@gmail.com. The first submission sends a one-time activation email; click it once and every later message comes through. The endpoint is `SUGGEST_ENDPOINT` in the script.

**Share preview and domain:** the `SHARE PREVIEW` block in `<head>` holds the canonical URL, Open Graph / X tags and the Person schema. When the custom domain is connected, replace `https://mehediifti.github.io/Ifti/` there (and in the schema) with the new domain. The preview image is `og.png` (1200×630).

**CV:** `cv.pdf`, one A4 page, linked from the homepage and the Work page.

**Themes:** current themes are Halftone (week 43: mint paper, pixel type, a dithered orange sun drawn by the script as `--ht-sun`), Cropmark (week 43), Lights Out (F1, Red Bull colours, plays start lights when picked) and Midnight Ledger (week 42). **Theme of the day:** visitors who haven't picked a theme get one from `THEME_DAY` (top of the page, in the `<head>` script), changing at midnight Dhaka time: Halftone (18 Oct 2026), Cropmark, Midnight Ledger, and round again. Lights Out is not in the rotation. Its card in the picker says "Today". Picking any other theme sticks; picking today's theme puts the visitor back on the rotation. To add a theme to the rotation, add a row to `THEME_DAY` (its settings must match its `set` in `THEMES`). Each theme's extra styling lives in its `THEME:` block at the end of the CSS. The target lock's colour is `--lock`; set it per theme there. The list is the `THEME UPDATE` list (`THEMES`) in the script. Each theme is a named bundle of colours, background, pattern, layout and text. The picker shows them in list order, so add each week's theme at the top. Visitors can edit any theme with the controls under it; edits are saved per theme on their device, and Reset puts that theme back to how it shipped. For styling beyond the panel's options, target `:root[data-theme="<id>"]` in the CSS. Also update the `data-*` attributes on `<html>` to match the new default so there's no flash on load.

**Off the clock pop-ups:** each card with `data-pop` opens a pop-up built in `POPS` in the script. The F1 numbers live in the `F1 UPDATE` block (standings, career stats, records). Refresh them after each race and change `asOf`.

**Terminal:** press `~`, or click the `>_ Terminal` button in the bottom-left corner (bottom-right on phones). Commands live in `CMDS` in the script: `help`, `ls`, `cd`, `cat`, `whoami`, `now`, `f1`, `theme`, `book`, `email`, `cv`, `socials`, `clear`, `exit`, plus `sudo hire ifti`.

**Hover previews:** on a desktop, hovering any link to another page or note shows its title and first lines. Nothing to update; it reads the page itself.

**Speed:** keep it fast by following these rules.
- Fonts are self-hosted in `fonts/` (Latin only, `font-display: swap`). Don't add Google Fonts links. To add a font, download its Latin woff2 into `fonts/` and add an `@font-face` at the top of the `<style>`. Only the default theme's fonts are preloaded.
- A tiny script in `<head>` shows only the page being opened and applies the visitor's saved theme before the first paint. Keep it small.
- Homepage blocks below the fold use `content-visibility: auto`. Add new long homepage sections to that rule.
- Heavy visuals (like the hero map) build right after the first paint. Do the same for anything new and expensive.
- No images in the page itself. `og.png` and `cv.pdf` only load when shared or clicked.
- **Favicon:** `favicon.svg` is the source (target-lock corners around a pixel "i", drawn on a 32px grid). `favicon.ico` (16, 32, 48) and `apple-touch-icon.png` (180) are rendered from it; re-render both if the SVG changes.

**Whiteboard (Playground, key 6):** the app lives in its own repo, `MehediIfti/whiteboard`, deployed by its own Vercel project at `whiteboard-mu-two.vercel.app`. `vercel.json` passes `/whiteboard/` through to it, so the `#whiteboard` page loads it from the site's own address (`WB_URL` in the script) the first time the page opens, on computers only; phones see a short note instead. Change the tool in that repo, not here.