// ============================================================
// ADMIN.JS 
// ============================================================

/* ==========================================================
   THEME BEFORE FIRST PAINT
   ========================================================== */

(function(){

    try {

        var saved =
            localStorage.getItem(
                'amin-admin-theme'
            );

        var theme =
            saved ||
            (
                window.matchMedia &&
                window.matchMedia(
                    '(prefers-color-scheme: light)'
                ).matches
                    ? 'light'
                    : 'dark'
            );

        document.documentElement
            .setAttribute(
                'data-theme',
                theme
            );

    } catch(e) {}

})();


(function() {
    'use strict';

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================
    
    const toastStack = document.getElementById('toast-stack');
    window.showToast = function(message, type) {
        if (!toastStack) { window.alert(message); return; }
        const el = document.createElement('div');
        el.className = 'toast toast-' + (type || 'error');
        el.innerHTML = (type === 'success'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>'
        ) + '<span></span>';
        el.querySelector('span').textContent = message;
        toastStack.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        window.setTimeout(() => {
            el.classList.remove('show');
            window.setTimeout(() => el.remove(), 300);
        }, 4200);
    };
    

    // ============================================================
    // CONFIRM ACTION MODAL
    // ============================================================
    
    window.confirmAction = function(message, options) {
        options = options || {};
        return new Promise((resolve) => {
            const backdrop = document.getElementById('confirm-modal-backdrop');
            if (!backdrop) { resolve(window.confirm(message)); return; }
            document.getElementById('confirm-modal-title').textContent = options.title || 'Are you sure?';
            document.getElementById('confirm-modal-message').textContent = message;
            const confirmBtn = document.getElementById('confirm-modal-confirm');
            const cancelBtn = document.getElementById('confirm-modal-cancel');
            confirmBtn.textContent = options.confirmLabel || 'Delete';
            backdrop.classList.add('active');

            function cleanup(result) {
                backdrop.classList.remove('active');
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                backdrop.removeEventListener('click', onBackdrop);
                document.removeEventListener('keydown', onKey);
                resolve(result);
            }

            function onConfirm() { cleanup(true); }
            function onCancel() { cleanup(false); }
            function onBackdrop(e) { if (e.target === backdrop) cleanup(false); }
            function onKey(e) { if (e.key === 'Escape') cleanup(false); }

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
            backdrop.addEventListener('click', onBackdrop);
            document.addEventListener('keydown', onKey);
        });
    };

    // ============================================================
    // PROMPT ACTION MODAL (replaces window.prompt())
    // ============================================================

    window.promptAction = function(message, options) {
        options = options || {};
        return new Promise((resolve) => {
            const backdrop = document.getElementById('prompt-modal-backdrop');
            if (!backdrop) { resolve(window.prompt(message, options.initialValue || '')); return; }

            document.getElementById('prompt-modal-title').textContent = options.title || 'Enter a value';
            document.getElementById('prompt-modal-message').textContent = message;

            const input = document.getElementById('prompt-modal-input');
            input.value = options.initialValue || '';
            input.placeholder = options.placeholder || '';
            input.readOnly = !!options.readOnly;
            input.rows = options.rows || 1;

            const confirmBtn = document.getElementById('prompt-modal-confirm');
            const cancelBtn = document.getElementById('prompt-modal-cancel');
            confirmBtn.textContent = options.confirmLabel || 'Save';
            cancelBtn.textContent = options.cancelLabel || 'Cancel';
            // A read-only prompt (e.g. "copy this rule text") has
            // nothing to submit — just close it either way.
            confirmBtn.style.display = options.readOnly ? 'none' : '';

            backdrop.classList.add('active');
            input.focus();
            if (options.readOnly) input.select();

            function cleanup(result) {
                backdrop.classList.remove('active');
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                backdrop.removeEventListener('click', onBackdrop);
                document.removeEventListener('keydown', onKey);
                resolve(result);
            }

            function onConfirm() { cleanup(input.value); }
            function onCancel() { cleanup(null); }
            function onBackdrop(e) { if (e.target === backdrop) cleanup(options.readOnly ? '' : null); }
            function onKey(e) {
                if (e.key === 'Escape') cleanup(options.readOnly ? '' : null);
                if (e.key === 'Enter' && !options.multiline && !options.readOnly) { e.preventDefault(); cleanup(input.value); }
            }

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
            backdrop.addEventListener('click', onBackdrop);
            document.addEventListener('keydown', onKey);
        });
    };

    // ============================================================
    // THEME TOGGLE
    // ============================================================
    
    (function() {
        document.querySelectorAll('#theme-toggle').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
                var next = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                try { localStorage.setItem('amin-admin-theme', next); } catch (e) {}
            });
        });
    })();

    // ============================================================
    // TABS
    // ============================================================
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    // ============================================================
    // MESSAGE SEARCH + FILTER
    // ============================================================
    
    (function() {
        const search = document.getElementById('msg-search');
        const pills = document.querySelectorAll('#msg-filter-pills .mini-pill');
        const noResults = document.getElementById('msg-no-results');
        if (!search) return;
        let activeFilter = 'all';

        function apply() {
            const q = search.value.toLowerCase().trim();
            let visible = 0;
            document.querySelectorAll('#tab-messages .msg-card').forEach(card => {
                const text = card.dataset.searchText || '';
                const matchesSearch = !q || text.includes(q);
                let matchesFilter = true;
                if (activeFilter === 'unread') matchesFilter = card.classList.contains('unread');
                if (activeFilter === 'replied') matchesFilter = card.classList.contains('is-replied');
                const show = matchesSearch && matchesFilter;
                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });
            if (noResults) noResults.style.display = visible === 0 ? '' : 'none';
        }

        search.addEventListener('input', apply);
        pills.forEach(p => p.addEventListener('click', () => {
            pills.forEach(x => x.classList.remove('active'));
            p.classList.add('active');
            activeFilter = p.dataset.filter;
            apply();
        }));
    })();

    // ============================================================
    // SUBSCRIBER ROW ACTIONS
    // ============================================================
    
    function bindSubRowActions(row) {
        const editBtn = row.querySelector('.sub-edit-btn');
        const deleteBtn = row.querySelector('.sub-delete-btn');
        const emailLink = row.querySelector('.sub-left');
        const emailText = row.querySelector('.sub-email-text');

        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (row.classList.contains('editing')) return;
                row.classList.add('editing');
                const currentEmail = emailText.textContent;
                const input = document.createElement('input');
                input.type = 'email';
                input.className = 'sub-edit-input';
                input.value = currentEmail;
                emailText.replaceWith(input);
                input.focus();
                input.select();

                const actions = row.querySelector('.sub-actions');
                actions.innerHTML =
                    '<button type="button" class="icon-btn-sm sub-save-btn" title="Save" aria-label="Save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg></button>' +
                    '<button type="button" class="icon-btn-sm sub-cancel-btn" title="Cancel" aria-label="Cancel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';

                const finishEdit = (newSpan) => {
                    row.classList.remove('editing');
                    input.replaceWith(newSpan);
                    const colorIdx = Math.abs(Array.from(newSpan.textContent).reduce((a, c) => a + c.charCodeAt(0), 0)) % 5;
                    const avatar = row.querySelector('.sub-avatar');
                    avatar.className = 'sub-avatar avatar-c' + colorIdx;
                    avatar.textContent = newSpan.textContent.charAt(0).toUpperCase();
                    actions.innerHTML =
                        '<button type="button" class="icon-btn-sm sub-edit-btn" title="Edit email" aria-label="Edit email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>' +
                        '<button type="button" class="icon-btn-sm sub-delete-btn" title="Delete subscriber" aria-label="Delete subscriber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>';
                    bindSubRowActions(row);
                };

                const cancel = () => {
                    const span = document.createElement('span');
                    span.className = 'sub-email-text';
                    span.textContent = currentEmail;
                    finishEdit(span);
                };

                const save = async () => {
                    const newEmail = input.value.trim();
                    if (!newEmail || newEmail === currentEmail) { cancel(); return; }
                    input.disabled = true;
                    const { ok, data } = await callAction({ action: 'edit_subscriber', id: row.dataset.id, email: newEmail });
                    if (ok) {
                        row.dataset.email = newEmail.toLowerCase();
                        emailLink.href = 'mailto:' + newEmail;
                        const span = document.createElement('span');
                        span.className = 'sub-email-text';
                        span.textContent = newEmail;
                        finishEdit(span);
                    } else {
                        showToast(data.error || 'Could not update the subscriber.', 'error');
                        input.disabled = false;
                        input.focus();
                    }
                };

                row.querySelector('.sub-save-btn').addEventListener('click', (ev) => { ev.preventDefault();
                    save(); });
                row.querySelector('.sub-cancel-btn').addEventListener('click', (ev) => { ev.preventDefault();
                    cancel(); });
                input.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter') { ev.preventDefault();
                        save(); }
                    if (ev.key === 'Escape') { ev.preventDefault();
                        cancel(); }
                });
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!(await confirmAction('This subscriber will be permanently removed. This cannot be undone.', { title: 'Remove subscriber?' }))) return;
                deleteBtn.disabled = true;
                const { ok, data } = await callAction({ action: 'delete_subscriber', id: row.dataset.id });
                if (ok) {
                    row.remove();
                    const list = document.getElementById('sub-list');
                    const statNums = document.querySelectorAll('.stat-card .num');
                    if (statNums[2]) statNums[2].textContent = Math.max(0, (parseInt(statNums[2].textContent, 10) || 0) - 1);
                    const subTabCount = document.querySelector('.tab-btn[data-tab="subscribers"] .count');
                    if (subTabCount) subTabCount.textContent = '(' + list.children.length + ')';
                    if (list.children.length === 0) {
                        document.getElementById('sub-search-toolbar').style.display = 'none';
                    }
                } else {
                    showToast(data.error || 'Could not delete the subscriber.', 'error');
                    deleteBtn.disabled = false;
                }
            });
        }
    }
    document.querySelectorAll('#sub-list .sub-row').forEach(bindSubRowActions);

    // ============================================================
    // SUBSCRIBER SEARCH
    // ============================================================
    
    (function() {
        const search = document.getElementById('sub-search');
        const noResults = document.getElementById('sub-no-results');
        if (!search) return;
        search.addEventListener('input', () => {
            const q = search.value.toLowerCase().trim();
            let visible = 0;
            document.querySelectorAll('#sub-list .sub-row').forEach(row => {
                const email = row.dataset.email || '';
                const show = !q || email.includes(q);
                row.style.display = show ? '' : 'none';
                if (show) visible++;
            });
            if (noResults) noResults.style.display = visible === 0 ? '' : 'none';
        });
    })();

    // ============================================================
    // PASSWORD EYE TOGGLES
    // ============================================================
    
    document.querySelectorAll('.pw-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            btn.classList.toggle('showing', !showing);
        });
    });

    // ============================================================
    // CALL ACTION (API)
    // ============================================================
    
    window.callAction = async function(payload) {
        let res;
        try {
            res = await fetch('api/admin_action.php', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (networkErr) {
            return { ok: false,
                data: { ok: false, error: 'Could not reach the server. Check your connection and try again.' } };
        }
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseErr) {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                try { data = JSON.parse(text.slice(start, end + 1)); } catch (e2) { data = null; }
            }
            if (!data) {
                console.error('Non-JSON response from admin_action.php:', text.slice(0, 500));
                const hint = text.trim().slice(0, 120) || ('HTTP ' + res.status);
                return { ok: false,
                    data: { ok: false, error: 'Server returned an unexpected response (' + hint + ')' } };
            }
        }
        if (data && data.login_expired) {
            showToast('Your session has expired. Please log in again.', 'error');
            window.setTimeout(() => window.location.reload(), 1400);
        }
        return { ok: res.ok && data.ok, data };
    };

    // ============================================================
    // ANALYTICS: ONLINE-NOW POLLING
    // ============================================================
    
    (function() {
        const numEl = document.getElementById('online-now-num');
        if (!numEl) return;
        async function refresh() {
            const { ok, data } = await callAction({ action: 'online_count' });
            if (ok) numEl.innerHTML = '<span class="online-dot"></span>' + data.online_now;
        }
        setInterval(refresh, 20000);
    })();

    // ============================================================
    // ANALYTICS: DELETE SINGLE VISIT RECORD
    // ============================================================
    
    const visitTableBody = document.querySelector('#tab-analytics .visit-table tbody');
    if (visitTableBody) {
        visitTableBody.addEventListener('click', async (e) => {
            const noteBtn = e.target.closest('.visitor-note-btn');
            if (noteBtn) {
                const visitorId = noteBtn.dataset.visitorId;
                if (!visitorId) { console.error('Note clicked but no data-visitor-id found.', noteBtn); return; }

                const existing = noteBtn.querySelector('.visitor-note-text');
                const current = existing ? existing.textContent : '';
                const next = await promptAction(
                    'Shown on every visit from this visitor — leave blank to remove it.',
                    { title: 'Note for this visitor', initialValue: current, placeholder: 'e.g. "Me testing" or "Rafiq — client"', confirmLabel: 'Save' }
                );
                if (next === null) return; // cancelled

                const note = next.trim();
                noteBtn.disabled = true;
                const { ok, data } = await callAction({ action: 'set_visitor_note', visitor_id: visitorId, note });
                noteBtn.disabled = false;

                if (!ok) {
                    console.error('set_visitor_note failed:', data);
                    showToast(data.error || 'Could not save this note.', 'error');
                    return;
                }

                // Apply the same note to every row for this visitor
                // currently shown in the table, not just the one clicked.
                visitTableBody.querySelectorAll(`.visitor-note-btn[data-visitor-id="${CSS.escape(visitorId)}"]`).forEach(btn => {
                    if (note) {
                        btn.innerHTML = '';
                        const span = document.createElement('span');
                        span.className = 'visitor-note-text';
                        span.textContent = note;
                        btn.appendChild(span);
                        btn.title = 'Edit note';
                    } else {
                        btn.innerHTML = '<i class="fa-solid fa-pen"></i> Note';
                        btn.title = 'Add a note for this visitor';
                    }
                });
                return;
            }

            const blockBtn = e.target.closest('.ip-block-btn');
            if (blockBtn) {
                const ip = blockBtn.dataset.ip;
                if (!ip) { console.error('Block clicked but no data-ip found.', blockBtn); return; }
                await performBlock(ip, blockBtn);
                return;
            }

            const unblockBtn = e.target.closest('.ip-unblock-btn');
            if (unblockBtn) {
                const ip = unblockBtn.dataset.ip;
                if (!ip) { console.error('Unblock clicked but no data-ip found.', unblockBtn); return; }
                await performUnblock(ip, unblockBtn);
                return;
            }

            const btn = e.target.closest('.visit-delete-btn');
            if (!btn) return;
            const row = btn.closest('tr');
            const visitId = row && row.dataset.visitId;
            if (!visitId) { console.error('Delete clicked but no data-visit-id found on the row.', row); return; }
            if (!(await confirmAction('This page-view record will be permanently removed.', { title: 'Delete this visit record?' }))) return;
            btn.disabled = true;
            const { ok, data } = await callAction({ action: 'delete_visit', id: visitId });
            if (ok) {
                row.remove();
                const countEl = document.getElementById('visit-table-count');
                if (countEl) {
                    const remaining = document.querySelectorAll('#tab-analytics .visit-table tbody tr[data-visit-id]').length;
                    countEl.textContent = remaining + ' shown';
                }
            } else {
                console.error('delete_visit failed:', data);
                showToast(data.error || 'Could not delete this record.', 'error');
                btn.disabled = false;
            }
        });
    }

    // ============================================================
    // BLOCKED IPS
    // ============================================================

    function escapeHtmlForIpTable(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function updateBlockedTabCount(delta) {
        const el = document.querySelector('.tab-btn[data-tab="blocked"] .count');
        if (!el) return;
        const current = parseInt(el.textContent.replace(/[^\d-]/g, ''), 10) || 0;
        el.textContent = '(' + Math.max(0, current + delta) + ')';
    }

    function blockedRowHtml(ip, reason) {
        return `<tr data-ip="${escapeHtmlForIpTable(ip)}">
            <td class="mono">${escapeHtmlForIpTable(ip)}</td>
            <td>${reason ? escapeHtmlForIpTable(reason) : '—'}</td>
            <td>Just now</td>
            <td class="center">
                <button type="button" class="btn btn-ghost btn-sm ip-unblock-btn" data-ip="${escapeHtmlForIpTable(ip)}">Unblock</button>
            </td>
        </tr>`;
    }

    function blockBtnHtml(ip) {
        return `<button type="button" class="btn btn-danger btn-sm ip-block-btn" data-ip="${escapeHtmlForIpTable(ip)}">Block</button>`;
    }

    function unblockBtnHtml(ip) {
        return `<button type="button" class="btn btn-ghost btn-sm ip-unblock-btn" data-ip="${escapeHtmlForIpTable(ip)}">Unblock</button>`;
    }

    async function performBlock(ip, btn) {
        const reasonInput = await promptAction(
            `${ip} will be redirected to a simple "Access Restricted" page instead of your site.`,
            { title: `Block ${ip}?`, placeholder: 'Optional reason (shown in the Blocked list)', confirmLabel: 'Block', cancelLabel: 'Cancel' }
        );
        if (reasonInput === null) return; // cancelled
        const reason = reasonInput.trim();

        btn.disabled = true;
        const { ok, data } = await callAction({ action: 'block_ip', ip, reason });
        btn.disabled = false;

        if (!ok) {
            console.error('block_ip failed:', data);
            showToast(data.error || 'Could not block this IP.', 'error');
            return;
        }

        if (data.htaccess_writable === false) {
            showToast(ip + ' was saved, but the site could not update .htaccess automatically.', 'error');
            await promptAction(
                'Your host may not allow PHP to edit .htaccess. To finish blocking this IP, add this to your site\'s root .htaccess file manually (already selected — just copy):',
                { title: 'Add this rule manually', initialValue: data.rule_text || '', readOnly: true, rows: 8, cancelLabel: 'Close' }
            );
        } else {
            showToast(ip + ' has been blocked.', 'success');
        }

        // Swap this row's Block button for an Unblock button, wherever
        // this IP appears in the Recent Visitors table.
        document.querySelectorAll(`#recent-ips-table tr[data-ip="${CSS.escape(ip)}"] td:last-child`).forEach(cell => {
            cell.innerHTML = unblockBtnHtml(ip);
        });

        // Same for every visit row in the Analytics tab from this IP —
        // there, the buttons themselves carry data-ip (not the row).
        document.querySelectorAll(`#tab-analytics .visit-table tbody .ip-block-btn[data-ip="${CSS.escape(ip)}"]`).forEach(oldBtn => {
            oldBtn.outerHTML = unblockBtnHtml(ip);
        });

        // Add it to the Currently Blocked table too.
        const blockedTbody = document.querySelector('#blocked-ips-table tbody');
        if (blockedTbody) {
            blockedTbody.querySelector('.visit-empty')?.closest('tr')?.remove();
            blockedTbody.insertAdjacentHTML('afterbegin', blockedRowHtml(ip, reason));
        }
        updateBlockedTabCount(1);
    }

    async function performUnblock(ip, btn) {
        if (!(await confirmAction(ip + ' will be able to open the site again.', { title: 'Unblock this IP?', confirmLabel: 'Unblock' }))) return;

        btn.disabled = true;
        const { ok, data } = await callAction({ action: 'unblock_ip', ip });

        if (!ok) {
            console.error('unblock_ip failed:', data);
            showToast(data.error || 'Could not unblock this IP.', 'error');
            btn.disabled = false;
            return;
        }

        // Remove it from the Currently Blocked table.
        const blockedIpsTableEl = document.getElementById('blocked-ips-table');
        const blockedRow = blockedIpsTableEl?.querySelector(`tr[data-ip="${CSS.escape(ip)}"]`);
        blockedRow?.remove();
        if (blockedIpsTableEl && blockedIpsTableEl.querySelectorAll('tbody tr[data-ip]').length === 0) {
            const tbody = blockedIpsTableEl.querySelector('tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="visit-empty">No IPs are currently blocked.</td></tr>';
        }
        updateBlockedTabCount(-1);

        // Swap the Unblock button back to Block wherever this IP shows
        // up in the Recent Visitors table.
        document.querySelectorAll(`#recent-ips-table tr[data-ip="${CSS.escape(ip)}"] td:last-child`).forEach(cell => {
            cell.innerHTML = blockBtnHtml(ip);
        });

        // Same for every visit row in the Analytics tab from this IP.
        document.querySelectorAll(`#tab-analytics .visit-table tbody .ip-unblock-btn[data-ip="${CSS.escape(ip)}"]`).forEach(oldBtn => {
            oldBtn.outerHTML = blockBtnHtml(ip);
        });

        if (data.htaccess_writable === false) {
            showToast(ip + ' was removed, but .htaccess could not be updated automatically — you may need to remove its rule manually.', 'error');
        } else {
            showToast(ip + ' has been unblocked.', 'success');
        }
    }

    const recentIpsTable = document.getElementById('recent-ips-table');
    if (recentIpsTable) {
        recentIpsTable.addEventListener('click', (e) => {
            const blockBtn = e.target.closest('.ip-block-btn');
            if (blockBtn) {
                const ip = blockBtn.dataset.ip;
                if (!ip) { console.error('Block clicked but no data-ip found.', blockBtn); return; }
                performBlock(ip, blockBtn);
                return;
            }
            const unblockBtn = e.target.closest('.ip-unblock-btn');
            if (unblockBtn) {
                const ip = unblockBtn.dataset.ip;
                if (!ip) { console.error('Unblock clicked but no data-ip found.', unblockBtn); return; }
                performUnblock(ip, unblockBtn);
            }
        });
    }

    const blockedIpsTable = document.getElementById('blocked-ips-table');
    if (blockedIpsTable) {
        blockedIpsTable.addEventListener('click', (e) => {
            const btn = e.target.closest('.ip-unblock-btn');
            if (!btn) return;
            const ip = btn.dataset.ip;
            if (!ip) { console.error('Unblock clicked but no data-ip found.', btn); return; }
            performUnblock(ip, btn);
        });
    }

    // ============================================================
    // ANALYTICS: CLEAR ALL VISIT RECORDS
    // ============================================================
    
    const clearAllBtn = document.getElementById('clear-all-visits-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', async () => {
            if (!(await confirmAction('Every visit record in your analytics history will be permanently erased. This cannot be undone.', { title: 'Clear all tracking records?', confirmLabel: 'Delete all' }))) return;
            clearAllBtn.disabled = true;
            const { ok, data } = await callAction({ action: 'delete_all_visits' });
            if (ok) {
                window.location.href = 'admin.php?tab=analytics';
            } else {
                showToast(data.error || 'Could not clear the records.', 'error');
                clearAllBtn.disabled = false;
            }
        });
    }

    // ============================================================
    // MARK AS READ
    // ============================================================
    
    document.querySelectorAll('.btn-mark-read').forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.msg-card');
            const id = card.dataset.msgId;
            btn.disabled = true;
            const { ok } = await callAction({ action: 'mark_read', id });
            if (ok) {
                card.classList.remove('unread');
                card.querySelector('.badge-new')?.remove();
                btn.remove();
            } else {
                btn.disabled = false;
            }
        });
    });

    // ============================================================
    // REPLY BOX OPEN/CANCEL
    // ============================================================
    
    document.querySelectorAll('.btn-reply-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.msg-card');
            card.querySelector('.reply-box').classList.add('open');
            card.querySelector('textarea').focus();
        });
    });
    document.querySelectorAll('.btn-cancel-reply').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.reply-box').classList.remove('open');
        });
    });

    // ============================================================
    // SEND REPLY
    // ============================================================
    
    document.querySelectorAll('.btn-send-reply').forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.msg-card');
            const box = btn.closest('.reply-box');
            const textarea = box.querySelector('textarea');
            const note = box.querySelector('.reply-note');
            const noteText = box.querySelector('.reply-note-text');
            const reply = textarea.value.trim();

            if (!reply) { textarea.focus(); return; }

            btn.disabled = true;
            const originalLabel = btn.textContent;
            btn.textContent = 'Sending...';

            const { ok, data } = await callAction({ action: 'reply', id: card.dataset.msgId, reply });

            if (ok) {
                note.classList.remove('err');
                note.classList.add('ok', 'show');
                noteText.textContent = 'Reply sent.';
                window.setTimeout(() => {
                    box.classList.remove('open');
                    note.classList.remove('show');
                    textarea.value = '';
                    card.classList.add('is-replied');
                    if (!card.querySelector('.badge-replied')) {
                        const row = card.querySelector('.msg-name-row');
                        const b = document.createElement('span');
                        b.className = 'badge badge-replied';
                        b.textContent = 'REPLIED';
                        row.appendChild(b);
                    }
                    let block = card.querySelector('.replied-block');
                    if (!block) {
                        block = document.createElement('div');
                        block.className = 'replied-block';
                        card.querySelector('.msg-actions').before(block);
                    }
                    block.innerHTML = '<div class="label">YOUR REPLY · just now</div><div class="txt"></div>';
                    block.querySelector('.txt').textContent = reply;
                }, 900);
            } else {
                note.classList.remove('ok');
                note.classList.add('err', 'show');
                noteText.textContent = data.error || 'Could not send reply. Please try again.';
            }

            btn.disabled = false;
            btn.textContent = originalLabel;
        });
    });

    // ============================================================
    // MESSAGE: EDIT
    // ============================================================

    function msgInitials(name) {
        const parts = String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
        const out = parts.map(p => p.charAt(0).toUpperCase()).join('');
        return out || '?';
    }
    // Mirrors the same lightweight hash the subscriber-edit code above
    // uses to recolor an avatar client-side (see bindSubRowActions) —
    // cosmetic only, doesn't need to match PHP's crc32-based avatar_class()
    // exactly, just needs to be stable for a given value.
    function msgAvatarColorIdx(seed) {
        return Math.abs(Array.from(String(seed || '')).reduce((a, c) => a + c.charCodeAt(0), 0)) % 5;
    }

    document.querySelectorAll('.btn-edit-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.msg-card');
            card.querySelector('.reply-box')?.classList.remove('open');
            card.querySelector('.edit-box').classList.add('open');
            card.querySelector('.edit-name').focus();
        });
    });

    document.querySelectorAll('.btn-cancel-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const box = btn.closest('.edit-box');
            const card = btn.closest('.msg-card');
            // Reset any unsaved changes back to what's currently shown.
            box.querySelector('.edit-name').value = card.querySelector('.msg-name').textContent.trim();
            box.querySelector('.edit-email').value = card.querySelector('.msg-sub-email').textContent.trim();
            box.querySelector('.edit-phone').value = card.querySelector('.msg-sub-phone')?.textContent.trim() || '';
            box.querySelector('.edit-subject').value = card.querySelector('.msg-subject')?.textContent.trim() || '';
            box.querySelector('.edit-message').value = card.querySelector('.msg-body').textContent;
            box.classList.remove('open');
        });
    });

    document.querySelectorAll('.btn-save-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.msg-card');
            const box = btn.closest('.edit-box');
            const note = box.querySelector('.edit-note');
            const noteText = box.querySelector('.edit-note-text');

            const name = box.querySelector('.edit-name').value.trim();
            const email = box.querySelector('.edit-email').value.trim();
            const phone = box.querySelector('.edit-phone').value.trim();
            const subject = box.querySelector('.edit-subject').value.trim();
            const message = box.querySelector('.edit-message').value.trim();

            note.classList.remove('show', 'ok', 'err');

            if (!name || !email || !message) {
                note.classList.add('show', 'err');
                noteText.textContent = 'Name, email, and message are required.';
                return;
            }

            btn.disabled = true;
            const originalLabel = btn.textContent;
            btn.textContent = 'Saving...';

            const { ok, data } = await callAction({
                action: 'edit_message', id: card.dataset.msgId,
                name, email, phone, subject, message
            });

            if (ok) {
                // Name + avatar
                card.querySelector('.msg-name').textContent = name;
                const avatar = card.querySelector('.msg-avatar');
                avatar.className = 'msg-avatar avatar-c' + msgAvatarColorIdx(email);
                avatar.textContent = msgInitials(name);

                // Email / phone line
                card.querySelector('.msg-sub-email').textContent = email;
                let phoneEl = card.querySelector('.msg-sub-phone');
                if (phone) {
                    if (!phoneEl) {
                        card.querySelector('.msg-sub').insertAdjacentHTML('beforeend', ' · <span class="msg-sub-phone"></span>');
                        phoneEl = card.querySelector('.msg-sub-phone');
                    }
                    phoneEl.textContent = phone;
                } else if (phoneEl) {
                    phoneEl.previousSibling?.remove(); // the " · " text node
                    phoneEl.remove();
                }

                // Subject (bold line above the message body)
                let subjectEl = card.querySelector('.msg-subject');
                if (subject) {
                    if (!subjectEl) {
                        subjectEl = document.createElement('div');
                        subjectEl.className = 'msg-subject';
                        card.querySelector('.msg-body').before(subjectEl);
                    }
                    subjectEl.textContent = subject;
                } else if (subjectEl) {
                    subjectEl.remove();
                }

                // Message body
                card.querySelector('.msg-body').textContent = message;

                // Keep the search index and the other action links in sync.
                card.dataset.searchText = (name + ' ' + email + ' ' + subject + ' ' + message).toLowerCase();
                const openEmail = card.querySelector('.msg-open-email');
                if (openEmail) {
                    openEmail.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Re: ' + (subject || 'your message'));
                }
                const replyTextarea = card.querySelector('.reply-box textarea');
                if (replyTextarea) {
                    replyTextarea.placeholder = 'Type your reply — this will be emailed to ' + email + '...';
                }

                box.classList.remove('open');
            } else {
                note.classList.add('show', 'err');
                noteText.textContent = data.error || 'Could not save changes. Please try again.';
            }

            btn.disabled = false;
            btn.textContent = originalLabel;
        });
    });

    // ============================================================
    // MESSAGE: DELETE
    // ============================================================

    document.querySelectorAll('.btn-delete-message').forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.msg-card');
            const confirmed = await window.confirmAction(
                'This message will be permanently deleted. This cannot be undone.',
                { title: 'Delete message?' }
            );
            if (!confirmed) return;

            const wasUnread = card.classList.contains('unread');
            btn.disabled = true;
            const { ok, data } = await callAction({ action: 'delete_message', id: card.dataset.msgId });

            if (ok) {
                card.remove();

                const statNums = document.querySelectorAll('.stat-card .num');
                if (statNums[0]) statNums[0].textContent = Math.max(0, (parseInt(statNums[0].textContent, 10) || 0) - 1);
                if (wasUnread && statNums[1]) statNums[1].textContent = Math.max(0, (parseInt(statNums[1].textContent, 10) || 0) - 1);

                const msgTabCount = document.querySelector('.tab-btn[data-tab="messages"] .count');
                const remaining = document.querySelectorAll('#tab-messages .msg-card').length;
                if (msgTabCount) msgTabCount.textContent = '(' + remaining + ')';
            } else {
                showToast(data.error || 'Could not delete the message.', 'error');
                btn.disabled = false;
            }
        });
    });

    // ============================================================
    // ADD SUBSCRIBER MANUALLY
    // ============================================================
    
    const addSubForm = document.getElementById('add-subscriber-form');
    if (addSubForm) {
        addSubForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('add-sub-email');
            const btn = document.getElementById('add-sub-btn');
            const note = document.getElementById('add-sub-note');
            const noteText = document.getElementById('add-sub-note-text');
            const email = input.value.trim();

            note.classList.remove('show', 'ok', 'err');
            btn.disabled = true;
            const originalLabel = btn.textContent;
            btn.textContent = 'Adding...';

            const { ok, data } = await callAction({ action: 'add_subscriber', email });

            if (ok) {
                note.classList.add('ok', 'show');
                noteText.textContent = data.already ? 'Already on the list.' : 'Subscriber added.';

                if (!data.already) {
                    const list = document.getElementById('sub-list');
                    const row = document.createElement('div');
                    row.className = 'sub-row';
                    row.dataset.email = data.email.toLowerCase();
                    row.dataset.id = data.id;
                    const colorIdx = Math.abs(Array.from(data.email).reduce((a, c) => a + c.charCodeAt(0), 0)) % 5;
                    row.innerHTML =
                        '<a class="sub-left" href="mailto:' + data.email + '" title="Email this subscriber">' +
                        '<div class="sub-avatar avatar-c' + colorIdx + '"></div>' +
                        '<span class="sub-email-text"></span>' +
                        '</a>' +
                        '<div class="sub-right">' +
                        '<span class="date"></span>' +
                        '<div class="sub-actions">' +
                        '<button type="button" class="icon-btn-sm sub-edit-btn" title="Edit email" aria-label="Edit email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>' +
                        '<button type="button" class="icon-btn-sm sub-delete-btn" title="Delete subscriber" aria-label="Delete subscriber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>' +
                        '</div>' +
                        '</div>';
                    row.querySelector('.sub-avatar').textContent = data.email.charAt(0).toUpperCase();
                    row.querySelector('.sub-email-text').textContent = data.email;
                    row.querySelector('.date').textContent = data.created_at;
                    list.prepend(row);
                    bindSubRowActions(row);

                    document.getElementById('subscribers-empty')?.remove();
                    const toolbar = document.getElementById('sub-search-toolbar');
                    if (toolbar) toolbar.style.display = '';

                    const statNums = document.querySelectorAll('.stat-card .num');
                    if (statNums[2]) statNums[2].textContent = (parseInt(statNums[2].textContent, 10) || 0) + 1;
                    const subTabCount = document.querySelector('.tab-btn[data-tab="subscribers"] .count');
                    if (subTabCount) subTabCount.textContent = '(' + list.children.length + ')';
                }

                input.value = '';
                window.setTimeout(() => note.classList.remove('show'), 3000);
            } else {
                note.classList.add('err', 'show');
                noteText.textContent = data.error || 'Could not add subscriber.';
            }

            btn.disabled = false;
            btn.textContent = originalLabel;
        });
    }

    // ============================================================
    // COPY ALL SUBSCRIBER EMAILS
    // ============================================================
    
    const copyBtn = document.getElementById('copy-emails');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const emails = Array.from(document.querySelectorAll('.sub-row .sub-email-text')).map(el => el.textContent).join(', ');
            navigator.clipboard.writeText(emails).then(() => {
                const original = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                window.setTimeout(() => { copyBtn.textContent = original; }, 1600);
            });
        });
    }

    // ============================================================
    // CHANGE PASSWORD MODAL
    // ============================================================
    
    const modal = document.getElementById('pw-modal-backdrop');
    const openModalBtn = document.getElementById('open-password-modal');
    if (modal && openModalBtn) {
        openModalBtn.addEventListener('click', () => modal.classList.add('active'));
        document.getElementById('pw-modal-cancel').addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

        document.getElementById('pw-modal-save').addEventListener('click', async () => {
            const current = document.getElementById('cp-current').value;
            const next = document.getElementById('cp-new').value;
            const confirm = document.getElementById('cp-confirm').value;
            const note = document.getElementById('pw-modal-note');
            const noteText = document.getElementById('pw-modal-note-text');
            const saveBtn = document.getElementById('pw-modal-save');

            note.classList.remove('show', 'ok', 'err');
            saveBtn.disabled = true;
            const originalLabel = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';

            const { ok, data } = await callAction({
                action: 'change_password',
                current_password: current,
                new_password: next,
                confirm_password: confirm
            });

            if (ok) {
                note.classList.add('ok', 'show');
                noteText.textContent = 'Password updated.';
                document.getElementById('cp-current').value = '';
                document.getElementById('cp-new').value = '';
                document.getElementById('cp-confirm').value = '';
                window.setTimeout(() => modal.classList.remove('active'), 1100);
            } else {
                note.classList.add('err', 'show');
                noteText.textContent = data.error || 'Could not update password.';
            }

            saveBtn.disabled = false;
            saveBtn.textContent = originalLabel;
        });
    }

    // ============================================================
    // VISITOR DETAILS MODAL
    // ============================================================
    
    (function() {
        var visitors = window.ADMIN_VISITOR_DATA || [];

        var backdrop = document.getElementById('visitor-details-backdrop');
        var body = document.getElementById('visitor-details-body');
        var subtitle = document.getElementById('visitor-details-subtitle');
        var closeBtn = document.getElementById('visitor-details-close');

        if (!backdrop || !body) {
            console.error('Visitor details modal elements not found');
            return;
        }

        function escapeHtml(value) {
            if (value === null || value === undefined || value === '') {
                return '—';
            }
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function formatValue(key, row) {
            var v = row[key];

            if (v === null || v === undefined || v === '') {
                return '—';
            }

            if (key === 'in_app_browser' || key === 'is_bot' || key === 'touch') {
                return Number(v) === 1 ?
                    '<span class="visitor-badge yes">Yes</span>' :
                    '<span class="visitor-badge no">No</span>';
            }

            if (key === 'device_model' && String(v).toLowerCase() === 'k') {
                return 'Hidden (Android privacy)';
            }

            if (['screen_width', 'screen_height', 'viewport_width', 'viewport_height'].includes(key)) {
                return escapeHtml(v) + ' px';
            }

            if (key === 'device_memory') {
                return escapeHtml(v) + ' GB';
            }

            if (key === 'downlink') {
                return escapeHtml(v) + ' Mbps';
            }
            if (key === 'rtt') {
                return escapeHtml(v) + ' ms';
            }

            if (key === 'created_at' && v) {
                try {
                    var date = new Date(v);
                    if (!isNaN(date)) {
                        return date.toLocaleString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                } catch (e) {}
                return escapeHtml(v);
            }

            return escapeHtml(v);
        }

        function createDetail(label, key, row, options) {
            options = options || {};
            var fullClass = options.full ? ' full' : '';
            var monoClass = options.mono ? ' mono' : '';

            return `
                <div class="visitor-detail${fullClass}">
                    <div class="visitor-detail-label">${escapeHtml(label)}</div>
                    <div class="visitor-detail-value${monoClass}">${formatValue(key, row)}</div>
                </div>
            `;
        }

        function createSection(title, html) {
            return `
                <div class="visitor-section">
                    <h4 class="visitor-section-title">${escapeHtml(title)}</h4>
                    <div class="visitor-detail-grid">${html}</div>
                </div>
            `;
        }

        function openVisitor(visitId) {
            var row = null;
            for (var i = 0; i < visitors.length; i++) {
                if (String(visitors[i].id) === String(visitId)) {
                    row = visitors[i];
                    break;
                }
            }

            if (!row) {
                showToast('Visitor data not found', 'error');
                return;
            }

            var html = '';

            html += createSection('Visit Info',
                createDetail('ID', 'id', row, { mono: true }) +
                createDetail('Visitor ID', 'visitor_id', row, { mono: true }) +
                createDetail('Visit #', 'total_visits', row) +
                createDetail('Time', 'created_at', row) +
                createDetail('Timezone', 'visitor_tz', row) +
                createDetail('Note', 'visitor_note', row)
            );

            html += createSection('Page & Traffic',
                createDetail('Page', 'page', row, { mono: true }) +
                createDetail('Page URL', 'page_url', row, { full: true, mono: true }) +
                createDetail('Referrer', 'referrer', row, { full: true, mono: true })
            );

            html += createSection('Device',
                createDetail('Device Type', 'device_type', row) +
                createDetail('Brand', 'brand', row) +
                createDetail('Model', 'device_model', row) +
                createDetail('Platform', 'platform', row) +
                createDetail('Platform Version', 'platform_version', row) +
                createDetail('Architecture', 'architecture', row) +
                createDetail('Bitness', 'bitness', row)
            );

            html += createSection('Browser',
                createDetail('Browser', 'browser', row) +
                createDetail('Browser Version', 'browser_version', row) +
                createDetail('In-App Browser', 'in_app_browser', row) +
                createDetail('Bot/Crawler', 'is_bot', row)
            );

            html += createSection('Operating System',
                createDetail('OS', 'os', row) +
                createDetail('OS Version', 'os_version', row) +
                createDetail('Language', 'lang', row)
            );

            html += createSection('Screen & Viewport',
                createDetail('Screen Width', 'screen_width', row) +
                createDetail('Screen Height', 'screen_height', row) +
                createDetail('Viewport Width', 'viewport_width', row) +
                createDetail('Viewport Height', 'viewport_height', row) +
                createDetail('Pixel Ratio', 'device_pixel_ratio', row)
            );

            html += createSection('Touch & Hardware',
                createDetail('Touch Support', 'touch', row) +
                createDetail('Touch Points', 'touch_points', row) +
                createDetail('CPU Cores', 'hardware_concurrency', row) +
                createDetail('Device Memory', 'device_memory', row)
            );

            html += createSection('Network',
                createDetail('Connection Type', 'connection_type', row) +
                createDetail('Downlink', 'downlink', row) +
                createDetail('RTT', 'rtt', row)
            );

            html += createSection('Network Identity',
                createDetail('IP Address', 'ip_address', row, { mono: true }) +
                createDetail('IP Hash', 'ip_hash', row, { mono: true })
            );

            html += createSection('User-Agent',
                createDetail('User-Agent', 'user_agent', row, { full: true, mono: true })
            );

            body.innerHTML = html;

            var subtitleText = '';
            if (row.brand) subtitleText += row.brand + ' ';
            if (row.device_model && row.device_model !== 'k') subtitleText += row.device_model + ' ';
            if (!subtitleText) subtitleText = row.device_type || 'Visitor';
            subtitle.textContent = subtitleText.trim();

            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeVisitor() {
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }

        document.addEventListener('click', function(event) {
            var button = event.target.closest('.visit-details-btn');
            if (!button) return;

            event.preventDefault();
            var visitId = button.getAttribute('data-visit-id');
            if (!visitId) {
                console.error('No visit-id found');
                return;
            }
            openVisitor(visitId);
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closeVisitor);
        }

        backdrop.addEventListener('click', function(event) {
            if (event.target === backdrop) {
                closeVisitor();
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && backdrop.classList.contains('active')) {
                closeVisitor();
            }
        });
    })();

// ============================================================
// USER MANAGEMENT - COMPLETE WORKING VERSION
// ============================================================

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUserManagement);
    } else {
        initUserManagement();
    }

    function initUserManagement() {
        console.log('User management initializing...');
        
        let users = [];
        let currentUserId = null;

        // Helper functions
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function formatDate(dateString) {
            if (!dateString) return 'Never';
            try {
                const date = new Date(dateString + ' UTC');
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch {
                return dateString;
            }
        }

        // Show toast message
        function showMessage(message, type = 'info') {
            if (typeof window.showToast === 'function') {
                window.showToast(message, type);
            } else {
                // Create a simple toast fallback
                const toast = document.createElement('div');
                toast.style.cssText = `
                    position: fixed; bottom: 20px; right: 20px; 
                    padding: 12px 20px; border-radius: 8px; 
                    color: #fff; z-index: 9999;
                    background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
                    max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    font-family: system-ui, -apple-system, sans-serif;
                `;
                toast.textContent = message;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transition = 'opacity 0.3s';
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            }
        }

        // Show user note in modal
        function showUserNote(message, type = 'info') {
            const note = document.getElementById('user-modal-note');
            const text = document.getElementById('user-modal-note-text');
            
            if (!note || !text) {
                showMessage(message, type);
                return;
            }
            
            text.textContent = message;
            note.style.display = 'flex';
            note.style.alignItems = 'center';
            note.style.gap = '8px';
            note.style.padding = '10px 12px';
            note.style.borderRadius = '8px';
            note.style.marginTop = '12px';
            // #user-modal-note also carries the shared .modal-note class,
            // which sets opacity:0 by default and only clears it via a
            // .show class — this code never added that class, so every
            // validation/error message here was rendering fully
            // invisible (display:flex, but opacity:0). Setting opacity
            // directly bypasses that class entirely.
            note.style.opacity = '1';
            
            const color = type === 'error' ? '#e74c3c' : '#2ecc71';
            note.style.color = color;
            note.style.background = type === 'error' ? '#fde8e8' : '#e8f8ed';
            
            const icon = note.querySelector('svg');
            if (icon) icon.style.color = color;
            
            clearTimeout(window.userNoteTimeout);
            window.userNoteTimeout = setTimeout(() => {
                note.style.display = 'none';
                note.style.opacity = '0';
            }, 5000);
        }

        // LOAD USERS
        async function loadUsers() {
            console.log('Loading users...');
            try {
                const tbody = document.getElementById('users-tbody');
                if (!tbody) {
                    console.error('users-tbody not found');
                    return;
                }
                
                tbody.innerHTML = '<tr><td colspan="7" class="visit-empty">Loading users...</td></tr>';
                
                const response = await fetch('api/user_manager.php?action=list');
                const data = await response.json();
                
                if (data.success) {
                    users = data.users || [];
                    renderUsers(users);
                    const userCount = document.getElementById('user-count');
                    if (userCount) userCount.textContent = `(${users.length})`;
                } else {
                    tbody.innerHTML = '<tr><td colspan="7" class="visit-empty">Error: ' + (data.error || 'Unknown error') + '</td></tr>';
                    showMessage(data.error || 'Error loading users', 'error');
                }
            } catch (error) {
                console.error('Error loading users:', error);
                const tbody = document.getElementById('users-tbody');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="7" class="visit-empty">Failed to load users</td></tr>';
                }
                showMessage('Failed to load users: ' + error.message, 'error');
            }
        }

        // RENDER USERS TABLE
        function renderUsers(userList) {
            const tbody = document.getElementById('users-tbody');
            if (!tbody) return;
            
            if (!userList || userList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="visit-empty">No users found</td></tr>';
                return;
            }
            
            let html = '';
            userList.forEach(user => {
                const isActive = user.is_active == 1;
                const roleClass = 'role-badge role-' + (user.role || 'viewer');
                
                html += `
                    <tr data-user-id="${user.id}">
                        <td>
                            <div class="user-cell">
                                <div class="user-avatar">
                                    ${user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div class="user-cell-name">${escapeHtml(user.full_name || user.username)}</div>
                                    <div class="user-cell-username">@${escapeHtml(user.username)}</div>
                                </div>
                            </div>
                        </td>
                        <td>${escapeHtml(user.email)}</td>
                        <td>
                            <span class="${roleClass}">${escapeHtml(user.role.toUpperCase())}</span>
                        </td>
                        <td>
                            <span class="visit-badge ${isActive ? 'status-active' : 'status-inactive'}">${isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td>${user.last_login ? formatDate(user.last_login) : 'Never'}</td>
                        <td>${formatDate(user.created_at)}</td>
                        <td>
                            <div class="visit-row-actions">
                                <button class="btn btn-ghost btn-sm edit-user-btn" data-id="${user.id}" title="Edit user">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="btn btn-ghost btn-sm toggle-user-btn" data-id="${user.id}" title="${isActive ? 'Deactivate' : 'Activate'} user">
                                    <i class="fa-solid ${isActive ? 'fa-pause' : 'fa-play'}"></i>
                                </button>
                                <button class="btn btn-danger btn-sm delete-user-btn" data-id="${user.id}" title="Delete user">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
            
            // Attach event listeners
            tbody.querySelectorAll('.edit-user-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const userId = parseInt(this.getAttribute('data-id'));
                    console.log('Edit user clicked:', userId);
                    openUserModal(userId);
                });
            });
            
            tbody.querySelectorAll('.toggle-user-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const userId = parseInt(this.getAttribute('data-id'));
                    console.log('Toggle user clicked:', userId);
                    toggleUser(userId);
                });
            });
            
            tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const userId = parseInt(this.getAttribute('data-id'));
                    console.log('Delete user clicked:', userId);
                    deleteUser(userId);
                });
            });
        }

        // OPEN USER MODAL
        function openUserModal(userId = null) {
            console.log('Opening user modal, userId:', userId);
            
            const modal = document.getElementById('user-modal-backdrop');
            if (!modal) {
                console.error('User modal not found');
                showMessage('Modal element not found', 'error');
                return;
            }
            
            const title = document.getElementById('user-modal-title');
            const subtitle = document.getElementById('user-modal-subtitle');
            const idField = document.getElementById('user-form-id');
            const usernameField = document.getElementById('user-form-username');
            const fullnameField = document.getElementById('user-form-fullname');
            const emailField = document.getElementById('user-form-email');
            const passwordField = document.getElementById('user-form-password');
            const roleField = document.getElementById('user-form-role');
            const activeField = document.getElementById('user-form-active');
            const saveBtn = document.getElementById('user-modal-save');
            const note = document.getElementById('user-modal-note');
            
            // Reset form
            const form = document.getElementById('user-form');
            if (form) form.reset();
            if (note) { note.style.display = 'none'; note.style.opacity = '0'; }
            if (idField) idField.value = '';
            if (activeField) activeField.checked = true;
            
            if (userId) {
                // EDIT MODE
                const user = users.find(u => u.id === userId);
                if (!user) {
                    showMessage('User not found', 'error');
                    return;
                }
                
                console.log('Editing user:', user);
                
                if (title) title.textContent = 'Edit User';
                if (subtitle) subtitle.textContent = 'Update user information';
                if (idField) idField.value = user.id;
                if (usernameField) usernameField.value = user.username;
                if (fullnameField) fullnameField.value = user.full_name || '';
                if (emailField) emailField.value = user.email;
                if (roleField) roleField.value = user.role;
                if (activeField) activeField.checked = user.is_active == 1;
                if (passwordField) {
                    passwordField.placeholder = 'Leave blank to keep current';
                    passwordField.required = false;
                    passwordField.value = '';
                }
                if (saveBtn) saveBtn.textContent = 'Update User';
                currentUserId = user.id;
            } else {
                // ADD MODE
                console.log('Adding new user');
                
                if (title) title.textContent = 'Add User';
                if (subtitle) subtitle.textContent = 'Create a new admin user';
                if (usernameField) usernameField.value = '';
                if (fullnameField) fullnameField.value = '';
                if (emailField) emailField.value = '';
                if (roleField) roleField.value = 'viewer';
                if (activeField) activeField.checked = true;
                if (passwordField) {
                    passwordField.placeholder = 'Enter password';
                    passwordField.required = true;
                    passwordField.value = '';
                }
                if (saveBtn) saveBtn.textContent = 'Create User';
                currentUserId = null;
            }
            
            // Show modal
            modal.classList.add('open');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            console.log('Modal opened');
        }

        // CLOSE USER MODAL
        function closeUserModal() {
            const modal = document.getElementById('user-modal-backdrop');
            if (modal) {
                modal.classList.remove('open');
                modal.style.display = 'none';
            }
            const note = document.getElementById('user-modal-note');
            if (note) note.style.display = 'none';
            document.body.style.overflow = '';
            console.log('Modal closed');
        }

        // SAVE USER (CREATE or UPDATE)
        async function saveUser(e) {
            e.preventDefault();
            console.log('Saving user...');
            
            const id = document.getElementById('user-form-id').value;
            const username = document.getElementById('user-form-username').value.trim();
            const fullName = document.getElementById('user-form-fullname').value.trim();
            const email = document.getElementById('user-form-email').value.trim();
            const password = document.getElementById('user-form-password').value;
            const role = document.getElementById('user-form-role').value;
            const isActive = document.getElementById('user-form-active').checked ? 1 : 0;
            
            console.log('Form data:', { id, username, fullName, email, role, isActive, hasPassword: !!password });
            
            // Validate
            if (!username || !email || !fullName) {
                showUserNote('Please fill in all required fields', 'error');
                return;
            }
            
            if (!id && !password) {
                showUserNote('Password is required for new users', 'error');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showUserNote('Please enter a valid email address', 'error');
                return;
            }
            
            // Validate password length for new users (must match the
            // minimum enforced server-side in user_manager.php).
            if (!id && password.length < 6) {
                showUserNote('Password must be at least 6 characters', 'error');
                return;
            }
            // Same rule applies if changing the password while editing
            // an existing user (leaving it blank keeps the current one).
            if (id && password && password.length < 6) {
                showUserNote('Password must be at least 6 characters', 'error');
                return;
            }
            
            const data = {
                username: username,
                full_name: fullName,
                email: email,
                role: role,
                is_active: isActive
            };
            
            if (id) {
                data.id = parseInt(id);
            }
            
            if (password) {
                data.password = password;
            }
            
            const saveBtn = document.getElementById('user-modal-save');
            const originalLabel = saveBtn.textContent;
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            saveBtn.style.opacity = '0.7';
            
            try {
                const action = id ? 'update' : 'create';
                
                const response = await fetch(`api/user_manager.php?action=${action}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(result.message || 'User saved successfully', 'success');
                    closeUserModal();
                    // Reload users after a short delay
                    setTimeout(() => loadUsers(), 500);
                } else {
                    showUserNote(result.error || 'Failed to save user', 'error');
                }
            } catch (error) {
                console.error('Error saving user:', error);
                showUserNote('Failed to save user: ' + error.message, 'error');
            }
            
            saveBtn.disabled = false;
            saveBtn.textContent = originalLabel;
            saveBtn.style.opacity = '1';
        }

        // DELETE USER
        async function deleteUser(userId) {
            const user = users.find(u => u.id === userId);
            if (!user) {
                showMessage('User not found', 'error');
                return;
            }
            
            let confirmed = false;
            if (typeof window.confirmAction === 'function') {
                confirmed = await window.confirmAction(
                    `Delete user "${user.username}"? This action cannot be undone.`,
                    { title: 'Delete User', confirmLabel: 'Delete' }
                );
            } else {
                confirmed = confirm(`Delete user "${user.username}"? This action cannot be undone.`);
            }
            
            if (!confirmed) return;
            
            try {
                const response = await fetch('api/user_manager.php?action=delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: userId })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(result.message || 'User deleted successfully', 'success');
                    loadUsers();
                } else {
                    showMessage(result.error || 'Failed to delete user', 'error');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                showMessage('Failed to delete user', 'error');
            }
        }

        // TOGGLE USER STATUS
        async function toggleUser(userId) {
            try {
                const response = await fetch('api/user_manager.php?action=toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: userId })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(result.message || 'User status updated', 'success');
                    loadUsers();
                } else {
                    showMessage(result.error || 'Failed to toggle user status', 'error');
                }
            } catch (error) {
                console.error('Error toggling user:', error);
                showMessage('Failed to toggle user status', 'error');
            }
        }

        // SEARCH USERS
        function searchUsers() {
            const searchInput = document.getElementById('user-search');
            if (!searchInput) return;
            
            const query = searchInput.value.toLowerCase().trim();
            if (!query) {
                renderUsers(users);
                return;
            }
            
            const filtered = users.filter(u => 
                u.username.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                (u.full_name && u.full_name.toLowerCase().includes(query))
            );
            renderUsers(filtered);
        }

        // SETUP EVENT LISTENERS
        function setupUserManagement() {
            console.log('Setting up user management...');
            
            // Add user button
            const addBtn = document.getElementById('add-user-btn');
            if (addBtn) {
                addBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Add user button clicked');
                    openUserModal();
                });
                console.log('Add user button attached');
            } else {
                console.error('Add user button not found');
            }

            // Form submit (handles both the Save and Cancel buttons,
            // since Cancel lives inside <form id="user-form">)
            const form = document.getElementById('user-form');
            if (form) {
                form.addEventListener('submit', saveUser);
                console.log('Form submit handler attached');
            } else {
                console.error('User form not found');
            }

            // Cancel button — attached AFTER the form above, and
            // directly (no cloning) since this whole setup only ever
            // runs once. Cloning the form after this listener was
            // attached used to silently discard it (cloneNode never
            // copies addEventListener-attached listeners), which is
            // why Cancel previously did nothing.
            const cancelBtn = document.getElementById('user-modal-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', closeUserModal);
                console.log('Cancel button attached');
            }

            // Close modal on backdrop click
            const modalBackdrop = document.getElementById('user-modal-backdrop');
            if (modalBackdrop) {
                modalBackdrop.addEventListener('click', function(e) {
                    if (e.target === this) closeUserModal();
                });
            }

            // Search
            const searchInput = document.getElementById('user-search');
            if (searchInput) {
                searchInput.addEventListener('input', searchUsers);
            }

            // Users tab click
            const usersTab = document.querySelector('[data-tab="users"]');
            if (usersTab) {
                usersTab.addEventListener('click', function() {
                    if (users.length === 0) {
                        loadUsers();
                    }
                });
            }

            // Check if users tab is active on page load
            const usersPanel = document.getElementById('tab-users');
            if (usersPanel && usersPanel.classList.contains('active')) {
                loadUsers();
            }
            
            console.log('User management setup complete');
        }

        // Initialize
        setupUserManagement();

        // Expose functions globally for debugging
        window.loadUsers = loadUsers;
        window.openUserModal = openUserModal;
        window.closeUserModal = closeUserModal;
        window.saveUser = saveUser;
        window.toggleUser = toggleUser;
        window.deleteUser = deleteUser;

        console.log('User management ready');
    }

})();

// ============================================================
// BLOG
// ============================================================

(function() {
    const panel = document.getElementById('tab-blog');
    if (!panel) return; // Blog tab not present on this page load.

    const listEl = document.getElementById('post-list');
    const editorEl = document.getElementById('post-editor');
    const newBtn = document.getElementById('new-post-btn');
    const closeBtn = document.getElementById('post-editor-close');
    const cancelBtn = document.getElementById('post-cancel-btn');
    const saveBtn = document.getElementById('post-save-btn');
    const editorTitleEl = document.getElementById('post-editor-title');
    const idInput = document.getElementById('post-id');
    const titleInput = document.getElementById('post-title');
    const slugInput = document.getElementById('post-slug');
    const statusSelect = document.getElementById('post-status');
    const coverInput = document.getElementById('post-cover');
    const excerptInput = document.getElementById('post-excerpt');
    const note = document.getElementById('post-note');
    const noteText = document.getElementById('post-note-text');

    let quill = null;
    function ensureQuill() {
        if (quill || typeof Quill === 'undefined') return quill;
        quill = new Quill('#post-quill-editor', {
            theme: 'snow',
            placeholder: 'Write your post...',
            modules: { toolbar: '#post-quill-toolbar' }
        });
        return quill;
    }

    // Decodes the base64 blob each post row carries its full HTML
    // content in (data-content-b64) back into a UTF-8 string. Using
    // base64 avoids fighting HTML-attribute escaping for arbitrarily
    // complex post markup.
    function decodeContentB64(b64) {
        try {
            const binary = atob(b64 || '');
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            return new TextDecoder('utf-8').decode(bytes);
        } catch (e) {
            return '';
        }
    }

    function slugifyClientSide(text) {
        return String(text || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function resetNote() {
        note.classList.remove('show', 'ok', 'err');
        noteText.textContent = '';
    }

    function openEditor(mode, row) {
        ensureQuill();
        resetNote();

        if (mode === 'edit' && row) {
            editorTitleEl.textContent = 'Edit post';
            idInput.value = row.dataset.postId;
            titleInput.value = row.dataset.title || '';
            slugInput.value = row.dataset.slug || '';
            statusSelect.value = row.dataset.status || 'draft';
            coverInput.value = row.dataset.cover || '';
            excerptInput.value = row.dataset.excerpt || '';
            quill.root.innerHTML = decodeContentB64(row.dataset.contentB64);
        } else {
            editorTitleEl.textContent = 'New post';
            idInput.value = '0';
            titleInput.value = '';
            slugInput.value = '';
            statusSelect.value = 'draft';
            coverInput.value = '';
            excerptInput.value = '';
            quill.root.innerHTML = '';
        }

        editorEl.classList.add('open');
        editorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        titleInput.focus();
    }

    function closeEditor() {
        editorEl.classList.remove('open');
    }

    // Slug auto-fills from the title as the user types, but only until
    // they've typed a slug themselves — editing the slug field once
    // stops the auto-fill so a manual choice never gets overwritten.
    let slugTouched = false;
    slugInput.addEventListener('input', () => { slugTouched = true; });
    titleInput.addEventListener('input', () => {
        if (!slugTouched) slugInput.value = slugifyClientSide(titleInput.value);
    });

    if (newBtn) newBtn.addEventListener('click', () => { slugTouched = false; openEditor('new'); });
    if (closeBtn) closeBtn.addEventListener('click', closeEditor);
    if (cancelBtn) cancelBtn.addEventListener('click', closeEditor);

    function bindPostRow(row) {
        const editBtn = row.querySelector('.post-edit-btn');
        const deleteBtn = row.querySelector('.post-delete-btn');

        if (editBtn) {
            editBtn.addEventListener('click', () => { slugTouched = true; openEditor('edit', row); });
        }
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const confirmed = await window.confirmAction(
                    'This post will be permanently deleted. This cannot be undone.',
                    { title: 'Delete post?' }
                );
                if (!confirmed) return;

                deleteBtn.disabled = true;
                const { ok, data } = await callAction({ action: 'delete_post', id: row.dataset.postId });
                if (ok) {
                    row.remove();
                    const tabCount = document.querySelector('.tab-btn[data-tab="blog"] .count');
                    if (tabCount) tabCount.textContent = '(' + document.querySelectorAll('#post-list .post-row').length + ')';
                    if (!document.querySelector('#post-list .post-row')) {
                        window.location.reload(); // show the "no posts yet" empty state
                    }
                } else {
                    showToast(data.error || 'Could not delete the post.', 'error');
                    deleteBtn.disabled = false;
                }
            });
        }
    }
    document.querySelectorAll('#post-list .post-row').forEach(bindPostRow);

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const q = ensureQuill();
            const id = parseInt(idInput.value, 10) || 0;
            const title = titleInput.value.trim();
            const content = q.root.innerHTML;
            const contentIsEmpty = q.getText().trim() === '' && !/<img\b/i.test(content);

            resetNote();
            if (!title) { note.classList.add('show', 'err'); noteText.textContent = 'Title is required.'; titleInput.focus(); return; }
            if (contentIsEmpty) { note.classList.add('show', 'err'); noteText.textContent = 'Post content cannot be empty.'; return; }

            saveBtn.disabled = true;
            const originalLabel = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';

            const payload = {
                action: id > 0 ? 'edit_post' : 'create_post',
                id, title, content,
                slug: slugInput.value.trim(),
                status: statusSelect.value,
                cover_image: coverInput.value.trim(),
                excerpt: excerptInput.value.trim()
            };

            const { ok, data } = await callAction(payload);

            if (ok) {
                note.classList.add('show', 'ok');
                noteText.textContent = 'Saved.';
                // A full reload keeps the list (thumbnails, slugs, view
                // links, published dates) in sync with the server's
                // rendering instead of hand-duplicating that logic here.
                window.setTimeout(() => { window.location.href = 'admin.php?tab=blog'; }, 500);
            } else {
                note.classList.add('show', 'err');
                noteText.textContent = data.error || 'Could not save the post. Please try again.';
                saveBtn.disabled = false;
                saveBtn.textContent = originalLabel;
            }
        });
    }

    // If the Blog tab is the one active on page load (?tab=blog after
    // a save), make sure Quill is ready in case the user opens the
    // editor right away.
    if (panel.classList.contains('active')) ensureQuill();
})();

})(); // END OF MAIN IIFE