# Ifti

Personal notebook site: notes, a monthly now page, work and bookshelf.

**Live:** https://ifti-gold.vercel.app/ (the old address, mehediifti.github.io/Ifti, forwards here)

Single static file (`index.html`), hosted on Vercel. `package.json` only holds packages for the server functions in `api/`.

**What's live, what's next, what's waiting on me:** [ROADMAP.md](ROADMAP.md).

## Start here

```sh
git clone https://github.com/MehediIfti/Ifti.git && cd Ifti
npm install                 # only needed to run the api/ functions locally (node-ical)
node scripts/check.mjs      # scripts parse, #links resolve, size under budget
node scripts/check-layout.mjs  # every page at 390, 700, 820, 1440 px: column wide enough, no sideways scroll (needs Playwright)
npx serve .                 # preview at localhost:3000 (any static server works)
```

- **Branch:** work on `main`. Vercel deploys `main` to the live site on every push; other branches get a preview link.
- **Rules:** read `CLAUDE.md` (how a session works, "next issue") and `VOICE.md` (how every word reads) before changing anything.
- **Live data offline:** a static server can't run `api/`, so the stereo, status, weather, F1 and heatmap fall back or stay hidden. Use `?player=demo` and `?status=free|busy` to preview the first two, or `vercel dev` to run the functions.

**Server functions (`api/`):**

| Endpoint | What it does | Cache |
|---|---|---|
| `/api/now-playing` | What I'm playing on Spotify | 20 s |
| `/api/status` | Free or busy-until, from the work calendar | 2 min |
| `/api/activity` | Meetings per day for 18 weeks (counts only) | 1 h |
| `/api/f1` | Standings, Max's numbers, next race (Jolpica) | 6 h |
| `/api/weather` | Dhaka temperature and sky (Open-Meteo) | 30 min |
| `/api/ping` | Health check, used by the terminal's `ping` | none |
| `/api/spotify-login`, `/api/spotify-callback` | One-time Spotify setup | none |

`api/_calendar.js` is shared by status and activity; files starting with `_` aren't endpoints.

**Vercel environment variables** (Project → Settings → Environment Variables; never in the page):

| Name | For |
|---|---|
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | The Spotify app |
| `SPOTIFY_REFRESH_TOKEN` | Reading what I play |
| `SPOTIFY_SETUP_KEY` | Only during Spotify setup; delete after |
| `GOOGLE_ICS_URL` | Secret iCal address of the work calendar. Treat it like a password |

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
- **Safety check:** every push runs `scripts/check.mjs` (GitHub Actions): the scripts must parse, every `#link` must point somewhere, and the page must stay under its size budget. Run it locally with `node scripts/check.mjs`.
- **Layout check:** `scripts/check-layout.mjs` opens every page in four themes at 390, 700, 820 and 1440 px and fails if the reading column is under 300 px, the page scrolls sideways, or a script throws. It needs Playwright, so it runs locally, not on push. Without Playwright in `node_modules`, set `PLAYWRIGHT=/path/to/playwright`. A squashed column throws no error, so `check.mjs` can't catch it.
- **New ideas:** use the Idea or Bug template on the New issue page.

**Voice:** all copy follows [VOICE.md](VOICE.md): plain words, the claim first, strong but true, facts only. Read it before adding a page, a note or a button. `CLAUDE.md` points Claude Code at it automatically.

**Monthly update:** edit the block marked `MONTHLY UPDATE` in `index.html` and the "Updated" date in the sidebar.

**Shelf and Now lists:** everything watched, read, listened to and explored lives in the `SHELF UPDATE` block, one list per section (Exploring, Watching, Reading, Listening), newest at the top. Add new items at the top. The Now page shows the first few of each list, set by the list's `data-now` count; older items stay on the Shelf, and each Now list links to its section there. The right rail's "Right now", the phone menu and the terminal's `now` read the top item of each. Watch list and books also live in Notion (Dashboard → Watch List → OverView, and Self-Help → Books); to refresh, ask a session to "sync the Shelf from Notion". Items not finished get a small `state` label (Watching, Up next, Dropped, Unfinished); friends' names from Notion's Suggested column stay off the site.

**Moving things around (computer only):** drag the Theme tab or the Terminal button anywhere on screen; the spot is saved in that browser, and dropping it back at its old edge or corner puts it home. Hover a section heading and drag the dotted grip to move that section within the page, or drag a link in the left rail to reorder the pages (Previous/Next follows the rail). The Theme tab and Terminal button snap to the nearest screen edge when let go; the Theme tab can also snap beside the column line next to either rail (three-column layout). Section and page order are not saved: a reload puts them back. The code is the `MOVE THINGS AROUND` block in the script.

**Coffee counter:** the pill above the Terminal button estimates cups of coffee this year: workdays so far (Sunday to Thursday, Dhaka time) times cups per workday, plus today's share by the hour. Change `CUPS_PER_DAY` (2.5) or `WORKWEEK` in the `COFFEE UPDATE` block. It follows the Terminal button when dragged and is hidden on phones. Clicking the cup brews one: the cup fills, the steam rises and the count goes up by one for that visit only (a reload puts it back). The card counts the visitor's cups today and in all, saved only in their browser (`cof-brew`). Every 100th cup of the year gets one steam burst, the first time a browser sees it (`cof-burst`). Reduced motion skips the animations.

**Search (Ctrl K / ⌘K):** finds pages, sections, notes, Shelf items, themes and a few actions (book a call, copy email, tour, terminal, print, random note). It indexes the page as it is, so new content shows up on its own. Also the Search button in the rail and the search icon on phones.

**Share cards:** select any line in a note and a "Share quote" button appears. It draws a card in the current theme (wide or square) to download, copy or share, with links to post on X or LinkedIn.

**Tour:** the square button beside the Terminal button (or "Take the tour" in search) walks through the site in a few stops. The button follows the Terminal button wherever it is dragged, and is hidden on phones, where search starts the tour. Steps that aren't on screen, like the right rail on phones, are skipped. The steps live in `STEPS` in the script.

**Print:** printing any page gives just that page, black on white, with my name, email and the page link at the top. The Work page prints as a CV. Add `class="no-print"` to anything that shouldn't print.

**Changelog:** the `CHANGELOG UPDATE` block (the `#changelog` page, linked in the footer). Written by hand, newest first, one heading per day. Only what a visitor would notice goes in: a new page, a new note, a new feature or a redesign. Copy edits, fixes and small tweaks stay out. Tag each entry Page, Note, Feature or Design.

**Stats radar:** edit the `STATS UPDATE` array in the script at the bottom of `index.html`. Each row is `[chart label, full name, strength, interest]`, scored 0–100. OVR, MVP and Grinding are calculated from it.

**Calendar activity:** the heatmap shows meetings per day for the last 18 weeks (counts only, no titles). `api/activity.js` counts them from the same calendar link as the status (what counts as a meeting lives in `api/_calendar.js`), cached for an hour. Google's link only reaches back a couple of months, so for older days the page uses the hand-kept `ACTIVITY UPDATE` block, which is also what shows if the live call fails. Nothing to update by hand any more.

**Note tags:** each note's `<article>` has a `data-tags` attribute (space-separated). Tags show in the note's Properties block, and notes that share a tag link to each other in the right column's local graph and linked mentions.

**Research:** the `RESEARCH UPDATE` block in `index.html`. One `<li>` per paper, newest first; each title links to the paper. A preprint of a published paper goes under that paper as a `pp-alt` line. The stat line under the lede (papers, preprints, citations, h-index, first author) is copied from ResearchGate by hand; update the month in the caption too.

**Education:** the `EDUCATION UPDATE` block in `index.html`, one `<li>` per school, newest first. It sits under the Academia heading in the left rail with Research.

**Playground:** tool, agent and workflow pages (Whiteboard, Paperclip, Hermes Agent, in that order), under the Playground heading in the left rail, above Academia. Playground starts open and Academia starts folded (the `data-shut` attribute on its rail group); clicking a heading toggles it, the choice is saved per visitor, and the group holding the current page always opens. The Theme tab snaps to just below the rail's last line (the Updated date) and shrinks to a dots-only pill when the screen is too short. On phones, the tab bar's More button opens the full index with Playground and Academia.

**Spotify stereo:** on every page but the homepage, the right column gets a second section, pinned to the bottom of the screen (the page details above it scroll on their own when long): a turntable (the default) or a cassette, switched under the player and remembered per visitor. It shows what I'm playing on Spotify (song or podcast episode), or the last thing I played. The markup is `#stereo` after the right column; the styles and script are marked `Spotify stereo` and `SPOTIFY`. Where the right column isn't shown (phones, tablets, the 2-column layout), a compact player (`#stereo-m`) floats at the bottom instead, above the tab bar on phones; × hides it for the visit. `api/now-playing.js` asks Spotify; the page asks it every 30 seconds on every page but the homepage, and Vercel's cache answers most of those. The player stays hidden until Spotify is connected. Add `?player=demo` to the address to preview it with placeholder text. To connect, once:
1. At developer.spotify.com/dashboard, create an app (any name). Redirect URI: `https://ifti-gold.vercel.app/api/spotify-callback`. API: Web API.
2. In Vercel → Settings → Environment Variables, add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from that app, and `SPOTIFY_SETUP_KEY` set to any long random word. Redeploy.
3. Open `https://ifti-gold.vercel.app/api/spotify-login?key=<that word>`, sign in to Spotify and agree. The page shows a refresh token.
4. Add it in Vercel as `SPOTIFY_REFRESH_TOKEN`, delete `SPOTIFY_SETUP_KEY`, and redeploy. The player appears on every page but the homepage.

**Calendar status:** under my name in the left rail on every page (and next to it in the phone top bar): **Door's open · Book a call** when my calendar is free, **In a meeting · free at 3:30 pm** when it's busy, at any hour (there are no working hours). Times show in the visitor's own time zone. Back-to-back meetings count as one; all-day events, events marked Free, cancelled ones and ones I declined don't count. `api/status.js` reads my work calendar through its secret iCal address and passes on only free or busy-until; titles and details never reach the page. It uses one package, `node-ical` (in `package.json`; Vercel installs it). Hidden until connected; add `?status=free` or `busy` to the address to preview. To connect, once: in Google Calendar (work account) → Settings → my calendar → Integrate calendar, copy **Secret address in iCal format**, add it in Vercel as `GOOGLE_ICS_URL`, and redeploy. Treat that link like a password: anyone with it can read the whole calendar. If it ever leaks, reset it on the same page and paste the new one.

**Social links:** the `SOCIALS UPDATE` list in the script. Each profile appears as a pill on the homepage (Let's talk), in the phone index menu, and as an icon tile under "Find me" in the right column. The footer links are plain HTML.

**Booking:** the booking link (Google Calendar) is `var CALENDLY` (the `BOOKING` comment in the script). Every `data-book` button points to it.

**Email:** wherever the site shares my email, it shows both: personal (mh.hasan884@gmail.com) and work (mehedi.ifti@musemind.agency). That's the contact line under Book a call on the homepage and Work, the Find me icons (`SOCIALS UPDATE`), the terminal's `email` (and `email work`), search's two copy actions, and the printed header.

**Contact form:** posts to FormSubmit and lands in mh.hasan884@gmail.com. The first submission sends a one-time activation email; click it once and every later message comes through. The endpoint is `SUGGEST_ENDPOINT` in the script.

**Share preview and domain:** the `SHARE PREVIEW` block in `<head>` holds the canonical URL, Open Graph / X tags and the Person schema. It points at `https://ifti-gold.vercel.app/`; when a custom domain is connected, replace that address there (and in the schema). The preview image is `og.png` (1200×630).

**CV:** `cv.pdf`, one A4 page, linked from the homepage and the Work page.

**Themes:** current themes are Halftone (week 43: mint paper, pixel type, a dithered orange sun drawn by the script as `--ht-sun`), Cropmark (week 43), Lights Out (F1, Red Bull colours, plays start lights when picked) and Midnight Ledger (week 42). **Theme of the day:** visitors who haven't picked a theme get one from `THEME_DAY` (top of the page, in the `<head>` script), changing at midnight Dhaka time: Halftone (18 Oct 2026), Cropmark, Midnight Ledger, and round again. Lights Out is not in the rotation. Its card in the picker says "Today". Picking any other theme sticks; picking today's theme puts the visitor back on the rotation. To add a theme to the rotation, add a row to `THEME_DAY` (its settings must match its `set` in `THEMES`). Each theme's extra styling lives in its `THEME:` block at the end of the CSS. The target lock's colour is `--lock`; set it per theme there. The list is the `THEME UPDATE` list (`THEMES`) in the script. Each theme is a named bundle of colours, background, pattern, layout and text. The picker shows them in list order, so add each week's theme at the top. Visitors can edit any theme with the controls under it; edits are saved per theme on their device, and Reset puts that theme back to how it shipped. For styling beyond the panel's options, target `:root[data-theme="<id>"]` in the CSS. Also update the `data-*` attributes on `<html>` to match the new default so there's no flash on load.

**Off the clock pop-ups:** each card with `data-pop` opens a pop-up built in `POPS` in the script. F1: standings, Red Bull's position, Max's wins, podiums and starts, his latest win and the next race (in the visitor's time) come live from `api/f1.js`, which reads the free Jolpica F1 API (no key) and is cached for six hours. The `F1 UPDATE` block holds fallbacks for when it's down, plus what stays by hand: titles, title years, poles and records.

**Terminal:** press `~`, or click the `>_ Terminal` button in the bottom-left corner. It is hidden on phones; search opens it there. Commands live in `CMDS` in the script: `help`, `ls`, `cd`, `cat`, `whoami`, `now`, `f1`, `theme`, `book`, `email`, `cv`, `socials`, `coffee` (same numbers as the pill, from `window.coffeeNow()`), `fortune` (a random `<mark>` line from the notes), `git log` (the Changelog; `--all` for everything) and `git status`, `top` (the `STATS UPDATE` rows as processes), `ping` (three real calls to `/api/ping`), `date`, `pwd`, `echo`, `history`, `clear`, `exit`, plus `sudo hire ifti`.

**Dhaka right now:** a thin strip at the top of every page, above its label and heading: Dhaka's date and time (worked out in the page, ticking each minute) and the weather from `api/weather.js`, which reads Open-Meteo (free, no key, no cookies) and is cached for 30 minutes, so visitors' browsers never call a third party. Each visit keeps it for 30 minutes in `sessionStorage`. If the weather can't load, only the time shows.

**404:** `404.html`, served by Vercel for any address that doesn't exist. A terminal says there's no such page, lists the main pages, and guesses the one you meant (`/notes` → `/#notes`, `/n/5` → `/#n-005`). It stands alone (no main script), uses the visitor's saved theme colours or today's, and isn't indexed.

**Hidden room:** `#backstage`, a page about how the site is built. It's left out of the rail, search, Previous/Next and the changelog on purpose. The terminal finds it: `ls -a` lists `.backstage`, and `cd .backstage` opens it. Its numbers (pages, notes, themes, changelog entries, page size) are counted live.

**Achievements:** eight badges in the `ACHIEVEMENTS` block (`ACH`), stored only in `localStorage`, with a small toast when one unlocks: terminal, `?` sheet, three themes picked, every note opened, tour, share card, the hidden room and the Konami code. Search "Achievements" or type `achievements` in the terminal for the list. Call `unlock('id')` from any new feature to add one.

**Keyboard:** `?` opens the shortcut sheet, built from the number-key map (`keys`) and the rail's labels, so new pages show up on their own. `r` opens a random note, never the one you're on (`randomNote()`, also used by search). There's one key the sheet doesn't mention: the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) runs the start lights and shows Lights Out for that visit only; a reload brings back the visitor's own theme.

**Links to sections:** every note heading gets an id like `s-n-005-who-pays-for-it` when the page loads (the same id search uses), and a `#` beside it copies the link. A fresh visit to that link opens the note at the section.

**Hover previews:** on a desktop, hovering any link to another page or note shows its title and first lines. Nothing to update; it reads the page itself.

**Speed:** keep it fast by following these rules.
- Fonts are self-hosted in `fonts/` (Latin only, `font-display: swap`). Don't add Google Fonts links. To add a font, download its Latin woff2 into `fonts/` and add an `@font-face` at the top of the `<style>`. Only the default theme's fonts are preloaded.
- A tiny script in `<head>` shows only the page being opened and applies the visitor's saved theme before the first paint. Keep it small.
- Homepage blocks below the fold use `content-visibility: auto`. Add new long homepage sections to that rule.
- Heavy visuals (like the hero map) build right after the first paint. Do the same for anything new and expensive.
- No images in the page itself. `og.png` and `cv.pdf` only load when shared or clicked.
- **Size budget:** `scripts/check.mjs` fails if `index.html` goes over 115 KB gzipped (about 112.6 KB today). Raise `BUDGET` there on purpose, not to get a push through.
- **Favicon:** `favicon.svg` is the source (target-lock corners around a pixel "i", drawn on a 32px grid). `favicon.ico` (16, 32, 48) and `apple-touch-icon.png` (180) are rendered from it; re-render both if the SVG changes.

**Whiteboard (Playground, key 6):** the app lives in its own repo, `MehediIfti/whiteboard`, deployed by its own Vercel project at `whiteboard-mu-two.vercel.app`. `vercel.json` passes `/whiteboard/` through to it, so the `#whiteboard` page loads it from the site's own address (`WB_URL` in the script) the first time the page opens, on computers only; phones see a short note instead. Change the tool in that repo, not here.