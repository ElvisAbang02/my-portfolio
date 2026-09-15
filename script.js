/* ============================================================
   EA-TECH Portfolio - script.js
   Features:
   1. Mobile hamburger menu
   2. Sticky header state on scroll
   3. Scroll-reveal animations (IntersectionObserver)
   4. Auto-updating footer year
   ============================================================ */

/* ------------------------------------------------------------
   1. MOBILE HAMBURGER MENU
   ------------------------------------------------------------
   On phones, the nav is hidden off-screen to the right.
   Clicking the hamburger button slides it in. Clicking again
   (or tapping any link) slides it back out.
   ------------------------------------------------------------ */
const menuToggle = document.querySelector("#menu-toggle");
const nav = document.querySelector("#nav");

menuToggle.addEventListener("click", () => {
    // Toggle the .open class on both button and nav
    menuToggle.classList.toggle("open");
    nav.classList.toggle("open");
    // Tell screen readers whether the menu is open or closed
    const isOpen = menuToggle.classList.contains("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
});

// When you tap a nav link, close the menu automatically.
// Simple approach: close on ANY link click (works for all links).
document.querySelectorAll("#nav a").forEach(link => {
    link.addEventListener("click", () => {
        menuToggle.classList.remove("open");
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

/* ------------------------------------------------------------
   2. STICKY HEADER STATE ON SCROLL
   ------------------------------------------------------------
   The header is already sticky via CSS. This just adds a
   visual change (light background + shadow) once you've
   scrolled past a small distance, so it "pops" off the page.
   ------------------------------------------------------------ */
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    // If we've scrolled more than 50px, add .scrolled; else remove it
    header.classList.toggle("scrolled", window.scrollY > 50);
});

/* ------------------------------------------------------------
   3. SCROLL-REVEAL ANIMATIONS
   ------------------------------------------------------------
   Elements with class "reveal-on-scroll" start invisible and
   slightly lower. When enough of them (15%) scroll into view,
   the IntersectionObserver adds "is-visible", which fades and
   lifts them into place. It only runs once per element.
   ------------------------------------------------------------ */
const animatedElements = document.querySelectorAll(".reveal-on-scroll");

const observerOptions = {
    root: null,          // viewport is the box being watched
    rootMargin: "0px",   // no offset
    threshold: 0.15      // trigger when 15% visible
};

const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // animate only once
        }
    });
}, observerOptions);

animatedElements.forEach(element => {
    scrollObserver.observe(element);
});

// Safety net: an element already in the viewport on first load
// should reveal immediately, without waiting for a scroll event.
// (Handles pages where the observer fires late or the target is
// already on-screen before the script runs.)
animatedElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewport) {
        element.classList.add("is-visible");
        scrollObserver.unobserve(element);
    }
});

/* ------------------------------------------------------------
   4. AUTO-UPDATING FOOTER YEAR
   ------------------------------------------------------------
   Uses Date() to get the current year and write it into the
   <span id="year"> element, so the copyright never goes stale.
   The if-guard keeps this from crashing on pages that have no
   year span (e.g. the contact page).
   ------------------------------------------------------------ */
const yearEl = document.querySelector("#year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

/* ------------------------------------------------------------
   5. CONTACT FORM VALIDATION
   ------------------------------------------------------------
   This whole block only runs on pages that contain a form with
   id="contact-form" (the if-guard prevents errors on the
   homepage, which has no form). It checks every field, shows a
   message, and stops the browser's default "submit and reload"
   behavior using preventDefault().
   ------------------------------------------------------------ */
const form = document.querySelector("#contact-form");
const statusEl = document.querySelector("#form-status");

if (form) {
    form.addEventListener("submit", (event) => {
        // Stop the page from reloading on submit
        event.preventDefault();

        // Grab each field's value
        const name = document.querySelector("#name").value.trim();
        const email = document.querySelector("#email").value.trim();
        const phone = document.querySelector("#phoneNumber").value.trim();
        const message = document.querySelector("#message").value.trim();

        // --- Validation checks ---------------------------------
        // name: at least 2 characters
        if (name.length < 2) {
            statusEl.textContent = "Please enter your name.";
            return;
        }
        // email: must contain @ and a dot in the right place
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValid) {
            statusEl.textContent = "Please enter a valid email address.";
            return;
        }
        // phone: at least 7 digits
        if (phone.length < 7) {
            statusEl.textContent = "Please enter a valid phone number.";
            return;
        }
        // message: not empty
        if (message.length === 0) {
            statusEl.textContent = "Please leave a message.";
            return;
        }

        // --- If everything is valid ------------------------------
        statusEl.textContent = "Thanks " + name + " — your message has been received. I'll get back to you soon.";
        form.reset(); // clear the fields for the next person
    });
}