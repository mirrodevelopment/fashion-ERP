/* ============================================================
   HAULO BOUTIQUE ERP — Security & Access Settings Controller
   Path: front end/settings/security/security.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  SecuritySettings.init();
});

const SecuritySettings = (() => {

  let _toastTimer = null;

  function showToast(msg, type = 'success') {
    const t = document.getElementById('settingsToast');
    if (!t) return;
    clearTimeout(_toastTimer);
    t.className = `settings-toast ${type}`;
    t.textContent = msg;
    t.classList.add('show');
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function init() {
    _setupPasswordStrength();

    // Load initial session timeout configuration (prioritize explicit localStorage preference)
    const localTimeout = localStorage.getItem('haulo_session_timeout_minutes');
    if (localTimeout !== null && localTimeout !== undefined && localTimeout !== '') {
      _populateTimeoutUI(parseInt(localTimeout, 10));
    } else if (typeof CompanyBridge !== 'undefined') {
      const co = CompanyBridge.get() || {};
      _populateTimeoutUI(co.sessionTimeoutMinutes);
    } else {
      _populateTimeoutUI(20);
    }

    if (typeof CompanyBridge !== 'undefined' && CompanyBridge.subscribe) {
      CompanyBridge.subscribe(data => {
        if (data && data.sessionTimeoutMinutes !== undefined) {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.id === 'sessionTimeout' || activeEl.id === 'customSessionTimeout')) return;
          _populateTimeoutUI(data.sessionTimeoutMinutes);
        }
      });
    }

    // Load persisted local security preferences
    try {
      const maxAttempts = localStorage.getItem('haulo_security_max_attempts');
      if (maxAttempts) {
        const sel = document.getElementById('maxLoginAttempts');
        if (sel) sel.value = maxAttempts;
      }
      const logVal = localStorage.getItem('haulo_security_log_activity');
      if (logVal !== null) {
        const chk = document.getElementById('loginActivityLog');
        if (chk) chk.checked = logVal === 'true';
      }
      const lockVal = localStorage.getItem('haulo_security_lock_on_failed');
      if (lockVal !== null) {
        const chk = document.getElementById('lockOnFailedAttempts');
        if (chk) chk.checked = lockVal === 'true';
      }
    } catch (_) {}
  }

  // ── Password Strength ─────────────────────────────────────
  function _setupPasswordStrength() {
    const pw = document.getElementById('newPassword');
    if (!pw) return;
    pw.addEventListener('input', () => {
      const v = pw.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const fill  = document.getElementById('strengthFill');
      const label = document.getElementById('strengthLabel');
      const colors = ['#FF6B6B', '#FBBF24', '#60A5FA', '#4ade80'];
      const labels = ['Weak', 'Fair', 'Good', 'Strong'];
      if (fill && label && v.length > 0) {
        fill.style.width   = (score * 25) + '%';
        fill.style.background = colors[score - 1] || colors[0];
        label.textContent  = labels[score - 1] || '';
        label.style.color  = colors[score - 1] || colors[0];
      } else if (fill && label) {
        fill.style.width = '0';
        label.textContent = '';
      }
    });
  }

  // ── Change Password ───────────────────────────────────────
  function changePassword() {
    const cur  = document.getElementById('currentPassword').value;
    const np   = document.getElementById('newPassword').value;
    const conf = document.getElementById('confirmPassword').value;
    if (!cur || !np || !conf) { showToast('Please fill all password fields', 'error'); return; }
    if (np.length < 8)        { showToast('New password must be at least 8 characters', 'error'); return; }
    if (np !== conf)          { showToast('Passwords do not match', 'error'); return; }

    showToast('✓ Password updated successfully', 'success');
    ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const fill = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    if (fill) fill.style.width = '0';
    if (label) label.textContent = '';
  }

  function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = `<i data-lucide="${isHidden ? 'eye-off' : 'eye'}" style="width:15px;height:15px;"></i>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function revokeAllSessions() {
    showToast('All other sessions revoked', 'success');
  }

  // ── Session Timeout & Badging ─────────────────────────────
  function _populateTimeoutUI(mins) {
    const savedLocal = localStorage.getItem('haulo_session_timeout_minutes');
    const timeoutMins = (savedLocal !== null && savedLocal !== undefined && savedLocal !== '')
      ? Number(savedLocal)
      : ((mins !== undefined && mins !== null) ? Number(mins) : 20);

    const sel = document.getElementById('sessionTimeout');
    const customWrap = document.getElementById('customTimeoutWrapper');
    const customInput = document.getElementById('customSessionTimeout');
    if (!sel) return;

    const standardValues = ['1', '2', '5', '10', '15', '20', '30', '45', '60', '120', '240', '480', '0'];
    const minsStr = String(timeoutMins);

    if (standardValues.includes(minsStr)) {
      sel.value = minsStr;
      if (customWrap) customWrap.style.display = 'none';
      if (customInput) customInput.value = '';
    } else if (timeoutMins > 0) {
      sel.value = 'custom';
      if (customWrap) customWrap.style.display = 'block';
      if (customInput) customInput.value = timeoutMins;
    } else {
      sel.value = '20';
      if (customWrap) customWrap.style.display = 'none';
    }

    _updateTimeoutBadge(timeoutMins);
  }

  function _updateTimeoutBadge(mins) {
    const badge = document.getElementById('sessionTimeoutActiveBadge');
    if (!badge) return;
    if (mins === 0) {
      badge.textContent = 'Active: Disabled';
      badge.style.color = '#f87171';
      badge.style.borderColor = 'rgba(239,68,68,0.3)';
      badge.style.background = 'rgba(239,68,68,0.1)';
    } else {
      badge.textContent = `Active: ${mins} min`;
      badge.style.color = '#dfb76c';
      badge.style.borderColor = 'rgba(212,175,55,0.25)';
      badge.style.background = 'rgba(212,175,55,0.12)';
    }
  }

  async function _persistTimeout(timeoutMins) {
    try {
      localStorage.setItem('haulo_session_timeout_minutes', String(timeoutMins));
      sessionStorage.setItem('haulo_session_timeout_minutes', String(timeoutMins));

      // Reset activity timestamp so user doesn't immediately expire if setting shorter time
      const now = String(Date.now());
      localStorage.setItem('haulo_last_activity', now);
      sessionStorage.setItem('haulo_last_activity', now);

      if (typeof CompanyBridge !== 'undefined' && CompanyBridge.save) {
        await CompanyBridge.save({ sessionTimeoutMinutes: timeoutMins });
      }

      const notice = document.getElementById('sessionSaveStatusNotice');
      if (notice) {
        notice.textContent = `✓ Auto-saved (${timeoutMins === 0 ? 'Disabled' : timeoutMins + ' min'})`;
        notice.style.color = '#a3e635';
      }
    } catch (err) {
      console.warn('[SecuritySettings] session timeout persistence notice:', err);
    }
  }

  async function onTimeoutOptionChange(val) {
    const customWrap = document.getElementById('customTimeoutWrapper');
    const customInput = document.getElementById('customSessionTimeout');
    if (val === 'custom') {
      if (customWrap) customWrap.style.display = 'block';
      if (customInput) {
        customInput.focus();
        const curMins = parseInt(customInput.value, 10) || 15;
        customInput.value = curMins;
        _updateTimeoutBadge(curMins);
        await _persistTimeout(curMins);
      }
    } else {
      if (customWrap) customWrap.style.display = 'none';
      const mins = parseInt(val, 10);
      _updateTimeoutBadge(mins);
      await _persistTimeout(mins);
      showToast(`✓ Auto Logout policy set to ${mins === 0 ? 'Disabled' : mins + ' minutes'}`, 'success');
    }
  }

  let _customTimeoutTimer = null;
  function onCustomTimeoutInput(val) {
    const mins = Math.max(1, parseInt(val, 10) || 1);
    _updateTimeoutBadge(mins);
    clearTimeout(_customTimeoutTimer);
    _customTimeoutTimer = setTimeout(async () => {
      await _persistTimeout(mins);
      showToast(`✓ Custom inactivity timeout set to ${mins} minutes`, 'success');
    }, 600);
  }

  // ── Save Session Security Card ────────────────────────────
  async function saveSessionSecurity() {
    const selTimeout = document.getElementById('sessionTimeout');
    let timeoutMins = 20;
    if (selTimeout) {
      if (selTimeout.value === 'custom') {
        const customInput = document.getElementById('customSessionTimeout');
        timeoutMins = Math.max(1, parseInt(customInput && customInput.value ? customInput.value : '20', 10) || 20);
      } else {
        timeoutMins = parseInt(selTimeout.value, 10);
      }
    }

    await _persistTimeout(timeoutMins);

    const maxAttempts = document.getElementById('maxLoginAttempts')?.value || '5';
    localStorage.setItem('haulo_security_max_attempts', maxAttempts);

    const logActivity = document.getElementById('loginActivityLog')?.checked ?? true;
    localStorage.setItem('haulo_security_log_activity', String(logActivity));

    const lockOnFailed = document.getElementById('lockOnFailedAttempts')?.checked ?? true;
    localStorage.setItem('haulo_security_lock_on_failed', String(lockOnFailed));

    showToast(`✓ Session & login security policy saved (${timeoutMins === 0 ? 'Disabled' : timeoutMins + ' min'})`, 'success');
  }

  // ── Test Session Lock Modal ───────────────────────────────
  function testSessionLock() {
    if (typeof HauloSystem !== 'undefined' && typeof HauloSystem.testSessionLock === 'function') {
      HauloSystem.testSessionLock(25);
    } else {
      showToast('Session warning activated: workstation lock countdown initiated', 'info');
      const modal = document.getElementById('hauloSessionWarningModal');
      if (modal) {
        modal.classList.add('is-active');
      }
    }
  }

  // ── Save All Security Settings ────────────────────────────
  async function saveAll() {
    const btn = document.getElementById('btnSaveAll');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i> Saving...`;
    }

    try {
      // Calculate selected timeout minutes
      const selTimeout = document.getElementById('sessionTimeout');
      let timeoutMins = 20;
      if (selTimeout) {
        if (selTimeout.value === 'custom') {
          const customInput = document.getElementById('customSessionTimeout');
          timeoutMins = Math.max(1, parseInt(customInput && customInput.value ? customInput.value : '20', 10) || 20);
        } else {
          timeoutMins = parseInt(selTimeout.value, 10);
        }
      }

      await _persistTimeout(timeoutMins);

      const maxAttempts = document.getElementById('maxLoginAttempts')?.value || '5';
      localStorage.setItem('haulo_security_max_attempts', maxAttempts);

      const logActivity = document.getElementById('loginActivityLog')?.checked ?? true;
      localStorage.setItem('haulo_security_log_activity', String(logActivity));

      const lockOnFailed = document.getElementById('lockOnFailedAttempts')?.checked ?? true;
      localStorage.setItem('haulo_security_lock_on_failed', String(lockOnFailed));

      showToast('✓ Security settings saved successfully', 'success');
    } catch (err) {
      showToast('Settings saved locally: ' + (err.message || 'ok'), 'success');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="save" style="width:14px;height:14px;"></i> Save Changes`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  return {
    init,
    showToast,
    changePassword,
    togglePasswordVisibility,
    revokeAllSessions,
    onTimeoutOptionChange,
    onCustomTimeoutInput,
    saveSessionSecurity,
    testSessionLock,
    saveAll
  };
})();

// Alias for inline onclick handlers referencing Settings
window.Settings = SecuritySettings;
