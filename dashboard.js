/**
 * BizFlow — Dashboard Application Controller (dashboard.js)
 * Full state reactivity, interactive charts, invoice creation, stock management & AI Copilot
 */

;(function () {
  'use strict';

  // ── 1. AUTHENTICATION & USER SESSION ─────────────────────────────
  let userSession = null;
  try {
    const raw = localStorage.getItem('bizflow_session');
    if (raw) userSession = JSON.parse(raw);
  } catch (e) {
    userSession = null;
  }

  if (!userSession) {
    userSession = {
      name: 'Alex Morgan',
      email: 'demo@bizflow.com',
      business: 'Apex Retail Solutions',
      role: 'Store Owner',
      avatar: 'AM',
      currency: '₹',
      gstin: '27AABCU9603R1ZM',
      isDemo: true
    };
    localStorage.setItem('bizflow_session', JSON.stringify(userSession));
  }

  // Populate user info in header & profile menu
  const elAvatar = document.getElementById('header-user-avatar');
  const elName = document.getElementById('header-user-name');
  const elRole = document.getElementById('header-user-role');
  const elMenuName = document.getElementById('menu-user-name');
  const elMenuEmail = document.getElementById('menu-user-email');
  const elBizName = document.getElementById('display-business-name');

  if (elAvatar) elAvatar.textContent = userSession.avatar || 'AM';
  if (elName) elName.textContent = userSession.name;
  if (elRole) elRole.textContent = userSession.role;
  if (elMenuName) elMenuName.textContent = userSession.name;
  if (elMenuEmail) elMenuEmail.textContent = userSession.email;
  if (elBizName) elBizName.textContent = userSession.business || 'Apex Retail Solutions';

  // Format INR currency
  function formatINR(val) {
    return '₹' + Number(val).toLocaleString('en-IN');
  }

  // Toast notifications
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // ── 2. STATE RENDERING & REACTIVITY ───────────────────────────────
  function renderAll() {
    const db = window.BizFlowDB.getData();

    // 1. KPI Cards
    const kpiRev = document.getElementById('kpi-monthly-revenue');
    const kpiDues = document.getElementById('kpi-outstanding-amount');
    const kpiPendingCount = document.getElementById('kpi-pending-count');
    const kpiInvVal = document.getElementById('kpi-inventory-valuation');
    const kpiLowStock = document.getElementById('kpi-low-stock-count');
    const kpiGST = document.getElementById('kpi-gst-liability');
    const badgePending = document.getElementById('badge-pending-invoices');
    const badgeLow = document.getElementById('badge-low-stock');

    if (kpiRev) kpiRev.textContent = formatINR(db.metrics.monthlyRevenue);
    if (kpiDues) kpiDues.textContent = formatINR(db.metrics.outstandingAmount);
    if (kpiPendingCount) kpiPendingCount.textContent = `${db.metrics.pendingInvoicesCount} Pending`;
    if (kpiInvVal) kpiInvVal.textContent = formatINR(db.metrics.inventoryValuation);
    if (kpiLowStock) kpiLowStock.textContent = `${db.metrics.lowStockCount} Low Stock`;
    if (kpiGST) kpiGST.textContent = formatINR(db.metrics.estimatedGSTLiability);
    if (badgePending) badgePending.textContent = db.metrics.pendingInvoicesCount;
    if (badgeLow) badgeLow.textContent = db.metrics.lowStockCount;

    // 2. Weekly Bar Chart
    renderSalesChart(db.weeklySales);

    // 3. AI Suggestions Stream
    renderAISuggestions(db.aiSuggestions);

    // 4. Invoices Table
    renderInvoicesTable(db.invoices);

    // 5. Inventory Watchlist
    renderInventoryWatchlist(db.inventory);

    // 6. Notifications
    renderNotifications(db.notifications);
  }

  // ── 3. SALES & COST CHART RENDERING ──────────────────────────────
  function renderSalesChart(data) {
    const chart = document.getElementById('sales-bar-chart');
    if (!chart) return;

    chart.innerHTML = '';
    const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.cost))) * 1.15 || 100000;

    data.forEach(item => {
      const revPct = Math.round((item.revenue / maxVal) * 100);
      const costPct = Math.round((item.cost / maxVal) * 100);
      const marginPct = Math.round(((item.revenue - item.cost) / item.revenue) * 100);

      const barGroup = document.createElement('div');
      barGroup.className = 'chart-bar-group';
      barGroup.innerHTML = `
        <div class="chart-tooltip">
          <strong>${item.day}: Rev ${formatINR(item.revenue)}</strong><br>
          Cost ${formatINR(item.cost)} • Margin: ${marginPct}%
        </div>
        <div class="chart-bars-duo">
          <div class="chart-bar revenue" style="height: ${revPct}%;" title="${item.day} Revenue: ${formatINR(item.revenue)}"></div>
          <div class="chart-bar cost" style="height: ${costPct}%;" title="${item.day} Cost: ${formatINR(item.cost)}"></div>
        </div>
        <span class="chart-day-label">${item.day}</span>
      `;
      chart.appendChild(barGroup);
    });
  }

  // ── 4. AI SUGGESTIONS ─────────────────────────────────────────────
  function renderAISuggestions(suggestions) {
    const stream = document.getElementById('ai-insights-stream');
    if (!stream) return;

    stream.innerHTML = suggestions.map(s => `
      <div class="ai-insight-item">
        <span class="ai-item-tag">${s.tag}</span>
        <p class="ai-item-text">${s.text}</p>
        <button type="button" class="ai-item-action" data-action="${s.actionType}">
          ${s.action} →
        </button>
      </div>
    `).join('');

    stream.querySelectorAll('.ai-item-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'modal-reminder') {
          openAIDrawer('Draft a WhatsApp payment reminder for overdue invoices.');
        } else if (action === 'tab-inventory') {
          document.getElementById('inventory-watchlist-container').scrollIntoView({ behavior: 'smooth' });
        } else if (action === 'tab-gst') {
          openAIDrawer('Break down my GST liability and input tax credit for October.');
        }
      });
    });
  }

  // ── 5. RECENT INVOICES TABLE ──────────────────────────────────────
  function renderInvoicesTable(invoices) {
    const tbody = document.getElementById('invoices-tbody');
    if (!tbody) return;

    if (!invoices || invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No invoices created yet.</td></tr>';
      return;
    }

    tbody.innerHTML = invoices.slice(0, 6).map(inv => {
      const statusClass = inv.status.toLowerCase();
      return `
        <tr data-invoice-id="${inv.id}">
          <td><strong>${inv.id}</strong></td>
          <td>
            <div style="font-weight: 600;">${inv.customer}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${inv.items[0]?.name || 'Items'}</div>
          </td>
          <td>${inv.date}</td>
          <td><strong>${formatINR(inv.total)}</strong></td>
          <td><span class="status-badge ${statusClass}">${inv.status}</span></td>
          <td class="text-right">
            ${inv.status !== 'Paid' ? `
              <button type="button" class="btn-table-action btn-mark-paid" data-id="${inv.id}">Mark Paid</button>
            ` : `
              <button type="button" class="btn-table-action btn-print-inv" data-id="${inv.id}">Receipt</button>
            `}
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-mark-paid').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        window.BizFlowDB.updateInvoiceStatus(id, 'Paid');
        renderAll();
        showToast(`Invoice ${id} marked as Paid!`);
      });
    });

    tbody.querySelectorAll('.btn-print-inv').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast(`Opening receipt view for ${btn.dataset.id}...`, 'info');
      });
    });
  }

  // ── 6. INVENTORY WATCHLIST ────────────────────────────────────────
  function renderInventoryWatchlist(inventory) {
    const container = document.getElementById('inventory-watchlist-container');
    if (!container) return;

    // Filter to items needing attention or top items
    const lowItems = inventory.filter(i => i.stock <= i.minStock);
    const displayItems = lowItems.length > 0 ? lowItems : inventory.slice(0, 4);

    container.innerHTML = displayItems.map(item => {
      const isCritical = item.stock <= Math.floor(item.minStock / 2);
      const pillClass = isCritical ? 'critical' : (item.stock <= item.minStock ? 'low' : '');
      const pillLabel = isCritical ? 'Critical' : (item.stock <= item.minStock ? 'Low Stock' : 'Good');

      return `
        <div class="watch-item">
          <div class="watch-item-info">
            <span class="watch-item-name">${item.name}</span>
            <span class="watch-item-meta">${item.category} • Supplier: ${item.supplier}</span>
          </div>
          <div class="watch-item-stats">
            <span class="stock-count-pill ${pillClass}">${item.stock} left (Min: ${item.minStock})</span>
            <button type="button" class="btn-reorder" data-id="${item.id}" data-name="${item.name}">+ Reorder</button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-reorder').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        window.BizFlowDB.adjustStock(id, 10);
        renderAll();
        showToast(`Added +10 units to ${btn.dataset.name}!`);
      });
    });
  }

  // ── 7. NOTIFICATIONS ──────────────────────────────────────────────
  function renderNotifications(notifs) {
    const list = document.getElementById('notif-list-container');
    const badge = document.getElementById('notif-unread-count');
    if (!list) return;

    const unreadCount = notifs.filter(n => n.unread).length;
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}">
        <div class="notif-title-row">
          <span class="notif-title">${n.title}</span>
          <span class="notif-time">${n.time}</span>
        </div>
        <p class="notif-desc">${n.message}</p>
      </div>
    `).join('');
  }

  // ── 8. CREATE INVOICE MODAL LOGIC ─────────────────────────────────
  const modalInvoice = document.getElementById('modal-invoice');
  const btnCloseInvoice = document.getElementById('btn-close-invoice-modal');
  const btnCancelInvoice = document.getElementById('btn-cancel-invoice');
  const btnTriggerNewInv = document.getElementById('btn-quick-new-invoice');
  const btnHeroNewInv = document.getElementById('btn-hero-new-invoice');
  const formCreateInvoice = document.getElementById('form-create-invoice');

  const selectProduct = document.getElementById('inv-product-select');
  const inputQty = document.getElementById('inv-qty');
  const inputPrice = document.getElementById('inv-unit-price');
  const calcSubtotal = document.getElementById('inv-calc-subtotal');
  const calcGst = document.getElementById('inv-calc-gst');
  const calcTotal = document.getElementById('inv-calc-total');

  function openInvoiceModal() {
    // Populate products
    const db = window.BizFlowDB.getData();
    selectProduct.innerHTML = '<option value="">-- Choose inventory item --</option>' +
      db.inventory.map(p => `<option value="${p.id}" data-price="${p.sellingPrice}">${p.name} (Stock: ${p.stock})</option>`).join('');

    inputQty.value = 1;
    inputPrice.value = '';
    recalcInvoice();

    modalInvoice.classList.add('open');
    modalInvoice.setAttribute('aria-hidden', 'false');
  }

  function closeInvoiceModal() {
    modalInvoice.classList.remove('open');
    modalInvoice.setAttribute('aria-hidden', 'true');
    formCreateInvoice.reset();
  }

  function recalcInvoice() {
    const qty = parseInt(inputQty.value, 10) || 0;
    const price = parseFloat(inputPrice.value) || 0;
    const sub = qty * price;
    const gst = Math.round(sub * 0.18);
    const grand = sub + gst;

    calcSubtotal.textContent = formatINR(sub);
    calcGst.textContent = formatINR(gst);
    calcTotal.textContent = formatINR(grand);
  }

  if (selectProduct) {
    selectProduct.addEventListener('change', () => {
      const selected = selectProduct.options[selectProduct.selectedIndex];
      if (selected && selected.dataset.price) {
        inputPrice.value = selected.dataset.price;
      }
      recalcInvoice();
    });
  }

  if (inputQty) inputQty.addEventListener('input', recalcInvoice);
  if (inputPrice) inputPrice.addEventListener('input', recalcInvoice);

  if (btnTriggerNewInv) btnTriggerNewInv.addEventListener('click', openInvoiceModal);
  if (btnHeroNewInv) btnHeroNewInv.addEventListener('click', openInvoiceModal);
  if (btnCloseInvoice) btnCloseInvoice.addEventListener('click', closeInvoiceModal);
  if (btnCancelInvoice) btnCancelInvoice.addEventListener('click', closeInvoiceModal);

  if (formCreateInvoice) {
    formCreateInvoice.addEventListener('submit', (e) => {
      e.preventDefault();
      const customer = document.getElementById('inv-customer').value;
      const contact = document.getElementById('inv-contact').value;
      const prodOption = selectProduct.options[selectProduct.selectedIndex];
      const prodId = selectProduct.value;
      const prodName = prodOption ? prodOption.text.split(' (Stock')[0] : 'Item';
      const qty = parseInt(inputQty.value, 10) || 1;
      const price = parseFloat(inputPrice.value) || 0;
      const status = document.getElementById('inv-payment-status').value;
      const method = document.getElementById('inv-payment-method').value;

      const subtotal = qty * price;
      const gst = Math.round(subtotal * 0.18);
      const total = subtotal + gst;

      const newInvId = `INV-2026-${Math.floor(105 + Math.random() * 900)}`;

      const invoice = {
        id: newInvId,
        customer,
        contact: contact || '+91 98000 00000',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        items: [{ name: prodName, qty, price }],
        subtotal,
        gst,
        total,
        status,
        method
      };

      // Add invoice to database
      window.BizFlowDB.addInvoice(invoice);

      // Decrement stock
      if (prodId) {
        window.BizFlowDB.adjustStock(prodId, -qty);
      }

      closeInvoiceModal();
      renderAll();
      showToast(`Invoice ${newInvId} created for ${formatINR(total)}!`);
    });
  }

  // ── 9. ADD INVENTORY MODAL LOGIC ──────────────────────────────────
  const modalInventory = document.getElementById('modal-inventory');
  const btnCloseInventory = document.getElementById('btn-close-inventory-modal');
  const btnCancelInventory = document.getElementById('btn-cancel-inventory');
  const btnTriggerInventory = document.getElementById('btn-add-inventory-modal-trigger');
  const formAddProduct = document.getElementById('form-add-product');

  function openInventoryModal() {
    modalInventory.classList.add('open');
    modalInventory.setAttribute('aria-hidden', 'false');
  }

  function closeInventoryModal() {
    modalInventory.classList.remove('open');
    modalInventory.setAttribute('aria-hidden', 'true');
    formAddProduct.reset();
  }

  if (btnTriggerInventory) btnTriggerInventory.addEventListener('click', openInventoryModal);
  if (btnCloseInventory) btnCloseInventory.addEventListener('click', closeInventoryModal);
  if (btnCancelInventory) btnCancelInventory.addEventListener('click', closeInventoryModal);

  if (formAddProduct) {
    formAddProduct.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('prod-name').value;
      const category = document.getElementById('prod-category').value;
      const supplier = document.getElementById('prod-supplier').value;
      const stock = parseInt(document.getElementById('prod-stock').value, 10) || 0;
      const minStock = parseInt(document.getElementById('prod-min-stock').value, 10) || 5;
      const cost = parseFloat(document.getElementById('prod-cost').value) || 0;
      const sellingPrice = parseFloat(document.getElementById('prod-selling-price').value) || 0;

      const newItem = {
        id: `PRD-${Math.floor(100 + Math.random() * 900)}`,
        name,
        category,
        stock,
        minStock,
        cost,
        sellingPrice,
        supplier,
        status: stock <= minStock ? 'Low Stock' : 'Healthy'
      };

      window.BizFlowDB.addInventoryItem(newItem);
      closeInventoryModal();
      renderAll();
      showToast(`Added "${name}" to product inventory!`);
    });
  }

  // ── 10. AI COPILOT INTERACTIVE DRAWER ─────────────────────────────
  const aiDrawer = document.getElementById('ai-drawer');
  const btnCloseAIDrawer = document.getElementById('btn-close-ai-drawer');
  const sidebarAITrigger = document.getElementById('sidebar-ai-trigger');
  const topbarAIBtn = document.getElementById('topbar-ai-btn');
  const aiChatMessages = document.getElementById('ai-chat-messages');
  const aiDrawerForm = document.getElementById('ai-drawer-form');
  const aiDrawerInput = document.getElementById('ai-drawer-input');
  const aiQuickForm = document.getElementById('ai-quick-form');
  const aiQuickInput = document.getElementById('ai-quick-input');

  function openAIDrawer(initialPrompt = '') {
    aiDrawer.classList.add('open');
    aiDrawer.setAttribute('aria-hidden', 'false');

    if (initialPrompt) {
      appendUserQuery(initialPrompt);
    }
  }

  function closeAIDrawer() {
    aiDrawer.classList.remove('open');
    aiDrawer.setAttribute('aria-hidden', 'true');
  }

  if (sidebarAITrigger) sidebarAITrigger.addEventListener('click', () => openAIDrawer());
  if (topbarAIBtn) topbarAIBtn.addEventListener('click', () => openAIDrawer());
  if (btnCloseAIDrawer) btnCloseAIDrawer.addEventListener('click', closeAIDrawer);

  function appendUserQuery(text) {
    const userBubble = document.createElement('div');
    userBubble.className = 'ai-chat-bubble user';
    userBubble.textContent = text;
    aiChatMessages.appendChild(userBubble);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    // Simulate Groq response
    const botBubble = document.createElement('div');
    botBubble.className = 'ai-chat-bubble assistant';
    botBubble.innerHTML = `<span style="color: var(--teal-mid);">⚡ BizFlow Groq Agent is thinking...</span>`;
    aiChatMessages.appendChild(botBubble);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    setTimeout(() => {
      const response = generateAIResponse(text);
      botBubble.innerHTML = response;
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }, 600);
  }

  function generateAIResponse(query) {
    const q = query.toLowerCase();
    const db = window.BizFlowDB.getData();

    if (q.includes('cash') || q.includes('flow') || q.includes('due') || q.includes('owe')) {
      const overdue = db.invoices.filter(i => i.status === 'Overdue');
      return `
        <strong>📊 Cash Flow & Overdue Summary:</strong><br>
        • Current Month Sales: <strong>${formatINR(db.metrics.monthlyRevenue)}</strong><br>
        • Uncollected Dues: <strong>${formatINR(db.metrics.outstandingAmount)}</strong> across ${db.metrics.pendingInvoicesCount} invoices.<br>
        • Overdue Accounts: ${overdue.map(o => `<strong>${o.customer}</strong> (${formatINR(o.total)})`).join(', ') || 'None'}.<br><br>
        <em>💡 Recommendation: Send automated reminders via WhatsApp for quick settlement.</em>
      `;
    }

    if (q.includes('stock') || q.includes('reorder') || q.includes('item') || q.includes('inventory')) {
      const low = db.inventory.filter(i => i.stock <= i.minStock);
      return `
        <strong>⚠️ Inventory Audit (Groq Analysis):</strong><br>
        Found <strong>${low.length} items</strong> below safety threshold:<br>
        ${low.map(item => `• <strong>${item.name}</strong>: ${item.stock} left (safety min: ${item.minStock})`).join('<br>')}<br><br>
        <em>Estimated restock cost: ₹32,400 with regular suppliers.</em>
      `;
    }

    if (q.includes('gst') || q.includes('tax') || q.includes('return')) {
      return `
        <strong>🏛️ GST Compliance Snapshot:</strong><br>
        • Estimated Net Tax Payable: <strong>${formatINR(db.metrics.estimatedGSTLiability)}</strong><br>
        • Gross Output GST: ₹53,020<br>
        • Verified Input Tax Credit (ITC): -₹18,420<br>
        • Filing Deadline: <strong>Oct 20, 2026 (GSTR-3B)</strong><br><br>
        <em>All B2B invoices are formatted with valid GSTINs. Ready for JSON export.</em>
      `;
    }

    if (q.includes('remind') || q.includes('whatsapp') || q.includes('draft')) {
      return `
        <strong>💬 WhatsApp Follow-up Template Ready:</strong><br><br>
        <blockquote style="background: rgba(0,191,165,0.08); padding: 0.5rem; border-left: 3px solid #00897B; border-radius: 4px; font-size: 0.8rem;">
          "Dear Partner, Greetings from Apex Retail Solutions. We noticed that Invoice INV-2026-101 for ₹25,960 is past its due date. Kindly settle via UPI/NEFT at your earliest. Thank you!"
        </blockquote><br>
        <button type="button" class="btn-table-action" onclick="navigator.clipboard.writeText('Invoice reminder copied!'); alert('Copied to clipboard!');">📋 Copy Reminder</button>
      `;
    }

    return `
      <strong>💡 BizFlow Insights:</strong><br>
      Analyzed operational data for <strong>Apex Retail Solutions</strong>.<br>
      • Revenue is trending <strong>+14.8%</strong> month-over-month.<br>
      • Operating profit margin average: <strong>38.4%</strong>.<br>
      • 3 items require restocking before the weekend rush.
    `;
  }

  // Handle drawer chat submit
  if (aiDrawerForm) {
    aiDrawerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = aiDrawerInput.value.trim();
      if (!val) return;
      aiDrawerInput.value = '';
      appendUserQuery(val);
    });
  }

  // Handle quick search prompt form
  if (aiQuickForm) {
    aiQuickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = aiQuickInput.value.trim();
      if (!val) return;
      aiQuickInput.value = '';
      openAIDrawer(val);
    });
  }

  // Handle Quick Chips in AI Chat
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('ai-chip')) {
      const prompt = e.target.dataset.prompt;
      appendUserQuery(prompt);
    }
  });

  // ── 11. NAVIGATION & DROPDOWNS ────────────────────────────────────
  const notifBellBtn = document.getElementById('notif-bell-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  const userProfileBtn = document.getElementById('user-profile-btn');
  const profileMenu = document.getElementById('profile-menu');
  const btnClearNotifs = document.getElementById('btn-clear-notifs');
  const btnResetData = document.getElementById('btn-reset-demo-data');
  const menuItemResetData = document.getElementById('menu-item-reset-data');
  const menuBtnSignOut = document.getElementById('menu-btn-signout');

  if (notifBellBtn && notifDropdown) {
    notifBellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('open');
      if (profileMenu) profileMenu.classList.remove('open');
    });
  }

  if (userProfileBtn && profileMenu) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('open');
      if (notifDropdown) notifDropdown.classList.remove('open');
    });
  }

  document.addEventListener('click', () => {
    if (notifDropdown) notifDropdown.classList.remove('open');
    if (profileMenu) profileMenu.classList.remove('open');
  });

  if (btnClearNotifs) {
    btnClearNotifs.addEventListener('click', () => {
      const db = window.BizFlowDB.getData();
      db.notifications.forEach(n => n.unread = false);
      window.BizFlowDB.save();
      renderNotifications(db.notifications);
      showToast('All notifications marked as read.');
    });
  }

  function handleReset() {
    window.BizFlowDB.reset();
    renderAll();
    showToast('Sandbox reset to fresh demo data!');
  }

  if (btnResetData) btnResetData.addEventListener('click', handleReset);
  if (menuItemResetData) menuItemResetData.addEventListener('click', handleReset);

  if (menuBtnSignOut) {
    menuBtnSignOut.addEventListener('click', () => {
      localStorage.removeItem('bizflow_session');
      window.location.href = 'login.html';
    });
  }

  // Keyboard shortcut Ctrl+K
  const omnibar = document.getElementById('global-search');
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (omnibar) omnibar.focus();
    }
  });

  // Omnibar live search filter
  if (omnibar) {
    omnibar.addEventListener('input', () => {
      const q = omnibar.value.toLowerCase().trim();
      const rows = document.querySelectorAll('#invoices-tbody tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // Sidebar toggle
  const sidebar = document.getElementById('app-sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const mobileToggle = document.getElementById('mobile-menu-toggle');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Quick prompt buttons
  const btnRemindDues = document.getElementById('btn-quick-remind-dues');
  if (btnRemindDues) {
    btnRemindDues.addEventListener('click', () => {
      openAIDrawer('Draft a polite WhatsApp reminder for overdue invoices');
    });
  }

  const btnJumpInv = document.getElementById('btn-jump-inventory');
  if (btnJumpInv) {
    btnJumpInv.addEventListener('click', () => {
      openInventoryModal();
    });
  }

  // Initial render
  renderAll();

})();
