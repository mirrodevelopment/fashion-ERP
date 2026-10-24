/**
 * ==========================================================================
 * HAULO BOUTIQUE ERP — MEASUREMENT PROFILE CONTROLLER (360° PROFILE)
 * File: front end/Measurements/measurement360/measurement360.js
 * Visual Language: Luxury Fashion ERP · Dark Warm Glassmorphic Spatial UI
 * 
 * ZERO MOCK DATA:
 * - Customer profile loaded live from PostgreSQL via /api/v1/customers
 * - Real orders count & active orders loaded from /api/v1/orders
 * - Garment measurements & versioning loaded from /api/v1/customers/{mobile}/body-measurements
 * - Live revision history chart & latest records loaded from DB history endpoint
 * - Dynamic fit insights, completeness calculation, and checklist
 * ==========================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. APPLICATION STATE & DATA MODEL (ZERO HARDCODED MOCKS)
  // ==========================================================================
  const State = {
    customerMobile: null,
    customerId: null,
    activeGarment: 'Blouse',
    activeView: 'front',
    activeTab: 'measurements',
    isEditMode: false,
    selectedRowIndex: null,
    chartInstance: null,
    comparisonData: null,
    historyRecords: []
  };

  const CustomerData = {
    id: null,
    name: '',
    phone: '',
    email: '',
    location: '',
    avatar: '',
    vip: false,
    tier: 'REGULAR',
    totalOrders: 0,
    activeOrders: 0,
    customerSince: '—',
    notes: []
  };

  // Garment Profiles — Pure Tailoring Measurement Definitions (values default to null until loaded from DB)
  const GarmentProfiles = {
    Blouse: [
      { id: 1,  key: 'shoulder',              name: 'Shoulder',                  value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 2,  key: 'bust',                  name: 'Bust',                      value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 3,  key: 'underBust',             name: 'Under Bust',                value: null, oldVal: null, diff: null, marker: 3,  unit: '"' },
      { id: 4,  key: 'waist',                 name: 'Waist',                     value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 5,  key: 'blouseLength',          name: 'Blouse Length',             value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 6,  key: 'armhole',               name: 'Armhole',                   value: null, oldVal: null, diff: null, marker: 9,  unit: '"' },
      { id: 7,  key: 'upperArm',              name: 'Upper Arm',                 value: null, oldVal: null, diff: null, marker: 11, unit: '"' },
      { id: 8,  key: 'sleeveLength',          name: 'Sleeve Length',             value: null, oldVal: null, diff: null, marker: 6,  unit: '"' },
      { id: 9,  key: 'sleeveRound',           name: 'Sleeve Round',              value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 10, key: 'elbowRound',            name: 'Elbow Round',               value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 11, key: 'wristRound',            name: 'Wrist Round',               value: null, oldVal: null, diff: null, marker: 12, unit: '"' },
      { id: 12, key: 'frontNeckDepth',        name: 'Front Neck Depth',          value: null, oldVal: null, diff: null, marker: 8,  unit: '"' },
      { id: 13, key: 'backNeckDepth',         name: 'Back Neck Depth',           value: null, oldVal: null, diff: null, marker: 7,  unit: '"' },
      { id: 14, key: 'bustPoint',             name: 'Bust Point',                value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 15, key: 'bustPointToBustPoint',  name: 'Bust Point to Bust Point',  value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 16, key: 'shoulderToBust',        name: 'Shoulder to Bust',          value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 17, key: 'shoulderToWaist',       name: 'Shoulder to Waist',         value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 18, key: 'frontWidth',            name: 'Front Width',               value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 19, key: 'backWidth',             name: 'Back Width',                value: null, oldVal: null, diff: null, marker: 1,  unit: '"' }
    ],
    Chudi: [
      { id: 1,  key: 'shoulder',        name: 'Shoulder',          value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 2,  key: 'bust',            name: 'Bust',              value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 3,  key: 'underBust',       name: 'Under Bust',        value: null, oldVal: null, diff: null, marker: 3,  unit: '"' },
      { id: 4,  key: 'waist',           name: 'Waist',             value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 5,  key: 'hip',             name: 'Hip',               value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 6,  key: 'topLength',       name: 'Top Length',        value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 7,  key: 'armhole',         name: 'Armhole',           value: null, oldVal: null, diff: null, marker: 9,  unit: '"' },
      { id: 8,  key: 'upperArm',        name: 'Upper Arm',         value: null, oldVal: null, diff: null, marker: 11, unit: '"' },
      { id: 9,  key: 'sleeveLength',    name: 'Sleeve Length',     value: null, oldVal: null, diff: null, marker: 6,  unit: '"' },
      { id: 10, key: 'sleeveRound',     name: 'Sleeve Round',      value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 11, key: 'elbowRound',      name: 'Elbow Round',       value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 12, key: 'wristRound',      name: 'Wrist Round',       value: null, oldVal: null, diff: null, marker: 12, unit: '"' },
      { id: 13, key: 'frontNeckDepth',  name: 'Front Neck Depth',  value: null, oldVal: null, diff: null, marker: 8,  unit: '"' },
      { id: 14, key: 'backNeckDepth',   name: 'Back Neck Depth',   value: null, oldVal: null, diff: null, marker: 7,  unit: '"' },
      { id: 15, key: 'frontWidth',      name: 'Front Width',       value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 16, key: 'backWidth',       name: 'Back Width',        value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 17, key: 'pantWaist',       name: 'Pant Waist',        value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 18, key: 'pantHip',         name: 'Pant Hip',          value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 19, key: 'pantLength',      name: 'Pant Length',       value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 20, key: 'thighRound',      name: 'Thigh Round',       value: null, oldVal: null, diff: null, marker: 3,  unit: '"' },
      { id: 21, key: 'kneeRound',       name: 'Knee Round',        value: null, oldVal: null, diff: null, marker: 3,  unit: '"' },
      { id: 22, key: 'calfRound',       name: 'Calf Round',        value: null, oldVal: null, diff: null, marker: 12, unit: '"' },
      { id: 23, key: 'ankleRound',      name: 'Ankle Round',       value: null, oldVal: null, diff: null, marker: 12, unit: '"' },
      { id: 24, key: 'crotchLength',    name: 'Crotch Length',     value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 25, key: 'bottomOpening',   name: 'Bottom Opening',    value: null, oldVal: null, diff: null, marker: 12, unit: '"' }
    ],
    Lehenga: [
      { id: 1,  key: 'shoulder',              name: 'Shoulder',                  value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 2,  key: 'bust',                  name: 'Bust',                      value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 3,  key: 'underBust',             name: 'Under Bust',                value: null, oldVal: null, diff: null, marker: 3,  unit: '"' },
      { id: 4,  key: 'waist',                 name: 'Waist',                     value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 5,  key: 'hip',                   name: 'Hip',                       value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 6,  key: 'blouseLength',          name: 'Blouse Length',             value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 7,  key: 'armhole',               name: 'Armhole',                   value: null, oldVal: null, diff: null, marker: 9,  unit: '"' },
      { id: 8,  key: 'upperArm',              name: 'Upper Arm',                 value: null, oldVal: null, diff: null, marker: 11, unit: '"' },
      { id: 9,  key: 'sleeveLength',          name: 'Sleeve Length',             value: null, oldVal: null, diff: null, marker: 6,  unit: '"' },
      { id: 10, key: 'sleeveRound',           name: 'Sleeve Round',              value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 11, key: 'elbowRound',            name: 'Elbow Round',               value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 12, key: 'wristRound',            name: 'Wrist Round',               value: null, oldVal: null, diff: null, marker: 12, unit: '"' },
      { id: 13, key: 'frontNeckDepth',        name: 'Front Neck Depth',          value: null, oldVal: null, diff: null, marker: 8,  unit: '"' },
      { id: 14, key: 'backNeckDepth',         name: 'Back Neck Depth',           value: null, oldVal: null, diff: null, marker: 7,  unit: '"' },
      { id: 15, key: 'bustPoint',             name: 'Bust Point',                value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 16, key: 'bustPointToBustPoint',  name: 'Bust Point to Bust Point',  value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 17, key: 'shoulderToBust',        name: 'Shoulder to Bust',          value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 18, key: 'shoulderToWaist',       name: 'Shoulder to Waist',         value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 19, key: 'skirtLength',           name: 'Skirt Length',              value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 20, key: 'waistToHip',            name: 'Waist to Hip',              value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 21, key: 'flare',                 name: 'Flare',                     value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 22, key: 'bottomOpening',         name: 'Bottom Opening',            value: null, oldVal: null, diff: null, marker: 5,  unit: '"' }
    ],
    Saree: [
      { id: 1,  key: 'shoulder',              name: 'Shoulder',                  value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 2,  key: 'bust',                  name: 'Bust',                      value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 3,  key: 'underBust',             name: 'Under Bust',                value: null, oldVal: null, diff: null, marker: 3,  unit: '"' },
      { id: 4,  key: 'waist',                 name: 'Waist',                     value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 5,  key: 'blouseLength',          name: 'Blouse Length',             value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 6,  key: 'armhole',               name: 'Armhole',                   value: null, oldVal: null, diff: null, marker: 9,  unit: '"' },
      { id: 7,  key: 'upperArm',              name: 'Upper Arm',                 value: null, oldVal: null, diff: null, marker: 11, unit: '"' },
      { id: 8,  key: 'sleeveLength',          name: 'Sleeve Length',             value: null, oldVal: null, diff: null, marker: 6,  unit: '"' },
      { id: 9,  key: 'sleeveRound',           name: 'Sleeve Round',              value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 10, key: 'elbowRound',            name: 'Elbow Round',               value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 11, key: 'wristRound',            name: 'Wrist Round',               value: null, oldVal: null, diff: null, marker: 12, unit: '"' },
      { id: 12, key: 'frontNeckDepth',        name: 'Front Neck Depth',          value: null, oldVal: null, diff: null, marker: 8,  unit: '"' },
      { id: 13, key: 'backNeckDepth',         name: 'Back Neck Depth',           value: null, oldVal: null, diff: null, marker: 7,  unit: '"' },
      { id: 14, key: 'bustPoint',             name: 'Bust Point',                value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 15, key: 'bustPointToBustPoint',  name: 'Bust Point to Bust Point',  value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 16, key: 'shoulderToBust',        name: 'Shoulder to Bust',          value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 17, key: 'shoulderToWaist',       name: 'Shoulder to Waist',         value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 18, key: 'frontWidth',            name: 'Front Width',               value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 19, key: 'backWidth',             name: 'Back Width',                value: null, oldVal: null, diff: null, marker: 1,  unit: '"' }
    ],
    Gown: [
      { id: 1,  key: 'shoulder',              name: 'Shoulder',                  value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 2,  key: 'bust',                  name: 'Bust',                      value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 3,  key: 'underBust',             name: 'Under Bust',                value: null, oldVal: null, diff: null, marker: 3,  unit: '"' },
      { id: 4,  key: 'waist',                 name: 'Waist',                     value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 5,  key: 'hip',                   name: 'Hip',                       value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 6,  key: 'fullLength',            name: 'Full Length',               value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 7,  key: 'armhole',               name: 'Armhole',                   value: null, oldVal: null, diff: null, marker: 9,  unit: '"' },
      { id: 8,  key: 'upperArm',              name: 'Upper Arm',                 value: null, oldVal: null, diff: null, marker: 11, unit: '"' },
      { id: 9,  key: 'sleeveLength',          name: 'Sleeve Length',             value: null, oldVal: null, diff: null, marker: 6,  unit: '"' },
      { id: 10, key: 'sleeveRound',           name: 'Sleeve Round',              value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 11, key: 'elbowRound',            name: 'Elbow Round',               value: null, oldVal: null, diff: null, marker: 10, unit: '"' },
      { id: 12, key: 'wristRound',            name: 'Wrist Round',               value: null, oldVal: null, diff: null, marker: 12, unit: '"' },
      { id: 13, key: 'frontNeckDepth',        name: 'Front Neck Depth',          value: null, oldVal: null, diff: null, marker: 8,  unit: '"' },
      { id: 14, key: 'backNeckDepth',         name: 'Back Neck Depth',           value: null, oldVal: null, diff: null, marker: 7,  unit: '"' },
      { id: 15, key: 'bustPoint',             name: 'Bust Point',                value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 16, key: 'bustPointToBustPoint',  name: 'Bust Point to Bust Point',  value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 17, key: 'shoulderToBust',        name: 'Shoulder to Bust',          value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 18, key: 'shoulderToWaist',       name: 'Shoulder to Waist',         value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 19, key: 'waistToHip',            name: 'Waist to Hip',              value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 20, key: 'flare',                 name: 'Flare',                     value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 21, key: 'bottomOpening',         name: 'Bottom Opening',            value: null, oldVal: null, diff: null, marker: 5,  unit: '"' }
    ],
    Custom: [
      { id: 1,  key: 'shoulder',     name: 'Shoulder',      value: null, oldVal: null, diff: null, marker: 1,  unit: '"' },
      { id: 2,  key: 'bust',         name: 'Bust',          value: null, oldVal: null, diff: null, marker: 2,  unit: '"' },
      { id: 3,  key: 'waist',        name: 'Waist',         value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 4,  key: 'hip',          name: 'Hip',           value: null, oldVal: null, diff: null, marker: 4,  unit: '"' },
      { id: 5,  key: 'fullLength',   name: 'Total Length',  value: null, oldVal: null, diff: null, marker: 5,  unit: '"' },
      { id: 6,  key: 'armhole',      name: 'Armhole',       value: null, oldVal: null, diff: null, marker: 9,  unit: '"' },
      { id: 7,  key: 'sleeveLength', name: 'Sleeve Length', value: null, oldVal: null, diff: null, marker: 6,  unit: '"' },
      { id: 8,  key: 'wristRound',   name: 'Wrist Round',   value: null, oldVal: null, diff: null, marker: 12, unit: '"' }
    ]
  };

  // ==========================================================================
  // 2. DOM INITIALIZATION
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initCustomerHeader();
    initTopTabs();
    initGarmentSelector();
    initMeasurementDetails();
    initMannequinInteractions();
    initHistoryChart();
    initNotesList();
    initAddNoteModal();
    initUpdateMeasurementsButton();

    morphMannequin360FromActiveProfile(false);

    loadCustomerAndMeasurementsFromApi();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // ==========================================================================
  // 3. LIVE API DATA FETCHING & SYNCHRONIZATION
  // ==========================================================================
  async function loadCustomerAndMeasurementsFromApi() {
    try {
      const { default: api, Auth } = await import('../../api.js');
      if (!Auth.isLoggedIn()) {
        window.location.href = '../../login/login.html';
        return;
      }

      const params = new URLSearchParams(window.location.search);
      let mobile = params.get('mobile') || params.get('phone') || params.get('customerMobile') || params.get('customerId') || params.get('id');
      const requestedGarment = params.get('garment') || params.get('garmentType');

      // If no query parameter provided, pick first real customer in the database
      if (!mobile) {
        const list = await api.customers.list({ page: 0, size: 1 }).catch(() => null);
        const items = Array.isArray(list) ? list : (list && list.content ? list.content : []);
        if (items.length > 0) {
          mobile = items[0].mobileNumber || items[0].phone;
        }
      }

      if (!mobile) {
        setEmptyCustomerView();
        return;
      }

      State.customerMobile = mobile;
      State.customerId = mobile;

      // 1. Fetch Real Customer Record
      try {
        const c = await api.customers.get(mobile);
        if (c) {
          CustomerData.id = c.mobileNumber || c.phone;
          CustomerData.name = c.name || 'Unnamed Client';
          CustomerData.phone = c.mobileNumber || c.phone || '—';
          CustomerData.email = c.email || '—';
          CustomerData.location = c.location || (c.city ? `${c.city}${c.state ? `, ${c.state}` : ''}` : '—');
          CustomerData.avatar = (c.avatarUrl && !c.avatarUrl.includes('user_avatar.jpg')) ? c.avatarUrl : '';
          CustomerData.tier = c.tier || 'REGULAR';
          CustomerData.vip = c.tier === 'VIP_PLATINUM' || c.tier === 'VIP_GOLD';

          // Derive Customer Since from createdAt
          if (c.createdAt) {
            const dt = new Date(c.createdAt);
            const months = Math.max(1, Math.round((new Date() - dt) / (1000 * 60 * 60 * 24 * 30.4)));
            const yrs = (months / 12).toFixed(1);
            CustomerData.customerSince = yrs >= 1 ? `${yrs} yrs` : `${months} mos`;
            CustomerData.customerSinceSub = dt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
          } else {
            CustomerData.customerSince = 'Recent';
            CustomerData.customerSinceSub = '';
          }

          // Fitting Notes from Customer Profile
          CustomerData.notes = [];
          if (c.notes) CustomerData.notes.push(c.notes);
          if (c.fitPreference) CustomerData.notes.push(`Fit preference: ${c.fitPreference}`);
          if (c.fabricAllergies) CustomerData.notes.push(`Fabric allergy alert: ${c.fabricAllergies}`);

          initCustomerHeader();
        }
      } catch (err) {
        console.warn('[Measurement360] Customer load error:', err.message);
      }

      // 2. Fetch Real Customer Orders Count
      try {
        const allOrders = await api.orders.list().catch(() => []);
        const customerOrders = (allOrders || []).filter(o => 
          (o.customerMobile && o.customerMobile === mobile) || 
          (o.phone && o.phone === mobile)
        );
        CustomerData.totalOrders = customerOrders.length;
        CustomerData.activeOrders = customerOrders.filter(o => 
          o.status && !['DELIVERED', 'CANCELLED'].includes(o.status.toUpperCase())
        ).length;

        const totalOrdersEl = document.getElementById('statTotalOrders');
        const activeOrdersEl = document.getElementById('statActiveOrders');
        if (totalOrdersEl) totalOrdersEl.textContent = CustomerData.totalOrders;
        if (activeOrdersEl) activeOrdersEl.textContent = CustomerData.activeOrders;
      } catch (err) {
        console.warn('[Measurement360] Orders count error:', err.message);
      }

      // 3. Activate requested garment if in URL
      if (requestedGarment) {
        const matchingBtn = Array.from(document.querySelectorAll('.garment-btn')).find(
          b => b.dataset.garment.toLowerCase() === requestedGarment.toLowerCase()
        );
        if (matchingBtn) {
          matchingBtn.click();
        } else {
          await syncCurrentGarmentFromApi();
        }
      } else {
        await syncCurrentGarmentFromApi();
      }

      // 4. Auto-enable edit mode if requested in URL
      const isEditRequested = params.get('edit') === 'true' || params.get('edit') === '1';
      if (isEditRequested) {
        setTimeout(() => {
          State.isEditMode = true;
          updateEditButtonState();
          renderMeasurementDetailsList();
          showToast('Edit mode enabled. Enter dimensions and click Update Measurements.');
        }, 150);
      }

    } catch (err) {
      console.error('[Measurement360] Initialization error:', err.message);
    }
  }

  function setEmptyCustomerView() {
    const nameEl = document.getElementById('customerName');
    if (nameEl) nameEl.textContent = 'No Customer Selected';
    const subEl = document.getElementById('detailsSubtitle');
    if (subEl) subEl.textContent = 'Select a customer from the overview page';
    renderMeasurementDetailsList();
  }

  async function syncCurrentGarmentFromApi() {
    if (!State.customerMobile) return;
    const gType = State.activeGarment.toUpperCase();

    try {
      const { default: api } = await import('../../api.js');

      // Fetch comparison (Current vs Old) and Revision History in parallel
      const [comp, history] = await Promise.all([
        api.customers.bodyMeasurements.getComparison(State.customerMobile, gType).catch(() => null),
        api.customers.bodyMeasurements.history(State.customerMobile, gType).catch(() => [])
      ]);

      State.comparisonData = comp;
      State.historyRecords = Array.isArray(history) ? history : [];

      const profile = GarmentProfiles[State.activeGarment] || GarmentProfiles.Blouse;

      if (comp && comp.current) {
        const curr = comp.current;
        const old = comp.old;
        const variances = comp.variance || {};

        // Update customer name in header if provided on measurement record
        if (curr.customerName && (!CustomerData.name || CustomerData.name === 'Loading Customer...')) {
          CustomerData.name = curr.customerName;
          const nameEl = document.getElementById('customerName');
          if (nameEl) nameEl.textContent = curr.customerName;
        }

        // Map dimensions from real database row
        profile.forEach(item => {
          item.value = curr[item.key] != null ? Number(curr[item.key]) : null;
          item.oldVal = (old && old[item.key] != null) ? Number(old[item.key]) : null;
          item.diff = variances[item.key] || null;
        });

        // Version badge in header
        const vBadge = document.getElementById('measVersionBadge');
        if (vBadge) {
          vBadge.textContent = `Version ${curr.version} (Current)`;
          vBadge.style.background = 'rgba(180, 240, 57, 0.14)';
          vBadge.style.color = '#b4f039';
        }

        // Add measurement fit notes to list
        if (curr.notes && !CustomerData.notes.includes(curr.notes)) {
          CustomerData.notes.unshift(curr.notes);
        }
        if (curr.postureNotes && !CustomerData.notes.includes(curr.postureNotes)) {
          CustomerData.notes.unshift(`Posture: ${curr.postureNotes}`);
        }
        if (curr.shapeNotes && !CustomerData.notes.includes(curr.shapeNotes)) {
          CustomerData.notes.unshift(`Shape: ${curr.shapeNotes}`);
        }

      } else {
        // No measurements recorded yet for this garment
        profile.forEach(item => {
          item.value = null;
          item.oldVal = null;
          item.diff = null;
        });

        const vBadge = document.getElementById('measVersionBadge');
        if (vBadge) {
          vBadge.textContent = 'Not Recorded';
          vBadge.style.background = 'rgba(255, 255, 255, 0.06)';
          vBadge.style.color = '#94a3b8';
        }
      }

      // Re-render UI components with real data
      renderMeasurementDetailsList();
      updateLatestRecordsUI(State.historyRecords, comp);
      updateHistoryChartWithRealData(State.historyRecords, comp);
      updateFitInsights(comp);
      initNotesList();
      updateMarkerBadgesTooltip();
      morphMannequin360FromActiveProfile(true);

    } catch (err) {
      console.warn('[Measurement360] syncCurrentGarmentFromApi error:', err.message);
      renderMeasurementDetailsList();
      morphMannequin360FromActiveProfile(false);
    }
  }

  // ==========================================================================
  // 4. CUSTOMER HEADER & PROFILE CARD
  // ==========================================================================
  function initCustomerHeader() {
    const nameEl = document.getElementById('customerName');
    const phoneEl = document.getElementById('customerPhone');
    const emailEl = document.getElementById('customerEmail');
    const avatarWrapper = document.getElementById('customerAvatarWrapper') || (avatarEl ? avatarEl.parentElement : null);

    if (nameEl) nameEl.textContent = CustomerData.name || 'Client Profile';
    if (phoneEl) phoneEl.textContent = CustomerData.phone || '—';
    if (emailEl) emailEl.textContent = CustomerData.email || '—';
    if (locEl) locEl.textContent = CustomerData.location || '—';

    if (avatarWrapper) {
      if (typeof window.applyPatronAvatarElement === 'function') {
        window.applyPatronAvatarElement(avatarWrapper, CustomerData.name, CustomerData.avatar, 'haulo-avatar-xl');
      } else if (typeof window.renderPatronAvatarHtml === 'function') {
        avatarWrapper.innerHTML = window.renderPatronAvatarHtml(CustomerData.name, CustomerData.avatar, 'haulo-avatar-xl');
      } else {
        const inits = typeof window.getPatronInitials === 'function' ? window.getPatronInitials(CustomerData.name) : 'CU';
        avatarWrapper.innerHTML = `<div class="haulo-patron-avatar-initials haulo-avatar-xl">${inits}</div>`;
      }
    }

    if (tierBadge) {
      if (CustomerData.vip) {
        tierBadge.style.display = 'inline-flex';
        if (tierText) tierText.textContent = CustomerData.tier.replace('_', ' ');
      } else {
        tierBadge.style.display = 'none';
      }
    }

    if (totalOrdersEl) totalOrdersEl.textContent = CustomerData.totalOrders;
    if (activeOrdersEl) activeOrdersEl.textContent = CustomerData.activeOrders;
    if (custSinceEl) custSinceEl.textContent = CustomerData.customerSince;
    if (custSinceSub) custSinceSub.textContent = CustomerData.customerSinceSub || '';

    if (addNoteLabel && CustomerData.name) {
      addNoteLabel.textContent = `Fit Note for ${CustomerData.name} (${State.activeGarment})`;
    }
  }

  // ==========================================================================
  // 5. TOP NAVIGATION TABS
  // ==========================================================================
  function initTopTabs() {
    const tabButtons = document.querySelectorAll('.tab-pill');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.activeTab = btn.dataset.tab;

        if (btn.dataset.tab === 'overview') {
          if (State.customerMobile) {
            window.location.href = `../../customer/Customer360/customer360.html?mobile=${encodeURIComponent(State.customerMobile)}`;
          } else {
            window.location.href = '../../customer/customer-overview/customer-overview.html';
          }
        }
      });
    });
  }

  // ==========================================================================
  // 6. GARMENT SELECTION LOGIC
  // ==========================================================================
  function initGarmentSelector() {
    const garmentBtns = document.querySelectorAll('.garment-btn');
    const visSubtitle = document.getElementById('visSubtitle');
    const detailsSubtitle = document.getElementById('detailsSubtitle');
    const historySelect = document.getElementById('historyGarmentSelect');
    const addNoteLabel = document.getElementById('addNoteLabel');

    garmentBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        garmentBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');

        const garment = btn.dataset.garment;
        State.activeGarment = garment;
        State.isEditMode = false;
        resetEditButton();

        if (visSubtitle) visSubtitle.textContent = `${garment} Measurements`;
        if (addNoteLabel) addNoteLabel.textContent = `Fit Note for ${CustomerData.name || 'Client'} (${garment})`;

        const vBadge = document.getElementById('measVersionBadge');
        if (detailsSubtitle && !vBadge) {
          detailsSubtitle.innerHTML = `${garment} <span id="measVersionBadge" style="margin-left: 8px; font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(180, 240, 57, 0.12); color: #b4f039; font-weight: 700; display: inline-block;">Loading...</span>`;
        } else if (detailsSubtitle && detailsSubtitle.childNodes[0]) {
          detailsSubtitle.childNodes[0].nodeValue = `${garment} `;
        }
        if (historySelect) historySelect.value = garment;

        renderMeasurementDetailsList();
        morphMannequin360FromActiveProfile(true);
        showToast(`Loaded ${garment} profile`);

        // Fetch real data from API for this garment
        await syncCurrentGarmentFromApi();
      });
    });

    if (historySelect) {
      historySelect.addEventListener('change', (e) => {
        const targetGarment = e.target.value;
        const matchingBtn = document.querySelector(`.garment-btn[data-garment="${targetGarment}"]`);
        if (matchingBtn) matchingBtn.click();
      });
    }
  }

  // ==========================================================================
  // 7. MEASUREMENT DETAILS LIST (RENDER & EDIT)
  // ==========================================================================
  function initMeasurementDetails() {
    renderMeasurementDetailsList();

    const toggleEditBtn = document.getElementById('toggleEditBtn');
    if (toggleEditBtn) {
      toggleEditBtn.addEventListener('click', () => {
        State.isEditMode = !State.isEditMode;
        updateEditButtonState();
        renderMeasurementDetailsList();
        if (State.isEditMode) {
          showToast('Edit mode enabled. Enter dimensions and click Update Measurements.');
        }
      });
    }
  }

  function resetEditButton() {
    const btn = document.getElementById('toggleEditBtn');
    const txt = document.getElementById('editBtnText');
    if (btn) btn.classList.remove('active');
    if (txt) txt.textContent = 'Edit';
  }

  function updateEditButtonState() {
    const btn = document.getElementById('toggleEditBtn');
    const txt = document.getElementById('editBtnText');
    if (!btn || !txt) return;

    if (State.isEditMode) {
      btn.classList.add('active');
      txt.textContent = 'Cancel';
    } else {
      btn.classList.remove('active');
      txt.textContent = 'Edit';
    }
  }

  function renderMeasurementDetailsList() {
    const container = document.getElementById('measurementItemsList');
    if (!container) return;

    const items = GarmentProfiles[State.activeGarment] || GarmentProfiles.Blouse;
    container.innerHTML = '';

    items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'meas-row';
      row.dataset.marker = item.marker || (index + 1);
      row.dataset.index = index;

      if (State.selectedRowIndex === index) {
        row.classList.add('active');
      }

      const left = document.createElement('div');
      left.className = 'meas-row-left';

      const numBadge = document.createElement('span');
      numBadge.className = 'row-num-badge';
      numBadge.textContent = item.id;

      const label = document.createElement('span');
      label.className = 'row-label';
      label.textContent = item.name;

      left.appendChild(numBadge);
      left.appendChild(label);

      const right = document.createElement('div');
      right.className = 'meas-row-right';

      if (State.isEditMode) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.25';
        input.min = '1';
        input.max = '160';
        input.placeholder = '—';
        input.className = 'meas-input-field';
        input.value = item.value != null ? Number(item.value).toFixed(1) : '';
        const handleLiveChange = (e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val) && val > 0) {
            item.value = val;
            morphMannequin360FromActiveProfile(true);
          }
        };
        input.addEventListener('input', handleLiveChange);
        input.addEventListener('change', handleLiveChange);
        right.appendChild(input);
      } else {
        const valGroup = document.createElement('div');
        valGroup.className = 'meas-val-group';

        // Current Value
        const valSpan = document.createElement('span');
        valSpan.className = 'row-value';
        valSpan.textContent = item.value != null ? `${Number(item.value).toFixed(1)}${item.unit}` : '—';
        valGroup.appendChild(valSpan);

        // Old Value indicator if available from DB
        if (item.oldVal != null) {
          const oldPill = document.createElement('span');
          oldPill.className = 'meas-old-pill';
          oldPill.title = `Previous fitting: ${Number(item.oldVal).toFixed(1)}"`;
          oldPill.textContent = `Old: ${Number(item.oldVal).toFixed(1)}"`;
          valGroup.appendChild(oldPill);
        }

        // Variance chip if old measurement exists
        if (item.diff && item.diff !== '0.00' && item.diff !== 'N/A') {
          const diffChip = document.createElement('span');
          const isPos = item.diff.startsWith('+');
          diffChip.className = `meas-diff-chip ${isPos ? 'pos' : 'neg'}`;
          diffChip.textContent = `${item.diff}"`;
          diffChip.title = `Variance from previous fitting: ${item.diff}"`;
          valGroup.appendChild(diffChip);
        } else if (item.diff === '0.00') {
          const diffChip = document.createElement('span');
          diffChip.className = 'meas-diff-chip zero';
          diffChip.textContent = 'Exact';
          valGroup.appendChild(diffChip);
        }

        right.appendChild(valGroup);
      }

      row.appendChild(left);
      row.appendChild(right);

      // Two-Way Interaction
      row.addEventListener('mouseenter', () => highlightMarker(item.marker || (index + 1), row));
      row.addEventListener('mouseleave', () => unhighlightMarker(item.marker || (index + 1), row));
      row.addEventListener('click', () => {
        State.selectedRowIndex = index;
        highlightMarker(item.marker || (index + 1), row, true);
      });

      container.appendChild(row);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================================================
  // 8. DYNAMIC 3D MANNEQUIN MORPHING ENGINE (PARAMETRIC PROPORTIONS)
  // ==========================================================================
  let currentMannequinParams360 = {
    bust: 36.5,
    waist: 30.0,
    hip: 39.0,
    shoulder: 14.25,
    neck: 7.5,
    underBust: 32.0,
    length: 14.5
  };
  let morphAnimationId360 = null;

  function generateFrontSilhouetteD(cx, neckW, shldW, bustW, waistW, hipW) {
    const xNeckL = cx - neckW;
    const xNeckR = cx + neckW;
    const xShldL = cx - shldW;
    const xShldR = cx + shldW;
    const xArmL = cx - shldW + 12;
    const xArmR = cx + shldW - 12;
    const xBustL = cx - bustW;
    const xBustR = cx + bustW;
    const xWaistL = cx - waistW;
    const xWaistR = cx + waistW;
    const xHipL = cx - hipW;
    const xHipR = cx + hipW;

    return `M ${xNeckL.toFixed(1)},54 ` +
           `L ${xNeckL.toFixed(1)},70 ` +
           `C ${(cx - neckW * 1.5).toFixed(1)},75 ${(xShldL + 14).toFixed(1)},83 ${xShldL.toFixed(1)},92 ` +
           `C ${(xShldL - 8).toFixed(1)},98 ${(xShldL - 8).toFixed(1)},118 ${xArmL.toFixed(1)},134 ` +
           `C ${(xBustL - 4).toFixed(1)},145 ${(xBustL - 5).toFixed(1)},156 ${(xBustL - 2).toFixed(1)},168 ` +
           `C ${(xBustL + 2).toFixed(1)},184 ${(xWaistL - 3).toFixed(1)},196 ${xWaistL.toFixed(1)},204 ` +
           `C ${(xWaistL - 3).toFixed(1)},218 ${(xHipL + 6).toFixed(1)},234 ${xHipL.toFixed(1)},248 ` +
           `C ${(xHipL - 3).toFixed(1)},256 ${(xHipL - 3).toFixed(1)},262 ${(xHipL - 2).toFixed(1)},266 ` +
           `C ${(cx - hipW * 0.77).toFixed(1)},277 ${(cx - hipW * 0.27).toFixed(1)},280 ${cx},280 ` +
           `C ${(cx + hipW * 0.27).toFixed(1)},280 ${(cx + hipW * 0.77).toFixed(1)},277 ${(xHipR + 2).toFixed(1)},266 ` +
           `C ${(xHipR + 3).toFixed(1)},262 ${(xHipR + 3).toFixed(1)},256 ${xHipR.toFixed(1)},248 ` +
           `C ${(xHipR - 6).toFixed(1)},234 ${(xWaistR + 3).toFixed(1)},218 ${xWaistR.toFixed(1)},204 ` +
           `C ${(xWaistR + 3).toFixed(1)},196 ${(xBustR - 2).toFixed(1)},184 ${(xBustR + 2).toFixed(1)},168 ` +
           `C ${(xBustR + 5).toFixed(1)},156 ${(xBustR + 4).toFixed(1)},145 ${xArmR.toFixed(1)},134 ` +
           `C ${(xShldR + 8).toFixed(1)},118 ${(xShldR + 8).toFixed(1)},98 ${xShldR.toFixed(1)},92 ` +
           `C ${(xShldR - 14).toFixed(1)},83 ${(cx + neckW * 1.5).toFixed(1)},75 ${xNeckR.toFixed(1)},70 ` +
           `L ${xNeckR.toFixed(1)},54 Z`;
  }

  function generateHorizontalRingsHTML(cx, neckW, shldW, bustW, waistW, hipW) {
    const f = (n) => n.toFixed(1);
    return `
      <path d="M ${f(cx - neckW)},60 Q ${cx},63 ${f(cx + neckW)},60" />
      <path d="M ${f(cx - neckW)},66 Q ${cx},70 ${f(cx + neckW)},66" />
      <path d="M ${f(cx - neckW)},72 Q ${cx},76 ${f(cx + neckW)},72" />
      <path d="M ${f(cx - shldW * 0.55)},78 Q ${cx},85 ${f(cx + shldW * 0.55)},78" />
      <path d="M ${f(cx - shldW * 0.8)},87 Q ${cx},95 ${f(cx + shldW * 0.8)},87" />
      <path d="M ${f(cx - shldW * 0.95)},99 Q ${cx},108 ${f(cx + shldW * 0.95)},99" />
      <path d="M ${f(cx - shldW)},112 Q ${cx},123 ${f(cx + shldW)},112" />
      <path d="M ${f(cx - bustW * 0.93)},126 Q ${cx},138 ${f(cx + bustW * 0.93)},126" />
      <path d="M ${f(cx - bustW * 0.98)},138 Q ${cx},150 ${f(cx + bustW * 0.98)},138" />
      <path d="M ${f(cx - bustW)},148 Q ${cx},161 ${f(cx + bustW)},148" stroke="rgba(242, 238, 228, 0.75)" stroke-width="0.9" />
      <path d="M ${f(cx - bustW * 0.98)},158 Q ${cx},172 ${f(cx + bustW * 0.98)},158" />
      <path d="M ${f(cx - (bustW * 0.6 + waistW * 0.4))},168 Q ${cx},181 ${f(cx + (bustW * 0.6 + waistW * 0.4))},168" stroke="rgba(242, 238, 228, 0.7)" stroke-width="0.8" />
      <path d="M ${f(cx - (bustW * 0.4 + waistW * 0.6))},178 Q ${cx},191 ${f(cx + (bustW * 0.4 + waistW * 0.6))},178" />
      <path d="M ${f(cx - (bustW * 0.2 + waistW * 0.8))},188 Q ${cx},200 ${f(cx + (bustW * 0.2 + waistW * 0.8))},188" />
      <path d="M ${f(cx - (waistW * 0.95))},196 Q ${cx},207 ${f(cx + (waistW * 0.95))},196" />
      <path d="M ${f(cx - waistW)},204 Q ${cx},215 ${f(cx + waistW)},204" stroke="#B8FF3D" stroke-width="1.1" stroke-opacity="0.85" stroke-dasharray="3,2" />
      <path d="M ${f(cx - (waistW * 0.8 + hipW * 0.2))},213 Q ${cx},224 ${f(cx + (waistW * 0.8 + hipW * 0.2))},213" />
      <path d="M ${f(cx - (waistW * 0.6 + hipW * 0.4))},222 Q ${cx},233 ${f(cx + (waistW * 0.6 + hipW * 0.4))},222" />
      <path d="M ${f(cx - (waistW * 0.4 + hipW * 0.6))},232 Q ${cx},243 ${f(cx + (waistW * 0.4 + hipW * 0.6))},232" />
      <path d="M ${f(cx - (waistW * 0.2 + hipW * 0.8))},242 Q ${cx},253 ${f(cx + (waistW * 0.2 + hipW * 0.8))},242" />
      <path d="M ${f(cx - (hipW * 0.95))},252 Q ${cx},263 ${f(cx + (hipW * 0.95))},252" />
      <path d="M ${f(cx - hipW)},261 Q ${cx},272 ${f(cx + hipW)},261" />
      <path d="M ${f(cx - hipW)},266 Q ${cx},277 ${f(cx + hipW)},266" stroke="rgba(242, 238, 228, 0.75)" stroke-width="0.85" />
    `;
  }

  function generateBreastLoopsHTML(cx, apexOff, bRadius) {
    const f = (n) => n.toFixed(1);
    const apexL = cx - apexOff;
    const apexR = cx + apexOff;
    const r1 = bRadius * 0.25;
    const r2 = bRadius * 0.5;
    const r3 = bRadius * 0.75;
    const r4 = bRadius;

    return `
      <ellipse cx="${f(apexL)}" cy="148" rx="${f(r1)}" ry="${f(r1 * 0.85)}" stroke="rgba(245, 240, 228, 0.75)" stroke-width="0.8" />
      <ellipse cx="${f(apexL)}" cy="148" rx="${f(r2)}" ry="${f(r2 * 0.85)}" />
      <ellipse cx="${f(apexL)}" cy="148" rx="${f(r3)}" ry="${f(r3 * 0.85)}" />
      <ellipse cx="${f(apexL)}" cy="148" rx="${f(r4)}" ry="${f(r4 * 0.85)}" stroke="rgba(215, 208, 195, 0.35)" />
      <line x1="${f(apexL - r1 * 0.7)}" y1="143" x2="${f(apexL - r4 * 0.7)}" y2="132" />
      <line x1="${f(apexL + r1 * 0.7)}" y1="143" x2="${f(apexL + r4 * 0.7)}" y2="133" />
      <line x1="${f(apexL - r1 * 0.7)}" y1="153" x2="${f(apexL - r4 * 0.7)}" y2="164" />
      <line x1="${f(apexL + r1 * 0.7)}" y1="153" x2="${f(apexL + r4 * 0.7)}" y2="163" />

      <ellipse cx="${f(apexR)}" cy="148" rx="${f(r1)}" ry="${f(r1 * 0.85)}" stroke="rgba(245, 240, 228, 0.75)" stroke-width="0.8" />
      <ellipse cx="${f(apexR)}" cy="148" rx="${f(r2)}" ry="${f(r2 * 0.85)}" />
      <ellipse cx="${f(apexR)}" cy="148" rx="${f(r3)}" ry="${f(r3 * 0.85)}" />
      <ellipse cx="${f(apexR)}" cy="148" rx="${f(r4)}" ry="${f(r4 * 0.85)}" stroke="rgba(215, 208, 195, 0.35)" />
      <line x1="${f(apexR + r1 * 0.7)}" y1="143" x2="${f(apexR + r4 * 0.7)}" y2="132" />
      <line x1="${f(apexR - r1 * 0.7)}" y1="143" x2="${f(apexR - r4 * 0.7)}" y2="133" />
      <line x1="${f(apexR + r1 * 0.7)}" y1="153" x2="${f(apexR + r4 * 0.7)}" y2="164" />
      <line x1="${f(apexR - r1 * 0.7)}" y1="153" x2="${f(apexR - r4 * 0.7)}" y2="163" />
    `;
  }

  function generateVerticalRibsHTML(cx, neckW, shldW, bustW, waistW, hipW, apexOff) {
    const f = (n) => n.toFixed(1);
    const apexL = cx - apexOff;
    const apexR = cx + apexOff;

    return `
      <path d="M ${cx},54 L ${cx},70 L ${cx},279" stroke="rgba(245, 240, 230, 0.85)" stroke-width="1.1" />
      <path d="M ${f(cx - neckW * 0.38)},54 C ${f(cx - neckW * 0.38)},70 ${f(cx - bustW * 0.15)},110 ${f(cx - bustW * 0.13)},148 C ${f(cx - waistW * 0.12)},185 ${f(cx - waistW * 0.12)},204 ${f(cx - waistW * 0.12)},204 C ${f(cx - waistW * 0.12)},220 ${f(cx - hipW * 0.17)},250 ${f(cx - hipW * 0.17)},279" />
      <path d="M ${f(cx + neckW * 0.38)},54 C ${f(cx + neckW * 0.38)},70 ${f(cx + bustW * 0.15)},110 ${f(cx + bustW * 0.13)},148 C ${f(cx + waistW * 0.12)},185 ${f(cx + waistW * 0.12)},204 ${f(cx + waistW * 0.12)},204 C ${f(cx + waistW * 0.12)},220 ${f(cx - hipW * 0.17)},250 ${f(cx - hipW * 0.17)},279" />
      <path d="M ${f(cx - neckW * 0.77)},54 C ${f(cx - neckW * 1.05)},75 ${f(apexL)},112 ${f(apexL)},148 C ${f(apexL)},182 ${f(cx - waistW * 0.44)},204 ${f(cx - waistW * 0.44)},204 C ${f(cx - waistW * 0.44)},225 ${f(cx - hipW * 0.46)},252 ${f(cx - hipW * 0.46)},277" stroke="rgba(240, 235, 225, 0.65)" stroke-width="0.75" />
      <path d="M ${f(cx + neckW * 0.77)},54 C ${f(cx + neckW * 1.05)},75 ${f(apexR)},112 ${f(apexR)},148 C ${f(apexR)},182 ${f(cx + waistW * 0.44)},204 ${f(cx + waistW * 0.44)},204 C ${f(cx + waistW * 0.44)},225 ${f(cx + hipW * 0.46)},252 ${f(cx + hipW * 0.46)},277" stroke="rgba(240, 235, 225, 0.65)" stroke-width="0.75" />
      <path d="M ${f(cx - shldW * 0.33)},74 C ${f(cx - bustW * 0.55)},105 ${f(cx - bustW * 0.66)},138 ${f(cx - bustW * 0.65)},158 C ${f(cx - waistW * 0.7)},182 ${f(cx - waistW * 0.7)},204 ${f(cx - waistW * 0.7)},204 C ${f(cx - waistW * 0.7)},225 ${f(cx - hipW * 0.68)},252 ${f(cx - hipW * 0.68)},274" />
      <path d="M ${f(cx + shldW * 0.33)},74 C ${f(cx + bustW * 0.55)},105 ${f(cx + bustW * 0.66)},138 ${f(cx + bustW * 0.65)},158 C ${f(cx - waistW * 0.7)},182 ${f(cx - waistW * 0.7)},204 ${f(cx - waistW * 0.7)},204 C ${f(cx - waistW * 0.7)},225 ${f(cx - hipW * 0.68)},252 ${f(cx - hipW * 0.68)},274" />
      <path d="M ${f(cx - shldW * 0.55)},78 C ${f(cx - bustW * 0.77)},105 ${f(cx - bustW * 0.85)},136 ${f(cx - bustW * 0.82)},162 C ${f(cx - waistW * 0.94)},185 ${f(cx - waistW * 0.94)},204 ${f(cx - waistW * 0.94)},204 C ${f(cx - waistW * 0.94)},225 ${f(cx - hipW * 0.85)},252 ${f(cx - hipW * 0.85)},270" />
      <path d="M ${f(cx + shldW * 0.55)},78 C ${f(cx + bustW * 0.77)},105 ${f(cx + bustW * 0.85)},136 ${f(cx + bustW * 0.82)},162 C ${f(cx - waistW * 0.94)},185 ${f(cx - waistW * 0.94)},204 ${f(cx - waistW * 0.94)},204 C ${f(cx - waistW * 0.94)},225 ${f(cx - hipW * 0.85)},252 ${f(cx - hipW * 0.85)},270" />
      <path d="M ${f(cx - shldW * 0.77)},86 C ${f(cx - shldW * 0.9)},108 ${f(cx - bustW * 0.95)},138 ${f(cx - bustW * 0.88)},166 C ${f(cx - waistW * 0.97)},185 ${f(cx - waistW * 0.97)},204 ${f(cx - waistW * 0.97)},204 C ${f(cx - waistW * 0.97)},225 ${f(cx - hipW * 0.97)},252 ${f(cx - hipW * 0.97)},268" />
      <path d="M ${f(cx + shldW * 0.77)},86 C ${f(cx + shldW * 0.9)},108 ${f(cx + bustW * 0.95)},138 ${f(cx + bustW * 0.88)},166 C ${f(cx - waistW * 0.97)},185 ${f(cx - waistW * 0.97)},204 ${f(cx - waistW * 0.97)},204 C ${f(cx - waistW * 0.97)},225 ${f(cx - hipW * 0.97)},252 ${f(cx - hipW * 0.97)},268" />
    `;
  }

  function renderMannequin360Geometry(params) {
    const baseBust = 36.0;
    const baseWaist = 28.0;
    const baseHip = 38.0;
    const baseShoulder = 14.5;
    const baseNeck = 7.5;

    const bust = Math.max(26, Math.min(52, parseFloat(params.bust) || baseBust));
    const waist = Math.max(20, Math.min(46, parseFloat(params.waist) || baseWaist));
    const hip = Math.max(28, Math.min(56, parseFloat(params.hip) || baseHip));
    const shoulder = Math.max(11, Math.min(19, parseFloat(params.shoulder) || baseShoulder));
    const neck = Math.max(5.5, Math.min(10, parseFloat(params.neck) || baseNeck));
    const underBust = Math.max(24, Math.min(46, parseFloat(params.underBust) || (bust * 0.88)));

    const neckW = 13 * (neck / baseNeck);
    const shldW = 60 * (shoulder / baseShoulder);
    const bustW = 54 * (bust / baseBust);
    const underBustW = 44 * (underBust / (baseBust * 0.88));
    const waistW = 34 * (waist / baseWaist);
    const hipW = 52 * (hip / baseHip);
    const apexOff = 25 * (bust / baseBust);
    const bRadius = 28 * (bust / baseBust);

    // Update Auto-Sized Badge
    const sizeBadge = document.getElementById('mannequinSizeBadge');
    if (sizeBadge) {
      sizeBadge.textContent = `Auto-Sized: B ${bust.toFixed(1)}" · W ${waist.toFixed(1)}" · H ${hip.toFixed(1)}"`;
    }

    // 1. FRONT VIEW MANNEQUIN (Center X = 220)
    const frontPath = document.getElementById('svgFrontSilhouette360');
    if (frontPath) {
      frontPath.setAttribute('d', generateFrontSilhouetteD(220, neckW, shldW, bustW, waistW, hipW));
    }

    const frontHem = document.getElementById('svgFrontHemPlate360');
    if (frontHem) frontHem.setAttribute('rx', hipW.toFixed(1));

    const frontArmL = document.getElementById('svgFrontArmscyeL360');
    if (frontArmL) {
      const armLx = (220 - shldW + 3).toFixed(1);
      frontArmL.setAttribute('cx', armLx);
      frontArmL.setAttribute('transform', `rotate(-16, ${armLx}, 113)`);
    }

    const frontArmR = document.getElementById('svgFrontArmscyeR360');
    if (frontArmR) {
      const armRx = (220 + shldW - 3).toFixed(1);
      frontArmR.setAttribute('cx', armRx);
      frontArmR.setAttribute('transform', `rotate(16, ${armRx}, 113)`);
    }

    const frontRings = document.getElementById('svgFrontHorizontalRings360');
    if (frontRings) frontRings.innerHTML = generateHorizontalRingsHTML(220, neckW, shldW, bustW, waistW, hipW);

    const frontLoops = document.getElementById('svgFrontBreastLoops360');
    if (frontLoops) frontLoops.innerHTML = generateBreastLoopsHTML(220, apexOff, bRadius);

    const frontRibs = document.getElementById('svgFrontVerticalRibs360');
    if (frontRibs) frontRibs.innerHTML = generateVerticalRibsHTML(220, neckW, shldW, bustW, waistW, hipW, apexOff);

    // 2. BACK VIEW MANNEQUIN (Center X = 430)
    const backPath = document.getElementById('svgBackSilhouette360');
    if (backPath) {
      backPath.setAttribute('d', generateFrontSilhouetteD(430, neckW, shldW, bustW, waistW, hipW));
    }

    const backHem = document.getElementById('svgBackHemPlate360');
    if (backHem) backHem.setAttribute('rx', hipW.toFixed(1));

    const backArmL = document.getElementById('svgBackArmscyeL360');
    if (backArmL) {
      const bArmLx = (430 - shldW + 3).toFixed(1);
      backArmL.setAttribute('cx', bArmLx);
      backArmL.setAttribute('transform', `rotate(-16, ${bArmLx}, 113)`);
    }

    const backArmR = document.getElementById('svgBackArmscyeR360');
    if (backArmR) {
      const bArmRx = (430 + shldW - 3).toFixed(1);
      backArmR.setAttribute('cx', bArmRx);
      backArmR.setAttribute('transform', `rotate(16, ${bArmRx}, 113)`);
    }

    const backRings = document.getElementById('svgBackHorizontalRings360');
    if (backRings) backRings.innerHTML = generateHorizontalRingsHTML(430, neckW, shldW, bustW, waistW, hipW);

    const backRibs = document.getElementById('svgBackVerticalRibs360');
    if (backRibs) backRibs.innerHTML = generateVerticalRibsHTML(430, neckW, shldW, bustW, waistW, hipW, apexOff);

    // 3. DYNAMIC OVERLAY MEASUREMENT LINES
    const lineShoulder = document.getElementById('lineShoulder360');
    if (lineShoulder) {
      lineShoulder.setAttribute('x1', (220 - shldW).toFixed(1));
      lineShoulder.setAttribute('x2', (220 + shldW).toFixed(1));
    }

    const lineFrontNeck = document.getElementById('lineFrontNeck360');
    if (lineFrontNeck) {
      lineFrontNeck.setAttribute('d', `M ${(220 - neckW).toFixed(1)} 70 Q 220 ${(70 + neck * 4).toFixed(1)} ${(220 + neckW).toFixed(1)} 70`);
    }

    const lineBust = document.getElementById('lineBust360');
    if (lineBust) {
      lineBust.setAttribute('d', `M ${(220 - bustW).toFixed(1)} 148 Q 220 161 ${(220 + bustW).toFixed(1)} 148`);
    }

    const lineUnderBust = document.getElementById('lineUnderBust360');
    if (lineUnderBust) {
      lineUnderBust.setAttribute('d', `M ${(220 - underBustW).toFixed(1)} 178 Q 220 191 ${(220 + underBustW).toFixed(1)} 178`);
    }

    const lineWaist = document.getElementById('lineWaist360');
    if (lineWaist) {
      lineWaist.setAttribute('d', `M ${(220 - waistW).toFixed(1)} 204 Q 220 215 ${(220 + waistW).toFixed(1)} 204`);
    }

    const lineHem = document.getElementById('lineHem360');
    if (lineHem) {
      lineHem.setAttribute('d', `M ${(220 - hipW).toFixed(1)} 266 Q 220 277 ${(220 + hipW).toFixed(1)} 266`);
    }

    const lineSleeveL = document.getElementById('lineSleeveL360');
    if (lineSleeveL) {
      lineSleeveL.setAttribute('d', `M ${(220 - shldW).toFixed(1)} 112 L ${(220 - shldW - 20).toFixed(1)} 180`);
    }

    const lineSleeveR = document.getElementById('lineSleeveR360');
    if (lineSleeveR) {
      lineSleeveR.setAttribute('d', `M ${(220 + shldW).toFixed(1)} 112 L ${(220 + shldW + 20).toFixed(1)} 180`);
    }

    const lineBackNeck = document.getElementById('lineBackNeck360');
    if (lineBackNeck) {
      lineBackNeck.setAttribute('d', `M ${(430 - neckW).toFixed(1)} 70 Q 430 92 ${(430 + neckW).toFixed(1)} 70`);
    }

    const lineArmhole = document.getElementById('lineArmhole360');
    if (lineArmhole) {
      lineArmhole.setAttribute('d', `M ${(430 - shldW).toFixed(1)} 112 Q 430 123 ${(430 + shldW).toFixed(1)} 112`);
    }

    const lineBackWaist = document.getElementById('lineBackWaist360');
    if (lineBackWaist) {
      lineBackWaist.setAttribute('d', `M ${(430 - waistW).toFixed(1)} 204 Q 430 215 ${(430 + waistW).toFixed(1)} 204`);
    }

    // 4. DYNAMIC MARKER BADGES POSITION TRACKING
    const bShoulder = document.getElementById('badgeShoulder360');
    if (bShoulder) bShoulder.style.left = `${(((220 - shldW) / 640) * 100).toFixed(1)}%`;

    const bArmhole = document.getElementById('badgeArmhole360');
    if (bArmhole) bArmhole.style.left = `${(((220 - shldW + 8) / 640) * 100).toFixed(1)}%`;

    const bSleeve = document.getElementById('badgeSleeve360');
    if (bSleeve) bSleeve.style.left = `${(((220 - shldW - 14) / 640) * 100).toFixed(1)}%`;

    const bLength = document.getElementById('badgeLength360');
    if (bLength) bLength.style.left = `${(((220 - hipW + 4) / 640) * 100).toFixed(1)}%`;

    const bBackShoulder = document.getElementById('badgeBackShoulder360');
    if (bBackShoulder) bBackShoulder.style.left = `${(((430 + shldW) / 640) * 100).toFixed(1)}%`;
  }

  function morphMannequin360ToMeasurements(targetMeasurements, animate = true) {
    if (!targetMeasurements) return;
    const target = {
      bust: parseFloat(targetMeasurements.bust) || 36.0,
      waist: parseFloat(targetMeasurements.waist) || 28.0,
      hip: parseFloat(targetMeasurements.hip) || 38.0,
      shoulder: parseFloat(targetMeasurements.shoulder) || 14.25,
      neck: parseFloat(targetMeasurements.neck) || 7.5,
      underBust: parseFloat(targetMeasurements.underBust) || (parseFloat(targetMeasurements.bust || 36.0) * 0.88),
      length: parseFloat(targetMeasurements.length) || 14.5
    };

    if (!animate) {
      currentMannequinParams360 = { ...target };
      renderMannequin360Geometry(target);
      return;
    }

    if (morphAnimationId360) cancelAnimationFrame(morphAnimationId360);

    const start = { ...currentMannequinParams360 };
    const startTime = performance.now();
    const duration = 360;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      const interpolated = {
        bust: start.bust + (target.bust - start.bust) * ease,
        waist: start.waist + (target.waist - start.waist) * ease,
        hip: start.hip + (target.hip - start.hip) * ease,
        shoulder: start.shoulder + (target.shoulder - start.shoulder) * ease,
        neck: start.neck + (target.neck - start.neck) * ease,
        underBust: start.underBust + (target.underBust - start.underBust) * ease,
        length: start.length + (target.length - start.length) * ease
      };

      currentMannequinParams360 = interpolated;
      renderMannequin360Geometry(interpolated);

      if (progress < 1) {
        morphAnimationId360 = requestAnimationFrame(step);
      } else {
        currentMannequinParams360 = { ...target };
        renderMannequin360Geometry(target);
        morphAnimationId360 = null;
      }
    }

    morphAnimationId360 = requestAnimationFrame(step);
  }

  function morphMannequin360FromActiveProfile(animate = true) {
    const profile = GarmentProfiles[State.activeGarment] || GarmentProfiles.Blouse;
    const findVal = (key) => {
      const item = profile.find(p => p.key === key);
      return item && item.value != null ? Number(item.value) : null;
    };

    const bust = findVal('bust') || 36.5;
    const waist = findVal('waist') || findVal('pantWaist') || 30.0;
    const hip = findVal('hip') || findVal('pantHip') || 39.0;
    const shoulder = findVal('shoulder') || 14.25;
    const underBust = findVal('underBust') || (bust * 0.88);
    const neck = findVal('frontNeckDepth') || 7.5;
    const length = findVal('blouseLength') || findVal('topLength') || findVal('fullLength') || 14.5;

    morphMannequin360ToMeasurements({
      bust,
      waist,
      hip,
      shoulder,
      underBust,
      neck,
      length
    }, animate);
  }

  window.morphMannequin360FromActiveProfile = morphMannequin360FromActiveProfile;
  window.morphMannequin360ToMeasurements = morphMannequin360ToMeasurements;

  function initMannequinInteractions() {
    const badges = document.querySelectorAll('.marker-badge');
    badges.forEach(badge => {
      const markerId = badge.dataset.idx;

      badge.addEventListener('mouseenter', () => {
        highlightDetailsRow(markerId, badge);
      });

      badge.addEventListener('mouseleave', () => {
        unhighlightDetailsRow(markerId, badge);
      });

      badge.addEventListener('click', () => {
        highlightDetailsRow(markerId, badge, true);
      });
    });

    // View switch buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        viewButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const view = btn.dataset.view;
        State.activeView = view;

        const frontForm = document.getElementById('frontDressForm360');
        const backForm = document.getElementById('backDressForm360');

        if (view === 'front') {
          if (frontForm) {
            frontForm.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            frontForm.style.opacity = '1';
            frontForm.style.transform = 'scale(1.06) translate(8px, 0)';
          }
          if (backForm) {
            backForm.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            backForm.style.opacity = '0.32';
            backForm.style.transform = 'scale(0.94) translate(8px, 0)';
          }
          highlightMarker(2);
          showToast('Front view in focus');
        } else if (view === 'back') {
          if (frontForm) {
            frontForm.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            frontForm.style.opacity = '0.32';
            frontForm.style.transform = 'scale(0.94) translate(-8px, 0)';
          }
          if (backForm) {
            backForm.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            backForm.style.opacity = '1';
            backForm.style.transform = 'scale(1.06) translate(-8px, 0)';
          }
          highlightMarker(7);
          showToast('Back view in focus');
        } else {
          if (frontForm) {
            frontForm.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            frontForm.style.opacity = '1';
            frontForm.style.transform = 'none';
          }
          if (backForm) {
            backForm.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            backForm.style.opacity = '1';
            backForm.style.transform = 'none';
          }
          showToast('Dual 360° perspective active');
        }
      });
    });
  }

  function updateMarkerBadgesTooltip() {
    const profile = GarmentProfiles[State.activeGarment] || GarmentProfiles.Blouse;
    document.querySelectorAll('.marker-badge').forEach(badge => {
      const markerId = parseInt(badge.dataset.idx, 10);
      const matched = profile.find(p => p.marker === markerId);
      if (matched && matched.value != null) {
        badge.title = `${matched.name}: ${Number(matched.value).toFixed(1)}"`;
      }
    });
  }

  function highlightMarker(markerId, rowEl, isPersistent = false) {
    document.querySelectorAll(`.meas-line[data-marker="${markerId}"]`).forEach(line => {
      line.classList.add('active');
    });

    document.querySelectorAll(`.marker-badge[data-idx="${markerId}"]`).forEach(badge => {
      badge.classList.add('active');
    });

    if (rowEl) {
      rowEl.classList.add('active');
    }
  }

  function unhighlightMarker(markerId, rowEl) {
    if (State.selectedRowIndex !== null && rowEl && rowEl.dataset.index == State.selectedRowIndex) {
      return;
    }

    document.querySelectorAll(`.meas-line[data-marker="${markerId}"]`).forEach(line => {
      line.classList.remove('active');
    });

    document.querySelectorAll(`.marker-badge[data-idx="${markerId}"]`).forEach(badge => {
      badge.classList.remove('active');
    });

    if (rowEl) {
      rowEl.classList.remove('active');
    }
  }

  function highlightDetailsRow(markerId, badgeEl, scrollTo = false) {
    const matchingRows = document.querySelectorAll(`.meas-row[data-marker="${markerId}"]`);
    matchingRows.forEach(row => {
      row.classList.add('active');
      if (scrollTo) {
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    document.querySelectorAll(`.meas-line[data-marker="${markerId}"]`).forEach(line => {
      line.classList.add('active');
    });

    if (badgeEl) {
      badgeEl.classList.add('active');
    }
  }

  function unhighlightDetailsRow(markerId, badgeEl) {
    const matchingRows = document.querySelectorAll(`.meas-row[data-marker="${markerId}"]`);
    matchingRows.forEach(row => {
      if (State.selectedRowIndex !== null && row.dataset.index == State.selectedRowIndex) {
        return;
      }
      row.classList.remove('active');
    });

    document.querySelectorAll(`.meas-line[data-marker="${markerId}"]`).forEach(line => {
      line.classList.remove('active');
    });

    if (badgeEl) {
      badgeEl.classList.remove('active');
    }
  }

  // ==========================================================================
  // 9. UPDATE MEASUREMENTS (DATABASE PERSISTENCE)
  // ==========================================================================
  function initUpdateMeasurementsButton() {
    const updateBtn = document.getElementById('updateMeasurementsBtn');
    if (!updateBtn) return;

    updateBtn.addEventListener('click', async () => {
      if (!State.customerMobile) {
        showToast('No customer loaded to update measurements', 'error');
        return;
      }

      const inputs = document.querySelectorAll('.meas-input-field');
      const profile = GarmentProfiles[State.activeGarment] || GarmentProfiles.Blouse;
      let hasErrors = false;
      let enteredValuesCount = 0;

      // Validate inputs if in edit mode
      if (State.isEditMode && inputs.length > 0) {
        inputs.forEach(input => {
          const raw = input.value.trim();
          if (raw !== '') {
            const val = parseFloat(raw);
            if (isNaN(val) || val <= 0 || val > 160) {
              input.style.borderColor = '#f87171';
              hasErrors = true;
            } else {
              input.style.borderColor = '#b4f039';
              const idx = parseInt(input.dataset.index, 10);
              if (profile[idx]) {
                profile[idx].value = val;
                enteredValuesCount++;
              }
            }
          }
        });

        if (hasErrors) {
          showToast('Please enter valid dimensions between 1" and 160"', 'error');
          return;
        }

        if (enteredValuesCount === 0) {
          showToast('Please enter at least one measurement dimension', 'error');
          return;
        }
      }

      // Build payload for backend API
      const payload = {
        garmentType: State.activeGarment.toUpperCase(),
        unit: 'in',
        recordedBy: 'Master Tailor'
      };

      profile.forEach(item => {
        if (item.key && item.value != null) {
          payload[item.key] = Number(item.value);
        }
      });

      // Exit Edit Mode
      State.isEditMode = false;
      resetEditButton();

      // Persist to Spring Boot backend API
      try {
        const { default: api } = await import('../../api.js');
        const saved = await api.customers.bodyMeasurements.save(State.customerMobile, payload);

        showToast(`Saved ${State.activeGarment} fitting! Version ${saved.version} is now Current.`);

        // Re-sync comparison from live DB
        await syncCurrentGarmentFromApi();

      } catch (err) {
        console.error('[Measurement360] Save error:', err);
        showToast(`Save failed: ${err.message}`, 'error');
        renderMeasurementDetailsList();
      }
    });
  }

  // ==========================================================================
  // 10. REVISION HISTORY CHART (REAL DATA ONLY)
  // ==========================================================================
  function initHistoryChart() {
    const canvas = document.getElementById('measurementHistoryChart');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    State.chartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Shoulder', 'Bust', 'Waist', 'Length', 'Armhole'],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(28, 22, 18, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${context.raw}"`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              color: 'rgba(255, 255, 255, 0.65)',
              font: { family: (typeof getComputedStyle === 'function' ? getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim() : '') || "'Montserrat', sans-serif", size: 11 }
            }
          },
          y: {
            min: 0,
            max: 60,
            ticks: {
              stepSize: 10,
              callback: function (val) { return val + '"'; },
              color: 'rgba(255, 255, 255, 0.45)',
              font: { family: (typeof getComputedStyle === 'function' ? getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim() : '') || "'Montserrat', sans-serif", size: 10.5 }
            },
            grid: { color: 'rgba(255, 255, 255, 0.07)', drawBorder: false }
          }
        }
      }
    });
  }

  function updateHistoryChartWithRealData(historyList, comp) {
    if (!State.chartInstance) return;

    const legendBar = document.getElementById('chartLegendBar');
    const labels = ['Shoulder', 'Bust', 'Waist', 'Length', 'Armhole'];
    State.chartInstance.data.labels = labels;

    // Build real datasets from DB records
    const datasets = [];
    const legendItems = [];
    const colors = [
      { bg: '#a78bfa', circle: 'purple' },
      { bg: '#e2e8f0', circle: 'gray' },
      { bg: '#b4f039', circle: 'lime' },
      { bg: '#38bdf8', circle: 'blue' }
    ];

    if (historyList && historyList.length > 0) {
      // Show up to the last 3 versions
      const displayVersions = historyList.slice(-3);
      displayVersions.forEach((rec, idx) => {
        const c = colors[idx % colors.length];
        const vLabel = `v${rec.version} (${rec.isCurrent ? 'Current' : 'Old'})`;
        const lenVal = rec.blouseLength || rec.topLength || rec.skirtLength || rec.fullLength || rec.pantLength;

        datasets.push({
          label: vLabel,
          data: [
            rec.shoulder != null ? Number(rec.shoulder) : 0,
            rec.bust != null ? Number(rec.bust) : 0,
            rec.waist != null ? Number(rec.waist) : 0,
            lenVal != null ? Number(lenVal) : 0,
            rec.armhole != null ? Number(rec.armhole) : 0
          ],
          backgroundColor: c.bg,
          borderRadius: 4,
          barPercentage: 0.78,
          categoryPercentage: 0.72
        });

        legendItems.push(`<span class="legend-item"><span class="legend-circle ${c.circle}"></span>${vLabel}</span>`);
      });
    } else if (comp && comp.current) {
      const curr = comp.current;
      const lenVal = curr.blouseLength || curr.topLength || curr.skirtLength || curr.fullLength;
      datasets.push({
        label: `v${curr.version} (Current)`,
        data: [
          curr.shoulder != null ? Number(curr.shoulder) : 0,
          curr.bust != null ? Number(curr.bust) : 0,
          curr.waist != null ? Number(curr.waist) : 0,
          lenVal != null ? Number(lenVal) : 0,
          curr.armhole != null ? Number(curr.armhole) : 0
        ],
        backgroundColor: '#b4f039',
        borderRadius: 4,
        barPercentage: 0.78,
        categoryPercentage: 0.72
      });
      legendItems.push(`<span class="legend-item"><span class="legend-circle lime"></span>v${curr.version} (Current)</span>`);
    }

    State.chartInstance.data.datasets = datasets;
    State.chartInstance.update();

    if (legendBar) {
      legendBar.innerHTML = legendItems.length > 0 
        ? legendItems.join('') 
        : '<span style="color: var(--c-text-muted); font-size: 11px;">No measurements recorded for chart</span>';
    }
  }

  // ==========================================================================
  // 11. LATEST MEASUREMENTS (REAL DATABASE SNAPSHOTS)
  // ==========================================================================
  function updateLatestRecordsUI(historyList, comp) {
    const list = document.getElementById('latestRecordsList');
    if (!list) return;

    const records = (historyList && historyList.length > 0) 
      ? [...historyList].reverse() 
      : (comp && comp.current ? [comp.current] : []);

    if (records.length === 0) {
      list.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--c-text-muted); font-size: 12px;">
          No measurement records found for ${State.activeGarment}.<br />
          Click <b>Edit</b> to record initial measurements.
        </div>
      `;
      return;
    }

    let html = '';
    records.forEach((rec, idx) => {
      const isCurrent = rec.isCurrent === true || rec.measurementType === 'CURRENT';
      const formattedDate = rec.recordedAt 
        ? new Date(rec.recordedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Active Fitting';

      html += `
        <div class="latest-record-item ${isCurrent ? 'active' : ''}" data-version="${rec.version}" tabindex="0">
          <div class="record-meta-top">
            <span class="record-date">${formattedDate}</span>
            <span class="${isCurrent ? 'badge-current' : 'badge-old'}" style="${!isCurrent ? 'font-size:10.5px;color:#94a3b8;background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:10px;' : ''}">
              ${isCurrent ? '<span class="badge-dot"></span>' : ''} Version ${rec.version} (${isCurrent ? 'Current' : 'Old'})
            </span>
          </div>
          <div class="record-meta-bottom">
            <span class="record-details">For ${State.activeGarment} · Taken by ${rec.recordedBy || 'Master Tailor'}</span>
            <i data-lucide="chevron-right" class="record-arrow"></i>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();

    // Clicking a historical snapshot loads its values into the details card
    list.querySelectorAll('.latest-record-item').forEach(item => {
      item.addEventListener('click', () => {
        list.querySelectorAll('.latest-record-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const v = parseInt(item.dataset.version, 10);
        const targetRec = records.find(r => r.version === v);
        if (targetRec) {
          loadSnapshotIntoDetails(targetRec);
        }
      });
    });
  }

  function loadSnapshotIntoDetails(rec) {
    const profile = GarmentProfiles[State.activeGarment] || GarmentProfiles.Blouse;
    profile.forEach(item => {
      item.value = rec[item.key] != null ? Number(rec[item.key]) : null;
    });
    renderMeasurementDetailsList();
    showToast(`Loaded Version ${rec.version} (${rec.isCurrent ? 'Current' : 'Old'}) snapshot`);
  }

  // ==========================================================================
  // 12. DYNAMIC FIT INSIGHTS & ACCURACY CALCULATION
  // ==========================================================================
  function updateFitInsights(comp) {
    const percentEl = document.getElementById('fitDonutPercent');
    const donutFill = document.getElementById('fitDonutFill');
    const checklist = document.getElementById('fitChecklist');
    const callout = document.getElementById('fitCalloutText');

    const profile = GarmentProfiles[State.activeGarment] || GarmentProfiles.Blouse;
    const totalPoints = profile.length;
    const filledPoints = profile.filter(p => p.value != null).length;
    const percent = totalPoints > 0 ? Math.round((filledPoints / totalPoints) * 100) : 0;

    if (percentEl) percentEl.textContent = `${percent}%`;

    if (donutFill) {
      const radius = 38;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (percent / 100) * circumference;
      donutFill.style.strokeDasharray = `${circumference}`;
      donutFill.style.strokeDashoffset = `${offset}`;
      donutFill.style.stroke = percent >= 90 ? 'var(--c-lime, #b4f039)' : (percent >= 50 ? '#fbbf24' : '#94a3b8');
    }

    // Dynamic checklist of key measurements
    if (checklist) {
      const keyItems = ['Shoulder', 'Bust', 'Waist', 'Armhole', 'Length'];
      checklist.innerHTML = keyItems.map(k => {
        const found = profile.find(p => p.name.toLowerCase().includes(k.toLowerCase()));
        const isRecorded = found && found.value != null;
        return `
          <div class="fit-check-row">
            <span class="fit-dot" style="background:${isRecorded ? 'var(--c-lime, #b4f039)' : 'rgba(255,255,255,0.2)'};"></span>
            <span class="fit-name">${found ? found.name : k}</span>
            <i data-lucide="${isRecorded ? 'check' : 'minus'}" class="fit-tick" style="color:${isRecorded ? 'var(--c-lime, #b4f039)' : 'var(--c-text-muted)'};"></i>
          </div>
        `;
      }).join('');
      if (window.lucide) window.lucide.createIcons();
    }

    if (callout) {
      if (percent === 100) {
        callout.textContent = `All ${totalPoints} tailored measurements recorded for ${State.activeGarment}.`;
      } else if (comp && comp.variance && Object.keys(comp.variance).length > 0) {
        callout.textContent = `Differences identified between Current and Old fittings.`;
      } else if (filledPoints > 0) {
        callout.textContent = `${filledPoints} of ${totalPoints} tailored points recorded for ${State.activeGarment}.`;
      } else {
        callout.textContent = `No measurements recorded yet for ${State.activeGarment}.`;
      }
    }
  }

  // ==========================================================================
  // 13. NOTES LIST & PERSISTENCE
  // ==========================================================================
  function initNotesList() {
    const list = document.getElementById('notesList');
    if (!list) return;

    if (!CustomerData.notes || CustomerData.notes.length === 0) {
      list.innerHTML = `
        <li class="note-item empty" style="color: var(--c-text-muted); font-style: italic; list-style: none;">
          No fit notes recorded for this customer yet.
        </li>
      `;
      return;
    }

    list.innerHTML = CustomerData.notes.map(note => `
      <li class="note-item">${note}</li>
    `).join('');
  }

  function initAddNoteModal() {
    const modal = document.getElementById('addNoteModal');
    const openBtn = document.getElementById('openAddNoteModalBtn');
    const closeBtn = document.getElementById('closeAddNoteBtn');
    const cancelBtn = document.getElementById('cancelAddNoteBtn');
    const confirmBtn = document.getElementById('confirmAddNoteBtn');
    const noteInput = document.getElementById('newNoteInput');

    if (!modal) return;

    function openModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      if (noteInput) {
        noteInput.value = '';
        setTimeout(() => noteInput.focus(), 100);
      }
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const text = noteInput ? noteInput.value.trim() : '';
        if (!text) {
          showToast('Please enter a note before saving', 'error');
          return;
        }

        CustomerData.notes.unshift(text);
        initNotesList();
        closeModal();

        // Persist note with active garment measurement to database
        if (State.customerMobile) {
          try {
            const { default: api } = await import('../../api.js');
            const payload = {
              garmentType: State.activeGarment.toUpperCase(),
              notes: text,
              unit: 'in',
              recordedBy: 'Master Tailor'
            };
            const profile = GarmentProfiles[State.activeGarment] || GarmentProfiles.Blouse;
            profile.forEach(p => {
              if (p.value != null) payload[p.key] = p.value;
            });
            await api.customers.bodyMeasurements.save(State.customerMobile, payload);
            showToast('Fit note persisted to database');
            await syncCurrentGarmentFromApi();
          } catch (err) {
            console.warn('[Measurement360] Note persistence note:', err.message);
            showToast('Note recorded locally');
          }
        }
      });
    }
  }

  // ==========================================================================
  // 14. TOAST NOTIFICATION UTILITY
  // ==========================================================================
  function showToast(message, type = 'success') {
    const stack = document.getElementById('toastStack');
    if (!stack) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle'}" class="toast-icon"></i>
      <span>${message}</span>
    `;

    stack.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 240ms ease';
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  // Expose methods for test automation & hooks
  window.HauloMeasurements = {
    State,
    CustomerData,
    GarmentProfiles,
    loadCustomerAndMeasurementsFromApi,
    syncCurrentGarmentFromApi,
    showToast
  };

})();
