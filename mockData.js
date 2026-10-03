/**
 * BizFlow — Mock Data & State Management (mockData.js)
 * Pre-seeded realistic retail & distribution business data (Apex Retail Solutions)
 */

;(function (root) {
  'use strict';

  const STORAGE_KEY = 'bizflow_app_db_v1';

  const DEFAULT_INITIAL_STATE = {
    business: {
      name: 'Apex Retail Solutions',
      tagline: 'Electronics, Accessories & Office Supplies',
      owner: 'Alex Morgan',
      email: 'demo@bizflow.com',
      phone: '+91 98765 43210',
      address: 'Suite 402, Trade Hub, BKC, Mumbai, Maharashtra 400051',
      gstin: '27AABCU9603R1ZM',
      currency: '₹',
      currentFY: '2026-2027',
      gstPeriod: 'October 2026'
    },
    metrics: {
      monthlyRevenue: 384520,
      revenueGrowth: 14.8,
      outstandingAmount: 68400,
      pendingInvoicesCount: 4,
      inventoryValuation: 1245000,
      lowStockCount: 3,
      estimatedGSTLiability: 34600,
      gstDueDate: 'Oct 20, 2026'
    },
    weeklySales: [
      { day: 'Mon', revenue: 42000, cost: 26000 },
      { day: 'Tue', revenue: 58500, cost: 34000 },
      { day: 'Wed', revenue: 51200, cost: 31000 },
      { day: 'Thu', revenue: 64800, cost: 39500 },
      { day: 'Fri', revenue: 78900, cost: 48000 },
      { day: 'Sat', revenue: 89120, cost: 53000 },
      { day: 'Sun', revenue: 62000, cost: 37000 }
    ],
    invoices: [
      {
        id: 'INV-2026-104',
        customer: 'Starlight Tech Labs',
        contact: '+91 98201 11223',
        date: '2026-10-02',
        dueDate: '2026-10-12',
        items: [
          { name: 'Ergonomic Desk Hub', qty: 2, price: 8400 }
        ],
        subtotal: 16800,
        gst: 3024,
        total: 19824,
        status: 'Paid',
        method: 'UPI'
      },
      {
        id: 'INV-2026-103',
        customer: 'Zenith Logistics LLP',
        contact: '+91 91370 44556',
        date: '2026-10-01',
        dueDate: '2026-10-15',
        items: [
          { name: 'Wireless Barcode Scanner', qty: 3, price: 4200 },
          { name: 'Thermal Receipt Rolls (Box of 20)', qty: 4, price: 1200 }
        ],
        subtotal: 17400,
        gst: 3132,
        total: 20532,
        status: 'Pending',
        method: 'NEFT'
      },
      {
        id: 'INV-2026-102',
        customer: 'Aura Digital Agency',
        contact: '+91 98199 88776',
        date: '2026-09-28',
        dueDate: '2026-10-05',
        items: [
          { name: 'Ultra-Wide 4K Monitor 32\"', qty: 1, price: 28500 }
        ],
        subtotal: 28500,
        gst: 5130,
        total: 33630,
        status: 'Paid',
        method: 'Credit Card'
      },
      {
        id: 'INV-2026-101',
        customer: 'Metropolitan Coworking',
        contact: '+91 99870 33221',
        date: '2026-09-18',
        dueDate: '2026-09-28',
        items: [
          { name: 'Noise-Canceling Headset Pro', qty: 4, price: 5500 }
        ],
        subtotal: 22000,
        gst: 3960,
        total: 25960,
        status: 'Overdue',
        method: 'Net Banking'
      },
      {
        id: 'INV-2026-100',
        customer: 'Veritas Financial Advisory',
        contact: '+91 98450 77112',
        date: '2026-09-15',
        dueDate: '2026-09-25',
        items: [
          { name: 'Smart Fingerprint Attendance Unit', qty: 1, price: 11500 }
        ],
        subtotal: 11500,
        gst: 2070,
        total: 13570,
        status: 'Paid',
        method: 'UPI'
      },
      {
        id: 'INV-2026-099',
        customer: 'Kavita Enterprises',
        contact: '+91 97690 12345',
        date: '2026-09-10',
        dueDate: '2026-09-20',
        items: [
          { name: 'Ergonomic Desk Hub', qty: 1, price: 8400 }
        ],
        subtotal: 8400,
        gst: 1512,
        total: 9912,
        status: 'Overdue',
        method: 'Cheque'
      }
    ],
    inventory: [
      {
        id: 'PRD-001',
        name: 'Wireless Barcode Scanner',
        category: 'Point of Sale',
        stock: 3,
        minStock: 10,
        cost: 2900,
        sellingPrice: 4200,
        supplier: 'DigiTech Importers',
        status: 'Critical Low'
      },
      {
        id: 'PRD-002',
        name: 'Thermal Receipt Rolls (Box of 20)',
        category: 'Consumables',
        stock: 5,
        minStock: 15,
        cost: 750,
        sellingPrice: 1200,
        supplier: 'PaperCraft Industries',
        status: 'Critical Low'
      },
      {
        id: 'PRD-003',
        name: 'Ergonomic Desk Hub',
        category: 'Workstation',
        stock: 4,
        minStock: 8,
        cost: 5800,
        sellingPrice: 8400,
        supplier: 'ErgoLife Furniture',
        status: 'Low Stock'
      },
      {
        id: 'PRD-004',
        name: 'Noise-Canceling Headset Pro',
        category: 'Audio',
        stock: 18,
        minStock: 10,
        cost: 3600,
        sellingPrice: 5500,
        supplier: 'SonicWaves Ltd',
        status: 'Healthy'
      },
      {
        id: 'PRD-005',
        name: 'Ultra-Wide 4K Monitor 32\"',
        category: 'Displays',
        stock: 12,
        minStock: 5,
        cost: 21000,
        sellingPrice: 28500,
        supplier: 'VisionTech Displays',
        status: 'Healthy'
      },
      {
        id: 'PRD-006',
        name: 'USB-C Multiport Dock 11-in-1',
        category: 'Accessories',
        stock: 24,
        minStock: 12,
        cost: 1950,
        sellingPrice: 3200,
        supplier: 'DigiTech Importers',
        status: 'Healthy'
      }
    ],
    notifications: [
      {
        id: 'NOTIF-1',
        title: 'Critical Inventory Alert',
        message: 'Wireless Barcode Scanner has only 3 units left in stock (Min required: 10).',
        time: '15 mins ago',
        type: 'warning',
        unread: true
      },
      {
        id: 'NOTIF-2',
        title: 'Payment Overdue',
        message: 'Invoice INV-2026-101 for Metropolitan Coworking (₹25,960) is past due date.',
        time: '2 hours ago',
        type: 'danger',
        unread: true
      },
      {
        id: 'NOTIF-3',
        title: 'GSTR-1 Filing Window Open',
        message: 'October return filing window is open. Estimated net GST liability: ₹34,600.',
        time: 'Yesterday',
        type: 'info',
        unread: false
      }
    ],
    aiSuggestions: [
      {
        id: 'AI-1',
        tag: 'Inventory Warning',
        text: '3 high-velocity items are running below reorder thresholds. Restocking now prevents an estimated ₹46,000 lost sales next week.',
        action: 'View Low Stock Items',
        actionType: 'tab-inventory'
      },
      {
        id: 'AI-2',
        tag: 'Cash Collection',
        text: '2 overdue accounts hold ₹35,872. BizFlow AI can generate formatted WhatsApp & email follow-up reminders in 1 click.',
        action: 'Draft Reminders',
        actionType: 'modal-reminder'
      },
      {
        id: 'AI-3',
        tag: 'Tax Optimization',
        text: 'Input Tax Credit (ITC) of ₹18,420 is available to offset against your ₹53,020 gross GST collections for September/October.',
        action: 'Review GST Breakdown',
        actionType: 'tab-gst'
      }
    ]
  };

  class BizFlowDB {
    constructor() {
      this.init();
    }

    init() {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        this.data = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
        this.save();
      } else {
        try {
          this.data = JSON.parse(existing);
        } catch (e) {
          this.data = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
          this.save();
        }
      }
    }

    reset() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
      this.save();
      return this.data;
    }

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    getData() {
      return this.data;
    }

    addInvoice(invoice) {
      this.data.invoices.unshift(invoice);
      
      this.data.metrics.monthlyRevenue += invoice.total;
      if (invoice.status !== 'Paid') {
        this.data.metrics.outstandingAmount += invoice.total;
        this.data.metrics.pendingInvoicesCount += 1;
      }
      this.data.metrics.estimatedGSTLiability += invoice.gst;

      this.save();
      return invoice;
    }

    updateInvoiceStatus(id, newStatus) {
      const inv = this.data.invoices.find(i => i.id === id);
      if (!inv) return null;

      const oldStatus = inv.status;
      inv.status = newStatus;

      if (oldStatus !== 'Paid' && newStatus === 'Paid') {
        this.data.metrics.outstandingAmount = Math.max(0, this.data.metrics.outstandingAmount - inv.total);
        this.data.metrics.pendingInvoicesCount = Math.max(0, this.data.metrics.pendingInvoicesCount - 1);
      } else if (oldStatus === 'Paid' && newStatus !== 'Paid') {
        this.data.metrics.outstandingAmount += inv.total;
        this.data.metrics.pendingInvoicesCount += 1;
      }

      this.save();
      return inv;
    }

    addInventoryItem(item) {
      this.data.inventory.push(item);
      this.data.metrics.inventoryValuation += (item.stock * item.cost);
      if (item.stock <= item.minStock) {
        this.data.metrics.lowStockCount += 1;
      }
      this.save();
      return item;
    }

    adjustStock(id, delta) {
      const item = this.data.inventory.find(i => i.id === id);
      if (!item) return null;

      const wasLow = item.stock <= item.minStock;
      item.stock = Math.max(0, item.stock + delta);
      const isNowLow = item.stock <= item.minStock;

      if (!wasLow && isNowLow) {
        this.data.metrics.lowStockCount += 1;
      } else if (wasLow && !isNowLow) {
        this.data.metrics.lowStockCount = Math.max(0, this.data.metrics.lowStockCount - 1);
      }

      item.status = item.stock <= Math.floor(item.minStock / 2) ? 'Critical Low' :
                    item.stock <= item.minStock ? 'Low Stock' : 'Healthy';

      this.save();
      return item;
    }
  }

  root.BizFlowDB = new BizFlowDB();

})(typeof window !== 'undefined' ? window : this);
