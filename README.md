# Ifti

Personal notebook site: notes, a monthly now page, work and bookshelf.

Single static file (`index.html`), served with GitHub Pages.

**Monthly update:** edit the block marked `MONTHLY UPDATE` in `index.html` and the "Updated" date in the sidebar.

**Stats radar:** edit the `STATS UPDATE` array in the script at the bottom of `index.html`. Each row is `[chart label, full name, strength, interest]`, scored 0–100. OVR, MVP and Grinding are calculated from it.

**Calendar activity:** the `ACTIVITY UPDATE` block holds meetings per day from the calendar (counts only, no titles). `from` is the first day (a Sunday); each row of `counts` is one week.

**Note tags:** each note's `<article>` has a `data-tags` attribute (space-separated). Tags show in the note's Properties block, and notes that share a tag link to each other in the right column's local graph and linked mentions.

**Research:** the `RESEARCH UPDATE` block in `index.html`. One `<li>` per paper, newest first; each card links to the paper's DOI. The index tiles (Research Interest, citations, h-index, papers, preprints, first author) are copied from ResearchGate by hand.

**Education:** the `EDUCATION UPDATE` block in `index.html`, one `<li>` per school, newest first. It sits under the Academia heading in the left rail with Research.

**Playground:** agent and workflow pages (Paperclip, Hermes Agent), under the Playground heading in the left rail, above Academia. On phones, the tab bar's More button opens the full index with Playground and Academia.

**Social links:** the `SOCIALS UPDATE` list in the script. Each profile appears as a pill on the homepage (Let's talk), in the phone index menu, and as an icon tile under "Find me" in the right column. The footer links are plain HTML.

**Booking:** the booking link (Google Calendar) is `var CALENDLY` (the `BOOKING` comment in the script). Every `data-book` button points to it.

**Contact form:** posts to FormSubmit and lands in mh.hasan884@gmail.com. The first submission sends a one-time activation email; click it once and every later message comes through. The endpoint is `SUGGEST_ENDPOINT` in the script.

**Share preview and domain:** the `SHARE PREVIEW` block in `<head>` holds the canonical URL, Open Graph / X tags and the Person schema. When the custom domain is connected, replace `https://mehediifti.github.io/Ifti/` there (and in the schema) with the new domain. The preview image is `og.png` (1200×630).

**CV:** `cv.pdf`, one A4 page, linked from the homepage and the Work page.

**Themes:** the `THEME UPDATE` list (`THEMES`) in the script. Each theme is a named bundle of colours, background, pattern, layout and text. The first entry is what new visitors get, so add each week's theme at the top. Visitors can edit any theme with the controls under it; edits are saved per theme on their device, and Reset puts that theme back to how it shipped. For styling beyond the panel's options, target `:root[data-theme="<id>"]` in the CSS. Also update the `data-*` attributes on `<html>` to match the new default so there's no flash on load.
