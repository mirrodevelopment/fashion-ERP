/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — Payment Bridge (Cross-Module Shared Utility)
 * File: front end/payments/payment-bridge.js
 *
 * Usage (any page):
 *   import { openPaymentModal, openReceiptModal } from '../../payments/payment-bridge.js';
 *
 *   openPaymentModal({
 *     orderId:      'uuid-from-db',   // DB UUID passed to recordTransaction
 *     orderCode:    'ORD-2025-001',   // Display order number
 *     customerName: 'Priya S.',
 *     balance:       5000,            // Outstanding amount
 *     label:        'Record Payment', // Optional modal title overwrite
 *     onSuccess:    () => myPage.reload()
 *   });
 *
 * Dependencies:
 *   - payment-bridge.css  (loaded once, injected automatically)
 *   - window.api          (set by api.js via window.api = api)
 *   - window.lucide       (optional — for icon rendering)
 * =======================================================================
 */

/* ── CSS auto-inject (once per page load) ─────────────────────────────── */
(function injectBridgeCss() {
  const LINK_ID = 'payment-bridge-css';
  if (document.getElementById(LINK_ID)) return;
  const link = document.createElement('link');
  link.id = LINK_ID;
  link.rel = 'stylesheet';
  // Resolve relative to this script's location
  const scriptSrc = (document.currentScript && document.currentScript.src) || '';
  if (scriptSrc) {
    link.href = new URL('payment-bridge.css', scriptSrc).href;
  } else {
    // Fallback: assume same directory as payments.html
    link.href = 'payment-bridge.css';
  }
  document.head.appendChild(link);
})();

/* ── Singleton backdrop element ──────────────────────────────────────── */
let _backdropEl = null;

function _ensureBackdrop() {
  if (_backdropEl && document.body.contains(_backdropEl)) return _backdropEl;
  _backdropEl = document.createElement('div');
  _backdropEl.id = 'pbBackdrop';
  _backdropEl.className = 'pb-backdrop';
  document.body.appendChild(_backdropEl);
  return _backdropEl;
}

/* ── Format currency ─────────────────────────────────────────────────── */
function _fmt(n) {
  return '\u20b9' + Number(n || 0).toLocaleString('en-IN');
}

/* ── Get current staff name from session ─────────────────────────────── */
function _staffName() {
  try {
    const u = (window.Auth && window.Auth.getUser && window.Auth.getUser()) ||
              JSON.parse(sessionStorage.getItem('erp_user') || 'null');
    return (u && (u.fullName || u.username)) || 'Staff';
  } catch (_) {
    return 'Staff';
  }
}

/* ── Lucide icon refresh ──────────────────────────────────────────────── */
function _refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/* ── Toast notification (reuses existing #toastContainer if present) ─── */
function _toast(message, type) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container-fixed';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'haulo-toast haulo-toast--' + (type || 'info');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('haulo-toast--hide');
    setTimeout(() => toast.remove(), 320);
  }, 3200);
}

/* ═══════════════════════════════════════════════════════════════════════
   PUBLIC: openPaymentModal
   ═══════════════════════════════════════════════════════════════════════ */
export function openPaymentModal({ orderId, orderCode, customerName, balance, label, onSuccess }) {
  const backdrop = _ensureBackdrop();

  backdrop.innerHTML = `
    <div class="pb-window" role="dialog" aria-modal="true" aria-labelledby="pbTitle">

      <!-- Header -->
      <div class="pb-header">
        <div class="pb-header-left">
          <span class="pb-label-overline">${label || 'Record Payment'}</span>
          <span class="pb-order-code" id="pbTitle">${orderCode || '—'}</span>
          <span class="pb-customer-name">${customerName || ''}</span>
        </div>
        <button class="pb-close-btn" id="pbCloseBtn" aria-label="Close">
          <i data-lucide="x"></i>
        </button>
      </div>

      <!-- Outstanding Balance Highlight -->
      <div class="pb-balance-highlight">
        <div class="pb-balance-label">Outstanding Balance</div>
        <div class="pb-balance-amount">${_fmt(balance)}</div>
      </div>

      <!-- Form Body -->
      <div class="pb-body">

        <div class="pb-form-group">
          <label class="pb-form-label" for="pbAmount">Payment Amount (₹)</label>
          <input
            id="pbAmount"
            class="pb-form-input"
            type="number"
            min="1"
            max="${balance}"
            value="${balance}"
            autocomplete="off"
          />
        </div>

        <div class="pb-form-group">
          <label class="pb-form-label" for="pbMethod">Payment Method</label>
          <select id="pbMethod" class="pb-form-select">
            <option value="UPI">UPI / GPay / PhonePe</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card (Credit / Debit)</option>
            <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>

        <div class="pb-form-group">
          <label class="pb-form-label" for="pbRef">Reference / UTR No. <span class="pb-form-label" style="opacity:0.6;">(Optional)</span></label>
          <input
            id="pbRef"
            class="pb-form-input"
            type="text"
            placeholder="e.g. UPI ref ID, cheque number…"
            autocomplete="off"
          />
        </div>

        <div class="pb-error-msg" id="pbError" role="alert"></div>

      </div>

      <!-- Footer -->
      <div class="pb-footer">
        <button class="pb-cancel-btn" id="pbCancelBtn">Cancel</button>
        <button class="pb-submit-btn" id="pbSubmitBtn">
          <i data-lucide="check"></i>
          Record Payment
        </button>
      </div>

    </div>
  `;

  backdrop.classList.add('open');
  _refreshIcons();

  /* ── Wire close triggers ── */
  const close = () => {
    backdrop.classList.remove('open');
  };

  backdrop.querySelector('#pbCloseBtn').addEventListener('click', close);
  backdrop.querySelector('#pbCancelBtn').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

  const escHandler = (e) => {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  /* ── Submit handler ── */
  const submitBtn = backdrop.querySelector('#pbSubmitBtn');
  const errEl     = backdrop.querySelector('#pbError');

  submitBtn.addEventListener('click', async () => {
    const amountRaw = parseFloat(backdrop.querySelector('#pbAmount').value || '0');
    const method    = backdrop.querySelector('#pbMethod').value;
    const refNo     = backdrop.querySelector('#pbRef').value.trim();

    // Validation
    errEl.textContent = '';
    errEl.classList.remove('visible');

    if (!amountRaw || amountRaw <= 0) {
      errEl.textContent = 'Please enter a valid payment amount.';
      errEl.classList.add('visible');
      return;
    }
    if (amountRaw > balance) {
      errEl.textContent = `Amount cannot exceed the outstanding balance of ${_fmt(balance)}.`;
      errEl.classList.add('visible');
      return;
    }

    // Disable button and show progress
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2"></i> Recording…';
    _refreshIcons();

    try {
      let apiClient = window.api;
      if (!apiClient || !apiClient.payments) {
        try {
          const mod = await import('../api.js');
          apiClient = mod.default || mod;
        } catch (_) {}
      }

      if (orderId && apiClient && apiClient.payments && apiClient.payments.recordTransaction) {
        await apiClient.payments.recordTransaction(orderId, {
          amount:      amountRaw,
          method:      method,
          receivedBy:  _staffName(),
          referenceNo: refNo,
          notes:       'Payment recorded via ' + (label || 'ERP Portal')
        });
      }

      // Broadcast cross-module refresh event
      window.dispatchEvent(new CustomEvent('payment:recorded', {
        detail: {
          orderId,
          orderCode,
          customerName,
          amount: amountRaw,
          method
        }
      }));

      close();
      _toast(`Payment of ${_fmt(amountRaw)} recorded for ${orderCode || 'order'}!`, 'success');

      if (typeof onSuccess === 'function') {
        setTimeout(onSuccess, 300);
      }

    } catch (err) {
      console.error('[PaymentBridge] recordTransaction failed:', err);
      errEl.textContent = 'Failed to record payment: ' + (err.message || 'Server error. Please try again.');
      errEl.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="check"></i> Record Payment';
      _refreshIcons();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   PUBLIC: openReceiptModal
   Reuses existing .receipt-paper, .receipt-header CSS from payments.css
   ═══════════════════════════════════════════════════════════════════════ */
export function openReceiptModal({
  orderCode,
  customerName,
  customerPhone,
  garment,
  orderValue,
  paid,
  balance,
  paymentMethod
}) {
  const backdrop = _ensureBackdrop();
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  backdrop.innerHTML = `
    <div class="pb-window" role="dialog" aria-modal="true" aria-label="Receipt">

      <!-- Header -->
      <div class="pb-header">
        <div class="pb-header-left">
          <span class="pb-label-overline">Payment Receipt</span>
          <span class="pb-order-code">${orderCode || '—'}</span>
        </div>
        <button class="pb-close-btn" id="pbRcptClose" aria-label="Close">
          <i data-lucide="x"></i>
        </button>
      </div>

      <!-- Receipt Paper (uses existing payments.css classes) -->
      <div class="pb-body">
        <div class="receipt-paper" id="pbReceiptPaper">

          <div class="receipt-header">
            <div class="receipt-brand">Haulo Boutique</div>
            <div class="receipt-sub">Official Payment Receipt</div>
            <div class="receipt-sub">${today}</div>
            <div class="receipt-title-banner">Tax Invoice / Payment Confirmation</div>
          </div>

          <div class="receipt-meta-grid">
            <div class="form-label">Order No.</div>
            <div class="form-label" style="font-weight:700;">${orderCode || '—'}</div>
            <div class="form-label">Customer</div>
            <div class="form-label" style="font-weight:700;">${customerName || '—'}</div>
            <div class="form-label">Phone</div>
            <div class="form-label">${customerPhone || '—'}</div>
            <div class="form-label">Garment</div>
            <div class="form-label">${garment || 'Bespoke Order'}</div>
          </div>

          <table class="receipt-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Order Value</td>
                <td>${_fmt(orderValue)}</td>
              </tr>
              <tr>
                <td>Amount Paid (${paymentMethod || 'UPI'})</td>
                <td>${_fmt(paid)}</td>
              </tr>
              <tr class="receipt-total-row">
                <td>Balance Due</td>
                <td>${_fmt(balance)}</td>
              </tr>
            </tbody>
          </table>

          <div class="receipt-footer">
            Thank you for choosing Haulo Boutique — Crafted with love ❤
          </div>

        </div>
      </div>

      <!-- Footer -->
      <div class="pb-footer">
        <button class="pb-cancel-btn" id="pbRcptCloseBtn">Close</button>
        <button class="pb-submit-btn" id="pbRcptPrintBtn">
          <i data-lucide="printer"></i>
          Print Receipt
        </button>
      </div>

    </div>
  `;

  backdrop.classList.add('open');
  _refreshIcons();

  const close = () => backdrop.classList.remove('open');
  backdrop.querySelector('#pbRcptClose').addEventListener('click', close);
  backdrop.querySelector('#pbRcptCloseBtn').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

  backdrop.querySelector('#pbRcptPrintBtn').addEventListener('click', () => window.print());

  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
}
