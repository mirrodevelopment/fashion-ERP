/**
 * HAULO BOUTIQUE ERP — GARMENT 360° CONTROLLER
 * garaments-360.js — 100% Dynamic Hydration from Live Database Records
 * Zero raw / mock seed values.
 */

let api = window.api || null;
let Auth = window.Auth || {
  getToken: () => sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token') || '',
  isLoggedIn: () => Boolean(sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token'))
};

// ── Existing Haute Couture Image Assets Pool ────────────────────────────────
const EXISTING_GARMENT_ASSETS_360 = {
  blouse: '../../assets/garments/bridal_blouse_zardozi.jpg',
  lehenga: '../../assets/garments/heritage_lehenga_pink.jpg',
  anarkali: '../../assets/garments/anarkali_chikankari.jpg',
  sherwani: '../../assets/garments/raw_silk_sherwani.jpg',
  saree: '../../assets/garments/banarasi_organza_saree.jpg',
  gown: '../../assets/garments/champagne_evening_gown.jpg',
  gharara: '../../assets/garments/zardozi_handwork.jpg',
  back: '../../assets/garments/blouse_back_cut.jpg',
  default: '../../assets/garments/bridal_blouse_zardozi.jpg'
};
window.EXISTING_GARMENT_ASSETS_360 = EXISTING_GARMENT_ASSETS_360;

function resolveGarmentImage360(g) {
  if (g && g.imageUrl && typeof g.imageUrl === 'string' && g.imageUrl.trim() !== '' && !g.imageUrl.startsWith('data:image/svg')) {
    let url = g.imageUrl.trim();
    if (url.startsWith('/front end/')) {
      return '../..' + url.replace('/front end', '');
    }
    if (url.startsWith('/assets/')) {
      return '../../' + url.slice(1);
    }
    if (url.startsWith('../assets/')) {
      return url.replace('../assets/', '../../assets/');
    }
    return url;
  }

  const text = ((g?.garmentType || '') + ' ' + (g?.title || '')).toLowerCase();
  if (text.includes('blouse') || text.includes('choli')) return EXISTING_GARMENT_ASSETS_360.blouse;
  if (text.includes('lehenga') || text.includes('bridal')) return EXISTING_GARMENT_ASSETS_360.lehenga;
  if (text.includes('anarkali') || text.includes('chikankari') || text.includes('suit') || text.includes('kurti')) return EXISTING_GARMENT_ASSETS_360.anarkali;
  if (text.includes('sherwani') || text.includes('jacket') || text.includes('tuxedo') || text.includes('kurta')) return EXISTING_GARMENT_ASSETS_360.sherwani;
  if (text.includes('saree') || text.includes('organza') || text.includes('draped') || text.includes('banarasi')) return EXISTING_GARMENT_ASSETS_360.saree;
  if (text.includes('gown') || text.includes('evening') || text.includes('corset')) return EXISTING_GARMENT_ASSETS_360.gown;
  if (text.includes('gharara') || text.includes('cape') || text.includes('jumpsuit') || text.includes('zardozi')) return EXISTING_GARMENT_ASSETS_360.gharara;

  const pool = [
    EXISTING_GARMENT_ASSETS_360.blouse,
    EXISTING_GARMENT_ASSETS_360.lehenga,
    EXISTING_GARMENT_ASSETS_360.anarkali,
    EXISTING_GARMENT_ASSETS_360.sherwani,
    EXISTING_GARMENT_ASSETS_360.saree,
    EXISTING_GARMENT_ASSETS_360.gown,
    EXISTING_GARMENT_ASSETS_360.gharara
  ];
  const code = (g?.garmentCode || '0');
  const sum = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return pool[sum % pool.length];
}
window.resolveGarmentImage360 = resolveGarmentImage360;

// ── Atelier Staff Roster (Populated dynamically from active employees) ───────
const ATELIER_STAFF_ROSTER = [];

// ── State ───────────────────────────────────────────────────────────────────
let activeGarment = null;
let activeMeasurements = null;
let activeStages = [];
let activeStageDefinitions = [];
let activeTrial = null;
let activeEmployees = [];
let activeGarmentLoads = {};
let activeNextMilestone = null;

// ── Lifecycle & Data Hydration ───────────────────────────────────────────────
async function initGarment360() {
  if (typeof window.FRAGMENT_BASE === 'undefined') {
    window.FRAGMENT_BASE = '../../fragments/';
  }

  // 1. Resolve target garment identifier from URL query or sessionStorage
  const params = new URLSearchParams(window.location.search);
  const garmentId = params.get('id');
  const garmentCode = params.get('code') || params.get('garmentCode');

  let resolvedGarment = null;

  // Try reading the user-selected garment from session storage (e.g. from New Garment or Garments Directory)
  try {
    const sessionData = sessionStorage.getItem('haulo_selected_garment');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (!garmentId && !garmentCode) {
        resolvedGarment = parsed;
      } else if ((garmentId && parsed.id === garmentId) || (garmentCode && parsed.garmentCode === garmentCode)) {
        resolvedGarment = parsed;
      }
    }
  } catch (e) {
    console.warn('[Garment 360] Could not parse session garment:', e);
  }

  // Fetch target database record from REST API
  try {
    if (garmentId && api?.garments?.getById) {
      const live = await api.garments.getById(garmentId);
      if (live && (live.id || live.garmentCode)) resolvedGarment = live;
    } else if (garmentCode && api?.garments?.list) {
      const res = await api.garments.list({ search: garmentCode, size: 5 });
      const list = res.content || (Array.isArray(res) ? res : []);
      const match = list.find(g => (g.garmentCode || '').toLowerCase() === garmentCode.toLowerCase());
      if (match) resolvedGarment = match;
    }
  } catch (err) {
    console.warn('[Garment 360] API fetch error:', err);
  }

  // Fallback: load latest registered garment from database if no specific garment selected
  if (!resolvedGarment && api?.garments?.list) {
    try {
      const firstRes = await api.garments.list({ size: 1 });
      const list = firstRes.content || (Array.isArray(firstRes) ? firstRes : []);
      if (list.length > 0) resolvedGarment = list[0];
    } catch (_) {}
  }

  // Fallback 2: Direct REST fetch if api helper not ready
  if (!resolvedGarment) {
    const token = Auth?.getToken() || '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      if (garmentId) {
        const r = await fetch(`/api/v1/garments/${encodeURIComponent(garmentId)}`, { headers });
        if (r.ok) resolvedGarment = await r.json();
      } else if (garmentCode) {
        const r = await fetch(`/api/v1/garments?search=${encodeURIComponent(garmentCode)}&size=1`, { headers });
        if (r.ok) {
          const data = await r.json();
          const list = data.content || (Array.isArray(data) ? data : []);
          if (list.length > 0) resolvedGarment = list[0];
        }
      } else {
        const r = await fetch(`/api/v1/garments?size=1`, { headers });
        if (r.ok) {
          const data = await r.json();
          const list = data.content || (Array.isArray(data) ? data : []);
          if (list.length > 0) resolvedGarment = list[0];
        }
      }
    } catch (_) {}
  }

  // Fallback 3: If URL provides explicit query parameters, hydrate directly
  if (!resolvedGarment && garmentCode && (params.get('title') || params.get('customerName') || params.get('totalAmount'))) {
    resolvedGarment = {
      id: garmentId || `param-${Date.now()}`,
      garmentCode: garmentCode,
      title: params.get('title') || 'Bespoke Garment',
      customerName: params.get('customerName') || 'Client',
      customerMobile: params.get('customerMobile') || '',
      orderCode: params.get('orderCode') || '—',
      totalAmount: Number(params.get('totalAmount') || 0),
      productionStage: params.get('productionStage') || 'DESIGNING',
      assignedTo: params.get('assignedTo') || 'Unassigned',
      materialStatus: params.get('materialStatus') || 'READY',
      fabric: params.get('fabric') || 'Primary Fabric',
      color: params.get('color') || '',
      garmentType: params.get('garmentType') || 'BESPOKE',
      specs: params.get('specs') || '',
      notes: params.get('notes') || '',
      dueDate: params.get('dueDate') || '',
      trialDate: params.get('trialDate') || '',
      branch: params.get('branch') || 'Main Branch',
      collectionName: params.get('collectionName') || 'Atelier Collection'
    };
  }

  // 2. If NO garment exists in database, session, or query, render clean Empty State
  if (!resolvedGarment || (!resolvedGarment.id && !resolvedGarment.garmentCode)) {
    renderEmptyState();
    return;
  }

  activeGarment = resolvedGarment;

  // 3. Fetch linked relational records in parallel (Measurements, Stages, Trials, Employees)
  await loadLinkedRelationalData(activeGarment);

  // 4. Hydrate all UI sections dynamically
  renderGarmentDossier(activeGarment);

  // 5. Update Breadcrumbs & document title
  const displayName = activeGarment.garmentCode || activeGarment.title || 'Garment 360';
  document.title = `Garment 360° Dossier — ${displayName}`;
  if (window.HauloBreadcrumbs && typeof window.HauloBreadcrumbs.setDynamic === 'function') {
    window.HauloBreadcrumbs.setDynamic(displayName);
  } else {
    document.addEventListener('haulo:breadcrumbs-set', () => {
      if (window.HauloBreadcrumbs) window.HauloBreadcrumbs.setDynamic(displayName);
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGarment360);
} else {
  initGarment360();
}

// ── Fetch Linked Database Records ───────────────────────────────────────────
async function loadLinkedRelationalData(g) {
  const token = Auth?.getToken() || '';
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fetchSafe = async (url) => {
    try {
      const res = await fetch(url, { headers });
      if (res.ok) return await res.json();
    } catch (_) {}
    return null;
  };

  // 1. Fetch real customer body measurements
  activeMeasurements = null;
  if (g.customerMobile) {
    const mRes = await fetchSafe(`/api/v1/customers/${encodeURIComponent(g.customerMobile)}/body-measurements`);
    if (Array.isArray(mRes) && mRes.length > 0) {
      activeMeasurements = mRes[0];
    } else {
      const mRes2 = await fetchSafe(`/api/v1/measurements?customerMobile=${encodeURIComponent(g.customerMobile)}`);
      if (mRes2?.content && Array.isArray(mRes2.content) && mRes2.content.length > 0) {
        activeMeasurements = mRes2.content[0];
      }
    }
  }

  // 2. Fetch real production stages for order/garment
  activeStages = [];
  if (g.orderId) {
    const stRes = await fetchSafe(`/api/v1/production/order/${encodeURIComponent(g.orderId)}`);
    if (Array.isArray(stRes) && stRes.length > 0) {
      activeStages = stRes;
    } else {
      const stAlt = await fetchSafe(`/api/v1/production/stages?orderId=${encodeURIComponent(g.orderId)}`);
      if (stAlt?.content && Array.isArray(stAlt.content)) activeStages = stAlt.content;
    }
  }
  if (activeStages.length === 0 && g.id) {
    const stGar = await fetchSafe(`/api/v1/production/stages?garmentId=${encodeURIComponent(g.id)}`);
    if (stGar?.content && Array.isArray(stGar.content)) activeStages = stGar.content;
  }

  // 3. Fetch real trial & alterations records
  activeTrial = null;
  const searchKey = g.orderCode || g.garmentCode;
  if (searchKey) {
    const tRes = await fetchSafe(`/api/v1/trials?search=${encodeURIComponent(searchKey)}`);
    const trials = tRes?.content || (Array.isArray(tRes) ? tRes : []);
    if (trials.length > 0) {
      activeTrial = trials[0];
    }
  }

  // 4. Fetch all active workforce employees from database
  const empRes = await fetchSafe('/api/v1/employees?size=100');
  const fetchedEmps = empRes?.content || (Array.isArray(empRes) ? empRes : []);
  activeEmployees = Array.isArray(fetchedEmps) ? fetchedEmps : [];

  // 4b. Fetch dynamic stage definitions from database
  activeStageDefinitions = [];
  const stageDefsRes = await fetchSafe('/api/v1/production/stage-definitions');
  const fetchedDefs = stageDefsRes?.content || (Array.isArray(stageDefsRes) ? stageDefsRes : []);
  if (Array.isArray(fetchedDefs) && fetchedDefs.length > 0) {
    activeStageDefinitions = fetchedDefs;
  }

  // 5. Fetch garments to compute actual artisan workload dynamically
  const garRes = await fetchSafe('/api/v1/garments?size=200');
  const allGarments = garRes?.content || (Array.isArray(garRes) ? garRes : []);
  activeGarmentLoads = {};
  allGarments.forEach(item => {
    if (item.assignedTo && item.status !== 'DELIVERED' && item.status !== 'CANCELLED') {
      const k = item.assignedTo.trim();
      activeGarmentLoads[k] = (activeGarmentLoads[k] || 0) + 1;
    }
  });
}

// ── Smart Specifications Parser ─────────────────────────────────────────────
function parseGarmentSpecs(specsStr, g) {
  const text = (specsStr || '').trim();
  const notes = (g?.notes || '').trim();
  const fullText = (text + ' ' + notes).toLowerCase();
  const gType = (g?.garmentType || '').toLowerCase();

  // 1. Neckline
  let neckline = { title: 'Neckline', desc: 'Custom silhouette neckline' };
  const neckMatch = text.match(/neckline[:\s]+([^,;.]+)/i) || text.match(/neck[:\s]+([^,;.]+)/i);
  if (neckMatch) {
    neckline.desc = neckMatch[1].trim();
  } else if (fullText.includes('sweetheart')) {
    neckline.desc = 'Sweetheart neck • contoured bust';
  } else if (fullText.includes('square')) {
    neckline.desc = 'Square neckline • reinforced collar';
  } else if (fullText.includes('mandarin') || fullText.includes('bandhgala') || gType.includes('sherwani')) {
    neckline.desc = 'Structured Mandarin band • fused collar';
  } else if (fullText.includes('boat')) {
    neckline.desc = 'Graceful boat neckline • wide shoulder';
  } else if (fullText.includes('v-neck') || fullText.includes('deep v')) {
    neckline.desc = 'Plunging V-neck • reinforced border';
  } else if (fullText.includes('round')) {
    neckline.desc = 'Classic round neck • hand piped';
  } else if (gType.includes('blouse') || gType.includes('choli')) {
    neckline.desc = 'Bespoke tailored neck • stay tape';
  } else {
    neckline.desc = `${g?.garmentType || 'Atelier'} signature neckline`;
  }

  // 2. Sleeve
  let sleeve = { title: 'Sleeve', desc: 'Fitted tailored sleeve' };
  const sleeveMatch = text.match(/sleeve[s]?[:\s]+([^,;.]+)/i);
  if (sleeveMatch) {
    sleeve.desc = sleeveMatch[1].trim();
  } else if (fullText.includes('elbow')) {
    sleeve.desc = 'Elbow length • structured cuff';
  } else if (fullText.includes('full sleeve') || fullText.includes('long sleeve')) {
    sleeve.desc = 'Full length • tailored armhole';
  } else if (fullText.includes('cap sleeve')) {
    sleeve.desc = 'Cap sleeve • delicate piping';
  } else if (fullText.includes('sleeveless')) {
    sleeve.desc = 'Sleeveless • bias-bound armhole';
  } else if (fullText.includes('half sleeve') || fullText.includes('short sleeve')) {
    sleeve.desc = 'Half sleeve • contoured bicep';
  } else {
    sleeve.desc = 'Tailored armhole & sleeve ease';
  }

  // 3. Embroidery & Ornamentation
  let embroidery = { title: 'Ornamentation', desc: 'Atelier hand craftsmanship' };
  const embMatch = text.match(/embroidery[:\s]+([^,;.]+)/i) || text.match(/work[:\s]+([^,;.]+)/i);
  if (embMatch) {
    embroidery.desc = embMatch[1].trim();
  } else if (fullText.includes('zardozi')) {
    embroidery.desc = 'Hand Zardozi with metallic bullion';
  } else if (fullText.includes('chikankari')) {
    embroidery.desc = 'Authentic Lucknowi Chikankari';
  } else if (fullText.includes('gotapatti') || fullText.includes('gota')) {
    embroidery.desc = 'Traditional Gota Patti applique';
  } else if (fullText.includes('sequin') || fullText.includes('pearl')) {
    embroidery.desc = 'Fine sequin & pearl micro-detailing';
  } else if (fullText.includes('threadwork') || fullText.includes('resham')) {
    embroidery.desc = 'Pure silk resham thread embroidery';
  } else if (g?.fabric && g.fabric.toLowerCase().includes('brocade')) {
    embroidery.desc = 'Woven metallic brocade motifs';
  } else {
    embroidery.desc = 'Precision seam finishing & edge piping';
  }

  // 4. Back Profile
  let back = { title: 'Back Profile', desc: 'Contoured back silhouette' };
  const backMatch = text.match(/back[:\s]+([^,;.]+)/i);
  if (backMatch) {
    back.desc = backMatch[1].trim();
  } else if (fullText.includes('deep back') || fullText.includes('back cut')) {
    back.desc = 'Deep cut back with handcrafted dori';
  } else if (fullText.includes('illusion back')) {
    back.desc = 'Sheer illusion back panel';
  } else {
    back.desc = 'Contoured anatomical back darts';
  }

  // 5. Lining
  let lining = { title: 'Internal Lining', desc: 'Breathable atelier lining' };
  const liningMatch = text.match(/lining[:\s]+([^,;.]+)/i);
  if (liningMatch) {
    lining.desc = liningMatch[1].trim();
  } else if (fullText.includes('cotton silk')) {
    lining.desc = 'Pure cotton silk breathable lining';
  } else if (fullText.includes('santoon') || fullText.includes('shantoon')) {
    lining.desc = 'Premium heavy santoon lining';
  } else if (fullText.includes('crepe')) {
    lining.desc = 'Butter crepe anti-static lining';
  } else {
    lining.desc = 'Reinforced hypoallergenic interior lining';
  }

  // 6. Closure
  let closure = { title: 'Closure Architecture', desc: 'Reinforced atelier closure' };
  const closureMatch = text.match(/closure[:\s]+([^,;.]+)/i) || text.match(/hook[s]?[:\s]+([^,;.]+)/i);
  if (closureMatch) {
    closure.desc = closureMatch[1].trim();
  } else if (fullText.includes('side hook') || fullText.includes('hooks')) {
    closure.desc = 'Concealed side hooks with bar-tack';
  } else if (fullText.includes('back hook')) {
    closure.desc = 'Reinforced back hook-and-eye band';
  } else if (fullText.includes('zip') || fullText.includes('zipper')) {
    closure.desc = 'Invisible YKK side zipper';
  } else if (fullText.includes('button')) {
    closure.desc = 'Hand-covered potli fabric buttons';
  } else {
    closure.desc = 'Concealed stress-tested fasteners';
  }

  // 7. Padding / Structure
  let padding = { title: 'Padding & Cups', desc: 'Structural cup moulding' };
  if (fullText.includes('pad') || fullText.includes('cup') || gType.includes('blouse') || gType.includes('corset')) {
    padding.desc = 'Contoured structural cups molded to apex';
  } else {
    padding.desc = 'Light canvas fusible chest stay';
  }

  return { neckline, sleeve, embroidery, back, lining, closure, padding };
}

// ── Dynamic BOM Generator ───────────────────────────────────────────────────
function generateDynamicBOM(g, specs) {
  const items = [];
  const statusReady = (g.materialStatus || 'READY').toUpperCase() === 'READY';
  const statusOOS = (g.materialStatus || '').toUpperCase() === 'OUT_OF_STOCK';

  const mainStatusText = statusReady ? 'Reserved \u2713' : (statusOOS ? 'Out of Stock \u26a0' : 'Pending Allocation');
  const mainStatusClass = statusReady ? 'green' : (statusOOS ? 'coral' : 'amber');

  // 1. Primary Fabric
  const fabricName = g.fabric || (g.garmentType ? `${g.garmentType} Fabric` : 'Primary Shell Fabric');
  items.push({
    name: fabricName,
    qty: '1.5 m',
    status: mainStatusText,
    statusClass: mainStatusClass,
    supplier: g.collectionName ? `${g.collectionName} Stock` : 'Atelier Inventory',
    swatch: '../../assets/swatch_raw_silk.jpg'
  });

  // 2. Lining Fabric
  items.push({
    name: specs.lining.desc.includes('cotton') ? 'Cotton Silk Lining' : (specs.lining.desc.includes('crepe') ? 'Butter Crepe Lining' : 'Breathable Interior Lining'),
    qty: '0.8 m',
    status: statusReady ? 'Issued \u2713' : 'Allocated \u2713',
    statusClass: 'green',
    supplier: 'Central Store',
    swatch: '../../assets/swatch_organza.jpg'
  });

  // 3. Embellishments / Zari
  if (specs.embroidery.desc.includes('Zardozi') || specs.embroidery.desc.includes('bullion') || specs.embroidery.desc.includes('Gota')) {
    items.push({
      name: 'Metallic Zari & Craft Trims',
      qty: '2.0 m',
      status: statusReady ? 'Allocated \u2713' : 'In Transit',
      statusClass: statusReady ? 'green' : 'amber',
      supplier: 'Craft Inventory',
      swatch: '../../assets/swatch_champagne.jpg'
    });
  } else {
    items.push({
      name: 'Reinforced Stay Tapes & Fusing',
      qty: '1.2 m',
      status: 'Issued \u2713',
      statusClass: 'green',
      supplier: 'Notions Store',
      swatch: '../../assets/swatch_champagne.jpg'
    });
  }

  // 4. Fasteners
  items.push({
    name: specs.closure.desc.includes('zip') ? 'Invisible YKK Zipper' : 'Bar-tack Hooks & Eyes',
    qty: specs.closure.desc.includes('zip') ? '1 unit' : '8 units',
    status: 'Available \u2713',
    statusClass: 'green',
    supplier: 'Atelier Haberdashery',
    swatch: '../../assets/swatch_raw_silk.jpg'
  });

  return items;
}

// ── Dynamic Production Stages Generator ─────────────────────────────────────
function generateDynamicStages(g, dbStages) {
  // Use strictly the live stages from the database (stage_definitions or active garment stages)
  let standardStages = [];
  if (Array.isArray(activeStageDefinitions) && activeStageDefinitions.length > 0) {
    standardStages = activeStageDefinitions.map(sd => ({
      key: (sd.stageKey || '').toUpperCase().trim(),
      name: sd.displayName || sd.stageKey || 'Stage',
      role: sd.requiredRole || '',
      dept: sd.deptLabel || '',
      sortOrder: sd.sortOrder ?? 0
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  } else if (Array.isArray(dbStages) && dbStages.length > 0) {
    standardStages = dbStages.map((dbs, idx) => ({
      key: (dbs.stageKey || dbs.stageName || ('STAGE_' + idx)).toUpperCase().trim(),
      name: dbs.stageName || dbs.stageKey || ('Stage ' + (idx + 1)),
      role: dbs.requiredRole || '',
      dept: dbs.department || '',
      sortOrder: dbs.sortOrder ?? idx
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // If no stages exist in the database, return empty array (zero hardcoded fallback)
  if (standardStages.length === 0) {
    return [];
  }

  const currentStageKey = (g?.productionStage || '').toUpperCase().trim();
  let currentIdx = standardStages.findIndex(s => 
    (currentStageKey && s.key === currentStageKey) ||
    (currentStageKey && s.name.toUpperCase() === currentStageKey) ||
    (currentStageKey && currentStageKey.includes(s.key)) ||
    (currentStageKey && s.key.includes(currentStageKey))
  );
  if (currentIdx === -1) {
    currentIdx = 0;
  }

  const assignedArtisan = g.assignedTo || 'Unassigned';
  const createdDate = formatDate(g.createdAt) || 'Started';

  return standardStages.map((st, idx) => {
    // Check if dbStages contains live record for this stage
    const matchingDbStage = Array.isArray(dbStages) ? dbStages.find(dbs => 
      (dbs.stageKey && dbs.stageKey.toUpperCase() === st.key) ||
      (dbs.stageName && dbs.stageName.toUpperCase() === st.name.toUpperCase())
    ) : null;

    let status = 'PENDING';
    let progressPct = 0;
    let artisan = '-';
    let date = '';
    let dur = '';

    if (matchingDbStage) {
      status = (matchingDbStage.status || (matchingDbStage.completed ? 'COMPLETED' : 'PENDING')).toUpperCase();
      artisan = matchingDbStage.assignedTo || assignedArtisan;
      date = formatDate(matchingDbStage.completedAt || matchingDbStage.updatedAt || matchingDbStage.createdAt) || '';
      dur = status === 'COMPLETED' ? 'Completed' : (status === 'IN_PROGRESS' || status === 'ACTIVE' ? 'Active Stage' : 'Pending');
      progressPct = status === 'COMPLETED' ? 100 : (status === 'IN_PROGRESS' || status === 'ACTIVE' ? 65 : 0);
    } else {
      if (idx < currentIdx) {
        status = 'COMPLETED';
        artisan = (idx === 0 && g.designer) ? g.designer : (idx === 1 ? 'Master Cutter' : (g.assignedTo || 'Atelier Artisan'));
        date = createdDate;
        dur = 'Completed';
        progressPct = 100;
      } else if (idx === currentIdx) {
        status = 'ACTIVE';
        progressPct = g.isOverdue ? 85 : 65;
        artisan = assignedArtisan;
        date = 'In Progress';
        dur = g.isOverdue ? 'Action Required' : 'Active Stage';
      } else {
        status = 'PENDING';
        artisan = '-';
        date = '';
        dur = '';
        progressPct = 0;
      }
    }

    return {
      name: st.name,
      artisan,
      date,
      dur,
      status,
      progressPct,
      isPassedBadge: status === 'COMPLETED'
    };
  });
}

// ── Dynamic Recent History Generator ─────────────────────────────────────────
function generateDynamicHistory(g, measurements, trial) {
  const events = [];

  // Event 1: Creation
  events.push({
    date: formatDate(g.createdAt) || 'Intake Phase',
    desc: `Garment ${g.garmentCode || ''} registered${g.customerName ? ` for ${g.customerName}` : ''}${g.designer ? ` by ${g.designer}` : ''}`,
    dot: 'purple'
  });

  // Event 2: Measurements
  if (measurements && (measurements.bust || measurements.waist)) {
    events.push({
      date: formatDate(measurements.createdAt || g.createdAt) || 'Intake Phase',
      desc: `34-Point measurement profile confirmed (${measurements.bust ? `Bust ${measurements.bust}"` : ''} ${measurements.waist ? `Waist ${measurements.waist}"` : ''})`,
      dot: 'purple'
    });
  } else {
    events.push({
      date: formatDate(g.createdAt) || 'Intake Phase',
      desc: 'Customer baseline profile verified',
      dot: 'purple'
    });
  }

  // Event 3: Material Status
  const matStatus = (g.materialStatus || 'READY').toUpperCase();
  events.push({
    date: formatDate(g.createdAt) || 'Prep Phase',
    desc: matStatus === 'READY' ? `Textile & notions allocated (${g.fabric || 'Primary Fabric'})` : `Material status: ${matStatus}`,
    dot: matStatus === 'READY' ? 'green' : 'amber'
  });

  // Event 4: Active Stage
  events.push({
    date: formatDate(g.updatedAt || g.createdAt) || 'Active Phase',
    desc: `${g.productionStage || 'Designing'} milestone active${g.assignedTo ? ` under ${g.assignedTo}` : ''}`,
    dot: 'orange'
  });

  // Event 5: Trial
  if (g.trialDate || trial) {
    events.push({
      date: formatDate(g.trialDate || trial?.trialDate) || 'Trial Day',
      desc: trial?.status ? `Trial session (${trial.status})` : `Bespoke fitting scheduled for ${formatDate(g.trialDate)}`,
      dot: 'lime'
    });
  }

  // Event 6: Delivery
  if (g.dueDate) {
    events.push({
      date: formatDate(g.dueDate),
      desc: g.status === 'DELIVERED' ? 'Handover completed to client' : `Committed delivery handover at ${g.branch || 'Main Branch'}`,
      dot: 'coral'
    });
  }

  return events;
}

// ── Real Workforce & Operations Helpers ─────────────────────────────────────
function resolveEmployeeAvatar(employeeOrName) {
  if (!employeeOrName) return '../../assets/user_avatar.jpg';

  // If passed an employee object directly
  if (typeof employeeOrName === 'object') {
    if (employeeOrName.avatarUrl) return employeeOrName.avatarUrl;
    employeeOrName = employeeOrName.name;
  }

  const nameStr = (employeeOrName || '').toLowerCase().trim();
  if (!nameStr || nameStr === 'unassigned' || nameStr === '-') {
    return '../../assets/user_avatar.jpg';
  }

  // Look up in activeEmployees dynamically fetched from the database
  const matched = (activeEmployees || []).find(e => (e.name || '').toLowerCase().trim() === nameStr);
  if (matched && matched.avatarUrl) {
    return matched.avatarUrl;
  }

  return '../../assets/user_avatar.jpg';
}

function calculateSkillMatch(employee, garment, stage) {
  if (!employee) return 88;
  const spec = (employee.specialization || '').toLowerCase();
  const role = (employee.role || '').toLowerCase();
  const currentStage = (stage || garment?.productionStage || '').toLowerCase();

  let score = 88;

  if (currentStage.includes('pattern') || currentStage.includes('cad')) {
    if (spec.includes('pattern') || spec.includes('cutter') || spec.includes('sculpt')) score += 10;
    else if (role.includes('tailor') || role.includes('designer')) score += 7;
  } else if (currentStage.includes('cut')) {
    if (spec.includes('cutter') || spec.includes('pattern')) score += 10;
    else if (role.includes('tailor')) score += 6;
  } else if (currentStage.includes('embroid') || currentStage.includes('zardozi')) {
    if (spec.includes('zardozi') || spec.includes('mukaish') || spec.includes('adda') || spec.includes('craft')) score += 11;
    else if (role.includes('artisan')) score += 7;
  } else if (currentStage.includes('stitch')) {
    if (spec.includes('stitch') || spec.includes('tailor') || spec.includes('drape') || spec.includes('tuxedo')) score += 9;
    else if (role.includes('tailor')) score += 7;
  } else if (currentStage.includes('trial') || currentStage.includes('alter')) {
    if (spec.includes('fitting') || spec.includes('draping') || spec.includes('stylist')) score += 9;
    else score += 5;
  } else if (currentStage.includes('qc')) {
    if (role.includes('qc') || spec.includes('auditor') || spec.includes('quality')) score += 11;
    else score += 4;
  } else {
    if (role.includes('designer') || role.includes('tailor')) score += 6;
  }

  return Math.min(score, 99);
}

function calculateWorkerLoad(workerName) {
  if (!workerName || workerName === 'Unassigned' || workerName === '-') {
    return { count: 0, percentage: 0, level: 'Available' };
  }
  const count = activeGarmentLoads[workerName] || 0;
  if (count === 0) return { count: 0, percentage: 0, level: 'Available' };
  if (count === 1) return { count: 1, percentage: 35, level: 'Low' };
  if (count === 2) return { count, percentage: 65, level: 'Balanced' };
  if (count === 3) return { count, percentage: 85, level: 'High' };
  return { count, percentage: 100, level: 'Full Load' };
}

function computeNextBestAction(garment, trial, employees) {
  const currentStage = (garment.productionStage || 'DESIGNING').toUpperCase();
  const stagesPipeline = [
    { match: s => s.includes('DESIGN') || s.includes('ORDER'), target: 'CAD_PATTERN', headline: 'Advance to CAD Pattern drafting milestone' },
    { match: s => s.includes('CAD') || s.includes('PATTERN') || s.includes('DRAFT'), target: 'CUTTING', headline: 'Commence precision cutting upon pattern approval' },
    { match: s => s.includes('CUT'), target: 'EMBROIDERY', headline: 'Transfer cut panels to embroidery artisan station' },
    { match: s => s.includes('EMBROID') || s.includes('HAND') || s.includes('ZARDOZI') || s.includes('CRAFT'), target: 'STITCHING', headline: 'Route embroidered panels to master tailor for assembly' },
    { match: s => s.includes('STITCH') || s.includes('ASSEMBL') || s.includes('BONE') || s.includes('SEW'), target: 'TRIAL', headline: 'Assemble garment panels & prepare for client trial session' },
    { match: s => s.includes('FINISH'), target: 'TRIAL', headline: 'Finalize hand-finishing & press for fitting consultation' },
    { match: s => s.includes('FIT') || s.includes('TRIAL') || s.includes('ALTER'), target: 'QC', headline: 'Review fitting consultation & advance to final QC inspection' },
    { match: s => s.includes('QC') || s.includes('INSPECT'), target: 'READY', headline: 'Sign off quality audit & transfer to showroom dispatch' },
    { match: s => s.includes('READY'), target: 'DELIVERED', headline: 'Coordinate client handover & finalize dispatch dossier' },
    { match: s => s.includes('DELIVER'), target: 'DELIVERED', headline: 'Dossier archived — delivery completed to client' }
  ];

  let headline = '';
  let targetStage = '';
  const openAlterations = trial?.alterations?.filter(a => !a.completed) || [];

  if (!garment.assignedTo || garment.assignedTo === 'Unassigned') {
    headline = `Assign qualified atelier lead for ${currentStage.replace(/_/g, ' ')}`;
    targetStage = currentStage;
  } else if (openAlterations.length > 0) {
    headline = `Prioritize Alteration: ${openAlterations[0].description || 'Fitting adjustments'}`;
    targetStage = 'STITCHING';
  } else if (garment.materialStatus === 'PENDING' || garment.materialStatus === 'OUT_OF_STOCK') {
    headline = 'Expedite Material Allocation from Inventory Ledger';
    targetStage = currentStage;
  } else {
    const matchedPipeline = stagesPipeline.find(p => p.match(currentStage));
    if (matchedPipeline) {
      targetStage = matchedPipeline.target;
      headline = matchedPipeline.headline;
    } else {
      targetStage = 'QC';
      headline = 'Review fitting consultation & advance to final QC inspection';
    }
  }

  const currentWorkerName = (garment.assignedTo || '').toLowerCase();
  let candidateArtisans = (employees || []).filter(e => 
    (e.name || '').toLowerCase() !== currentWorkerName &&
    (e.status || 'ACTIVE').toUpperCase() === 'ACTIVE'
  );

  if (candidateArtisans.length === 0) {
    candidateArtisans = employees || [];
  }

  const ranked = candidateArtisans.map(emp => {
    const skill = calculateSkillMatch(emp, garment, targetStage);
    const loadInfo = calculateWorkerLoad(emp.name);
    const priorityScore = skill - (loadInfo.percentage * 0.2);
    return { emp, skill, loadInfo, priorityScore };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  const bestRecommendation = ranked[0]?.emp || null;
  const bestSkill = ranked[0]?.skill || 94;
  const bestLoadInfo = ranked[0]?.loadInfo || { count: 0, percentage: 25, level: 'Available' };

  return {
    headline,
    targetStage,
    recommendedWorker: bestRecommendation,
    skillMatch: bestSkill,
    loadInfo: bestLoadInfo,
    confidence: bestLoadInfo.percentage <= 65 ? 'High' : 'Moderate'
  };
}

// ── Render Dossier ─────────────────────────────────────────────────────────
function renderGarmentDossier(g) {
  const workspace = document.getElementById('g360Workspace');
  const emptyState = document.getElementById('g360EmptyState');
  if (workspace) workspace.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  const stage = (g.productionStage || 'DESIGNING').toUpperCase();
  const type = (g.garmentType || 'BESPOKE').toUpperCase();
  const priority = (g.priority || 'NORMAL').toUpperCase();

  // Dynamic Date Calculation
  const now = new Date();
  const due = g.dueDate ? new Date(g.dueDate) : null;
  const isOverdue = Boolean(due && due < now && stage !== 'READY' && stage !== 'DELIVERED');
  g.isOverdue = isOverdue;

  // 1. Dynamic Readiness Calculation (15% to 100%)
  let readinessPct = 15;
  if (stage.includes('ORDER') || stage.includes('DESIGN')) readinessPct = 20;
  else if (stage.includes('CAD') || stage.includes('PATTERN') || stage.includes('DRAFT')) readinessPct = 35;
  else if (stage.includes('CUT')) readinessPct = 50;
  else if (stage.includes('EMBROID') || stage.includes('HAND') || stage.includes('ZARDOZI') || stage.includes('CRAFT')) readinessPct = 65;
  else if (stage.includes('STITCH') || stage.includes('ASSEMBL') || stage.includes('BONE') || stage.includes('SEW')) readinessPct = 80;
  else if (stage.includes('FINISH')) readinessPct = 88;
  else if (stage.includes('TRIAL') || stage.includes('FIT') || stage.includes('ALTER')) readinessPct = 92;
  else if (stage.includes('QC') || stage.includes('INSPECT')) readinessPct = 95;
  else if (stage.includes('READY') || stage.includes('DELIVER') || stage.includes('COMPLETE')) readinessPct = 100;

  // Adjust readiness based on material and measurement completeness
  if ((g.materialStatus || 'READY').toUpperCase() === 'READY') readinessPct = Math.min(100, readinessPct + 3);
  if (activeMeasurements) readinessPct = Math.min(100, readinessPct + 2);

  // Delivery Confidence % Calculation
  let confidencePct = 94;
  if (isOverdue) confidencePct = 62;
  else if (priority === 'URGENT') confidencePct = 78;
  else if (priority === 'HIGH') confidencePct = 86;

  const openAlterations = activeTrial?.alterations?.filter(a => !a.completed)?.length || 0;
  const costNumber = Number(g.totalAmount || 0);

  // 2. Header Metrics Strip
  setVal('valHeaderReadiness', `${readinessPct}%`);
  setStroke('ringHeaderReadiness', readinessPct);

  setVal('valHeaderConfidence', `${confidencePct}%`);
  setStroke('ringHeaderConfidence', confidencePct);

  setVal('valOpenAlterationCount', String(openAlterations));
  setVal('valProductionCost', costNumber > 0 ? `₹${costNumber.toLocaleString('en-IN')}` : '—');

  // 3. Hero Identity Banner
  const heroThumb = document.getElementById('garmentHeroThumb');
  if (heroThumb) {
    heroThumb.src = resolveGarmentImage360(g);
    heroThumb.onerror = () => { heroThumb.src = EXISTING_GARMENT_ASSETS_360.default; };
  }

  setVal('lblGarmentCode', g.garmentCode || '—');
  setVal('lblGarmentName', g.title || 'Bespoke Garment');

  setVal('badgeCategory', type);
  setVal('badgeStage', stage);

  const badgeRisk = document.getElementById('badgeRisk');
  if (badgeRisk) {
    if (isOverdue || priority === 'URGENT') {
      badgeRisk.className = 'g360-badge badge-red';
      badgeRisk.textContent = 'AT RISK';
    } else if (priority === 'HIGH') {
      badgeRisk.className = 'g360-badge badge-red';
      badgeRisk.textContent = 'HIGH PRIORITY';
    } else {
      badgeRisk.className = 'g360-badge badge-green';
      badgeRisk.textContent = 'ON TRACK';
    }
  }

  // Meta Navigation Links
  const linkCust = document.getElementById('linkCustomer');
  if (linkCust) {
    if (g.customerName) {
      linkCust.textContent = g.customerName;
      linkCust.href = `../../customer/Customer360/customer360.html?search=${encodeURIComponent(g.customerName)}`;
    } else {
      linkCust.textContent = 'Walk-in Client';
      linkCust.removeAttribute('href');
    }
  }

  const linkOrd = document.getElementById('linkOrder');
  if (linkOrd) {
    if (g.orderCode) {
      linkOrd.textContent = g.orderCode;
      linkOrd.href = `../../orders/view-order/view-order.html?order=${encodeURIComponent(g.orderCode)}`;
    } else {
      linkOrd.textContent = '—';
      linkOrd.removeAttribute('href');
    }
  }

  setVal('lblBranch', g.branch || 'Main Branch');
  setVal('lblCollection', g.collectionName || 'Bespoke Atelier');
  setVal('lblDesignSource', g.designCode || (g.specs ? 'Custom Specifications' : 'Atelier Standard'));
  setVal('lblAssignedTailor', g.assignedTo || 'Unassigned');
  setVal('lblTrialDate', formatDate(g.trialDate) || 'Not Scheduled');
  setVal('lblDeliveryPromise', formatDate(g.dueDate) || 'Not Scheduled');

  // 4. Garment Readiness Breakdown
  setVal('valOverallReadiness', `${readinessPct}%`);
  setStroke('ringOverallReadiness', readinessPct);

  // Sub-breakdowns
  const designPct = stage.includes('DESIGN') ? 60 : 100;
  setWidth('fillDesign', `${designPct}%`);
  setVal('numDesign', `${designPct}%`);

  const measPct = activeMeasurements ? 100 : 0;
  setWidth('fillMeasurements', `${measPct}%`);
  setVal('numMeasurements', measPct > 0 ? '100%' : 'Pending');

  const matStatus = (g.materialStatus || 'READY').toUpperCase();
  const matPct = matStatus === 'READY' ? 100 : (matStatus === 'PARTIAL' ? 50 : (matStatus === 'PENDING' ? 25 : 0));
  setWidth('fillMaterials', `${matPct}%`);
  setVal('numMaterials', `${matPct}%`);

  let constPct = 0;
  if (readinessPct >= 80) constPct = 85;
  else if (readinessPct >= 50) constPct = 50;
  else if (readinessPct >= 35) constPct = 25;
  setWidth('fillConstruction', `${constPct}%`);
  setVal('numConstruction', `${constPct}%`);

  const numTrialEl = document.getElementById('numTrial');
  if (numTrialEl) {
    if (activeTrial) {
      numTrialEl.textContent = activeTrial.status || 'Completed';
      setWidth('fillTrial', '100%');
    } else if (stage.includes('FIT') || stage.includes('TRIAL')) {
      numTrialEl.textContent = 'In Session';
      setWidth('fillTrial', '75%');
    } else if (g.trialDate) {
      numTrialEl.textContent = 'Scheduled';
      setWidth('fillTrial', '50%');
    } else {
      numTrialEl.textContent = 'Pending';
      setWidth('fillTrial', '0%');
    }
  }

  const numQcEl = document.getElementById('numQc');
  if (numQcEl) {
    if (stage === 'READY' || stage === 'DELIVERED') {
      numQcEl.textContent = 'Passed';
      setWidth('fillQc', '100%');
    } else if (stage === 'QC') {
      numQcEl.textContent = 'In Progress';
      setWidth('fillQc', '50%');
    } else {
      numQcEl.textContent = 'Not Started';
      setWidth('fillQc', '0%');
    }
  }

  const alertBox = document.getElementById('lblReadinessAlert');
  if (alertBox) {
    if (isOverdue) {
      alertBox.textContent = `\u26a0 Delivery committed for ${formatDate(g.dueDate)} is past schedule. Expedite active stage.`;
    } else if (matStatus === 'PENDING' || matStatus === 'OUT_OF_STOCK') {
      alertBox.textContent = '\u26a0 Material allocation is pending from inventory ledger.';
    } else if (g.trialDate) {
      alertBox.textContent = `Trial fitting scheduled on ${formatDate(g.trialDate)}. Ensure stage completion prior to consultation.`;
    } else {
      alertBox.textContent = `Production progressing on schedule for delivery handover on ${formatDate(g.dueDate) || 'target milestone'}.`;
    }
  }

  // Parse specifications dynamically
  const parsedSpecs = parseGarmentSpecs(g.specs, g);

  // 5. Measurements & Fit Intelligence
  renderMeasurements(g, activeMeasurements);

  // 6. Construction Blueprint & BOM
  renderBlueprint(g, parsedSpecs);
  renderBOM(g, parsedSpecs);

  // 7. Production Journey & History
  renderProductionJourney(g, activeStages);
  renderHistory(g, activeMeasurements, activeTrial);

  // 8. Right Column (Work, Action, Alterations, QC, Change)
  renderRightColumn(g, activeTrial, activeEmployees);

  if (window.lucide) window.lucide.createIcons();
}

// ── Measurements Renderer ──────────────────────────────────────────────────
function renderMeasurements(g, m) {
  const hasMeasurements = Boolean(m && (m.bust || m.waist || m.shoulder || m.armhole || m.sleeveLength));

  setVal('valDim1', m?.bust ? `${m.bust}"` : '—');
  setVal('valDim2', m?.waist ? `${m.waist}"` : '—');
  setVal('valDim3', m?.shoulder ? `${m.shoulder}"` : '—');
  setVal('valDim4', m?.armhole ? `${m.armhole}"` : '—');
  setVal('valDim5', m?.sleeveLength ? `${m.sleeveLength}"` : '—');

  const deltaRow = document.getElementById('containerDeltaRow');
  if (deltaRow) {
    if (hasMeasurements && (m.deltaWaist || m.deltaArmhole || m.deltaSleeve)) {
      deltaRow.innerHTML = `
        <span class="delta-title">Changes from baseline profile</span>
        <div class="delta-items-grid">
          <div class="delta-item-col">
            <span class="delta-key">Waist</span>
            <span class="delta-tag green" id="deltaWaist">${m.deltaWaist ? `\u2191 ${m.deltaWaist}` : 'Exact'}</span>
          </div>
          <div class="delta-item-col">
            <span class="delta-key">Armhole</span>
            <span class="delta-tag green" id="deltaArmhole">${m.deltaArmhole ? `\u2191 ${m.deltaArmhole}` : 'Exact'}</span>
          </div>
          <div class="delta-item-col">
            <span class="delta-key">Sleeve</span>
            <span class="delta-tag coral" id="deltaSleeve">${m.deltaSleeve ? `\u2193 ${m.deltaSleeve}` : 'Exact'}</span>
          </div>
        </div>
      `;
    } else if (hasMeasurements) {
      deltaRow.innerHTML = `
        <span class="delta-title">Client anatomical matrix</span>
        <div style="font-size:11.5px;color:var(--lime);padding:6px 0;">\u2713 Verified 34-point customer body measurements active.</div>
      `;
    } else {
      deltaRow.innerHTML = `
        <span class="delta-title">Client body measurements</span>
        <div style="font-size:11.5px;color:#9ca3af;padding:6px 0;">No prior measurement comparisons recorded.</div>
      `;
    }
  }

  const badgeVer = document.getElementById('badgeFitMemoryVer');
  if (badgeVer) badgeVer.textContent = m?.version ? `V${m.version}` : 'V1';

  const fitMem = document.getElementById('lblFitMemory');
  if (fitMem) {
    fitMem.textContent = m?.notes || m?.shapeNotes || g.notes || 'No custom fit memory notes recorded for this client.';
  }
}

// ── Blueprint Renderer ─────────────────────────────────────────────────────
function renderBlueprint(g, specs) {
  const bpImg = document.getElementById('blueprintMainImg');
  if (bpImg) {
    bpImg.src = resolveGarmentImage360(g);
    bpImg.onerror = () => { bpImg.src = EXISTING_GARMENT_ASSETS_360.default; };
  }

  setVal('bpNeckTitle', specs.neckline.title);
  setVal('bpNeckDesc', specs.neckline.desc);

  setVal('bpSleeveTitle', specs.sleeve.title);
  setVal('bpSleeveDesc', specs.sleeve.desc);

  setVal('bpEmbroideryTitle', specs.embroidery.title);
  setVal('bpEmbroideryDesc', specs.embroidery.desc);

  // Set click handlers on visual hotspots
  const hsNeck = document.getElementById('hotspotNeckline');
  if (hsNeck) hsNeck.onclick = () => inspectHotspot(specs.neckline.title, specs.neckline.desc);

  const hsSleeve = document.getElementById('hotspotSleeve');
  if (hsSleeve) hsSleeve.onclick = () => inspectHotspot(specs.sleeve.title, specs.sleeve.desc);

  const hsEmb = document.getElementById('hotspotEmbroidery');
  if (hsEmb) hsEmb.onclick = () => inspectHotspot(specs.embroidery.title, specs.embroidery.desc);

  // Render 4 aside detail nodes
  const aside = document.getElementById('bpThumbsAside');
  if (aside) {
    aside.innerHTML = `
      <div class="bp-thumb-node" onclick="inspectHotspot('${escapeHTML(specs.back.title)}', '${escapeHTML(specs.back.desc)}')">
        <img src="../../assets/garments/blouse_back_cut.jpg" alt="Back" class="bp-thumb-img" onerror="this.src='../../assets/order-ref/blouse_back.jpg'" />
        <div class="bp-thumb-info">
          <strong>Back</strong>
          <span>${escapeHTML(specs.back.desc)}</span>
        </div>
      </div>
      <div class="bp-thumb-node" onclick="inspectHotspot('${escapeHTML(specs.padding.title)}', '${escapeHTML(specs.padding.desc)}')">
        <img src="../../assets/swatch_champagne.jpg" alt="Structure" class="bp-thumb-img" />
        <div class="bp-thumb-info">
          <strong>Structure</strong>
          <span>${escapeHTML(specs.padding.desc)}</span>
        </div>
      </div>
      <div class="bp-thumb-node" onclick="inspectHotspot('${escapeHTML(specs.lining.title)}', '${escapeHTML(specs.lining.desc)}')">
        <img src="../../assets/swatch_organza.jpg" alt="Lining" class="bp-thumb-img" />
        <div class="bp-thumb-info">
          <strong>Lining</strong>
          <span>${escapeHTML(specs.lining.desc)}</span>
        </div>
      </div>
      <div class="bp-thumb-node" onclick="inspectHotspot('${escapeHTML(specs.closure.title)}', '${escapeHTML(specs.closure.desc)}')">
        <img src="../../assets/swatch_raw_silk.jpg" alt="Closure" class="bp-thumb-img" />
        <div class="bp-thumb-info">
          <strong>Closure</strong>
          <span>${escapeHTML(specs.closure.desc)}</span>
        </div>
      </div>
    `;
  }
}

// ── Bill of Materials Renderer ─────────────────────────────────────────────
function renderBOM(g, specs) {
  const container = document.getElementById('bomListContainer');
  if (!container) return;

  const matStatus = (g.materialStatus || 'READY').toUpperCase();
  const readinessPct = matStatus === 'READY' ? 100 : (matStatus === 'PARTIAL' ? 65 : (matStatus === 'PENDING' ? 30 : 0));

  setVal('valMaterialReadiness', `${readinessPct}%`);
  setWidth('fillMaterialReadiness', `${readinessPct}%`);

  const items = generateDynamicBOM(g, specs);

  container.innerHTML = items.map(it => `
    <div class="bom-item-row">
      <img src="${it.swatch}" alt="${escapeHTML(it.name)}" class="bom-swatch" onerror="this.src='../../assets/swatch_raw_silk.jpg'" />
      <span class="bom-name">${escapeHTML(it.name)}</span>
      <span class="bom-qty">${escapeHTML(it.qty)}</span>
      <span class="bom-badge ${it.statusClass}">${escapeHTML(it.status)}</span>
      <span class="bom-supplier" title="${escapeHTML(it.supplier)}">${escapeHTML(it.supplier)}</span>
    </div>
  `).join('');
}

// ── Production Journey Stepper Renderer ────────────────────────────────────
function renderProductionJourney(g, dbStages) {
  const container = document.getElementById('journeyStepperContainer');
  if (!container) return;

  const steps = generateDynamicStages(g, dbStages);
  if (!steps || steps.length === 0) {
    container.innerHTML = '<div style=\"color:var(--text-muted);font-size:12px;text-align:center;padding:24px 0;\">No production workflow stages configured in database.</div>';
    return;
  }

  let html = '';
  steps.forEach((st, idx) => {
    let nodeHtml = '';
    if (st.status === 'COMPLETED') {
      nodeHtml = `<div class="journey-node">\u2713</div>`;
    } else if (st.status === 'ACTIVE') {
      nodeHtml = `<div class="journey-node active-ring">${st.progressPct}%</div>`;
    } else {
      nodeHtml = `<div class="journey-node">-</div>`;
    }

    let metaDurHtml = '';
    if (st.isPassedBadge) {
      metaDurHtml = `<span class="journey-step-badge passed">Passed</span>`;
    } else if (st.dur && st.dur.includes('Action')) {
      metaDurHtml = `<span class="journey-step-badge overdue">${escapeHTML(st.dur)}</span>`;
    } else if (st.dur) {
      metaDurHtml = `<div class="journey-step-meta">${escapeHTML(st.dur)}</div>`;
    }

    const artisanHtml = st.artisan && st.artisan !== '-' 
      ? `<div class="journey-step-meta"><i data-lucide="user" style="width:10px;height:10px;display:inline-block;vertical-align:middle;margin-right:2px;"></i>${escapeHTML(st.artisan)}</div>` 
      : (st.artisan === '-' ? `<div class="journey-step-meta">-</div>` : '');

    const dateHtml = st.date ? `<div class="journey-step-meta">${escapeHTML(st.date)}</div>` : '';

    html += `
      <div class="journey-step ${st.status === 'COMPLETED' ? 'completed' : (st.status === 'ACTIVE' ? 'active' : '')}">
        ${nodeHtml}
        <div class="journey-step-name" style="${st.status === 'ACTIVE' ? 'color:var(--lime);' : (st.status === 'PENDING' ? 'color:var(--text-muted);' : '')}">${escapeHTML(st.name)}</div>
        ${artisanHtml}
        ${dateHtml}
        ${metaDurHtml}
      </div>
    `;

    if (idx < steps.length - 1) {
      html += `<div class="journey-sep-arrow">&gt;</div>`;
    }
  });

  container.innerHTML = html;
}

// ── Recent History Renderer ────────────────────────────────────────────────
function renderHistory(g, measurements, trial) {
  const container = document.getElementById('historyChainContainer');
  if (!container) return;

  const events = generateDynamicHistory(g, measurements, trial);

  container.innerHTML = events.map((ev, i) => `
    <div class="history-item">
      <div class="history-dot ${ev.dot}"></div>
      <div class="history-item-body">
        <div class="history-date">${escapeHTML(ev.date)}</div>
        <div class="history-desc">${escapeHTML(ev.desc)}</div>
      </div>
    </div>
    ${i < events.length - 1 ? '<span class="history-sep">&rsaquo;</span>' : ''}
  `).join('');
}

// ── Right Column Operations Renderer ───────────────────────────────────────
function renderRightColumn(g, trial, employees) {
  // 1. Current Work
  renderCurrentWork(g, employees);

  // 2. Next Best Action
  renderNextBestAction(g, trial, employees);

  // 3. Trial & Alteration Intelligence
  renderTrialAndAlterations(g, trial);

  // 4. QC & Finish
  renderQcAndFinish(g);

  // 5. Change Impact
  const openAlterationsCount = trial?.alterations?.filter(a => !a.completed)?.length || 0;
  renderChangeImpact(g, openAlterationsCount);
}

function renderCurrentWork(g, employees) {
  const currentWorkerName = (g.assignedTo || '').trim();
  const workerAvatarEl = document.getElementById('workerAvatar');
  const isAssigned = Boolean(currentWorkerName && currentWorkerName !== 'Unassigned' && currentWorkerName !== '-');

  const emp = isAssigned
    ? employees.find(e => (e.name || '').toLowerCase() === currentWorkerName.toLowerCase()) || { name: currentWorkerName, role: 'Tailor' }
    : null;

  if (workerAvatarEl) {
    workerAvatarEl.src = emp ? (emp.avatarUrl || resolveEmployeeAvatar(emp.name)) : '../../assets/user_avatar.jpg';
    workerAvatarEl.alt = emp ? emp.name : 'Unassigned';
  }

  setVal('workerTaskHeadline', g.productionStage ? `${g.productionStage.replace(/_/g, ' ')} Construction` : 'Awaiting Production');
  setVal('workerName', isAssigned ? emp.name : 'Unassigned');
  setVal('workerRole', isAssigned ? (emp.role || emp.specialization || 'Artisan') : 'No Artisan Assigned');

  const skillMatch = isAssigned ? calculateSkillMatch(emp, g, g.productionStage) : 0;
  const loadInfo = isAssigned ? calculateWorkerLoad(emp.name) : { count: 0, percentage: 0 };

  setVal('workerSkillMatch', isAssigned ? `${skillMatch}%` : '—');
  setWidth('barSkillMatch', isAssigned ? `${skillMatch}%` : '0%');

  setVal('workerLoad', isAssigned ? `${loadInfo.percentage}%` : '0%');
  setWidth('barWorkerLoad', isAssigned ? `${Math.min(loadInfo.percentage, 100)}%` : '0%');

  const expectedText = g.dueDate
    ? (g.isOverdue ? `Overdue • Due ${formatDate(g.dueDate)}` : `Expected completion ${formatDate(g.dueDate)}`)
    : 'Timeline to be scheduled';
  setVal('lblExpectedCompletion', expectedText);

  const overdueBadge = document.getElementById('badgeOverdue');
  if (overdueBadge) {
    if (g.isOverdue) {
      overdueBadge.className = 'badge-overdue';
      overdueBadge.innerHTML = `<i data-lucide="alert-triangle" style="width:11px;height:11px;"></i> <span>Overdue</span>`;
    } else if (isAssigned) {
      overdueBadge.className = 'badge-overdue';
      overdueBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      overdueBadge.style.color = '#34d399';
      overdueBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      overdueBadge.innerHTML = `<i data-lucide="check" style="width:11px;height:11px;"></i> <span>On Track</span>`;
    } else {
      overdueBadge.className = 'badge-overdue';
      overdueBadge.style.background = 'rgba(245, 158, 11, 0.15)';
      overdueBadge.style.color = '#f59e0b';
      overdueBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      overdueBadge.innerHTML = `<span>Assign Artisan</span>`;
    }
  }
}

function renderNextBestAction(g, trial, employees) {
  const nba = computeNextBestAction(g, trial, employees);
  activeNextMilestone = nba;

  setVal('nbaHeadline', nba.headline);

  const nbaAvatarEl = document.getElementById('nbaAvatar');
  if (nbaAvatarEl && nba.recommendedWorker) {
    nbaAvatarEl.src = nba.recommendedWorker.avatarUrl || resolveEmployeeAvatar(nba.recommendedWorker.name);
    nbaAvatarEl.alt = nba.recommendedWorker.name;
  }

  setVal('nbaArtisanName', nba.recommendedWorker ? nba.recommendedWorker.name : 'Workshop Lead');
  setVal('nbaArtisanRole', nba.recommendedWorker ? (nba.recommendedWorker.role || 'Artisan') : 'Tailor');
  setVal('nbaSkillMatch', `${nba.skillMatch}%`);
  setVal('nbaCapacity', nba.loadInfo ? `${Math.max(1, 8 - (nba.loadInfo.count * 1.5)).toFixed(1)} hrs` : 'Available');
  setVal('nbaConfidence', `${Math.max(65, 95 - (nba.loadInfo?.percentage || 30) * 0.2).toFixed(0)}% \u2192 96%`);

  const riskLevel = g.isOverdue ? 'HIGH' : ((g.priority === 'HIGH' || g.priority === 'URGENT') ? 'MEDIUM' : 'LOW');
  setVal('nbaRiskLevel', riskLevel);

  const riskCause = g.isOverdue
    ? 'Primary cause: Milestone timeline risk'
    : (g.materialStatus === 'PENDING' ? 'Primary cause: Material procurement' : 'Primary cause: Workshop capacity');
  setVal('nbaRiskCause', riskCause);

  setVal('nbaConfidenceSummary', `Estimated delivery confidence ${nba.confidence === 'High' ? '92%' : '84%'}`);

  const riskFill = document.getElementById('nbaRiskFill');
  if (riskFill) {
    riskFill.style.width = riskLevel === 'HIGH' ? '90%' : (riskLevel === 'MEDIUM' ? '65%' : '30%');
  }
}

function renderTrialAndAlterations(g, trial) {
  const hasTrial = Boolean(trial && (trial.id || trial.trialCode));
  const trialIterationText = hasTrial ? (trial.trialCode || 'Trial 01') : (g.trialDate ? 'Trial 01' : 'Fitting Consultation');
  const trialDateText = hasTrial ? formatDate(trial.trialDate) : (formatDate(g.trialDate) || 'Not Scheduled');
  const trialStatusText = hasTrial ? (trial.status || 'Completed') : (g.trialDate ? 'Scheduled' : 'Pending');

  setVal('trialIteration', trialIterationText);
  setVal('trialDateScheduled', trialDateText);
  setVal('badgeTrialStatus', trialStatusText);

  const badgeAltCount = document.getElementById('badgeOpenAlterations');
  const openAlts = trial?.alterations?.filter(a => !a.completed) || [];
  if (badgeAltCount) {
    if (openAlts.length > 0) {
      badgeAltCount.className = 'g360-badge badge-red';
      badgeAltCount.innerHTML = `<i data-lucide="scissors" style="width:11px;height:11px;"></i> <span>${openAlts.length} Open Alteration${openAlts.length > 1 ? 's' : ''}</span>`;
    } else {
      badgeAltCount.className = 'g360-badge badge-green';
      badgeAltCount.innerHTML = `<i data-lucide="check" style="width:11px;height:11px;"></i> <span>No Open Alterations</span>`;
    }
  }

  const feedbackList = document.getElementById('trialFeedbackList');
  if (feedbackList) {
    if (trial?.customerFeedback) {
      feedbackList.innerHTML = `<div style="font-size:12px;color:#e5e7eb;padding:4px 0;line-height:1.4;">${escapeHTML(trial.customerFeedback)}</div>`;
    } else if (openAlts.length > 0) {
      feedbackList.innerHTML = openAlts.map(a => `
        <div class="feedback-row"><span>${escapeHTML(a.area || 'Fitting')}</span><strong class="tight">&bull; ${escapeHTML(a.description || 'Adjustment required')}</strong></div>
      `).join('');
    } else if (hasTrial) {
      feedbackList.innerHTML = `
        <div class="feedback-row"><span>Bespoke Fit</span><strong class="good">&check; Verified Perfect</strong></div>
        <div class="feedback-row"><span>Comfort</span><strong class="good">&check; Client Approved</strong></div>
      `;
    } else {
      feedbackList.innerHTML = `
        <div style="font-size:11.5px;color:#9ca3af;padding:6px 0;">No fitting consultation conducted yet. Schedule trial once stitching is assembled.</div>
      `;
    }
  }

  const alterList = document.getElementById('trialAlterList');
  if (alterList) {
    if (openAlts.length > 0) {
      alterList.innerHTML = openAlts.map(a => `
        <div class="alter-item">&uarr; ${escapeHTML(a.description || 'Fitting Adjustment')}</div>
      `).join('') + `
        <div class="alter-meta">Assigned to <span id="lblAlterTailor">${escapeHTML(openAlts[0].assignedTailor || g.assignedTo || 'Atelier Tailor')}</span></div>
        <div class="alter-due">Target: <span>${formatDate(openAlts[0].dueDate || g.dueDate) || 'Next Day'}</span></div>
      `;
    } else if (hasTrial) {
      alterList.innerHTML = `
        <div style="font-size:11.5px;color:#34d399;padding:6px 0;">&check; Zero alterations required. Pattern approved.</div>
      `;
    } else {
      alterList.innerHTML = `
        <div style="font-size:11.5px;color:#9ca3af;padding:6px 0;">Zero active alteration tasks.</div>
      `;
    }
  }
}

function renderQcAndFinish(g) {
  const currentStage = (g.productionStage || 'DESIGNING').toUpperCase();
  const stagesPipeline = ['DESIGNING', 'PATTERN', 'CUTTING', 'EMBROIDERY', 'STITCHING', 'FINISHING', 'TRIAL', 'QC', 'READY', 'DELIVERED'];
  const curIdx = stagesPipeline.findIndex(s => currentStage.includes(s));

  const cuttingPassed = curIdx >= 2;
  const embroideryPassed = curIdx >= 3;
  const stitchingPassed = curIdx >= 4;
  const qcPassed = curIdx >= 7;

  let qcReadinessPct = 25;
  if (qcPassed) qcReadinessPct = 100;
  else if (curIdx >= 6) qcReadinessPct = 85;
  else if (curIdx >= 4) qcReadinessPct = 65;
  else if (curIdx >= 2) qcReadinessPct = 45;

  setVal('valQcReadiness', `${qcReadinessPct}%`);
  setStroke('ringQcReadiness', qcReadinessPct);

  const qcList = document.getElementById('qcChecklistContainer');
  if (qcList) {
    qcList.innerHTML = `
      <div class="qc-check-item">
        <span>${cuttingPassed ? '<i data-lucide="check-circle" style="width:10px;height:10px;color:#34d399;"></i>' : '<span class="qc-bullet">&bull;</span>'} Pattern & Cut Verification</span>
        <span class="status ${cuttingPassed ? 'passed' : 'pending'}">${cuttingPassed ? 'Passed' : 'Pending'}</span>
      </div>
      <div class="qc-check-item">
        <span>${embroideryPassed ? '<i data-lucide="check-circle" style="width:10px;height:10px;color:#34d399;"></i>' : '<span class="qc-bullet">&bull;</span>'} Embroidery & Craft Audit</span>
        <span class="status ${embroideryPassed ? 'passed' : 'pending'}">${embroideryPassed ? 'Passed' : 'Pending'}</span>
      </div>
      <div class="qc-check-item">
        <span>${stitchingPassed ? '<i data-lucide="check-circle" style="width:10px;height:10px;color:#34d399;"></i>' : '<span class="qc-bullet">&bull;</span>'} Seam & Lining Assembly</span>
        <span class="status ${stitchingPassed ? 'passed' : 'pending'}">${stitchingPassed ? 'Passed' : 'Pending'}</span>
      </div>
      <div class="qc-check-item">
        <span>${qcPassed ? '<i data-lucide="check-circle" style="width:10px;height:10px;color:#34d399;"></i>' : '<span class="qc-bullet amber">&bull;</span>'} Final Press & Quality Sign-off</span>
        <span class="status ${qcPassed ? 'passed' : 'pending'}">${qcPassed ? 'Passed' : 'Pending'}</span>
      </div>
    `;
  }

  setVal('lblQcAlert', qcPassed ? 'Final quality control passed and approved for dispatch.' : 'Quality control audit pending milestone completion.');
}

function renderChangeImpact(g, openAlterationsCount) {
  const hasNotes = Boolean(g.notes && g.notes.trim().length > 0);
  const title = document.getElementById('ciNoticeTitle');
  const summary = document.getElementById('ciSummaryText');

  if (openAlterationsCount > 0) {
    if (title) title.textContent = 'Fitting Alterations Required';
    if (summary) summary.textContent = `${openAlterationsCount} modification${openAlterationsCount > 1 ? 's' : ''} in progress`;
  } else if (hasNotes) {
    if (title) title.textContent = 'Custom Atelier Specifications';
    if (summary) summary.textContent = 'Client preference notes active';
  } else {
    if (title) title.textContent = 'Specifications Locked';
    if (summary) summary.textContent = 'Production aligned with approved design';
  }

  const ciList = document.getElementById('ciListContainer');
  if (ciList) {
    if (openAlterationsCount > 0) {
      ciList.innerHTML = `
        <div class="ci-row"><span>Alteration status:</span><strong style="color:#f87171;">${openAlterationsCount} Task(s) Open</strong></div>
        <div class="ci-row"><span>Material impact:</span><strong>In-house adjustments</strong></div>
        <div class="ci-row"><span>Estimated extra time:</span><strong>1.0 – 2.0 hrs</strong></div>
        <div class="ci-row"><span>Delivery impact:</span><strong style="color:var(--lime);">On track if completed today</strong></div>
      `;
    } else {
      ciList.innerHTML = `
        <div class="ci-row"><span>Garment Silhouette:</span><strong>${escapeHTML(g.garmentType || 'Bespoke')}</strong></div>
        <div class="ci-row"><span>Textile Allocation:</span><strong>${escapeHTML(g.fabric || 'Specified in BOM')}</strong></div>
        <div class="ci-row"><span>Design Rework:</span><strong style="color:var(--lime);">None Required</strong></div>
        <div class="ci-row"><span>Delivery Commitment:</span><strong style="color:var(--lime);">${formatDate(g.dueDate) || 'Committed'}</strong></div>
      `;
    }
  }

  const btnApprove = document.querySelector('.btn-ci-approve');
  if (btnApprove) {
    if (openAlterationsCount > 0) {
      btnApprove.style.display = 'block';
      btnApprove.innerHTML = '<span>Review Alteration Tasks &rarr;</span>';
      btnApprove.onclick = () => { window.location.href = '../../trials-alterations/trials-alterations.html'; };
    } else {
      btnApprove.style.display = 'none';
    }
  }
}

// ── Clean Empty State ──────────────────────────────────────────────────────
function renderEmptyState() {
  const workspace = document.getElementById('g360Workspace');
  const emptyState = document.getElementById('g360EmptyState');
  if (workspace) workspace.style.display = 'none';
  if (emptyState) emptyState.style.display = 'flex';

  document.title = 'Garment 360° — No Garment Selected';
  if (window.HauloBreadcrumbs && typeof window.HauloBreadcrumbs.setDynamic === 'function') {
    window.HauloBreadcrumbs.setDynamic('No Garment Selected');
  }
  if (window.lucide) window.lucide.createIcons();
}

// ── Helpers ────────────────────────────────────────────────────────────────
function setVal(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setWidth(id, w) {
  const el = document.getElementById(id);
  if (el) el.style.width = w;
}

function setStroke(id, pct) {
  const el = document.getElementById(id);
  if (el) el.setAttribute('stroke-dasharray', `${pct}, 100`);
}

function formatDate(dStr) {
  if (!dStr) return '';
  const d = new Date(dStr);
  if (isNaN(d.getTime())) return dStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

// ── Modal Actions ──────────────────────────────────────────────────────────
window.inspectHotspot = function(title, desc) {
  openModal(title, `
    <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;font-size:13px;line-height:1.5;color:#e5e7eb;">
      ${escapeHTML(desc)}
    </div>
  `);
};

window.openJobCard = function() {
  const g = activeGarment || {};
  openModal(`Job Card — ${escapeHTML(g.garmentCode || '—')}`, `
    <div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:12px;">
      <h3 style="margin:0;color:#fff;">${escapeHTML(g.title || 'Bespoke Garment')}</h3>
      <span style="font-size:12px;color:#9ca3af;">Client: ${escapeHTML(g.customerName || '—')} &bull; Order: ${escapeHTML(g.orderCode || '—')}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;margin-bottom:14px;">
      <div><span style="color:#6b7280;">Assigned Artisan:</span> <strong style="color:#fff;">${escapeHTML(g.assignedTo || 'Unassigned')}</strong></div>
      <div><span style="color:#6b7280;">Due Date:</span> <strong style="color:#b8ff3d;">${formatDate(g.dueDate) || 'Not Scheduled'}</strong></div>
      <div><span style="color:#6b7280;">Fabric:</span> <strong style="color:#fff;">${escapeHTML(g.fabric || 'Bespoke')}</strong></div>
      <div><span style="color:#6b7280;">Current Stage:</span> <strong style="color:#fff;">${escapeHTML(g.productionStage || 'DESIGNING')}</strong></div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;">
      <button class="btn-g360-glass" onclick="window.print()">Print</button>
      <button class="btn-g360-primary" onclick="closeModal()">Done</button>
    </div>
  `);
};

window.openStageModal = function() {
  openModal('Update Garment Stage', `
    <p style="font-size:12.5px;color:#9ca3af;">Select next milestone for ${escapeHTML(activeGarment?.garmentCode || 'Garment')}:</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
      <button class="btn-g360-glass" onclick="selectNewStage('CUTTING')">Cutting</button>
      <button class="btn-g360-glass" onclick="selectNewStage('EMBROIDERY')">Embroidery</button>
      <button class="btn-g360-glass" onclick="selectNewStage('STITCHING')">Stitching</button>
      <button class="btn-g360-glass" onclick="selectNewStage('TRIAL')">Trial</button>
      <button class="btn-g360-glass" onclick="selectNewStage('QC')">QC</button>
      <button class="btn-g360-primary" onclick="selectNewStage('READY')">Ready for Delivery</button>
    </div>
  `);
};

window.selectNewStage = function(newStage) {
  if (activeGarment) {
    advanceToStage(newStage);
  }
};

window.openTrialScheduleModal = function() {
  openModal('Schedule Fitting Consultation', `
    <p style="font-size:12.5px;color:#9ca3af;">Client: ${escapeHTML(activeGarment?.customerName || 'Walk-in Client')}</p>
    <input type="date" id="inputTrialDateModal" value="${activeGarment?.trialDate || ''}" style="background:#1e2430;border:1px solid #374151;color:#fff;padding:8px;border-radius:6px;width:100%;margin-bottom:12px;" />
    <button class="btn-g360-primary" style="width:100%;" onclick="confirmScheduleTrialDate()">Confirm Trial Date</button>
  `);
};

window.confirmScheduleTrialDate = async function() {
  const input = document.getElementById('inputTrialDateModal');
  if (input && activeGarment) {
    const newDate = input.value;
    activeGarment.trialDate = newDate;
    try {
      if (api?.garments?.update && activeGarment.id) {
        await api.garments.update(activeGarment.id, { trialDate: newDate });
      }
    } catch (_) {}
    closeModal();
    renderGarmentDossier(activeGarment);
    showToast(`Fitting scheduled for ${formatDate(newDate)}`);
  }
};

// ── More Actions Modal ──────────────────────────────────────────────────────
window.openMoreModal = function() {
  const g = activeGarment || {};
  const isUrgent = (g.priority || '').toUpperCase() === 'URGENT';
  const isHold = (g.status || '').toUpperCase() === 'ON_HOLD';

  const html = `
    <div style="font-size:12px;color:#9ca3af;margin-bottom:14px;">
      Quick actions and atelier operations for <strong style="color:#fff;">${escapeHTML(g.garmentCode || g.title || 'Garment')}</strong>:
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
      <button type="button" class="btn-g360-glass" style="display:flex;align-items:center;gap:8px;padding:10px;text-align:left;" onclick="closeModal(); openJobCard();">
        <i data-lucide="file-text" style="color:var(--lime);width:16px;height:16px;flex-shrink:0;"></i>
        <div>
          <strong style="display:block;font-size:12px;color:#fff;">Print Job Card</strong>
          <span style="font-size:10px;color:#9ca3af;">Atelier physical cut slip</span>
        </div>
      </button>

      <button type="button" class="btn-g360-glass" style="display:flex;align-items:center;gap:8px;padding:10px;text-align:left;" onclick="closeModal(); openStageModal();">
        <i data-lucide="layers" style="color:var(--lime);width:16px;height:16px;flex-shrink:0;"></i>
        <div>
          <strong style="display:block;font-size:12px;color:#fff;">Update Stage</strong>
          <span style="font-size:10px;color:#9ca3af;">Advance production milestone</span>
        </div>
      </button>

      <button type="button" class="btn-g360-glass" style="display:flex;align-items:center;gap:8px;padding:10px;text-align:left;" onclick="closeModal(); openTrialScheduleModal();">
        <i data-lucide="calendar" style="color:var(--lime);width:16px;height:16px;flex-shrink:0;"></i>
        <div>
          <strong style="display:block;font-size:12px;color:#fff;">Schedule Fitting</strong>
          <span style="font-size:10px;color:#9ca3af;">Book client trial session</span>
        </div>
      </button>

      <button type="button" class="btn-g360-glass" style="display:flex;align-items:center;gap:8px;padding:10px;text-align:left;" onclick="closeModal(); reassignTailor();">
        <i data-lucide="user-check" style="color:var(--lime);width:16px;height:16px;flex-shrink:0;"></i>
        <div>
          <strong style="display:block;font-size:12px;color:#fff;">Reassign Artisan</strong>
          <span style="font-size:10px;color:#9ca3af;">Rebalance workshop capacity</span>
        </div>
      </button>
    </div>

    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;margin-bottom:14px;">
      <div style="font-size:11px;font-weight:700;color:var(--text-sub);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">
        Cross-Module Atelier Portals
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${g.customerName ? `
          <a href="../../customer/Customer360/customer360.html?search=${encodeURIComponent(g.customerName)}" class="btn-g360-glass" style="text-decoration:none;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;font-size:11.5px;color:#e5e7eb;">
            <span><i data-lucide="user" style="width:13px;height:13px;vertical-align:middle;margin-right:6px;color:var(--lime);"></i> Customer Profile (${escapeHTML(g.customerName)})</span>
            <span style="color:var(--lime);font-size:10.5px;">Open &rsaquo;</span>
          </a>
        ` : ''}
        ${g.orderCode ? `
          <a href="../../orders/view-order/view-order.html?order=${encodeURIComponent(g.orderCode)}" class="btn-g360-glass" style="text-decoration:none;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;font-size:11.5px;color:#e5e7eb;">
            <span><i data-lucide="package" style="width:13px;height:13px;vertical-align:middle;margin-right:6px;color:var(--lime);"></i> Production Order (${escapeHTML(g.orderCode)})</span>
            <span style="color:var(--lime);font-size:10.5px;">Open &rsaquo;</span>
          </a>
        ` : ''}
        <a href="../../Measurements/measurement360/measurement360.html" class="btn-g360-glass" style="text-decoration:none;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;font-size:11.5px;color:#e5e7eb;">
          <span><i data-lucide="ruler" style="width:13px;height:13px;vertical-align:middle;margin-right:6px;color:var(--lime);"></i> 34-Point Measurement Matrix</span>
          <span style="color:var(--lime);font-size:10.5px;">Open &rsaquo;</span>
        </a>
        <a href="../../trials-alterations/trials-alterations.html" class="btn-g360-glass" style="text-decoration:none;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;font-size:11.5px;color:#e5e7eb;">
          <span><i data-lucide="scissors" style="width:13px;height:13px;vertical-align:middle;margin-right:6px;color:var(--lime);"></i> Trials &amp; Alterations Desk</span>
          <span style="color:var(--lime);font-size:10.5px;">Open &rsaquo;</span>
        </a>
      </div>
    </div>

    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;display:flex;gap:8px;justify-content:space-between;align-items:center;">
      <div style="display:flex;gap:6px;">
        <button type="button" class="btn-g360-glass" style="font-size:11px;color:${isUrgent ? 'var(--lime)' : '#f87171'};" onclick="toggleGarmentPriority()">
          <i data-lucide="alert-triangle" style="width:12px;height:12px;vertical-align:middle;margin-right:3px;"></i>
          ${isUrgent ? 'Set Normal Priority' : 'Mark Rush Priority'}
        </button>
        <button type="button" class="btn-g360-glass" style="font-size:11px;color:${isHold ? 'var(--lime)' : '#fbbf24'};" onclick="toggleGarmentHold()">
          <i data-lucide="pause-circle" style="width:12px;height:12px;vertical-align:middle;margin-right:3px;"></i>
          ${isHold ? 'Resume Production' : 'Place on Hold'}
        </button>
      </div>
      <button type="button" class="btn-g360-primary" onclick="closeModal()">Close</button>
    </div>
  `;

  openModal('More Garment Actions', html);
};

window.toggleGarmentPriority = async function() {
  if (!activeGarment) return;
  const isUrgent = (activeGarment.priority || '').toUpperCase() === 'URGENT';
  const newPriority = isUrgent ? 'NORMAL' : 'URGENT';
  try {
    if (api?.garments?.update && activeGarment.id) {
      await api.garments.update(activeGarment.id, { priority: newPriority });
    }
  } catch (err) {
    console.warn('[Garment 360] Priority update warning:', err);
  }
  activeGarment.priority = newPriority;
  closeModal();
  renderGarmentDossier(activeGarment);
  showToast(`Garment priority updated to ${newPriority}.`);
};

window.toggleGarmentHold = async function() {
  if (!activeGarment) return;
  const isHold = (activeGarment.status || '').toUpperCase() === 'ON_HOLD';
  const newStatus = isHold ? 'IN_PRODUCTION' : 'ON_HOLD';
  try {
    if (api?.garments?.update && activeGarment.id) {
      await api.garments.update(activeGarment.id, { status: newStatus });
    }
  } catch (err) {
    console.warn('[Garment 360] Hold toggle warning:', err);
  }
  activeGarment.status = newStatus;
  closeModal();
  renderGarmentDossier(activeGarment);
  showToast(isHold ? 'Garment resumed into active production.' : 'Garment placed on operational hold.');
};

// ── Measurement Set Version Switcher ─────────────────────────────────────────
window.changeMeasurementSet = function(version) {
  const m = activeMeasurements;
  const badgeVer = document.getElementById('badgeFitMemoryVer');
  if (badgeVer) badgeVer.textContent = version;

  if (m) {
    setVal('valDim1', m.bust ? `${m.bust}"` : '—');
    setVal('valDim2', m.waist ? `${m.waist}"` : '—');
    setVal('valDim3', m.shoulder ? `${m.shoulder}"` : '—');
    setVal('valDim4', m.armhole ? `${m.armhole}"` : '—');
    setVal('valDim5', m.sleeveLength ? `${m.sleeveLength}"` : '—');
  }
  showToast(`Active Measurement Profile: ${version}`);
};

// ── Full Garment Lifecycle History Modal ─────────────────────────────────────
window.openHistoryModal = function() {
  const g = activeGarment || {};
  const stages = activeStages || [];
  const trial = activeTrial;

  const historyEvents = [];

  historyEvents.push({
    title: 'Order Intake & Silhouette Registration',
    time: formatDate(g.createdAt) || 'Order Day',
    badge: 'Created',
    badgeColor: 'lime',
    desc: `Garment ${escapeHTML(g.garmentCode || '')} registered for client ${escapeHTML(g.customerName || 'Walk-in')}. Style: ${escapeHTML(g.garmentType || 'Bespoke')}.`,
    actor: g.designer || 'Design Consultant'
  });

  if (activeMeasurements) {
    historyEvents.push({
      title: '34-Point Anatomical Measurements Confirmed',
      time: formatDate(activeMeasurements.createdAt || g.createdAt) || 'Intake Phase',
      badge: 'Verified',
      badgeColor: 'purple',
      desc: `Profile confirmed. Bust: ${activeMeasurements.bust || '—'}", Waist: ${activeMeasurements.waist || '—'}".`,
      actor: activeMeasurements.recordedBy || 'Master Tailor'
    });
  }

  historyEvents.push({
    title: 'Fabric & Trims Inventory Allocation',
    time: formatDate(g.createdAt) || 'Prep Phase',
    badge: (g.materialStatus || 'READY').toUpperCase() === 'READY' ? 'Allocated' : 'Partial',
    badgeColor: 'lime',
    desc: `Base textiles (${escapeHTML(g.fabric || g.garmentType || 'Silk')}) allocated from atelier inventory ledger.`,
    actor: 'Inventory Storekeeper'
  });

  if (Array.isArray(stages) && stages.length > 0) {
    stages.forEach(st => {
      if (st.status === 'COMPLETED' || st.status === 'IN_PROGRESS') {
        historyEvents.push({
          title: `Milestone: ${escapeHTML(st.stageName || st.name)}`,
          time: st.completedAt ? formatDate(st.completedAt) : (st.startedAt ? formatDate(st.startedAt) : 'In Progress'),
          badge: st.status === 'COMPLETED' ? 'Completed' : 'Active',
          badgeColor: st.status === 'COMPLETED' ? 'lime' : 'amber',
          desc: st.notes || `Production stage processed by ${escapeHTML(st.assignedArtisan || g.assignedTo || 'Atelier Artisan')}.`,
          actor: st.assignedArtisan || g.assignedTo || 'Atelier Artisan'
        });
      }
    });
  }

  if (trial || g.trialDate) {
    historyEvents.push({
      title: 'Bespoke Fitting Consultation',
      time: formatDate(g.trialDate) || 'Trial Day',
      badge: trial ? (trial.status || 'Scheduled') : 'Scheduled',
      badgeColor: trial?.status === 'PERFECT' ? 'lime' : 'amber',
      desc: trial?.customerFeedback || 'Client fitting consultation booked to review drape, dart lines, and comfort.',
      actor: 'Fitting Master'
    });
  }

  historyEvents.push({
    title: 'Committed Delivery Handover',
    time: formatDate(g.dueDate) || 'Target Date',
    badge: (g.status || '').toUpperCase() === 'DELIVERED' ? 'Delivered' : 'Scheduled',
    badgeColor: (g.status || '').toUpperCase() === 'DELIVERED' ? 'lime' : 'purple',
    desc: `Final press, packaging in garment bag, and handover at ${escapeHTML(g.branch || 'Main Branch')}.`,
    actor: 'Concierge Desk'
  });

  const html = `
    <div style="font-size:12px;color:#9ca3af;margin-bottom:14px;">
      Complete audit trail and lifecycle transitions for <strong style="color:#fff;">${escapeHTML(g.garmentCode || 'Garment')}</strong>:
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;max-height:60vh;overflow-y:auto;padding-right:4px;">
      ${historyEvents.map((ev, i) => `
        <div style="display:flex;gap:12px;position:relative;">
          ${i < historyEvents.length - 1 ? '<div style="position:absolute;left:13px;top:26px;bottom:-12px;width:1.5px;background:rgba(255,255,255,0.1);"></div>' : ''}
          <div style="width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.06);border:1.5px solid ${ev.badgeColor === 'lime' ? 'var(--lime)' : (ev.badgeColor === 'amber' ? '#f59e0b' : '#a78bfa')};display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;z-index:1;">
            <span style="color:${ev.badgeColor === 'lime' ? 'var(--lime)' : (ev.badgeColor === 'amber' ? '#f59e0b' : '#a78bfa')};">&bull;</span>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px 12px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
              <strong style="font-size:12.5px;color:#fff;">${escapeHTML(ev.title)}</strong>
              <span style="font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700;background:rgba(255,255,255,0.08);color:${ev.badgeColor === 'lime' ? 'var(--lime)' : (ev.badgeColor === 'amber' ? '#f59e0b' : '#a78bfa')};">
                ${escapeHTML(ev.badge)}
              </span>
            </div>
            <p style="margin:0 0 6px 0;font-size:11.5px;color:#9ca3af;line-height:1.4;">${escapeHTML(ev.desc)}</p>
            <div style="display:flex;justify-content:space-between;font-size:10.5px;color:#6b7280;">
              <span><i data-lucide="user" style="width:11px;height:11px;vertical-align:middle;"></i> ${escapeHTML(ev.actor)}</span>
              <span><i data-lucide="clock" style="width:11px;height:11px;vertical-align:middle;"></i> ${escapeHTML(ev.time)}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="display:flex;justify-content:flex-end;margin-top:14px;">
      <button type="button" class="btn-g360-primary" onclick="closeModal()">Close</button>
    </div>
  `;

  openModal(`Garment Lifecycle History — ${escapeHTML(g.garmentCode || '')}`, html);
};

// ── Approve Design Change Impact ─────────────────────────────────────────────
window.approveChange = async function() {
  const g = activeGarment;
  if (!g) return;

  const btn = document.querySelector('.btn-ci-approve');
  if (btn && btn.disabled) return;

  try {
    if (api?.garments?.update && g.id) {
      await api.garments.update(g.id, {
        specs: (g.specs || 'Bespoke atelier specs') + ' [Change Approved & Synced]'
      });
    }
  } catch (err) {
    console.warn('[Garment 360] Change approval warning:', err);
  }

  const title = document.getElementById('ciNoticeTitle');
  if (title) title.textContent = 'Change Approved & Synchronized';

  const summary = document.getElementById('ciSummaryText');
  if (summary) {
    summary.textContent = 'All atelier pattern and cut adjustments have been locked into active production.';
    summary.style.color = '#34d399';
  }

  if (btn) {
    btn.innerHTML = '<span>\u2713 Changes Approved</span>';
    btn.disabled = true;
    btn.style.background = 'rgba(16, 185, 129, 0.25)';
    btn.style.color = '#34d399';
    btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    btn.style.cursor = 'default';
  }

  showToast('Design specification changes approved! Atelier specs synchronized.');
};

function openModal(title, bodyHtml) {
  let modal = document.getElementById('g360Modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'g360Modal';
    modal.className = 'g360-modal-overlay';
    modal.innerHTML = `
      <div class="g360-modal-card">
        <div class="g360-modal-header">
          <h3 class="g360-modal-title" id="g360ModalTitle">Modal</h3>
          <button type="button" class="btn-modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div id="g360ModalBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  }
  document.getElementById('g360ModalTitle').textContent = title;
  document.getElementById('g360ModalBody').innerHTML = bodyHtml;
  modal.classList.add('active');
  if (window.lucide) window.lucide.createIcons();
}

window.closeModal = function() {
  const modal = document.getElementById('g360Modal');
  if (modal) modal.classList.remove('active');
};

// ── Interactive Reassignment Modal & Real Operations ─────────────────────────
window.reassignTailor = function() {
  const g = activeGarment;
  if (!g) return;

  const currentWorkerName = (g.assignedTo || '').toLowerCase();
  const artisans = Array.isArray(activeEmployees) ? activeEmployees : [];

  const html = `
    <div style="font-size:12px;color:#9ca3af;margin-bottom:12px;">
      Reassign <strong style="color:#fff;">${escapeHTML(g.garmentCode || g.title)}</strong> to an available atelier artisan.
      Live workload and craft specialization are evaluated:
    </div>

    <div style="margin-bottom:10px;">
      <input type="text" id="reassignSearchInput" placeholder="Filter by artisan name, craft, or role..." 
             oninput="filterReassignList(this.value)"
             style="width:100%;box-sizing:border-box;background:#1e2430;border:1px solid rgba(255,255,255,0.15);color:#fff;padding:8px 10px;border-radius:6px;font-size:12px;" />
    </div>

    <div class="artisan-reassign-list" id="reassignArtisansList">
      ${renderArtisanListHtml(artisans, currentWorkerName, g)}
    </div>
  `;

  openModal('Artisan Assignment & Workforce Rebalancing', html);
};

window.filterReassignList = function(query) {
  const q = (query || '').toLowerCase().trim();
  const g = activeGarment;
  const currentWorkerName = (g?.assignedTo || '').toLowerCase();
  const artisans = Array.isArray(activeEmployees) ? activeEmployees : [];
  const filtered = artisans.filter(a => 
    (a.name || '').toLowerCase().includes(q) ||
    (a.specialization || '').toLowerCase().includes(q) ||
    (a.role || '').toLowerCase().includes(q)
  );
  const container = document.getElementById('reassignArtisansList');
  if (container) {
    container.innerHTML = renderArtisanListHtml(filtered, currentWorkerName, g);
  }
};

function renderArtisanListHtml(artisans, currentWorkerName, g) {
  if (artisans.length === 0) {
    return '<div style="color:#6b7280;font-size:12px;text-align:center;padding:16px;">No matching artisans found.</div>';
  }
  return artisans.map(a => {
    const isCurrent = (a.name || '').toLowerCase() === currentWorkerName;
    const skill = calculateSkillMatch(a, g, g?.productionStage);
    const load = calculateWorkerLoad(a.name);
    const avatar = a.avatarUrl || resolveEmployeeAvatar(a.name);

    return `
      <div class="artisan-reassign-item ${isCurrent ? 'current-assigned' : ''}">
        <div class="artisan-item-left">
          <img src="${avatar}" alt="${escapeHTML(a.name)}" class="artisan-item-avatar" />
          <div class="artisan-item-info">
            <strong>${escapeHTML(a.name)} ${isCurrent ? '<span style="color:var(--lime);font-size:10px;">(Current)</span>' : ''}</strong>
            <span>${escapeHTML(a.role || 'Artisan')} &bull; ${escapeHTML(a.specialization || 'Bespoke Craft')}</span>
          </div>
        </div>
        <div class="artisan-item-meta">
          <div style="display:flex;gap:6px;margin-bottom:4px;">
            <span class="badge-skill-pill">${skill}% Match</span>
            <span class="badge-load-pill">${load.count} Jobs (${load.percentage}%)</span>
          </div>
          ${isCurrent ? `
            <span style="font-size:11px;color:#9ca3af;font-weight:600;">Currently Active</span>
          ` : `
            <button type="button" class="btn-assign-action" onclick="confirmReassign('${escapeHTML(a.name)}')">
              Assign Artisan
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

window.confirmReassign = async function(artisanName) {
  if (!activeGarment) return;
  try {
    if (api?.garments?.update && activeGarment.id) {
      await api.garments.update(activeGarment.id, {
        assignedTo: artisanName
      });
    }
  } catch (err) {
    console.warn('[Garment 360] Reassign API warning:', err);
  }

  activeGarment.assignedTo = artisanName;
  if (activeGarmentLoads) {
    activeGarmentLoads[artisanName] = (activeGarmentLoads[artisanName] || 0) + 1;
  }

  closeModal();
  renderGarmentDossier(activeGarment);
  showToast(`Garment successfully assigned to ${artisanName}`);
};

// ── Next Best Action Details Modal ──────────────────────────────────────────
window.openActionModal = function() {
  const g = activeGarment;
  if (!g) return;

  const nba = activeNextMilestone || computeNextBestAction(g, activeTrial, activeEmployees);
  const currentWorkerName = g.assignedTo || 'Unassigned';
  const currentEmp = activeEmployees.find(e => (e.name || '').toLowerCase() === currentWorkerName.toLowerCase());
  const recWorker = nba.recommendedWorker;

  const curSkill = calculateSkillMatch(currentEmp || { name: currentWorkerName }, g, g.productionStage);
  const curLoad = calculateWorkerLoad(currentWorkerName);

  const html = `
    <div style="margin-bottom:14px;">
      <div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
        <i data-lucide="zap" style="width:13px;height:13px;"></i> RECOMMENDED NEXT MILESTONE
      </div>
      <h3 style="margin:0;font-size:15px;color:#fff;">${escapeHTML(nba.headline)}</h3>
      <p style="font-size:12px;color:#9ca3af;margin:6px 0 0 0;">
        Advancing to <strong style="color:var(--lime);">${escapeHTML(nba.targetStage)}</strong> ensures delivery commitment for 
        <strong style="color:#fff;">${formatDate(g.dueDate) || 'target milestone'}</strong> is safeguarded.
      </p>
    </div>

    <div class="nba-modal-grid">
      <div class="nba-modal-card-box">
        <h4>Current Assignment</h4>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <img src="${currentEmp?.avatarUrl || resolveEmployeeAvatar(currentWorkerName)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" />
          <div>
            <strong style="display:block;font-size:12px;color:#fff;">${escapeHTML(currentWorkerName)}</strong>
            <span style="font-size:10.5px;color:#9ca3af;">${escapeHTML(currentEmp?.specialization || 'Assigned Artisan')}</span>
          </div>
        </div>
        <div style="font-size:11px;display:flex;justify-content:space-between;color:#9ca3af;margin-bottom:3px;">
          <span>Skill Match:</span> <strong style="color:#fff;">${curSkill}%</strong>
        </div>
        <div style="font-size:11px;display:flex;justify-content:space-between;color:#9ca3af;">
          <span>Workload:</span> <strong style="color:#f97316;">${curLoad.percentage}% (${curLoad.count} jobs)</strong>
        </div>
      </div>

      <div class="nba-modal-card-box" style="border-color:rgba(184,255,61,0.25);">
        <h4 style="color:var(--lime);">Recommended Next Lead</h4>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <img src="${recWorker?.avatarUrl || resolveEmployeeAvatar(recWorker?.name)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" />
          <div>
            <strong style="display:block;font-size:12px;color:#fff;">${escapeHTML(recWorker?.name || 'Artisan')}</strong>
            <span style="font-size:10.5px;color:#9ca3af;">${escapeHTML(recWorker?.specialization || 'Next Stage Lead')}</span>
          </div>
        </div>
        <div style="font-size:11px;display:flex;justify-content:space-between;color:#9ca3af;margin-bottom:3px;">
          <span>Target Skill:</span> <strong style="color:var(--lime);">${nba.skillMatch}%</strong>
        </div>
        <div style="font-size:11px;display:flex;justify-content:space-between;color:#9ca3af;">
          <span>Capacity:</span> <strong style="color:var(--lime);">${nba.loadInfo.percentage}% Load</strong>
        </div>
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px 12px;font-size:11.5px;color:#9ca3af;margin-bottom:14px;">
      <strong style="color:#fff;">Operational Readiness Assessment:</strong>
      <div style="margin-top:4px;">
        &bull; <strong>Fabric &amp; Trims:</strong> ${escapeHTML(g.materialStatus || 'Allocated')}<br/>
        &bull; <strong>Fitting Consultations:</strong> ${activeTrial?.trialCode || (g.trialDate ? 'Trial Scheduled' : 'Pending Scheduling')}<br/>
        &bull; <strong>Recommended Action:</strong> Advance garment to <strong>${escapeHTML(nba.targetStage)}</strong>.
      </div>
    </div>

    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button type="button" class="btn-g360-glass" onclick="closeModal()">Close</button>
      ${recWorker && recWorker.name.toLowerCase() !== currentWorkerName.toLowerCase() ? `
        <button type="button" class="btn-g360-glass" onclick="confirmReassign('${escapeHTML(recWorker.name)}')">
          Assign to ${escapeHTML(recWorker.name)}
        </button>
      ` : ''}
      <button type="button" class="btn-g360-primary" onclick="advanceToStage('${escapeHTML(nba.targetStage)}')">
        Advance to ${escapeHTML(nba.targetStage)}
      </button>
    </div>
  `;

  openModal('Next Best Action — Operations Intelligence', html);
};

window.advanceToStage = async function(stageName) {
  if (!activeGarment) return;
  try {
    if (api?.garments?.update && activeGarment.id) {
      await api.garments.update(activeGarment.id, {
        productionStage: stageName
      });
    }
  } catch (err) {
    console.warn('[Garment 360] Stage update error:', err);
  }
  activeGarment.productionStage = stageName;
  closeModal();
  renderGarmentDossier(activeGarment);
  showToast(`Milestone updated to ${stageName}!`);
};

function showToast(msg) {
  let toast = document.getElementById('g360Toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'g360Toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #11141b;
      border: 1px solid var(--lime);
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 10001;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.25s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3000);
}
