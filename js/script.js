/* ==========================================================================
   Sithole Agriculture & LiveStocks — site-wide interactions (every page)
   --------------------------------------------------------------------------
   1. Tabs          ([data-tabs])         — "Explore the Farm" on the Home page
   2. Accordion     ([data-accordion])    — FAQ on the About Us page
   3. Scroll reveal (.reveal)             — sections fade in as they scroll into view
   4. Count-up      ([data-count-to])     — "The Farm in Numbers" on the Home page
   Everything is progressive enhancement: with JavaScript off, all content is
   still visible and every number shows its final value.
   (This file replaces the Part 2 placeholder.)
   ========================================================================== */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. TABS (WAI-ARIA tabs pattern, arrow-key navigation) ---------- */
    function initTabs(root) {
        var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
        var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
        if (!tabs.length || tabs.length !== panels.length) { return; }

        function select(index, moveFocus) {
            tabs.forEach(function (tab, i) {
                var active = i === index;
                tab.setAttribute('aria-selected', active ? 'true' : 'false');
                tab.tabIndex = active ? 0 : -1;          /* only the active tab is in the Tab order */
                panels[i].hidden = !active;
                panels[i].classList.toggle('is-active', active);
            });
            if (moveFocus) { tabs[index].focus(); }
        }

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () { select(i, false); });
            tab.addEventListener('keydown', function (event) {
                var next = null;
                if (event.key === 'ArrowRight') { next = (i + 1) % tabs.length; }
                if (event.key === 'ArrowLeft') { next = (i - 1 + tabs.length) % tabs.length; }
                if (event.key === 'Home') { next = 0; }
                if (event.key === 'End') { next = tabs.length - 1; }
                if (next !== null) { event.preventDefault(); select(next, true); }
            });
        });

        select(0, false);
    }

    /* ---------- 2. ACCORDION (buttons + aria-expanded, one open at a time) ---------- */
    function initAccordion(root) {
        var triggers = Array.prototype.slice.call(root.querySelectorAll('.accordion__trigger'));

        function setOpen(trigger, open) {
            var panel = document.getElementById(trigger.getAttribute('aria-controls'));
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (panel) { panel.classList.toggle('is-open', open); }
        }

        triggers.forEach(function (trigger) {
            setOpen(trigger, false);
            trigger.addEventListener('click', function () {
                var willOpen = trigger.getAttribute('aria-expanded') !== 'true';
                triggers.forEach(function (other) { setOpen(other, false); });   /* close the others */
                setOpen(trigger, willOpen);
            });
        });
    }

    /* ---------- 3. SCROLL REVEAL ---------- */
    function initReveal() {
        var items = document.querySelectorAll('.reveal');
        if (!items.length || !('IntersectionObserver' in window) || prefersReducedMotion) { return; }

        document.documentElement.classList.add('reveal-ready');   /* CSS hides .reveal items only from this point */

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);       /* animate once, then stop watching */
                }
            });
        }, { threshold: 0.12 });

        items.forEach(function (item) { observer.observe(item); });
    }

    /* ---------- 4. COUNT-UP NUMBERS ---------- */
    function animateCount(el) {
        var target = parseInt(el.getAttribute('data-count-to'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        if (isNaN(target)) { return; }

        var duration = 1400;
        var start = null;
        function frame(timestamp) {
            if (start === null) { start = timestamp; }
            var progress = Math.min((timestamp - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);                 /* fast at first, slows down at the end */
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) { window.requestAnimationFrame(frame); }
        }
        el.textContent = '0' + suffix;
        window.requestAnimationFrame(frame);
    }

    function initCounters() {
        var counters = document.querySelectorAll('[data-count-to]');
        /* Reduced motion / old browsers: leave the final numbers exactly as written in the HTML */
        if (!counters.length || !('IntersectionObserver' in window) || prefersReducedMotion) { return; }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        counters.forEach(function (counter) { observer.observe(counter); });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-tabs]').forEach(initTabs);
        document.querySelectorAll('[data-accordion]').forEach(initAccordion);
        initReveal();
        initCounters();
    });
})();
