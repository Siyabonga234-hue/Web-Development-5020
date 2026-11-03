/* ==========================================================================
   Sithole Agriculture & LiveStocks — farm data (single source of truth)
   --------------------------------------------------------------------------
   Used by:
     - js/catalogue.js  -> builds the "Browse Our Stock" cards (products.html)
     - js/forms.js      -> fills the enquiry dropdowns, works out the availability
                           response, and picks the farm email for each form
     - js/map.js        -> places the two farm markers on the contact page map
   Keeping everything in one JavaScript file (instead of a separate .json file)
   means the site also works when a page is opened straight from the folder
   (file://), because browsers block fetch() of local files.
   To change a herd size, add a crop or correct a phone number, edit this file
   only — nothing else needs to change.
   ========================================================================== */
(function (global) {
    'use strict';

    /* ---------- The two farm locations (same details as the Contact page) ---------- */
    var farms = [
        {
            id: 'limehill',
            name: 'Mnambithi, Limehill',
            label: 'First farm: Mnambithi, Limehill',
            phone: '060 402 7620',
            phoneLink: '+27604027620',
            email: 'mondisetech@gmail.com',
            /* Approximate position of the Limehill area (used only for the map marker) */
            lat: -28.33,
            lng: 29.77
        },
        {
            id: 'bergville',
            name: 'Bergville',
            label: 'Second farm: Bergville',
            phone: '083 668 6689',
            phoneLink: '+27836686689',
            email: 'njabulosjebha@gmail.com',
            /* Approximate position of the Bergville area (used only for the map marker) */
            lat: -28.73,
            lng: 29.36
        }
    ];

    /* ---------- What the farm sells ----------
       herd  = approximate number of animals on the farm (from the About Us page).
               Update these numbers as the herd changes; the enquiry form uses them
               to tell buyers whether their quantity is within the current herd.
       Crops have no herd size because availability depends on the season.       */
    var items = [
        {
            id: 'nguni-cattle',
            category: 'livestock',
            name: 'Nguni Cattle',
            unit: 'animals',
            herd: 25,
            summary: 'Hardy and pest-resistant, and well suited to local conditions.',
            image: 'cattle-grazing',
            width: 736, height: 920,
            alt: 'Nguni and Brahman cattle grazing on a green hillside at the farm'
        },
        {
            id: 'brahman-cattle',
            category: 'livestock',
            name: 'Brahman Cattle',
            unit: 'animals',
            herd: 30,
            summary: 'A hardy breed chosen for its resistance to pests and its good quality beef.',
            image: 'cattle-herd',
            width: 736, height: 981,
            alt: 'A herd of cattle walking along a fenced farm path'
        },
        {
            id: 'nguni-goats',
            category: 'livestock',
            name: 'Nguni Goats',
            unit: 'animals',
            herd: 30,
            summary: 'Raised for the local community and region. Goats hold great cultural importance in Zulu tradition.'
        },
        {
            id: 'zulu-chickens',
            category: 'livestock',
            name: 'Zulu Chickens',
            unit: 'birds',
            herd: 80,
            summary: 'Traditional Zulu chickens (izinkukhu zesiZulu) and Olam\u2019thuthu chickens, with broilers and layers on the farm.'
        },
        {
            id: 'corn',
            category: 'crops',
            name: 'Corn (Maize)',
            unit: 'kg',
            summary: 'Maize grown on the farm\u2019s fertile KwaZulu-Natal land and harvested by machine.',
            image: 'corn-harvest',
            width: 720, height: 1280,
            alt: 'Combine harvesters cutting a field of ripe maize'
        },
        {
            id: 'potatoes',
            category: 'crops',
            name: 'Potatoes',
            unit: 'kg',
            summary: 'Potatoes grown in rows on the farm and dug fresh.',
            image: 'potato-rows',
            width: 720, height: 960,
            alt: 'Freshly dug potatoes lying in the rows of a field'
        },
        {
            id: 'tomatoes',
            category: 'crops',
            name: 'Tomatoes',
            unit: 'kg',
            summary: 'Tomatoes grown on the farm as part of our seasonal produce.'
        }
    ];

    var categoryLabels = { livestock: 'Livestock', crops: 'Crops' };

    /* Which resolutions exist for each photo (so srcset only lists real files) */
    var imageWidths = {
        'cattle-grazing': [360, 540, 720],
        'cattle-herd': [360, 540, 720],
        'corn-harvest': [360, 540, 720],
        'potato-rows': [360, 540, 720],
        'potatoes': [360, 540]
    };

    function findItem(id) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { return items[i]; }
        }
        return null;
    }

    function findFarm(id) {
        for (var i = 0; i < farms.length; i++) {
            if (farms[i].id === id) { return farms[i]; }
        }
        return null;
    }

    global.FARM = global.FARM || {};
    global.FARM.farms = farms;
    global.FARM.items = items;
    global.FARM.categoryLabels = categoryLabels;
    global.FARM.imageWidths = imageWidths;
    global.FARM.findItem = findItem;
    global.FARM.findFarm = findFarm;
})(window);
