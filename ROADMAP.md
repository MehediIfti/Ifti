# Roadmap

What's live, what's next, and what's waiting on me. Issues hold the detail; this page is the map.
Update it in the same commit as the change: tick the box, add the commit or issue, move the line.

**Live:** https://ifti-gold.vercel.app/ · **Backlog:** [open issues](https://github.com/MehediIfti/Ifti/issues) · **History:** the `#changelog` page

## Live

### Pages and notes
- [x] Launch: Index, Now, Work, Shelf, notes N°001–N°004 (17 Oct 2026)
- [x] Research and Education under Academia
- [x] Playground: Whiteboard, Paperclip, Hermes Agent
- [x] Changelog page
- [x] N°005 Trust is the product
- [x] N°006 Show the cut marks
- [x] N°007 Show the guardrails first (N°005's client-work list, now its own note)
- [x] Work history timeline, homepage map (map, globe, clocks), Shelf as the archive
- [x] Hidden room `#backstage`: how the site is built, numbers counted live ([#5](https://github.com/MehediIfti/Ifti/issues/5))
- [x] A real 404: a terminal that guesses the page you meant ([#7](https://github.com/MehediIfti/Ifti/issues/7))

### Themes and look
- [x] Appearance panel: pick a theme or edit colours, background and type
- [x] Cropmark, Midnight Ledger, Lights Out (F1, start lights) and Halftone
- [x] Theme of the day: Halftone → Cropmark → Midnight Ledger at midnight Dhaka. Lights Out stays out of the rotation
- [x] Target lock: the cursor hides and four corners frame anything clickable, keyboard focus too
- [x] Favicon (`favicon.svg`, `.ico`, `apple-touch-icon.png`)
- [x] Phone browser bar follows the theme

### Live data (Vercel functions in `api/`)
- [x] On the stereo: Spotify now playing, turntable or cassette, compact player on phones ([#22](https://github.com/MehediIfti/Ifti/issues/22))
- [x] Music under Off the clock opens the stereo: playing now, and the last three songs
- [x] Door's open: free or in a meeting, from the work calendar, under my name ([#23](https://github.com/MehediIfti/Ifti/issues/23))
- [x] Live activity: the meetings heatmap counts itself from the calendar
- [x] Live F1 numbers from Jolpica, next race in the visitor's time
- [x] Dhaka right now: date, time and weather strip at the top of every page ([#14](https://github.com/MehediIfti/Ifti/issues/14))

### Interaction
- [x] Reading view: notes in tabs, properties, linked notes, graph
- [x] Search (Ctrl K / ⌘K) with actions: book a call, copy either email, tour, terminal, print, random note, achievements
- [x] Terminal (`~`): `coffee`, `fortune`, `git log`, `git status`, `top`, `ping`, `achievements`, `email [work]`, `ls -a` and more ([#2](https://github.com/MehediIfti/Ifti/issues/2), [#3](https://github.com/MehediIfti/Ifti/issues/3))
- [x] Keyboard: `?` shortcut sheet, `r` random note, Konami code for Lights Out, not saved ([#8](https://github.com/MehediIfti/Ifti/issues/8), [#10](https://github.com/MehediIfti/Ifti/issues/10), [#4](https://github.com/MehediIfti/Ifti/issues/4))
- [x] Achievements: eight badges, stored only in the browser ([#6](https://github.com/MehediIfti/Ifti/issues/6))
- [x] Links to sections: `#` beside every note heading copies a deep link
- [x] Share cards from selected quotes, Tour, Print (Work prints as a CV)
- [x] Move things around: drag the Theme tab, Terminal, sections and rail links
- [x] Coffee counter, Book a call, hover previews
- [x] Brew a cup: click the coffee cup, your cups saved in your browser ([#1](https://github.com/MehediIfti/Ifti/issues/1))
- [x] Both emails wherever the site shares one: personal and work (mehedi.ifti@musemind.agency)

### Under the hood
- [x] Hosted on Vercel, `main` only. v2-review retired ([#25](https://github.com/MehediIfti/Ifti/issues/25))
- [x] `scripts/check.mjs` on every push: scripts parse, anchors resolve, page and script each under 75 KB gzipped
- [x] `scripts/check-layout.mjs` before shipping: every page at 390, 700, 820 and 1440 px, column wide enough, no sideways scroll
- [x] Audit fixes: notes readable on phones, no page jump on phone load, Appearance panel fits phones, time-zone caption follows daylight saving, no intro on deep links
- [x] Self-hosted fonts, skip link, no cookies

## Next (ready to build)
Play order: lowest milestone first, oldest first. Say "next issue" to start one.

- [ ] [#9](https://github.com/MehediIfti/Ifti/issues/9) Reading progress on notes · 20-min
- [ ] [#11](https://github.com/MehediIfti/Ifti/issues/11) Stat share cards · 20-min
- [ ] [#12](https://github.com/MehediIfti/Ifti/issues/12) Map game: find Dhaka · 20-min
- [ ] [#13](https://github.com/MehediIfti/Ifti/issues/13) Theme roulette · 20-min
- [ ] [#15](https://github.com/MehediIfti/Ifti/issues/15) Tour on phones · 20-min
- [ ] [#29](https://github.com/MehediIfti/Ifti/issues/29) Contrast check for every theme in check.mjs · 20-min
- [ ] [#30](https://github.com/MehediIfti/Ifti/issues/30) Installable: web app manifest · 20-min
- [ ] [#26](https://github.com/MehediIfti/Ifti/issues/26) Free-slot finder under Book a call · 2x20-min
- [ ] [#27](https://github.com/MehediIfti/Ifti/issues/27) Note share previews and an RSS feed · 2x20-min
- [ ] [#28](https://github.com/MehediIfti/Ifti/issues/28) Recap email builder in the Playground · 2x20-min
- [ ] [#31](https://github.com/MehediIfti/Ifti/issues/31) Theme secrets and scratching the record · 2x20-min

## Later (bigger builds, start with a first slice)
- [ ] [#20](https://github.com/MehediIfti/Ifti/issues/20) Ask Ifti in the terminal: keyword search over the notes first, no AI. [30-day plan](docs/plans/ask-ifti-30-day-plan.md). Parked 18 Oct: quick wins first.
- [ ] [#21](https://github.com/MehediIfti/Ifti/issues/21) Negotiation sparring game: a scripted buyer first
- [ ] [#24](https://github.com/MehediIfti/Ifti/issues/24) Whiteboard guestbook: notes by FormSubmit, approved by hand

## Waiting on me (`needs-info`)
- [ ] [#16](https://github.com/MehediIfti/Ifti/issues/16) A /uses page: the list of what I use
- [ ] [#17](https://github.com/MehediIfti/Ifti/issues/17) The Gentlemen and Supergirl: series or film?
- [ ] [#18](https://github.com/MehediIfti/Ifti/issues/18) Coffee counter: which holidays I took off
- [ ] [#19](https://github.com/MehediIfti/Ifti/issues/19) Licence: MIT for code, words all rights reserved?
- [ ] [#32](https://github.com/MehediIfti/Ifti/issues/32) Trust blocks: first-call details, two openers, quotable recommendations (parked for now)
- [ ] [#33](https://github.com/MehediIfti/Ifti/issues/33) Note filters: names for the two kinds of notes
- [ ] [#34](https://github.com/MehediIfti/Ifti/issues/34) Spotify "On repeat": OK to sign in once more?

## Decided
- No working hours on the site. Status is free or busy, any hour.
- No Indian film, series or comedy references. American or relevant ones instead.
- Stereo: turntable by default, cassette as the option. Hidden on the homepage.
- Dhaka strip at the top of every page; availability under the name.
- Secrets live only in Vercel env vars. Only free/busy and counts leave the calendar functions, never titles.
