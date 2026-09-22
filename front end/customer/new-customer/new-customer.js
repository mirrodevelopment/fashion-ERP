/* ============================================================
   HAULO BOUTIQUE ERP — NEW CUSTOMER WORKSPACE CONTROLLER
   File: front end/customer/new-customer/new-customer.js
   Mirrors new-order UX, Indian mobile & address formatting,
   real-time preview sync, measurements, and draft persistence.
   ============================================================ */

'use strict';

// ─── Global State ───
const customerState = {
  avatarDataUrl: '',
  salutation: 'Ms.',
  firstName: '',
  lastName: '',
  gender: 'Female',
  dob: '',
  anniversary: '',
  notes: '',
  phone: '',
  whatsappEnabled: true,
  altPhone: '',
  email: '',
  instagram: '',
  prefChannel: 'WhatsApp',
  address: '',
  city: '',
  locality: '',
  state: '',
  pincode: '',
  landmark: '',
  styles: [],
  colors: [],
  fit: '',
  allergies: '',
  measurementUnit: 'in',
  measurementMode: 'bespoke',
  activeGarment: 'BLOUSE',
  measurements: {
    bust: 0,
    waist: 0,
    hip: 0,
    shoulder: 0,
    frontNeck: 0,
    backNeck: 0,
    armhole: 0,
    fullLength: 0,
  },
  tier: 'Standard',
  stylist: '',
  referral: '',
  openingCredit: 0,
  creditLimit: 0,
};




// City to State & Locality Presets
const INDIAN_CITY_PRESETS = {
  Chennai: { state: 'Tamil Nadu', locality: 'T. Nagar', pincode: '600017' },
  Mumbai: { state: 'Maharashtra', locality: 'Bandra West', pincode: '400050' },
  Bengaluru: { state: 'Karnataka', locality: 'Indiranagar', pincode: '560038' },
  'New Delhi': { state: 'Delhi NCR', locality: 'South Extension II', pincode: '110049' },
  Hyderabad: { state: 'Telangana', locality: 'Jubilee Hills', pincode: '500033' },
  Kolkata: { state: 'West Bengal', locality: 'Ballygunge', pincode: '700019' },
  Kochi: { state: 'Kerala', locality: 'Panampilly Nagar', pincode: '682036' },
  Ahmedabad: { state: 'Gujarat', locality: 'Bodakdev', pincode: '380054' },
  Pune: { state: 'Maharashtra', locality: 'Koregaon Park', pincode: '411001' },
};

// ─── DOM References Cache ───
let dom = {};

function cacheDom() {
  dom = {
    form: document.getElementById('newCustomerForm'),
    stepper: document.getElementById('workflowStepper'),
    // Step 1
    avatarImg: document.getElementById('avatarPreviewImg'),
    avatarFallback: document.getElementById('avatarFallback'),
    avatarInitials: document.getElementById('avatarInitials'),
    avatarFileInput: document.getElementById('avatarFileInput'),
    btnRemoveAvatar: document.getElementById('btnRemoveAvatar'),
    salutationSelect: document.getElementById('salutationSelect'),
    firstNameInput: document.getElementById('firstNameInput'),
    lastNameInput: document.getElementById('lastNameInput'),
    dobInput: document.getElementById('dobInput'),
    anniversaryInput: document.getElementById('anniversaryInput'),
    clientNotesInput: document.getElementById('clientNotesInput'),
    // Step 2
    primaryMobileInput: document.getElementById('primaryMobileInput'),
    whatsappToggle: document.getElementById('whatsappToggle'),
    whatsappTag: document.getElementById('whatsappTag'),
    altPhoneInput: document.getElementById('altPhoneInput'),
    emailInput: document.getElementById('emailInput'),
    instagramInput: document.getElementById('instagramInput'),
    prefChannelSelect: document.getElementById('prefChannelSelect'),
    // Step 3
    streetAddressInput: document.getElementById('streetAddressInput'),
    citySelect: document.getElementById('citySelect'),
    localityInput: document.getElementById('localityInput'),
    stateSelect: document.getElementById('stateSelect'),
    pincodeInput: document.getElementById('pincodeInput'),
    landmarkInput: document.getElementById('landmarkInput'),
    // Step 4
    garmentChipsWrap: document.getElementById('garmentChipsWrap'),
    colorPaletteWrap: document.getElementById('colorPaletteWrap'),
    fitPreferenceSelect: document.getElementById('fitPreferenceSelect'),
    fabricAllergyInput: document.getElementById('fabricAllergyInput'),
    prefNeckSelect: document.getElementById('prefNeckSelect'),
    prefSleeveSelect: document.getElementById('prefSleeveSelect'),
    prefOccasionsInput: document.getElementById('prefOccasionsInput'),
    prefDeliverySelect: document.getElementById('prefDeliverySelect'),
    // Step 5
    unitInchesBtn: document.getElementById('unitInchesBtn'),
    unitCmBtn: document.getElementById('unitCmBtn'),
    standardSizeView: document.getElementById('standardSizeView'),
    measurementsGrid: document.getElementById('measurementsGrid'),
    measBust: document.getElementById('measBust'),
    measUnderbust: document.getElementById('measUnderbust'),
    measWaist: document.getElementById('measWaist'),
    measHighHip: document.getElementById('measHighHip'),
    measLowHip: document.getElementById('measLowHip'),
    measShoulder: document.getElementById('measShoulder'),
    measFrontNeck: document.getElementById('measFrontNeck'),
    measBackNeck: document.getElementById('measBackNeck'),
    measArmhole: document.getElementById('measArmhole'),
    measFullLength: document.getElementById('measFullLength'),
    // Step 6
    assignedStylistSelect: document.getElementById('assignedStylistSelect'),
    referralSelect: document.getElementById('referralSelect'),
    openingCreditInput: document.getElementById('openingCreditInput'),
    creditLimitInput: document.getElementById('creditLimitInput'),
    // Right Preview Card
    sumAvatarImg: document.getElementById('sumAvatarImg'),
    sumAvatarFallback: document.getElementById('sumAvatarFallback'),
    sumAvatarInitials: document.getElementById('sumAvatarInitials'),
    sumClientName: document.getElementById('sumClientName'),
    sumTierBadge: document.getElementById('sumTierBadge'),
    sumClientId: document.getElementById('sumClientId'),
    sumPhone: document.getElementById('sumPhone'),
    sumWhatsappBadge: document.getElementById('sumWhatsappBadge'),
    sumEmail: document.getElementById('sumEmail'),
    sumLocation: document.getElementById('sumLocation'),
    sumStyleTags: document.getElementById('sumStyleTags'),
    sumMeasDims: document.getElementById('sumMeasDims'),
    sumStylist: document.getElementById('sumStylist'),
    sumVipIcon: document.getElementById('sumVipIcon'),
    // Readiness
    readinessPercent: document.getElementById('readinessPercent'),
    readinessBar: document.getElementById('readinessBar'),
    chkIdentity: document.getElementById('chkIdentity'),
    chkContact: document.getElementById('chkContact'),
    chkAddress: document.getElementById('chkAddress'),
    chkStyle: document.getElementById('chkStyle'),
    chkMeasurements: document.getElementById('chkMeasurements'),
    chkAccount: document.getElementById('chkAccount'),
    // Modal
    successModal: document.getElementById('successModal'),
    modalCustomerSubtitle: document.getElementById('modalCustomerSubtitle'),
    modalCustomerSummary: document.getElementById('modalCustomerSummary'),
    toastContainer: document.getElementById('toastContainer'),
  };
}

// ─── Horizontal Stepper Smooth Scroll ───
function initStepper() {
  const steps = [
    { num: 1, target: 'cardIdentity' },
    { num: 2, target: 'cardContact' },
    { num: 3, target: 'cardAddress' },
    { num: 4, target: 'cardStyleDNA' },
    { num: 5, target: 'cardMeasurements' },
    { num: 6, target: 'cardAccount' },
  ];

  document.querySelectorAll('.step-node').forEach(node => {
    node.addEventListener('click', () => {
      const stepNum = parseInt(node.getAttribute('data-step'), 10);
      const match = steps.find(s => s.num === stepNum);
      if (match) {
        const el = document.getElementById(match.target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight card briefly
          el.style.boxShadow = '0 0 0 2px var(--lime), 0 14px 40px rgba(0,0,0,0.5)';
          setTimeout(() => {
            el.style.boxShadow = '';
          }, 1200);

          // Update active stepper state
          document.querySelectorAll('.step-node').forEach(n => n.classList.remove('active'));
          node.classList.add('active');
        }
      }
    });
  });
}

// ─── Avatar Photo Handling ───
function handleAvatarFileSelect(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      customerState.avatarDataUrl = e.target.result;
      if (dom.avatarImg) {
        dom.avatarImg.src = customerState.avatarDataUrl;
        dom.avatarImg.style.display = 'block';
      }
      if (dom.avatarFallback) dom.avatarFallback.style.display = 'none';
      if (dom.btnRemoveAvatar) dom.btnRemoveAvatar.style.display = 'inline-block';

      // Update right preview avatar
      if (dom.sumAvatarImg) {
        dom.sumAvatarImg.src = customerState.avatarDataUrl;
        dom.sumAvatarImg.style.display = 'block';
      }
      if (dom.sumAvatarFallback) dom.sumAvatarFallback.style.display = 'none';

      showToast('Client portrait uploaded.', 'success');
    };
    reader.readAsDataURL(file);
  }
}

function removeAvatar() {
  customerState.avatarDataUrl = '';
  if (dom.avatarImg) {
    dom.avatarImg.src = '';
    dom.avatarImg.style.display = 'none';
  }
  if (dom.avatarFallback) dom.avatarFallback.style.display = 'flex';
  if (dom.btnRemoveAvatar) dom.btnRemoveAvatar.style.display = 'none';
  if (dom.avatarFileInput) dom.avatarFileInput.value = '';

  if (dom.sumAvatarImg) {
    dom.sumAvatarImg.src = '';
    dom.sumAvatarImg.style.display = 'none';
  }
  if (dom.sumAvatarFallback) dom.sumAvatarFallback.style.display = 'flex';

  syncCustomerPreview();
  showToast('Client portrait removed.', 'info');
}

// Trigger upload click
document.addEventListener('click', e => {
  if (e.target.closest('#btnTriggerUpload')) {
    if (dom.avatarFileInput) dom.avatarFileInput.click();
  }
});

// ─── Gender Change ───
function handleGenderChange(genderVal) {
  customerState.gender = genderVal;
  document.querySelectorAll('.gender-pill').forEach(pill => {
    const radio = pill.querySelector('input');
    pill.classList.toggle('active', radio && radio.value === genderVal);
  });
  updateReadinessProgress();
}

// ─── Indian Mobile Number Masking ───
function handlePhoneInput(input) {
  // Allow only digits and space
  let val = input.value.replace(/[^\d]/g, '');
  if (val.length > 10) val = val.substring(0, 10);

  // Format as XXXXX XXXXX
  if (val.length > 5) {
    input.value = val.substring(0, 5) + ' ' + val.substring(5);
  } else {
    input.value = val;
  }
  customerState.phone = input.value;
  syncCustomerPreview();
  updateReadinessProgress();
}

// ─── Indian City Selection Preset ───
function handleCityChange(selectedCity) {
  customerState.city = selectedCity;
  const preset = INDIAN_CITY_PRESETS[selectedCity];
  if (preset) {
    if (dom.stateSelect) dom.stateSelect.value = preset.state;
    if (dom.localityInput) dom.localityInput.value = preset.locality;
    if (dom.pincodeInput) dom.pincodeInput.value = preset.pincode;
  }
  syncCustomerPreview();
  updateReadinessProgress();
}

// ─── Garment Chips Multi-Select ───
function toggleGarmentChip(button) {
  const style = button.getAttribute('data-style');
  const index = customerState.styles.indexOf(style);
  if (index > -1) {
    customerState.styles.splice(index, 1);
    button.classList.remove('active');
  } else {
    customerState.styles.push(style);
    button.classList.add('active');
  }
  syncCustomerPreview();
  updateReadinessProgress();
}

// ─── Color Swatches Multi-Select ───
function toggleColorSwatch(button) {
  const color = button.getAttribute('data-color');
  const index = customerState.colors.indexOf(color);
  if (index > -1) {
    customerState.colors.splice(index, 1);
    button.classList.remove('active');
  } else {
    customerState.colors.push(color);
    button.classList.add('active');
  }
  updateReadinessProgress();
}

// ─── Measurement Modes & Units ───
function toggleMeasuringMode(mode) {
  customerState.measurementMode = mode;
  document.getElementById('pillCustomTape').classList.toggle('active', mode === 'bespoke');
  document.getElementById('pillStandardSizing').classList.toggle('active', mode === 'standard');

  if (dom.standardSizeView) {
    dom.standardSizeView.style.display = mode === 'standard' ? 'block' : 'none';
  }
  syncCustomerPreview();
  updateReadinessProgress();
}

function selectStandardSize(button, sizeNum) {
  document.querySelectorAll('.std-pill').forEach(p => p.classList.remove('active'));
  button.classList.add('active');

  // Preset measurements for standard sizes
  const presets = {
    32: { bust: 32, underbust: 27, waist: 26, highHip: 33.5, lowHip: 36.5, shoulder: 14 },
    34: { bust: 34, underbust: 29, waist: 28, highHip: 35.5, lowHip: 38.5, shoulder: 14.5 },
    36: { bust: 36, underbust: 31, waist: 30, highHip: 37.5, lowHip: 40.5, shoulder: 15 },
    38: { bust: 38, underbust: 33, waist: 32, highHip: 39.5, lowHip: 42.5, shoulder: 15.5 },
    40: { bust: 40, underbust: 35, waist: 34, highHip: 41.5, lowHip: 44.5, shoulder: 16 },
    42: { bust: 42, underbust: 37, waist: 36, highHip: 43.5, lowHip: 46.5, shoulder: 16.5 },
  };

  const p = presets[sizeNum] || presets[34];
  const unit = customerState.measurementUnit;
  const factor = unit === 'cm' ? 2.54 : 1;

  if (dom.measBust) dom.measBust.value = (p.bust * factor).toFixed(1);
  if (dom.measUnderbust) dom.measUnderbust.value = (p.underbust * factor).toFixed(1);
  if (dom.measWaist) dom.measWaist.value = (p.waist * factor).toFixed(1);
  if (dom.measHighHip) dom.measHighHip.value = (p.highHip * factor).toFixed(1);
  if (dom.measLowHip) dom.measLowHip.value = (p.lowHip * factor).toFixed(1);
  if (dom.measShoulder) dom.measShoulder.value = (p.shoulder * factor).toFixed(1);

  syncCustomerPreview();
  showToast(`Standard Size ${sizeNum} measurements loaded.`, 'info');
}

// ─── Precision Haute Couture Garment Specifications ───
const TAILORING_GARMENT_SPECS = {
  BLOUSE: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 34.0 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.0 },
    { key: 'waist', label: 'Waist', defaultVal: 28.0 },
    { key: 'blouseLength', label: 'Blouse Length', defaultVal: 14.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 15.5 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 10.5 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 11.0 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 10.0 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 8.0 },
    { key: 'bustPoint', label: 'Bust Point', defaultVal: 9.5 },
    { key: 'bustPointToBustPoint', label: 'Bust Point to Bust Point', defaultVal: 7.5 },
    { key: 'shoulderToBust', label: 'Shoulder to Bust', defaultVal: 9.5 },
    { key: 'shoulderToWaist', label: 'Shoulder to Waist', defaultVal: 14.0 },
    { key: 'frontWidth', label: 'Front Width', defaultVal: 13.5 },
    { key: 'backWidth', label: 'Back Width', defaultVal: 14.0 }
  ],
  CHUDI: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 35.0 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.5 },
    { key: 'waist', label: 'Waist', defaultVal: 29.0 },
    { key: 'hip', label: 'Hip', defaultVal: 38.0 },
    { key: 'topLength', label: 'Top Length', defaultVal: 40.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 16.0 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 18.0 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 10.5 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 9.5 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 7.0 },
    { key: 'frontWidth', label: 'Front Width', defaultVal: 13.5 },
    { key: 'backWidth', label: 'Back Width', defaultVal: 14.0 },
    { key: 'pantWaist', label: 'Pant Waist', defaultVal: 30.0 },
    { key: 'pantHip', label: 'Pant Hip', defaultVal: 40.0 },
    { key: 'pantLength', label: 'Pant Length', defaultVal: 39.0 },
    { key: 'thighRound', label: 'Thigh Round', defaultVal: 22.0 },
    { key: 'kneeRound', label: 'Knee Round', defaultVal: 15.0 },
    { key: 'calfRound', label: 'Calf Round', defaultVal: 13.0 },
    { key: 'ankleRound', label: 'Ankle Round', defaultVal: 10.0 },
    { key: 'crotchLength', label: 'Crotch Length', defaultVal: 26.0 },
    { key: 'bottomOpening', label: 'Bottom Opening', defaultVal: 12.0 }
  ],
  LEHENGA: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 34.0 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.0 },
    { key: 'waist', label: 'Waist', defaultVal: 28.0 },
    { key: 'hip', label: 'Hip', defaultVal: 38.0 },
    { key: 'blouseLength', label: 'Blouse Length', defaultVal: 14.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 15.5 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 10.5 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 11.0 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 10.0 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 8.0 },
    { key: 'bustPoint', label: 'Bust Point', defaultVal: 9.5 },
    { key: 'bustPointToBustPoint', label: 'Bust Point to Bust Point', defaultVal: 7.5 },
    { key: 'shoulderToBust', label: 'Shoulder to Bust', defaultVal: 9.5 },
    { key: 'shoulderToWaist', label: 'Shoulder to Waist', defaultVal: 14.0 },
    { key: 'skirtLength', label: 'Skirt Length', defaultVal: 42.0 },
    { key: 'waistToHip', label: 'Waist to Hip', defaultVal: 8.0 },
    { key: 'flare', label: 'Flare', defaultVal: 120.0 },
    { key: 'bottomOpening', label: 'Bottom Opening', defaultVal: 140.0 }
  ],
  SAREE: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 34.0 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.0 },
    { key: 'waist', label: 'Waist', defaultVal: 28.0 },
    { key: 'blouseLength', label: 'Blouse Length', defaultVal: 14.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 15.5 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 10.5 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 11.0 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 10.0 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 8.0 },
    { key: 'bustPoint', label: 'Bust Point', defaultVal: 9.5 },
    { key: 'bustPointToBustPoint', label: 'Bust Point to Bust Point', defaultVal: 7.5 },
    { key: 'shoulderToBust', label: 'Shoulder to Bust', defaultVal: 9.5 },
    { key: 'shoulderToWaist', label: 'Shoulder to Waist', defaultVal: 14.0 },
    { key: 'frontWidth', label: 'Front Width', defaultVal: 13.5 },
    { key: 'backWidth', label: 'Back Width', defaultVal: 14.0 }
  ],
  GOWN: [
    { key: 'shoulder', label: 'Shoulder', defaultVal: 14.5 },
    { key: 'bust', label: 'Bust', defaultVal: 34.5 },
    { key: 'underBust', label: 'Under Bust', defaultVal: 29.5 },
    { key: 'waist', label: 'Waist', defaultVal: 28.5 },
    { key: 'hip', label: 'Hip', defaultVal: 38.5 },
    { key: 'fullLength', label: 'Full Length', defaultVal: 56.0 },
    { key: 'armhole', label: 'Armhole', defaultVal: 16.0 },
    { key: 'upperArm', label: 'Upper Arm', defaultVal: 11.5 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 22.0 },
    { key: 'sleeveRound', label: 'Sleeve Round', defaultVal: 10.5 },
    { key: 'elbowRound', label: 'Elbow Round', defaultVal: 9.5 },
    { key: 'wristRound', label: 'Wrist Round', defaultVal: 6.5 },
    { key: 'frontNeckDepth', label: 'Front Neck Depth', defaultVal: 6.5 },
    { key: 'backNeckDepth', label: 'Back Neck Depth', defaultVal: 7.5 },
    { key: 'bustPoint', label: 'Bust Point', defaultVal: 9.5 },
    { key: 'bustPointToBustPoint', label: 'Bust Point to Bust Point', defaultVal: 7.5 },
    { key: 'shoulderToBust', label: 'Shoulder to Bust', defaultVal: 9.5 },
    { key: 'shoulderToWaist', label: 'Shoulder to Waist', defaultVal: 14.0 },
    { key: 'waistToHip', label: 'Waist to Hip', defaultVal: 8.0 },
    { key: 'flare', label: 'Flare', defaultVal: 140.0 },
    { key: 'bottomOpening', label: 'Bottom Opening', defaultVal: 150.0 }
  ]
};

function renderMeasurementFields(garmentKey) {
  const container = document.getElementById('measurementsGrid');
  if (!container) return;
  const normalizedKey = (garmentKey || 'BLOUSE').toUpperCase();
  const specs = TAILORING_GARMENT_SPECS[normalizedKey] || TAILORING_GARMENT_SPECS.BLOUSE;
  const unit = customerState.measurementUnit === 'cm' ? 'cm' : '"';

  container.innerHTML = specs.map(pt => `
    <div class="meas-field">
      <span class="meas-label">${pt.label}</span>
      <div class="meas-input-wrap">
        <input type="number" id="meas_${pt.key}" data-point="${pt.key}" class="form-input meas-num" 
          value="${pt.defaultVal}" step="0.25" min="1" max="250" oninput="syncCustomerPreview()" />
        <span class="meas-unit">${unit}</span>
      </div>
    </div>
  `).join('');
}

window.switchMeasGarment = function(garmentKey, btnEl) {
  customerState.activeGarment = garmentKey;
  document.querySelectorAll('#measGarmentPills .btn-garment-pill').forEach(p => {
    p.classList.remove('active');
    p.style.background = 'rgba(255,255,255,0.05)';
    p.style.color = 'var(--text-muted, #94a3b8)';
  });
  if (btnEl) {
    btnEl.classList.add('active');
    btnEl.style.background = 'var(--accent, #ec4899)';
    btnEl.style.color = '#fff';
  }
  renderMeasurementFields(garmentKey);
  syncCustomerPreview();
};

function toggleMeasurementUnit(unit) {
  if (customerState.measurementUnit === unit) return;
  customerState.measurementUnit = unit;

  if (dom.unitInchesBtn) dom.unitInchesBtn.classList.toggle('active', unit === 'in');
  if (dom.unitCmBtn) dom.unitCmBtn.classList.toggle('active', unit === 'cm');

  const unitSymbol = unit === 'in' ? '"' : 'cm';
  const factor = unit === 'cm' ? 2.54 : 1 / 2.54;

  document.querySelectorAll('#measurementsGrid input[data-point]').forEach(input => {
    if (input && input.value) {
      const currentVal = parseFloat(input.value);
      if (!isNaN(currentVal)) {
        input.value = (currentVal * factor).toFixed(1);
      }
    }
  });

  // Update unit label spans
  document.querySelectorAll('#measurementsGrid .meas-unit').forEach(span => {
    span.textContent = unitSymbol;
  });

  syncCustomerPreview();
}

// ─── Membership Tier Switcher ───
function handleTierChange(tierVal) {
  customerState.tier = tierVal;
  document.getElementById('tierPlatinumCard').classList.toggle('active', tierVal === 'VIP Platinum');
  document.getElementById('tierGoldCard').classList.toggle('active', tierVal === 'VIP Gold');
  document.getElementById('tierRegularCard').classList.toggle('active', tierVal === 'Regular');

  syncCustomerPreview();
  updateReadinessProgress();
}

// ─── Real-Time Sync with Right Column Live Preview ───
function syncCustomerPreview() {
  const salutation = dom.salutationSelect ? dom.salutationSelect.value : 'Ms.';
  const firstName = dom.firstNameInput ? dom.firstNameInput.value.trim() : '';
  const lastName = dom.lastNameInput ? dom.lastNameInput.value.trim() : '';
  const hasName = firstName || lastName;
  const fullName = hasName ? `${salutation} ${firstName} ${lastName}`.trim() : '—';

  // 1. Name & Primary Mobile Identity
  if (dom.sumClientName) dom.sumClientName.textContent = fullName;
  const rawPhone = dom.primaryMobileInput ? dom.primaryMobileInput.value.trim() : '';
  const displayMobile = rawPhone ? `+91 ${rawPhone}` : (customerState.phone ? `+91 ${customerState.phone}` : '—');
  if (dom.sumClientId) dom.sumClientId.textContent = displayMobile;

  // 2. Initials Fallback
  const initials = hasName ? ((firstName.charAt(0) || '') + (lastName.charAt(0) || '')).toUpperCase() : '—';
  if (dom.avatarInitials) dom.avatarInitials.textContent = initials;
  if (dom.sumAvatarInitials) dom.sumAvatarInitials.textContent = initials;

  // 3. Tier Badge & VIP Icon
  if (dom.sumTierBadge) {
    dom.sumTierBadge.textContent = customerState.tier;
    dom.sumTierBadge.className = 'tier-pill-badge ' + (customerState.tier === 'VIP Platinum' ? 'platinum' : customerState.tier === 'VIP Gold' ? 'gold' : 'regular');
  }
  if (dom.sumVipIcon) {
    dom.sumVipIcon.textContent = customerState.tier === 'VIP Platinum' ? '👑' : customerState.tier === 'VIP Gold' ? '⭐' : '';
    dom.sumVipIcon.style.display = customerState.tier === 'Regular' ? 'none' : 'block';
  }

  // 4. Contact Details
  if (dom.sumPhone) {
    dom.sumPhone.textContent = rawPhone ? `+91 ${rawPhone}` : '—';
  }

  const isWhatsapp = dom.whatsappToggle ? dom.whatsappToggle.checked : true;
  if (dom.sumWhatsappBadge) {
    dom.sumWhatsappBadge.style.display = isWhatsapp ? 'inline-flex' : 'none';
  }
  if (dom.whatsappTag) {
    dom.whatsappTag.style.display = isWhatsapp ? 'inline-flex' : 'none';
  }

  const email = dom.emailInput ? dom.emailInput.value.trim() : '';
  if (dom.sumEmail) dom.sumEmail.textContent = email || '—';

  const locality = dom.localityInput ? dom.localityInput.value.trim() : '';
  const city = dom.citySelect ? dom.citySelect.value : '';
  if (dom.sumLocation) dom.sumLocation.textContent = locality && city ? `${locality}, ${city}` : (city || locality || '—');

  // 5. Style DNA Tags
  if (dom.sumStyleTags) {
    if (customerState.styles.length === 0) {
      dom.sumStyleTags.innerHTML = '<span class="p-tag" style="opacity:0.6;">No styles selected</span>';
    } else {
      dom.sumStyleTags.innerHTML = customerState.styles
        .slice(0, 4)
        .map(s => `<span class="p-tag">${s}</span>`)
        .join('');
      if (customerState.styles.length > 4) {
        dom.sumStyleTags.innerHTML += `<span class="p-tag">+${customerState.styles.length - 4} more</span>`;
      }
    }
  }

  // 6. Measurements Preview
  const bustVal = dom.measBust ? dom.measBust.value : '34';
  const waistVal = dom.measWaist ? dom.measWaist.value : '28';
  const hipVal = dom.measLowHip ? dom.measLowHip.value : '38.5';
  const unit = customerState.measurementUnit === 'in' ? '"' : 'cm';

  if (dom.sumMeasDims) {
    dom.sumMeasDims.textContent = `${bustVal}${unit} — ${waistVal}${unit} — ${hipVal}${unit}`;
  }

  // 7. Assigned Stylist
  const stylist = dom.assignedStylistSelect ? dom.assignedStylistSelect.value.split('(')[0].trim() : '';
  if (dom.sumStylist) dom.sumStylist.textContent = stylist || '—';

  updateReadinessProgress();
}

// ─── Dynamic Onboarding Readiness Checklist ───
function updateReadinessProgress() {
  let score = 0;
  const total = 6;

  // 1. Identity Check
  const hasName = dom.firstNameInput && dom.firstNameInput.value.trim() !== '' && dom.lastNameInput && dom.lastNameInput.value.trim() !== '';
  if (hasName) score++;
  if (dom.chkIdentity) dom.chkIdentity.classList.toggle('completed', hasName);

  // 2. Contact Check
  const rawPhone = dom.primaryMobileInput ? dom.primaryMobileInput.value.replace(/[^\d]/g, '') : '';
  const hasPhone = rawPhone.length === 10;
  if (hasPhone) score++;
  if (dom.chkContact) dom.chkContact.classList.toggle('completed', hasPhone);

  // 3. Address Check
  const hasAddress = dom.streetAddressInput && dom.streetAddressInput.value.trim() !== '' && dom.localityInput && dom.localityInput.value.trim() !== '';
  if (hasAddress) score++;
  if (dom.chkAddress) dom.chkAddress.classList.toggle('completed', hasAddress);

  // 4. Style DNA Check
  const hasStyles = customerState.styles.length > 0;
  if (hasStyles) score++;
  if (dom.chkStyle) dom.chkStyle.classList.toggle('completed', hasStyles);

  // 5. Measurements Check
  const hasMeas = dom.measBust && parseFloat(dom.measBust.value) > 0 && dom.measWaist && parseFloat(dom.measWaist.value) > 0;
  if (hasMeas) score++;
  if (dom.chkMeasurements) dom.chkMeasurements.classList.toggle('completed', hasMeas);

  // 6. Account Check
  const hasAccount = !!customerState.tier && dom.assignedStylistSelect && dom.assignedStylistSelect.value !== '';
  if (hasAccount) score++;
  if (dom.chkAccount) dom.chkAccount.classList.toggle('completed', hasAccount);

  // Progress Bar & Percentage
  const percent = Math.round((score / total) * 100);
  if (dom.readinessPercent) dom.readinessPercent.textContent = `${percent}%`;
  if (dom.readinessBar) dom.readinessBar.style.width = `${percent}%`;
}

// ─── Draft Management (LocalStorage) ───
const DRAFT_KEY = 'haulo_new_customer_draft';

function saveCustomerDraft() {
  const draftData = {
    salutation: dom.salutationSelect ? dom.salutationSelect.value : 'Ms.',
    firstName: dom.firstNameInput ? dom.firstNameInput.value : '',
    lastName: dom.lastNameInput ? dom.lastNameInput.value : '',
    gender: customerState.gender,
    dob: dom.dobInput ? dom.dobInput.value : '',
    anniversary: dom.anniversaryInput ? dom.anniversaryInput.value : '',
    notes: dom.clientNotesInput ? dom.clientNotesInput.value : '',
    phone: dom.primaryMobileInput ? dom.primaryMobileInput.value : '',
    whatsappEnabled: dom.whatsappToggle ? dom.whatsappToggle.checked : true,
    altPhone: dom.altPhoneInput ? dom.altPhoneInput.value : '',
    email: dom.emailInput ? dom.emailInput.value : '',
    instagram: dom.instagramInput ? dom.instagramInput.value : '',
    prefChannel: dom.prefChannelSelect ? dom.prefChannelSelect.value : 'WhatsApp',
    address: dom.streetAddressInput ? dom.streetAddressInput.value : '',
    city: dom.citySelect ? dom.citySelect.value : 'Chennai',
    locality: dom.localityInput ? dom.localityInput.value : '',
    state: dom.stateSelect ? dom.stateSelect.value : 'Tamil Nadu',
    pincode: dom.pincodeInput ? dom.pincodeInput.value : '',
    landmark: dom.landmarkInput ? dom.landmarkInput.value : '',
    styles: customerState.styles,
    colors: customerState.colors,
    fit: dom.fitPreferenceSelect ? dom.fitPreferenceSelect.value : 'Structured Corseted',
    allergies: dom.fabricAllergyInput ? dom.fabricAllergyInput.value : '',
    tier: customerState.tier,
    stylist: dom.assignedStylistSelect ? dom.assignedStylistSelect.value : '',
    referral: dom.referralSelect ? dom.referralSelect.value : '',
    openingCredit: dom.openingCreditInput ? dom.openingCreditInput.value : 0,
    creditLimit: dom.creditLimitInput ? dom.creditLimitInput.value : 25000,
    timestamp: new Date().toISOString(),
  };

  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    showToast('Customer profile draft saved to this browser.', 'success');
  } catch (err) {
    showToast('Could not save draft: storage full.', 'error');
  }
}

function restoreCustomerDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (!draft || !draft.firstName) return;

    if (dom.salutationSelect) dom.salutationSelect.value = draft.salutation || 'Ms.';
    if (dom.firstNameInput) dom.firstNameInput.value = draft.firstName || '';
    if (dom.lastNameInput) dom.lastNameInput.value = draft.lastName || '';
    if (draft.gender) handleGenderChange(draft.gender);
    if (dom.dobInput) dom.dobInput.value = draft.dob || '';
    if (dom.anniversaryInput) dom.anniversaryInput.value = draft.anniversary || '';
    if (dom.clientNotesInput) dom.clientNotesInput.value = draft.notes || '';
    if (dom.primaryMobileInput) dom.primaryMobileInput.value = draft.phone || '';
    if (dom.whatsappToggle) dom.whatsappToggle.checked = draft.whatsappEnabled !== false;
    if (dom.altPhoneInput) dom.altPhoneInput.value = draft.altPhone || '';
    if (dom.emailInput) dom.emailInput.value = draft.email || '';
    if (dom.instagramInput) dom.instagramInput.value = draft.instagram || '';
    if (dom.prefChannelSelect) dom.prefChannelSelect.value = draft.prefChannel || 'WhatsApp';
    if (dom.streetAddressInput) dom.streetAddressInput.value = draft.address || '';
    if (dom.citySelect) dom.citySelect.value = draft.city || 'Chennai';
    if (dom.localityInput) dom.localityInput.value = draft.locality || '';
    if (dom.stateSelect) dom.stateSelect.value = draft.state || 'Tamil Nadu';
    if (dom.pincodeInput) dom.pincodeInput.value = draft.pincode || '';
    if (dom.landmarkInput) dom.landmarkInput.value = draft.landmark || '';

    if (Array.isArray(draft.styles)) customerState.styles = draft.styles;
    if (Array.isArray(draft.colors)) customerState.colors = draft.colors;
    if (draft.tier) handleTierChange(draft.tier);
    if (dom.assignedStylistSelect && draft.stylist) dom.assignedStylistSelect.value = draft.stylist;
    if (dom.referralSelect && draft.referral) dom.referralSelect.value = draft.referral;
    if (dom.openingCreditInput) dom.openingCreditInput.value = draft.openingCredit || 0;
    if (dom.creditLimitInput) dom.creditLimitInput.value = draft.creditLimit || 25000;

    syncCustomerPreview();
  } catch (err) {
    console.warn('[New Customer] Could not restore draft', err);
  }
}

// ─── Customer Registration Submission ───
const CUSTOMERS_REGISTRY_KEY = 'haulo_registered_customers';

function handleCustomerSubmit(event) {
  event.preventDefault();

  const firstName = dom.firstNameInput ? dom.firstNameInput.value.trim() : '';
  const lastName = dom.lastNameInput ? dom.lastNameInput.value.trim() : '';
  if (!firstName || !lastName) {
    showToast('Please provide both First Name and Last Name.', 'error');
    if (dom.firstNameInput) dom.firstNameInput.focus();
    return;
  }

  const rawPhone = dom.primaryMobileInput ? dom.primaryMobileInput.value.replace(/[^\d]/g, '') : '';
  if (rawPhone.length < 10) {
    showToast('Please enter a valid 10-digit Indian mobile number.', 'error');
    if (dom.primaryMobileInput) dom.primaryMobileInput.focus();
    return;
  }

  const salutation = dom.salutationSelect ? dom.salutationSelect.value : 'Ms.';
  const fullName = `${salutation} ${firstName} ${lastName}`.trim();
  const email = dom.emailInput ? dom.emailInput.value.trim() : '';
  const locality = dom.localityInput ? dom.localityInput.value.trim() : '';
  const city = dom.citySelect ? dom.citySelect.value : 'Chennai';
  const state = dom.stateSelect ? dom.stateSelect.value : 'Tamil Nadu';
  const fullLocation = `${locality ? locality + ', ' : ''}${city}`;
  const openingBalance = parseFloat(dom.openingCreditInput ? dom.openingCreditInput.value : 0) || 0;

  const mobileKey = `+91 ${dom.primaryMobileInput.value.trim()}`;

  // Build the complete customer record matching customer-overview.js schema
  const newCustomerRecord = {
    id: mobileKey,
    mobileNumber: mobileKey,
    name: fullName,
    avatar: customerState.avatarDataUrl || '',
    tier: customerState.tier,
    phone: mobileKey,
    email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    location: fullLocation,
    totalOrders: 0,
    ordersInProcess: 0,
    totalSpend: openingBalance,
    balance: 0,
    lastOrderDate: new Date().toISOString().slice(0, 10),
    favoriteGarment: customerState.styles.join(', ') || 'Bridal Couture',
    measurementsOnFile: true,
    // Extra Metadata
    gender: customerState.gender,
    dob: dom.dobInput ? dom.dobInput.value : '',
    anniversary: dom.anniversaryInput ? dom.anniversaryInput.value : '',
    whatsappEnabled: dom.whatsappToggle ? dom.whatsappToggle.checked : true,
    address: dom.streetAddressInput ? dom.streetAddressInput.value.trim() : '',
    pincode: dom.pincodeInput ? dom.pincodeInput.value.trim() : '',
    stylist: dom.assignedStylistSelect ? dom.assignedStylistSelect.value : '',
    measurements: {
      bust: dom.measBust ? dom.measBust.value : '34.0',
      waist: dom.measWaist ? dom.measWaist.value : '28.0',
      lowHip: dom.measLowHip ? dom.measLowHip.value : '38.5',
      unit: customerState.measurementUnit,
    },
  };

  // Save to backend API
  (async () => {
    try {
      const { default: api } = await import('../../api.js');
      await api.customers.create({
        mobileNumber: mobileKey,
        name: fullName,
        salutation: dom.salutationSelect?.value || 'Ms.',
        firstName: firstName,
        lastName: lastName,
        gender: customerState.gender || 'Female',
        phone: mobileKey,
        altPhone: dom.altPhoneInput?.value.trim() || '',
        email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        instagramHandle: dom.instagramInput?.value.trim() || '',
        preferredChannel: dom.prefChannelSelect?.value || 'WhatsApp',
        dob: dom.dobInput?.value || null,
        anniversary: dom.anniversaryInput?.value || null,
        tier: customerState.tier === 'VIP Platinum' ? 'VIP_PLATINUM' : customerState.tier === 'VIP Gold' ? 'VIP_GOLD' : 'REGULAR',
        location: fullLocation,
        streetAddress: dom.streetAddressInput?.value.trim() || '',
        city: city,
        state: state,
        pincode: dom.pincodeInput?.value.trim() || '',
        landmark: dom.landmarkInput?.value.trim() || '',
        creditLimit: dom.creditLimitInput ? (parseFloat(dom.creditLimitInput.value) || 0) : 0,
        notes: dom.clientNotesInput?.value.trim() || '',
        favoriteGarment: customerState.styles.join(', ') || 'Bridal Couture',
        fitPreference: dom.fitPreferenceSelect?.value || '',
        fabricAllergies: dom.fabricAllergyInput?.value.trim() || '',
        preferredNeck: dom.prefNeckSelect?.value || '',
        preferredSleeve: dom.prefSleeveSelect?.value || '',
        preferredOccasions: dom.prefOccasionsInput?.value.trim() || '',
        deliveryPreference: dom.prefDeliverySelect?.value || 'Standard Boutique Pickup',
        measurementsOnFile: true
      });
      console.log('[New Customer] Successfully persisted customer with Mobile PK to API!');

      // Save initial measurements to dedicated customer_body_measurements table
      const activeGarment = customerState.activeGarment || 'BLOUSE';
      const bodyMeasPayload = {
        garmentType: activeGarment,
        customerName: fullName,
        unit: customerState.measurementUnit || 'in',
        recordedBy: dom.assignedStylistSelect ? dom.assignedStylistSelect.value.split('(')[0].trim() : 'Master Tailor'
      };
      document.querySelectorAll('#measurementsGrid input[data-point]').forEach(inp => {
        const val = parseFloat(inp.value);
        if (!isNaN(val)) {
          bodyMeasPayload[inp.getAttribute('data-point')] = val;
        }
      });
      await api.customers.bodyMeasurements.save(mobileKey, bodyMeasPayload)
        .catch(mErr => console.warn('[New Customer] Body measurement save error:', mErr.message));

      // ── Upload customer avatar photo if one was selected ──────────────
      if (dom.avatarFileInput && dom.avatarFileInput.files && dom.avatarFileInput.files[0]) {
        try {
          const avatarFormData = new FormData();
          avatarFormData.append('file', dom.avatarFileInput.files[0]);
          const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token') || '';
          const cleanMobile = encodeURIComponent(mobileKey.replace(/\s/g, ''));
          const avatarResp = await fetch(`/api/v1/customers/${cleanMobile}/avatar`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: avatarFormData
          });
          if (avatarResp.ok) {
            console.log('[New Customer] Avatar image uploaded and saved to server successfully.');
            showToast('Client portrait saved to server.', 'success');
          } else {
            console.warn('[New Customer] Avatar upload returned non-OK:', avatarResp.status);
          }
        } catch (imgErr) {
          console.warn('[New Customer] Avatar upload failed (non-blocking):', imgErr.message);
        }
      }

    } catch (apiErr) {
      console.warn('[New Customer] API save failed, saved locally:', apiErr.message);
    }
  })();

  // Save to localStorage registry so customer-overview.html picks it up instantly
  try {
    const existingRaw = localStorage.getItem(CUSTOMERS_REGISTRY_KEY);
    const existingList = existingRaw ? JSON.parse(existingRaw) : [];
    existingList.unshift(newCustomerRecord);
    localStorage.setItem(CUSTOMERS_REGISTRY_KEY, JSON.stringify(existingList));
    localStorage.removeItem(DRAFT_KEY); // Clear draft after successful creation
  } catch (err) {
    console.error('[New Customer] Failed to save registry to localStorage', err);
  }

  // Populate Success Modal
  if (dom.modalCustomerSubtitle) {
    dom.modalCustomerSubtitle.textContent = `${fullName} (${mobileKey}) is now registered in the Haulo Boutique ERP.`;
  }
  if (dom.modalCustomerSummary) {
    const bustVal = document.getElementById('meas_bust')?.value || '34.0';
    const waistVal = document.getElementById('meas_waist')?.value || '28.0';
    dom.modalCustomerSummary.innerHTML = `
      <div class="m-row"><span class="m-lbl">Client Name</span><span class="m-val">${fullName}</span></div>
      <div class="m-row"><span class="m-lbl">Primary Mobile</span><span class="m-val" style="color:var(--lime);font-weight:700;">${mobileKey}</span></div>
      <div class="m-row"><span class="m-lbl">Membership Tier</span><span class="m-val" style="color:var(--lime);">${customerState.tier}</span></div>
      <div class="m-row"><span class="m-lbl">Garment Measured</span><span class="m-val" style="color:#fff;font-weight:600;">${activeGarment}</span></div>
      <div class="m-row"><span class="m-lbl">Lead Stylist</span><span class="m-val">${dom.assignedStylistSelect ? dom.assignedStylistSelect.value.split('(')[0] : ''}</span></div>
      <div class="m-row"><span class="m-lbl">Bespoke Fit</span><span class="m-val">Bust: ${bustVal}" — Waist: ${waistVal}"</span></div>
    `;
  }

  // Show Modal
  if (dom.successModal) {
    dom.successModal.style.display = 'flex';
  }

  showToast(`Customer ${fullName} registered with ${activeGarment} measurements!`, 'success');
}

function closeSuccessModal() {
  if (dom.successModal) dom.successModal.style.display = 'none';
}

function navigateToOverview() {
  window.location.href = '../customer-overview/customer-overview.html';
}

function navigateToNewOrder() {
  const mobileVal = dom.primaryMobileInput ? dom.primaryMobileInput.value.trim() : customerState.phone;
  const fullMobile = `+91 ${mobileVal}`;
  window.location.href = `../../orders/new-order/new-order.html?mobile=${encodeURIComponent(fullMobile)}`;
}

// ─── Toast Notifications Helper ───
function showToast(message, type = 'info') {
  if (!dom.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="t-icon" style="width:16px;height:16px;"></i>
    <span>${message}</span>
  `;
  dom.toastContainer.appendChild(toast);
  if (window.lucide) window.lucide.createIcons({ root: toast });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── Dynamic Stylists Loader ───
async function loadStylists() {
  if (!dom.assignedStylistSelect) return;
  try {
    const apiObj = window.api || (await import('../../api.js')).default;
    if (apiObj && apiObj.employees) {
      const emps = await apiObj.employees.list({ status: 'ACTIVE' });
      const employeeList = Array.isArray(emps) ? emps : (emps && emps.content ? emps.content : []);
      if (employeeList.length > 0) {
        const currentVal = dom.assignedStylistSelect.value;
        dom.assignedStylistSelect.innerHTML = '<option value="">Select Stylist...</option>' +
          employeeList.map(e => {
            const role = e.role || e.designation || 'Stylist';
            const label = `${e.name || 'Staff'} (${role})`;
            return `<option value="${label}">${label}</option>`;
          }).join('');
        if (currentVal) dom.assignedStylistSelect.value = currentVal;
        syncCustomerPreview();
      }
    }
  } catch (err) {
    console.warn('[New Customer] Could not load stylists from API:', err.message);
  }
}

// ─── Initializer ───
document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  initStepper();
  renderMeasurementFields('BLOUSE');
  restoreCustomerDraft();
  syncCustomerPreview();
  loadStylists();

  // Re-run icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

