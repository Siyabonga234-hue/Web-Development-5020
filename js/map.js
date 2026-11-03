/* ==========================================================================
   Sithole Agriculture & LiveStocks — interactive farm map (contact.html)
   --------------------------------------------------------------------------
   Uses Leaflet (loaded from a CDN in contact.html) with OpenStreetMap tiles.
   Features:
     - a marker + popup for each farm (Limehill and Bergville)
     - buttons that fly the map to a farm, or show both at once
     - "Find my nearest farm": asks the browser for the visitor's position
       (only when they press the button) and works out which farm is closer
   The Google Maps embeds further down the page stay as a street-level backup,
   so the visitor still gets a map even if Leaflet cannot load.
   Marker positions are approximate (town level) and live in js/farm-data.js.
   ========================================================================== */
(function () {
    'use strict';

    var mapEl = document.getElementById('farm-map');
    var farms = window.FARM && window.FARM.farms;
    if (!mapEl || !farms) { return; }

    var statusEl = document.getElementById('map-status');
    function say(message) { if (statusEl) { statusEl.textContent = message; } }

    var controls = document.querySelectorAll('[data-map-focus], #map-show-all, #map-locate');

    if (typeof L === 'undefined') {
        mapEl.textContent = '';
        mapEl.hidden = true;
        Array.prototype.forEach.call(controls, function (b) { b.disabled = true; });
        say('The interactive map could not load. The Google Maps below show both farm areas.');
        return;
    }

    /* ---------- the interactive map ---------- */
    var map = L.map(mapEl, { scrollWheelZoom: false });   /* wheel-zoom off so the page can still scroll past the map */
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    var markers = {};
    var bounds = [];
    farms.forEach(function (farm) {
        var popup = document.createElement('div');
        var title = document.createElement('strong');
        title.textContent = 'Sithole Agriculture & LiveStocks';
        var place = document.createElement('div');
        place.textContent = farm.name + ', KwaZulu-Natal';
        var note = document.createElement('div');
        note.textContent = 'Approximate position';
        var phone = document.createElement('a');
        phone.href = 'tel:' + farm.phoneLink;
        phone.textContent = farm.phone;
        var directions = document.createElement('a');
        directions.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(farm.name + ', KwaZulu-Natal, South Africa');
        directions.target = '_blank';
        directions.rel = 'noopener noreferrer';
        directions.textContent = 'Get directions';
        popup.appendChild(title);
        popup.appendChild(place);
        popup.appendChild(note);
        popup.appendChild(phone);
        popup.appendChild(document.createElement('br'));
        popup.appendChild(directions);

        markers[farm.id] = L.marker([farm.lat, farm.lng], { title: farm.name, alt: 'Farm location: ' + farm.name })
            .addTo(map)
            .bindPopup(popup);
        bounds.push([farm.lat, farm.lng]);
    });

    function findFarm(id) { return window.FARM.findFarm(id); }

    function showAll() {
        map.fitBounds(bounds, { padding: [40, 40] });
        map.closePopup();
        say('Showing both farms.');
    }

    function focusOn(id) {
        var farm = findFarm(id);
        if (!farm) { return; }
        map.flyTo([farm.lat, farm.lng], 10, { duration: 1.2 });
        markers[id].openPopup();
        say('Showing ' + farm.name + '.');
    }

    showAll();

    Array.prototype.forEach.call(document.querySelectorAll('[data-map-focus]'), function (button) {
        button.addEventListener('click', function () { focusOn(button.getAttribute('data-map-focus')); });
    });
    var allButton = document.getElementById('map-show-all');
    if (allButton) { allButton.addEventListener('click', showAll); }

    /* ---------- nearest farm (straight-line distance, haversine formula) ---------- */
    function distanceKm(lat1, lng1, lat2, lng2) {
        var toRad = function (deg) { return deg * Math.PI / 180; };
        var dLat = toRad(lat2 - lat1);
        var dLng = toRad(lng2 - lng1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    var locateButton = document.getElementById('map-locate');
    if (locateButton) {
        locateButton.addEventListener('click', function () {
            if (!navigator.geolocation) { say('Your browser does not support location finding.'); return; }
            say('Finding your location\u2026');
            navigator.geolocation.getCurrentPosition(function (position) {
                var nearest = null;
                var nearestDistance = Infinity;
                farms.forEach(function (farm) {
                    var d = distanceKm(position.coords.latitude, position.coords.longitude, farm.lat, farm.lng);
                    if (d < nearestDistance) { nearestDistance = d; nearest = farm; }
                });
                focusOn(nearest.id);
                say('Your nearest farm is ' + nearest.name + ' (about ' + Math.round(nearestDistance) + ' km away in a straight line).');
            }, function () {
                say('We could not get your location. You can still pick a farm with the buttons above.');
            }, { timeout: 10000 });
        });
    }
})();
