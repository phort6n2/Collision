# Embedding the quote form on the main WordPress site

The same form as the landing pages, packaged to drop into
`collisionautoglass.com`. It posts to **both** destinations the landing form
posts to — the HighLevel inbound webhook and the leads app — and reports **no**
Google Ads conversion.

**The snippet:** <https://collisionglass.co/embed/form.html>

That URL is two things at once. Open it in a browser and it renders a working
copy of the form, so you can test the real code end to end. **View source and
copy the whole file** and that is exactly what goes into WordPress.

---

## Before it works: one thing on the app side

The leads app checks the **origin** of the browser making the request. Its
allowlist currently holds:

```
https://collisionglass.co
https://www.collisionglass.co
```

The WordPress site is a different origin, so until these are added the second
post fails its CORS preflight:

```
https://collisionautoglass.com
https://www.collisionautoglass.com
```

Add **both** — apex and `www`. WordPress redirects between them depending on the
site's canonical setting, and the browser sends whichever one the page was
actually served from.

**What happens in the meantime:** nothing visible. The leads-app post fails
silently by design — the HighLevel post is unaffected, the visitor sees the
normal success screen, and the lead lands in the CRM as usual. It just does not
reach the app. You will see `[cag] leads-app post failed` in the browser console
and nothing else.

HighLevel's inbound webhook accepts any origin, so that half works immediately.

---

## Installing it

1. Open <https://collisionglass.co/embed/form.html>, view source, select all,
   copy.
2. In WordPress, edit the page and add a **Custom HTML** block.
3. Paste. Publish. Preview the page — the form should render immediately.

**Use the block editor's "Custom HTML" block, not the classic editor.** The
classic editor strips `<script>` tags for any user below Administrator, and it
does it silently: the block saves, the page loads, and the form is simply not
there. If the site uses a page builder, use its raw-HTML or code widget
(Elementor: "HTML"; Divi: "Code"; Beaver Builder: "HTML").

The form is `max-width: 560px` and fills its container below that, so it drops
into a sidebar, a narrow column or a full-width section without adjustment.

---

## Why it looks right on any theme

It renders into a **shadow root**. WordPress themes and page builders style
`input`, `button` and `select` globally and aggressively, and a theme rule like
`input { width: 100% !important }` beats any class prefix we could pick. A shadow
root is the only isolation that holds — the theme cannot reach in and the form's
styles cannot leak out onto the rest of the page.

`qa/embed-check.cjs` proves this rather than assuming it: it injects
`input, select, button { background: lime !important; border: 8px dashed magenta
!important }` into the host page and asserts the inputs are still white.

If the client wants the form to use their site's font instead of the system
stack, set one property on the mount point — no other change:

```html
<div id="cag-quote-form" style="--cag-font: inherit"></div>
```

---

## What it sends

The identical 37-key payload the landing form sends, with two fields deliberately
different:

| Field | Landing pages | This embed |
|---|---|---|
| `contact_source` | `Google Ads` | **`Organic`** |
| `source` | `landing:collision-portland` | `website:collisionautoglass.com` |

`contact_source` maps to the contact's **Source** in HighLevel, which is what
makes the split visible in the contact list. `paid_click` still records whether
that specific visitor actually arrived on a click ID, so a visitor who clicked an
ad and then browsed to the main site is still identifiable — see
`docs/ghl-field-mapping.md`.

Everything else is the same: the same six required fields, the same phone/ZIP/VIN
formatting, the same honeypot and trusted-interaction bot trap, the same 10-second
timeout, the same click-ID and UTM capture.

## What it does not send

**No Google Ads conversion, and no gtag at all.** This is deliberate.

Smart Bidding only learns from conversions Google can attribute to an ad click.
Ads point at `collisionglass.co`; the `_gcl_aw` cookie does not travel across
domains, so a submission here has nothing for Google to match and the conversion
would be discarded. Zero optimisation value.

The cost side is why it is not merely pointless. The landing pages send
**enhanced conversions** — hashed email and phone — which exist precisely so
Google can match a conversion to an earlier ad click *by the person* rather than
by the cookie. A visitor who clicked an ad three weeks ago and later fills in this
form can be matched and counted against the landing pages' conversion action.
That makes landing-page CPA look better than it is and feeds Smart Bidding credit
the landing pages did not earn.

If the client ever wants main-site volume visible inside Ads, create a **separate**
conversion action and set it to **Secondary** so it is observation-only and
excluded from bidding. Do not point this form at the landing pages' action.

The leads app already answers "how many organic leads" more accurately than Ads
can, because it sees all of them rather than the fraction Google manages to
attribute.

---

## Changing it later

The snippet is a **snapshot**. Editing `landing/embed-form.html` and deploying
does *not* change what is live on WordPress — the pasted copy keeps serving until
someone re-pastes it.

Two things make that survivable:

- The build stamps a date into the first line of the output. Compare it against
  the first line of what is in the WordPress block to know whether they match.
- `npm run verify` asserts that the embed's field set and payload keys match the
  landing form's, so the two cannot silently diverge **in the repo**. Nothing can
  check what is actually pasted into WordPress.

**So: any change to `landing/embed-form.html` needs a re-paste. Say so when you
make one.**

## Checking it

```
npm run qa:embed
```

Builds a throwaway copy with test IDs, then drives a real browser through four
scenarios: the healthy path, the leads app down, the CRM down, and a scripted
bot submit. It asserts both posts fire with the identical payload, that a
leads-app failure changes nothing the visitor sees, that a CRM failure shows the
error rather than a false success, and that no Google tag is present.

## Decisions left open

Two values in `site.embed` are empty, which means they fall back to the landing
site's:

- **`phoneFormatted` / `phoneE164`** — the number shown in the embed's error and
  success states. It currently falls back to `(503) 832-4376`, the HighLevel
  line that records the call and logs the lead. Using it here means main-site
  calls get recorded too. That is probably good, but it changes what the client's
  organic call volume looks like, so it is worth a decision rather than a
  default. Set the shop's own line instead if they would rather leave organic
  calls untracked.
- **`privacyUrl`** — falls back to `https://collisionglass.co/privacy`. If the
  main site maintains its own privacy policy, point at that one instead; a
  consent line linking to a different domain's policy is worse than one linking
  to the policy the visitor expects.
