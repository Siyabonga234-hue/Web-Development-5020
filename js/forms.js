/* ==========================================================================
   Sithole Agriculture & LiveStocks — form handling (enquiry.html and contact.html)
   --------------------------------------------------------------------------
   Both forms share one small validation engine (section 1) and then do
   different jobs once the input is valid:

     ENQUIRY form  -> works out an availability + pricing response for the animal
                      or crop the buyer asked about, shows it immediately, and
                      sends the enquiry in the background with AJAX (fetch) so
                      the page never reloads.
     CONTACT form  -> compiles the details into an email addressed to the farm the
                      visitor chose, and lets them send it from their email app.

   The rules themselves live in js/validation.js. Farm, stock and email details
   come from js/farm-data.js. User text is only ever put on the page with
   textContent, never innerHTML.
   ========================================================================== */
(function (global) {
    'use strict';

    var V = global.FARM && global.FARM.validate;
    if (!V) { return; }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) { node.className = className; }
        if (text !== undefined) { node.textContent = text; }
        return node;
    }

    var BUYER_LABELS = { individual: 'Individual buyer', wholesale: 'Wholesale (organisation or business)' };
    var INTEREST_LABELS = { livestock: 'Livestock', crops: 'Crops', both: 'Livestock and crops', general: 'General enquiry' };
    var METHOD_LABELS = { email: 'Email', phone: 'Phone call' };
    var TYPE_LABELS = {
        general: 'General question',
        stock: 'Livestock or crops',
        feedback: 'Feedback',
        complaint: 'Complaint',
        partnership: 'Partnership or supply'
    };

    /* Largest quantity accepted per unit */
    var MAX_QUANTITY = { animals: 500, birds: 2000, kg: 100000 };

    /* ======================================================================
       1. VALIDATION ENGINE
       Each field sits in a wrapper:  <div data-field="name"> ... </div>
       with an error line:            <p data-error-for="name" hidden></p>
       ====================================================================== */
    function createValidator(form, rules) {
        var touched = {};
        var names = Array.prototype.map.call(form.querySelectorAll('[data-field]'), function (w) {
            return w.getAttribute('data-field');
        }).filter(function (name) { return typeof rules[name] === 'function'; });

        function wrapper(name) { return form.querySelector('[data-field="' + name + '"]'); }
        function isActive(name) { var w = wrapper(name); return !!w && !w.hidden; }

        /* current value of a field: radio -> chosen value, checkbox -> 'yes' or '', others -> text */
        function get(name) {
            var w = wrapper(name);
            if (!w) { return ''; }
            if (w.querySelector('input[type="radio"]')) {
                var chosen = w.querySelector('input[type="radio"]:checked');
                return chosen ? chosen.value : '';
            }
            var box = w.querySelector('input[type="checkbox"]');
            if (box) { return box.checked ? 'yes' : ''; }
            var control = w.querySelector('input, select, textarea');
            return control ? control.value : '';
        }

        function show(name, message) {
            var w = wrapper(name);
            var out = form.querySelector('[data-error-for="' + name + '"]');
            if (!w || !out) { return; }
            w.classList.toggle('has-error', !!message);
            Array.prototype.forEach.call(w.querySelectorAll('input, select, textarea'), function (control) {
                if (message) { control.setAttribute('aria-invalid', 'true'); }
                else { control.removeAttribute('aria-invalid'); }
            });
            out.textContent = message;     /* the line keeps its height when empty, so the form never jumps while someone is clicking */
        }

        function check(name) {
            if (!isActive(name)) { show(name, ''); return ''; }      /* hidden conditional fields are skipped */
            var message = rules[name](get);
            show(name, message);
            return message;
        }

        function checkAll() {
            var errors = [];
            names.forEach(function (name) {
                var message = check(name);
                if (message) { errors.push({ name: name, message: message }); }
            });
            return errors;
        }

        function firstControl(name) {
            var w = wrapper(name);
            return w ? w.querySelector('input, select, textarea') : null;
        }

        function labelFor(name) {
            var w = wrapper(name);
            var label = w && w.querySelector('label, legend');
            return label ? label.textContent.replace(/\*/g, '').replace(/\(optional\)/i, '').trim() : name;
        }

        /* the red box at the top of the form that lists what needs fixing */
        function showSummary(errors) {
            var box = form.querySelector('.form-summary');
            if (!box) { return; }
            box.textContent = '';
            box.appendChild(el('p', 'form-summary-title',
                errors.length === 1 ? 'Please fix 1 problem before sending:' : 'Please fix ' + errors.length + ' problems before sending:'));
            var list = el('ul');
            errors.forEach(function (err) {
                var item = el('li');
                var link = el('a', '', labelFor(err.name) + ': ' + err.message);
                var control = firstControl(err.name);
                link.href = '#' + (control && control.id ? control.id : '');
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    if (control) { control.focus(); }
                });
                item.appendChild(link);
                list.appendChild(item);
            });
            box.appendChild(list);
            box.hidden = false;
            box.focus();
        }

        function hideSummary() {
            var box = form.querySelector('.form-summary');
            if (box) { box.hidden = true; box.textContent = ''; }
        }

        /* validate a field as the visitor leaves it, then keep it up to date while they fix it */
        form.addEventListener('focusout', function (event) {
            var w = event.target.closest && event.target.closest('[data-field]');
            if (!w) { return; }
            var type = event.target.type;
            if (type === 'radio' || type === 'checkbox') { return; }    /* these validate on change */
            var name = w.getAttribute('data-field');
            if (typeof rules[name] !== 'function') { return; }
            touched[name] = true;
            check(name);
        });

        function onChange(event) {
            var w = event.target.closest && event.target.closest('[data-field]');
            if (w) {
                var changed = w.getAttribute('data-field');
                var type = event.target.type;
                if (type === 'radio' || type === 'checkbox' || event.target.tagName === 'SELECT') {
                    touched[changed] = true;
                }
            }
            /* re-check every field the visitor has already been to (one answer can affect another,
               e.g. choosing "Phone call" makes the phone number required) */
            names.forEach(function (name) { if (touched[name]) { check(name); } });
        }
        form.addEventListener('input', onChange);
        form.addEventListener('change', onChange);

        function reset() {
            touched = {};
            names.forEach(function (name) { show(name, ''); });
            hideSummary();
        }

        return {
            get: get,
            check: check,
            checkAll: checkAll,
            showSummary: showSummary,
            hideSummary: hideSummary,
            focusField: function (name) { var c = firstControl(name); if (c) { c.focus(); } },
            reset: reset
        };
    }

    /* "0 / 500" counters under text areas */
    function initCounters(form) {
        Array.prototype.forEach.call(form.querySelectorAll('[data-count-for]'), function (counter) {
            var control = document.getElementById(counter.getAttribute('data-count-for'));
            if (!control) { return; }
            var max = control.maxLength > 0 ? control.maxLength : 0;
            function update() {
                var length = control.value.length;
                counter.textContent = length + (max ? ' / ' + max : '') + ' characters';
                counter.classList.toggle('is-near-limit', max > 0 && length >= max * 0.9);
            }
            control.addEventListener('input', update);
            update();
        });
    }

    /* show or hide a block of fields; disabled controls are skipped by validation AND by the submitted data */
    function setConditional(wrapperEl, visible) {
        wrapperEl.hidden = !visible;
        Array.prototype.forEach.call(wrapperEl.querySelectorAll('input, select, textarea'), function (c) {
            c.disabled = !visible;
        });
    }

    /* ======================================================================
       2. ENQUIRY RESPONSE (pure: takes the answers, returns what to show)
       api = { findItem, findFarm }  (from js/farm-data.js)
       ====================================================================== */
    function buildEnquiryResponse(values, api) {
        var lines = [];
        var notes = [];
        lines.push({ label: 'Buyer type', value: BUYER_LABELS[values.buyerType] || values.buyerType });
        lines.push({ label: 'Interested in', value: INTEREST_LABELS[values.interest] || values.interest });

        var item = values.interest !== 'general' ? api.findItem(values.item) : null;
        var qty = parseInt(values.quantity, 10);

        if (item && qty) {
            lines.push({ label: 'Item', value: item.name });
            lines.push({ label: 'Quantity', value: qty + ' ' + item.unit });

            var availability;
            var status;
            if (item.herd) {
                if (qty <= item.herd) {
                    availability = 'Within our current herd (about ' + item.herd + ' ' + item.unit + '). We will confirm exactly which ' + item.unit + ' are available.';
                    status = 'in';
                } else {
                    availability = 'More than our current herd of about ' + item.herd + ' ' + item.unit + '. We will tell you what we can supply now and what could be planned for later.';
                    status = 'low';
                }
            } else {
                availability = 'Availability depends on the season. We will confirm what is ready to harvest and how much we can supply.';
                status = 'check';
            }
            lines.push({ label: 'Availability', value: availability, status: status });
            lines.push({
                label: 'Price',
                value: item.herd
                    ? 'Livestock prices depend on the breed, age and weight of the animals, so we give you a quote once we know exactly what you need.'
                    : 'Crop prices depend on the season and the quantity, so we give you a quote once we know how much you need.'
            });
        } else {
            lines.push({ label: 'Next step', value: 'We will read your message and reply with the right information.' });
        }

        if (values.neededBy) { lines.push({ label: 'Needed by', value: values.neededBy }); }

        var farm = values.farm ? api.findFarm(values.farm) : null;
        if (farm) {
            lines.push({ label: 'Your farm contact', value: farm.name + ': ' + farm.phone + ' / ' + farm.email });
        } else {
            lines.push({ label: 'Our contacts', value: 'Limehill: 060 402 7620. Bergville: 083 668 6689.' });
        }
        lines.push({ label: 'We will reply by', value: METHOD_LABELS[values.contactMethod] || values.contactMethod });

        notes.push(values.buyerType === 'wholesale'
            ? 'As a wholesale buyer, we will also talk to you about volumes, timing and delivery.'
            : 'We will confirm collection or delivery arrangements with you when we reply.');

        return { lines: lines, notes: notes };
    }

    /* ======================================================================
       3. CONTACT EMAIL (pure: takes the answers, returns the compiled email)
       ====================================================================== */
    function buildEmail(values, farm) {
        var typeLabel = TYPE_LABELS[values.messageType] || 'Message';
        var subject = '[' + typeLabel + '] ' + values.subject.trim();
        var body = [
            'Hello Sithole Agriculture & LiveStocks (' + farm.name + '),',
            '',
            values.message.trim(),
            '',
            'Kind regards,',
            values.name.trim(),
            '',
            'Email: ' + values.email.trim()
        ];
        if (values.phone && values.phone.trim()) { body.push('Phone: ' + values.phone.trim()); }
        body.push('Preferred reply method: ' + (METHOD_LABELS[values.contactMethod] || values.contactMethod));
        body.push('Message type: ' + typeLabel);

        var text = body.join('\r\n');
        return {
            to: farm.email,
            subject: subject,
            body: text,
            href: 'mailto:' + farm.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text)
        };
    }

    global.FARM.buildEnquiryResponse = buildEnquiryResponse;
    global.FARM.buildEmail = buildEmail;

    if (typeof document === 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = { buildEnquiryResponse: buildEnquiryResponse, buildEmail: buildEmail };
        }
        return;
    }

    /* Fill a <select> with the two farms */
    function fillFarmSelect(select) {
        global.FARM.farms.forEach(function (farm) {
            var option = document.createElement('option');
            option.value = farm.id;
            option.textContent = farm.name;
            select.appendChild(option);
        });
    }

    /* ======================================================================
       4. ENQUIRY PAGE
       ====================================================================== */
    function initEnquiry(form) {
        var interestSelect = form.querySelector('#enquiry-interest');
        var itemSelect = form.querySelector('#enquiry-item');
        var quantityInput = form.querySelector('#enquiry-quantity');
        var quantityLabel = form.querySelector('#quantity-label-text');
        var quantityHint = form.querySelector('#quantity-hint');
        var farmSelect = form.querySelector('#enquiry-farm');
        var dateInput = form.querySelector('#enquiry-date');
        var itemGroup = form.querySelector('[data-field="item"]');
        var quantityGroup = form.querySelector('[data-field="quantity"]');
        var responsePanel = document.getElementById('enquiry-response');
        var statusEl = null;
        var submitButton = form.querySelector('button[type="submit"]');

        form.noValidate = true;     /* our own friendly messages replace the browser's pop-ups */
        fillFarmSelect(farmSelect);

        /* the date picker only offers today up to a year from now */
        var today = new Date();
        dateInput.min = V.toDateString(today);
        dateInput.max = V.toDateString(V.addDays(today, 365));

        var validator = createValidator(form, {
            name: function (get) { return V.validateName(get('name')); },
            email: function (get) { return V.validateEmail(get('email')); },
            contactMethod: function (get) { return get('contactMethod') ? '' : 'Please choose how you would like us to reply.'; },
            phone: function (get) { return V.validatePhone(get('phone'), get('contactMethod') === 'phone'); },
            buyerType: function (get) { return get('buyerType') ? '' : 'Please tell us whether you are an individual or a wholesale buyer.'; },
            interest: function (get) { return V.validateSelect(get('interest'), 'Please choose what you are interested in.'); },
            item: function (get) { return V.validateSelect(get('item'), 'Please choose what you would like to enquire about.'); },
            quantity: function (get) {
                var item = global.FARM.findItem(get('item'));
                var unit = item ? item.unit : 'items';
                return V.validateQuantity(get('quantity'), 1, MAX_QUANTITY[unit] || 1000, unit);
            },
            farm: function () { return ''; },
            neededBy: function (get) { return V.validateDate(get('neededBy'), new Date()); },
            message: function (get) { return V.validateText(get('message'), 'your message', 10, 500); },
            consent: function (get) { return get('consent') ? '' : 'Please tick the box so we can contact you about this enquiry.'; }
        });

        /* the "what exactly?" list only shows items that match the chosen interest */
        function rebuildItemOptions() {
            var interest = interestSelect.value;
            var previous = itemSelect.value;
            itemSelect.textContent = '';
            var placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Choose\u2026';
            itemSelect.appendChild(placeholder);
            global.FARM.items.forEach(function (item) {
                if (interest === 'both' || item.category === interest) {
                    var option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.name + ' (' + global.FARM.categoryLabels[item.category].toLowerCase() + ')';
                    itemSelect.appendChild(option);
                }
            });
            itemSelect.value = previous;                 /* keep the choice if it is still on the list */
            if (itemSelect.value !== previous) { itemSelect.value = ''; }
        }

        /* the quantity label changes with the item: animals, birds or kilograms */
        function updateQuantityLabels() {
            var item = global.FARM.findItem(itemSelect.value);
            if (!item) {
                quantityLabel.textContent = 'How many?';
                quantityHint.textContent = '';
                return;
            }
            if (item.unit === 'kg') {
                quantityLabel.textContent = 'Approximate quantity (kg)';
                quantityHint.textContent = 'Roughly how many kilograms do you need?';
            } else {
                quantityLabel.textContent = 'How many ' + item.unit + '?';
                quantityHint.textContent = 'We have about ' + item.herd + ' ' + item.unit + ' on the farm at the moment.';
            }
        }

        function syncConditionalFields() {
            var needsItem = interestSelect.value === 'livestock' || interestSelect.value === 'crops' || interestSelect.value === 'both';
            rebuildItemOptions();
            setConditional(itemGroup, needsItem);
            setConditional(quantityGroup, needsItem);
            updateQuantityLabels();
        }
        interestSelect.addEventListener('change', syncConditionalFields);
        itemSelect.addEventListener('change', updateQuantityLabels);

        /* arriving from a catalogue card: enquiry.html?item=nguni-goats */
        var wanted = new URLSearchParams(global.location.search).get('item');
        var wantedItem = wanted ? global.FARM.findItem(wanted) : null;
        if (wantedItem) { interestSelect.value = wantedItem.category; }
        syncConditionalFields();
        if (wantedItem) { itemSelect.value = wantedItem.id; updateQuantityLabels(); }
        initCounters(form);

        function currentValues() {
            return {
                name: validator.get('name').trim(),
                email: validator.get('email').trim(),
                contactMethod: validator.get('contactMethod'),
                buyerType: validator.get('buyerType'),
                interest: validator.get('interest'),
                item: validator.get('item'),
                quantity: validator.get('quantity'),
                farm: validator.get('farm'),
                neededBy: validator.get('neededBy')
            };
        }

        function showResponse(values, result) {
            responsePanel.textContent = '';
            responsePanel.appendChild(el('h2', 'response-title', 'Thank you, ' + values.name.split(' ')[0] + '!'));
            responsePanel.appendChild(el('p', 'response-intro', 'Here is what we have worked out from your enquiry:'));

            var list = el('dl', 'response-list');
            result.lines.forEach(function (line) {
                var row = el('div', 'response-row');
                row.appendChild(el('dt', '', line.label));
                row.appendChild(el('dd', line.status ? 'availability availability-' + line.status : '', line.value));
                list.appendChild(row);
            });
            responsePanel.appendChild(list);
            result.notes.forEach(function (note) { responsePanel.appendChild(el('p', 'response-note', note)); });

            var send = el('p', 'send-status', '');
            send.setAttribute('role', 'status');
            responsePanel.appendChild(send);

            var actions = el('div', 'response-actions');
            var farms = values.farm ? [global.FARM.findFarm(values.farm)] : global.FARM.farms;
            farms.forEach(function (farm) {
                var call = el('a', 'cta-button', 'Call ' + farm.name.split(',')[0]);
                call.href = 'tel:' + farm.phoneLink;
                actions.appendChild(call);
            });
            var edit = el('button', 'button-outline', 'Edit my enquiry');
            edit.type = 'button';
            edit.addEventListener('click', function () {
                responsePanel.hidden = true;
                form.hidden = false;
                validator.focusField('name');
            });
            var fresh = el('button', 'button-outline', 'Start a new enquiry');
            fresh.type = 'button';
            fresh.addEventListener('click', function () {
                form.reset();
                validator.reset();
                syncConditionalFields();
                form.querySelector('#enquiry-message').dispatchEvent(new Event('input', { bubbles: true }));   /* refresh the character counter */
                responsePanel.hidden = true;
                form.hidden = false;
                validator.focusField('name');
            });
            actions.appendChild(edit);
            actions.appendChild(fresh);
            responsePanel.appendChild(actions);

            form.hidden = true;
            responsePanel.hidden = false;
            responsePanel.setAttribute('tabindex', '-1');
            responsePanel.focus();
            statusEl = send;
        }

        function setStatus(state) {
            if (!statusEl) { return; }
            var messages = {
                sending: 'Sending your enquiry to our team\u2026',
                sent: '\u2713 Your enquiry has been sent to our team. We will reply soon.',
                failed: 'We could not send your enquiry automatically (you may be offline). Please use the call button so it still reaches us.'
            };
            statusEl.textContent = messages[state] || '';
            statusEl.className = 'send-status send-' + state;
        }

        /* AJAX: send the form in the background with fetch, no page reload.
           The enquiry goes to the email address of the farm the buyer chose
           (or the first farm if they have no preference). */
        function sendInBackground(summaryText) {
            var farm = global.FARM.findFarm(farmSelect.value) || global.FARM.farms[0];
            var endpoint = form.getAttribute('data-ajax-base') + farm.email;
            if (typeof fetch !== 'function') { setStatus('failed'); return; }

            var data = new FormData(form);
            if (summaryText) { data.append('availability', summaryText); }

            var controller = typeof AbortController === 'function' ? new AbortController() : null;
            var timer = controller ? setTimeout(function () { controller.abort(); }, 12000) : null;
            setStatus('sending');
            submitButton.disabled = true;

            fetch(endpoint, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' },
                signal: controller ? controller.signal : undefined
            }).then(function (response) {
                return response.json().catch(function () { return {}; }).then(function (json) {
                    if (!response.ok || json.success === false || json.success === 'false') { throw new Error('rejected'); }
                    setStatus('sent');
                });
            }).catch(function () {
                setStatus('failed');
            }).then(function () {
                if (timer) { clearTimeout(timer); }
                submitButton.disabled = false;
            });
        }

        /* keep the no-JavaScript fallback pointing at the chosen farm too */
        farmSelect.addEventListener('change', function () {
            var farm = global.FARM.findFarm(farmSelect.value) || global.FARM.farms[0];
            form.action = 'https://formsubmit.co/' + farm.email;
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            /* hidden spam-trap field: real visitors never fill it in */
            var trap = form.querySelector('[name="_honey"]');
            if (trap && trap.value) { return; }

            var errors = validator.checkAll();
            if (errors.length) {
                validator.showSummary(errors);
                return;
            }
            validator.hideSummary();

            var values = currentValues();
            var result = buildEnquiryResponse(values, global.FARM);
            var availabilityLine = result.lines.filter(function (l) { return l.label === 'Availability'; })[0];
            showResponse(values, result);                                   /* instant answer first ... */
            sendInBackground(availabilityLine ? availabilityLine.value : '');   /* ... then send it in the background */
        });
    }

    /* ======================================================================
       5. CONTACT PAGE
       ====================================================================== */
    function initContact(form) {
        var farmSelect = form.querySelector('#contact-farm');
        var previewPanel = document.getElementById('email-preview');

        form.noValidate = true;
        fillFarmSelect(farmSelect);
        initCounters(form);

        var validator = createValidator(form, {
            name: function (get) { return V.validateName(get('name')); },
            email: function (get) { return V.validateEmail(get('email')); },
            contactMethod: function (get) { return get('contactMethod') ? '' : 'Please choose how you would like us to reply.'; },
            phone: function (get) { return V.validatePhone(get('phone'), get('contactMethod') === 'phone'); },
            farm: function (get) { return V.validateSelect(get('farm'), 'Please choose which farm should receive your message.'); },
            messageType: function (get) { return V.validateSelect(get('messageType'), 'Please choose the type of message.'); },
            subject: function (get) { return V.validateText(get('subject'), 'a subject', 3, 80); },
            message: function (get) { return V.validateText(get('message'), 'your message', 20, 1000); },
            consent: function (get) { return get('consent') ? '' : 'Please tick the box to confirm we may reply to you.'; }
        });

        function showPreview(email) {
            previewPanel.textContent = '';
            previewPanel.appendChild(el('h2', 'response-title', 'Your email is ready'));
            previewPanel.appendChild(el('p', 'response-intro',
                'We have put your details into an email. It has not been sent yet \u2014 press the button below to send it from your email app.'));

            var meta = el('dl', 'response-list');
            [['To', email.to], ['Subject', email.subject]].forEach(function (pair) {
                var row = el('div', 'response-row');
                row.appendChild(el('dt', '', pair[0]));
                row.appendChild(el('dd', '', pair[1]));
                meta.appendChild(row);
            });
            previewPanel.appendChild(meta);
            previewPanel.appendChild(el('pre', 'email-body', email.body));

            var actions = el('div', 'response-actions');
            var send = el('a', 'cta-button', 'Send email');
            send.href = email.href;
            var copy = el('button', 'button-outline', 'Copy email text');
            copy.type = 'button';
            var edit = el('button', 'button-outline', 'Edit my message');
            edit.type = 'button';
            var note = el('p', 'send-status', '');
            note.setAttribute('role', 'status');

            copy.addEventListener('click', function () {
                var text = 'To: ' + email.to + '\r\nSubject: ' + email.subject + '\r\n\r\n' + email.body;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () {
                        note.textContent = '\u2713 Email text copied.';
                    }, function () {
                        note.textContent = 'Could not copy automatically. Please select the text above and copy it.';
                    });
                } else {
                    note.textContent = 'Copying is not supported here. Please select the text above and copy it.';
                }
            });
            edit.addEventListener('click', function () {
                previewPanel.hidden = true;
                form.hidden = false;
                validator.focusField('message');
            });

            actions.appendChild(send);
            actions.appendChild(copy);
            actions.appendChild(edit);
            previewPanel.appendChild(actions);
            previewPanel.appendChild(note);

            form.hidden = true;
            previewPanel.hidden = false;
            previewPanel.setAttribute('tabindex', '-1');
            previewPanel.focus();
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var trap = form.querySelector('[name="_honey"]');
            if (trap && trap.value) { return; }

            var errors = validator.checkAll();
            if (errors.length) { validator.showSummary(errors); return; }
            validator.hideSummary();

            var farm = global.FARM.findFarm(validator.get('farm'));
            var email = buildEmail({
                name: validator.get('name'),
                email: validator.get('email'),
                phone: validator.get('phone'),
                contactMethod: validator.get('contactMethod'),
                messageType: validator.get('messageType'),
                subject: validator.get('subject'),
                message: validator.get('message')
            }, farm);
            showPreview(email);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var enquiry = document.getElementById('enquiry-form');
        var contact = document.getElementById('contact-form');
        if (enquiry) { initEnquiry(enquiry); }
        if (contact) { initContact(contact); }
    });
})(typeof window !== 'undefined' ? window : globalThis);
