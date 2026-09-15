# EA-TECH Portfolio — What We Built & What You Learned

> Written as a record of every change we made to your portfolio, and the
> JavaScript/CSS lessons behind each one. Re-read any section if it fades.

---

## 1. The big idea that ties everything together

Every feature on a website boils down to **one pattern**:

1. **HTML** says *what's there* (a button, a form, a div).
2. **CSS** defines every *possible look* as classes (`open`, `scrolled`, `is-visible`).
3. **JS** detects what the *user does*, then adds/removes those classes to switch looks.

> **HTML says what's there. JS says why. CSS says what it looks like — for every state.**
> JS flips a class; CSS reacts to that class. That's the whole secret.

---

## 2. The bug we killed first (and the lesson to never forget)

Your `script.js` used to crash on page load:

```js
const mybtn = document.querySelector("#mybtn");
mybtn.addEventListener("click", ...);   // 💥 CRASH
```

- `querySelector("#mybtn")` found **nothing** → returned `null`.
- Calling `.addEventListener` on `null` throws an error that **kills the entire script**.
- So nothing else (including your scroll animation) ever ran.

### THE LESSON: always guard your `querySelector` results

Whenever you grab an element that might not exist on every page, check it first:

```js
const mybtn = document.querySelector("#mybtn");
if (mybtn) {
    mybtn.addEventListener("click", ...);
}
```

- `if (element)` is true when the element was found, false when it's `null`.
- This is a **reusable habit**. We hit the exact same bug twice — the homepage
  script, and later the contact page. Guard everything.

---

## 3. Scroll reveal — how it works

Elements with the class `reveal-on-scroll` start **invisible** (CSS sets `opacity: 0`)
and get revealed when they scroll into view. The reveal is done by the
**IntersectionObserver** — a browser API that *watches* elements and calls you when
they enter (or leave) the viewport.

```js
const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");  // reveal it
            observer.unobserve(entry.target);          // stop watching (animate once)
        }
    });
}, { root: null, threshold: 0.15 });
```

- `threshold: 0.15` → fires when 15% of the element is visible.
- `root: null` → the viewport is the "box" we compare against.
- `unobserve` → plays the animation **only once**, not every scroll.

### The lesson: a reveal class can *hide* things on pages without the script

`reveal-on-scroll`'s CSS starts the element at `opacity: 0`. That's fine **if** the
script that adds `is-visible` loads. But if a page uses the class **without** loading
the script, the content stays invisible forever — which is exactly why your contact
form looked "blank." **Every page that uses a reveal class must load `script.js`.**

We also added a safety net: if an element is **already in the viewport on first load**,
reveal it immediately instead of waiting for a scroll event.

---

## 4. Sticky header state

```js
window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
});
```

### The lesson: `classList.toggle` with a second argument

- `element.classList.toggle("open")` → flips the class on/off.
- `element.classList.toggle("open", condition)` → `condition` is a true/false; if
  true it **forces** the class on, if false it **forces** it off.

That one line replaces a whole `if (scrolled) {add} else {remove}` — the boolean
`window.scrollY > 50` decides everything.

---

## 5. Mobile hamburger menu

```js
menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("open");   // hamburger → ✕
    nav.classList.toggle("open");          // slide menu in/out
});
```

- `toggle` is smart: same click both opens and closes.
- CSS on mobile hides the nav off-screen (`right: -100%`), and `.open` slides it to
  `right: 0`. The hamburger is **3 empty `<span>`s**, each a line; the `.open` state
  rotates the lines into an ✕.

---

## 6. Auto-updating year

```js
const yearEl = document.querySelector("#year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}
```

- `new Date()` → now. `.getFullYear()` → the year.
- `.textContent` → safe way to set the text inside the `<span id="year">`.
- Your footer now always shows the current year; you never edit "© 2026" by hand.

---

## 7. Contact form validation (the newest feature)

The form's Submit button now works. Its `novalidate` attribute tells the browser
"don't use your default popups — I'll handle validation myself." The JS listens for
the `submit` event and checks each field.

```js
form.addEventListener("submit", (event) => {
    event.preventDefault();   // ❗ stop the browser from reloading the page

    const name = document.querySelector("#name").value.trim();
    // ... checks ...
    if (name.length < 2)   { statusEl.textContent = "Please enter your name."; return; }
    if (!emailValid)       { statusEl.textContent = "Please enter a valid email."; return; }
    // if all pass:
    statusEl.textContent = "Thanks …";
    form.reset();
});
```

### Five lessons in this feature

1. **`event.preventDefault()`** — stops the browser's *default* behavior (for a submit,
   that's reloading the page / navigating away). You always call this first in the
   handler, else the page reloads before your JS finishes.

2. **Reading a field's value** — `input.value` gives what the user typed, and
   `.trim()` strips leading/trailing spaces so `"  "` counts as empty.

3. **Validating an email without a library** — a **regular expression (regex)**:
   ```js
   const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   ```
   Roughly: "some chars, then `@`, then more chars, then a `.`, then more chars."
   `.test(string)` returns `true`/`false`.

4. **Early `return` as a mini-guard chain** — each `if` fails → show a message →
   `return` (stop the function). Only if *all* checks pass does the code reach the
   success line. This is a clean "check-and-bail" pattern.

5. **`aria-live="polite"` on the message** — tells screen readers to announce the
   feedback when it changes. Tiny, but it makes the form accessible.

---

## 8. Quick reference — all the files touched

| File | What changed |
|------|-------------|
| `portfolio-homepage.html` | Fixed "View my work" link (`#Works`), fixed dead `contact.html` link, added hamburger button, added `reveal-on-scroll` classes, added `<span id="year">` |
| `contact-page.html` | Fixed broken `logo.png` path, added hamburger button, added `id` to form + `#form-status` message + `novalidate`, changed phone to `type="tel"`, added `reveal-on-scroll` + the missing `<script>` tag |
| `prac.css` | Fixed `scroll-initial-target` → `scroll-behavior`; added hamburger button styles, `.scrolled` header state, reveal animation classes, mobile responsive rules, `#form-status` style |
| `script.js` | Fixed the crash (guarded queries); added hamburger, sticky header, reveal + in-viewport safety net, auto-year, contact form validation |

## 10. Cross-page anchor links (the "Home does nothing" bug)

On the contact page, "Home" (and "Works"/"About") didn't work at first.

```html
<!-- ❌ Before -->
<a href="#hero">Home</a>      <!-- no element with id="hero" on THIS page -->
```

- An `href="#name"` link scrolls to an element with that `id` **on the current page**.
- If it doesn't exist here, the click silently does nothing.
- The homepage *has* a `hero` section, so it worked there. The contact page doesn't,
  so it broke.

```html
<!-- ✅ After: prefix the filename to jump to a section on another page -->
<a href="portfolio-homepage.html">Home</a>
<a href="portfolio-homepage.html#Works">Works</a>
<a href="portfolio-homepage.html#About">About</a>
```

### The rule
- Same page → `href="#section-id"`.
- Different page → `href="otherpage.html#section-id"`.

## 11. The 10 commands / concepts to keep

1. `querySelector("#id")` / `querySelector(".class")` — find one element.
2. `addEventListener("event", fn)` — run code *when* something happens.
3. `classList.toggle("name", condition)` — flip a class (optional force).
4. `new IntersectionObserver(cb, opts)` — trigger when an element enters view.
5. `event.preventDefault()` — stop the browser's default action.
6. `element.value` / `.textContent` — read input, set safe text.
7. `.trim()` — remove surrounding whitespace.
8. regex `.test()` — validate an email (or any pattern).
9. `if (element) {...}` — never call methods on `null`.
10. Early `return` — build a guard chain in a submit handler.