/* ==========================================================================
   Sithole Agriculture & LiveStocks — "Browse Our Stock" (products.html)
   --------------------------------------------------------------------------
   Builds the livestock and crop cards from FARM.items (js/farm-data.js) and adds:
     - live search      (name, category or description, as the visitor types)
     - category filter  (livestock / crops)
     - sorting          (name A-Z / Z-A, category)
   Visitors can also arrive with a ready-made filter, e.g.
   products.html?category=crops   (the Home page tabs link this way).
   Cards are made with createElement/textContent (never innerHTML), so text
   from the data file can never be interpreted as HTML.
   ========================================================================== */
(function (global) {
    'use strict';

    /* ---------- pure logic: easy to test, no page needed ---------- */
    function filterAndSort(items, state) {
        var query = String(state.query || '').trim().toLowerCase();

        var result = items.filter(function (item) {
            if (state.category && state.category !== 'all' && item.category !== state.category) { return false; }
            if (query) {
                var haystack = (item.name + ' ' + item.category + ' ' + item.summary).toLowerCase();
                /* every word typed must appear somewhere, so "nguni goats" or "maize" both work */
                return query.split(/\s+/).every(function (word) { return haystack.indexOf(word) !== -1; });
            }
            return true;
        });

        var sorters = {
            'name-asc':  function (a, b) { return a.name.localeCompare(b.name); },
            'name-desc': function (a, b) { return b.name.localeCompare(a.name); },
            'category':  function (a, b) { return a.category.localeCompare(b.category) || a.name.localeCompare(b.name); }
        };
        if (sorters[state.sort]) { result = result.slice().sort(sorters[state.sort]); }
        return result;
    }

    global.FARM = global.FARM || {};
    global.FARM.filterAndSort = filterAndSort;

    if (typeof document === 'undefined') {
        if (typeof module !== 'undefined' && module.exports) { module.exports = { filterAndSort: filterAndSort }; }
        return;
    }

    /* ---------- page wiring ---------- */
    var grid = document.getElementById('catalogue-grid');
    if (!grid || !global.FARM.items) { return; }

    var searchInput = document.getElementById('catalogue-search');
    var categorySelect = document.getElementById('catalogue-category');
    var sortSelect = document.getElementById('catalogue-sort');
    var resetButton = document.getElementById('catalogue-reset');
    var countEl = document.getElementById('result-count');
    var emptyEl = document.getElementById('no-results');
    var emptyResetButton = document.getElementById('empty-reset');

    function element(tag, className, text) {
        var el = document.createElement(tag);
        if (className) { el.className = className; }
        if (text !== undefined) { el.textContent = text; }
        return el;
    }

    /* "cattle-herd" -> "images/cattle-herd-360w.jpg 360w, images/cattle-herd-540w.jpg 540w, ..." */
    function buildSrcset(imageName) {
        var widths = global.FARM.imageWidths[imageName] || [];
        return widths.map(function (w) { return 'images/' + imageName + '-' + w + 'w.jpg ' + w + 'w'; }).join(', ');
    }

    function buildCard(item) {
        var card = element('article', 'card catalogue-card');
        var label = global.FARM.categoryLabels[item.category];

        if (item.image) {
            /* the photo is a link to the full-size image; lightbox.js opens it in a modal */
            var imageLink = element('a', 'catalogue-card__image-link');
            imageLink.href = 'images/' + item.image + '.jpg';
            imageLink.setAttribute('data-lightbox', 'catalogue');
            imageLink.setAttribute('data-caption', item.name + ' \u2014 ' + label);
            imageLink.setAttribute('aria-label', 'View larger photo: ' + item.name);

            var img = document.createElement('img');
            img.src = 'images/' + item.image + '-540w.jpg';
            img.srcset = buildSrcset(item.image);
            img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 22vw';
            img.alt = item.alt;
            img.width = item.width;
            img.height = item.height;
            img.loading = 'lazy';
            imageLink.appendChild(img);
            imageLink.appendChild(element('span', 'catalogue-card__zoom', 'View larger'));
            card.appendChild(imageLink);
        } else {
            /* no photo yet: a plain coloured band keeps the cards lined up */
            var band = element('div', 'catalogue-card__band catalogue-card__band--' + item.category, label);
            band.setAttribute('aria-hidden', 'true');
            card.appendChild(band);
        }

        var body = element('div', 'catalogue-card__body');
        body.appendChild(element('p', 'catalogue-card__category', label));
        body.appendChild(element('h3', '', item.name));
        body.appendChild(element('p', '', item.summary));
        if (item.herd) {
            body.appendChild(element('p', 'catalogue-card__meta', 'On the farm: about ' + item.herd + ' ' + item.unit));
        } else {
            body.appendChild(element('p', 'catalogue-card__meta', 'Availability depends on the season'));
        }

        var enquire = element('a', 'text-link', 'Enquire about ' + item.name);
        enquire.href = 'enquiry.html?item=' + encodeURIComponent(item.id);
        var linkWrap = element('p');
        linkWrap.appendChild(enquire);
        body.appendChild(linkWrap);

        card.appendChild(body);
        return card;
    }

    function currentState() {
        return {
            query: searchInput ? searchInput.value : '',
            category: categorySelect ? categorySelect.value : 'all',
            sort: sortSelect ? sortSelect.value : 'featured'
        };
    }

    function render() {
        var all = global.FARM.items;
        var shown = filterAndSort(all, currentState());

        grid.textContent = '';                                   /* clear the old cards */
        shown.forEach(function (item) { grid.appendChild(buildCard(item)); });

        countEl.textContent = shown.length === 0
            ? 'Nothing matches your search.'
            : 'Showing ' + shown.length + ' of ' + all.length + ' items.';
        emptyEl.hidden = shown.length !== 0;
        grid.hidden = shown.length === 0;
    }

    function reset() {
        searchInput.value = '';
        categorySelect.value = 'all';
        sortSelect.value = 'featured';
        render();
        searchInput.focus();
    }

    /* Pre-fill from the address, e.g. ?category=crops or ?q=goats */
    function applyQueryString() {
        var params = new URLSearchParams(global.location.search);
        var category = params.get('category');
        var q = params.get('q');
        if (category && categorySelect) {
            var known = Array.prototype.some.call(categorySelect.options, function (o) { return o.value === category; });
            if (known) { categorySelect.value = category; }
        }
        if (q && searchInput) { searchInput.value = q.slice(0, 40); }
    }

    [searchInput, categorySelect, sortSelect].forEach(function (control) {
        if (!control) { return; }
        control.addEventListener(control === searchInput ? 'input' : 'change', render);
    });
    if (resetButton) { resetButton.addEventListener('click', reset); }
    if (emptyResetButton) { emptyResetButton.addEventListener('click', reset); }

    /* pressing Enter inside the search box should not reload the page */
    var form = document.getElementById('catalogue-filters');
    if (form) { form.addEventListener('submit', function (e) { e.preventDefault(); }); }

    applyQueryString();
    render();
})(typeof window !== 'undefined' ? window : globalThis);
