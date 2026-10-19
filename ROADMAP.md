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
- [x] Notes have their own links (`/n/005`) with their own previews, and an RSS feed at `/feed.xml` ([#27](https://github.com/MehediIfti/Ifti/issues/27))
- [x] A real 404: a terminal that guesses the page you meant ([#7](https://github.com/MehediIfti/Ifti/issues/7))

### Themes and look
- [x] Appearance panel: pick a theme or edit colours, background and type
- [x] Cropmark, Midnight Ledger, Lights Out (F1, start lights) and Halftone
- [x] Theme of the day: Halftone → Cropmark → Midnight Ledger at midnight Dhaka. Lights Out stays out of the rotation
- [x] Target lock: the cursor hides and four corners frame anything clickable, keyboard focus too
- [x] Favicon (`favicon.svg`, `.ico`, `apple-touch-icon.png`)
- [x] Phone browser bar follows the theme
- [x] Theme tricks: Halftone's sun sets, Midnight Ledger's desk lamp (L), Cropmark's printer's proof (C) ([#31](https://github.com/MehediIfti/Ifti/issues/31))
- [x] Theme roulette: "Surprise me" in search ([#13](https://github.com/MehediIfti/Ifti/issues/13))

### Live data (Vercel functions in `api/`)
- [x] On the stereo: Spotify now playing, turntable or cassette, compact player on phones ([#22](https://github.com/MehediIfti/Ifti/issues/22))
- [x] Music under Off the clock opens the stereo: playing now, and the last three songs
- [x] Door's open: free or in a meeting, from the work calendar, under my name ([#23](https://github.com/MehediIfti/Ifti/issues/23))
- [x] Live activity: the meetings heatmap counts itself from the calendar
- [x] Live F1 numbers from Jolpica, next race in the visitor's time
- [x] Race weekend: the Dhaka strip counts down to lights out ([#42](https://github.com/MehediIfti/Ifti/issues/42))
- [x] Dhaka right now: date, time and weather strip at the top of every page ([#14](https://github.com/MehediIfti/Ifti/issues/14))

### Interaction
- [x] Reading view: notes in tabs, properties, linked notes, graph
- [x] Search (Ctrl K / ⌘K) with actions: book a call, copy either email, tour, terminal, print, random note, achievements
- [x] Terminal (`~`): `coffee`, `fortune`, `git log`, `git status`, `top`, `ping`, `achievements`, `email [work]`, `ls -a` and more ([#2](https://github.com/MehediIfti/Ifti/issues/2), [#3](https://github.com/MehediIfti/Ifti/issues/3))
- [x] Keyboard: `?` shortcut sheet, `r` random note, Konami code for Lights Out, not saved ([#8](https://github.com/MehediIfti/Ifti/issues/8), [#10](https://github.com/MehediIfti/Ifti/issues/10), [#4](https://github.com/MehediIfti/Ifti/issues/4))
- [x] Achievements: nine badges, stored only in the browser ([#6](https://github.com/MehediIfti/Ifti/issues/6))
- [x] Secrets counter in the footer: how many there are, how many you've found ([#40](https://github.com/MehediIfti/Ifti/issues/40))
- [x] F1 reaction test: start lights, timed, best time kept, new badge under 250 ms ([#41](https://github.com/MehediIfti/Ifti/issues/41))
- [x] Reading progress: a line along the top fills as you read a note, with minutes left ([#9](https://github.com/MehediIfti/Ifti/issues/9))
- [x] Links to sections: `#` beside every note heading copies a deep link
- [x] Share cards from selected quotes, Tour, Print (Work prints as a CV)
- [x] Challenge and secrets cards: share your reaction time with a `?beat=` link, or your secrets found ([#11](https://github.com/MehediIfti/Ifti/issues/11))
- [x] Move things around: drag the Theme tab, Terminal, sections and rail links
- [x] Coffee counter, Book a call, hover previews
- [x] Stereo by hand: scratch the record, fast-forward the cassette ([#31](https://github.com/MehediIfti/Ifti/issues/31))
- [x] Brew a cup: click the coffee cup, your cups saved in your browser ([#1](https://github.com/MehediIfti/Ifti/issues/1))
- [x] Both emails wherever the site shares one: personal and work (mehedi.ifti@musemind.agency)

### Under the hood
- [x] Hosted on Vercel, `main` only. v2-review retired ([#25](https://github.com/MehediIfti/Ifti/issues/25))
- [x] `scripts/check.mjs` on every push: scripts parse, anchors resolve, page and script each under 75 KB gzipped
- [x] `scripts/check-layout.mjs` before shipping: every page at 390, 700, 820 and 1440 px, column wide enough, no sideways scroll
- [x] Audit fixes: notes readable on phones, no page jump on phone load, Appearance panel fits phones, time-zone caption follows daylight saving, no intro on deep links
- [x] Self-hosted fonts, skip link, no cookies
- [x] Contrast: every palette passes 4.5:1, checked by `check.mjs` on every push; axe scan 0 violations on 44 page views ([#29](https://github.com/MehediIfti/Ifti/issues/29))
- [x] Screen readers: real buttons for Off the clock, honest note tabs, heading levels; `robots.txt`, `sitemap.xml`, security headers

## Next (ready to build)
Play order: lowest milestone first, oldest first. Say "next issue" to start one.

- [ ] [#15](https://github.com/MehediIfti/Ifti/issues/15) Tour on phones · 20-min
- [ ] [#30](https://github.com/MehediIfti/Ifti/issues/30) Installable: web app manifest · 20-min
- [ ] [#26](https://github.com/MehediIfti/Ifti/issues/26) Free-slot finder under Book a call · 2x20-min
- [ ] [#28](https://github.com/MehediIfti/Ifti/issues/28) Recap email builder in the Playground · 2x20-min
- [ ] [#49](https://github.com/MehediIfti/Ifti/issues/49) Refresh og.png with the current address · 20-min
- [ ] [#47](https://github.com/MehediIfti/Ifti/issues/47) Accessibility scan in check-layout.mjs · 20-min
- [ ] [#48](https://github.com/MehediIfti/Ifti/issues/48) Lighter first load on phones · 2x20-min

## Cool, for later
The fun queue. Pick one when there's a free session.

- [ ] [#43](https://github.com/MehediIfti/Ifti/issues/43) A preview image for every note: N°, title and date in the site's look · 2x20-min
- [ ] [#45](https://github.com/MehediIfti/Ifti/issues/45) Belief cards: share a line from What I believe · 20-min
- [ ] [#46](https://github.com/MehediIfti/Ifti/issues/46) Listen to a note: read aloud by the browser, the paragraph highlighted · 20-min
- [ ] [#44](https://github.com/MehediIfti/Ifti/issues/44) Fastest starts: a reaction-test leaderboard (needs a small store)

## Later (bigger builds, start with a first slice)
- [ ] [#21](https://github.com/MehediIfti/Ifti/issues/21) Negotiation sparring game: a scripted buyer first
- [ ] [#24](https://github.com/MehediIfti/Ifti/issues/24) Whiteboard guestbook: notes by FormSubmit, approved by hand
- [ ] [#50](https://github.com/MehediIfti/Ifti/issues/50) Hear about broken features before visitors do: script errors logged by a Vercel function

## Waiting on me (`needs-info`)
- [ ] [#16](https://github.com/MehediIfti/Ifti/issues/16) A /uses page: the list of what I use
- [ ] [#17](https://github.com/MehediIfti/Ifti/issues/17) The Gentlemen and Supergirl: series or film?
- [ ] [#18](https://github.com/MehediIfti/Ifti/issues/18) Coffee counter: which holidays I took off
- [ ] [#19](https://github.com/MehediIfti/Ifti/issues/19) Licence: MIT for code, words all rights reserved?
- [ ] [#32](https://github.com/MehediIfti/Ifti/issues/32) Trust blocks: first-call details, two openers, quotable recommendations (parked for now)
- [ ] [#33](https://github.com/MehediIfti/Ifti/issues/33) Note filters: names for the two kinds of notes
- [ ] [#34](https://github.com/MehediIfti/Ifti/issues/34) Spotify "On repeat": OK to sign in once more?

## Decided
- Ask Ifti (#20) was closed on 18 Oct 2026 without being built. Its [30-day plan](docs/plans/ask-ifti-30-day-plan.md) stays; reopen #20 to bring it back.
- No map game (#12, dropped 19 Oct 2026).
- Phones stay lean. New fun features ship for computers first; phones get them only when they add something there.
- No working hours on the site. Status is free or busy, any hour.
- No Indian film, series or comedy references. American or relevant ones instead.
- Stereo: turntable by default, cassette as the option. Hidden on the homepage.
- Dhaka strip at the top of every page; availability under the name.
- Secrets live only in Vercel env vars. Only free/busy and counts leave the calendar functions, never titles.
