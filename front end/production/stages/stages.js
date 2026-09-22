/**
 * stages.js — Production Stage Definitions Management
 * Full CRUD + drag-to-reorder + employee pinning
 */

import api from '../../api.js';

// ─── State ──────────────────────────────────────────────────────────────────
let allStages = [];         // full list (active + inactive)
let allEmployees = [];      // for employee assignment panel
let filterMode = 'all';     // 'all' | 'active' | 'inactive'
let dragSrcIndex = null;
let currentEmpStageId = null; // stageDefId for employee panel

// ─── DOM refs ────────────────────────────────────────────────────────────────
const stagesGrid     = document.getElementById('stagesGrid');
const countBadge     = document.getElementById('stagesCountBadge');
const stageModal     = document.getElementById('stageModal');
const deleteModal    = document.getElementById('deleteModal');
const empModal       = document.getElementById('empModal');

// ─── Artwork Gallery ──────────────────────────────────────────────────────────
// Generic list of available stage artwork files on disk.
// These are visual options only — NOT tied to any stage name or stageKey.
// Users can assign any artwork to any stage they create.
const ARTWORK_GALLERY = [
  { label: 'Order Intake',       imageUrl: '/front end/assets/stages/Order_Taken_1010.jpg' },
  { label: 'Design Studio',      imageUrl: '/front end/assets/stages/Designing_1058.jpg'   },
  { label: 'Fabric Prep',        imageUrl: '/front end/assets/stages/Lining_2047.jpg'       },
  { label: 'Hand Embroidery',    imageUrl: '/front end/assets/stages/Hand_Work_3082.jpg'    },
  { label: 'Cutting Room',       imageUrl: '/front end/assets/stages/Cutting_4091.jpg'      },
  { label: 'Stitching Bay',      imageUrl: '/front end/assets/stages/Stitching_5076.jpg'    },
  { label: 'Fitting Session',    imageUrl: '/front end/assets/stages/Trial_6034.jpg'        },
  { label: 'Quality Check',      imageUrl: '/front end/assets/stages/QC_7019.jpg'           },
  { label: 'Dispatch Ready',     imageUrl: '/front end/assets/stages/Ready_8043.jpg'        },
  { label: 'Draping Atelier',    imageUrl: '/front end/assets/stages/Draping_9012.jpg'      },
  { label: 'Fabric Sourcing',    imageUrl: '/front end/assets/stages/Fabric_9085.jpg'       },
];

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();
  bindUIEvents();
  await Promise.all([loadStages(), loadEmployees()]);
});

// ─── Load data ────────────────────────────────────────────────────────────────
async function loadStages() {
  try {
    allStages = await api.production.stageDefinitions.list();
    renderStages();
  } catch (e) {
    console.error('Failed to load stage definitions', e);
    showToast('Failed to load stage definitions', 'error');
    stagesGrid.innerHTML = `
      <div class="stages-empty">
        <i data-lucide="wifi-off"></i>
        <p>Could not load stages</p>
        <p class="empty-hint">Check that the server is running and try refreshing.</p>
      </div>`;
    lucide.createIcons();
  }
}

async function loadEmployees() {
  try {
    allEmployees = await api.employees.list({ size: 200 });
  } catch (e) {
    console.warn('Could not preload employees:', e);
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderStages() {
  const filtered = filterStages();
  countBadge.textContent = `${filtered.length} stage${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    stagesGrid.innerHTML = `
      <div class="stages-empty">
        <i data-lucide="${filterMode === 'inactive' ? 'eye-off' : 'layers'}"></i>
        <p>${filterMode === 'inactive' ? 'No inactive stages' : 'No stages found'}</p>
        <p class="empty-hint">${filterMode === 'all' ? 'Click "New Stage" to create your first production stage.' : ''}</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  stagesGrid.innerHTML = filtered.map((s, idx) => buildStageCard(s, idx)).join('');
  lucide.createIcons();
  initDragAndDrop();
}

function filterStages() {
  if (filterMode === 'active')   return allStages.filter(s => s.active);
  if (filterMode === 'inactive') return allStages.filter(s => !s.active);
  return allStages;
}

function formatStageImgUrl(url) {
  if (!url) return '';
  const clean = url.replace(/^\/+/, '');
  return clean.startsWith('front end/') ? '../../' + clean.replace('front end/', '') : '../../' + clean;
}

function buildStageCard(stage, idx) {
  const dotClass = stage.colorClass || 'dot-silver';
  const empHtml  = buildEmpPills(stage.pinnedEmployees || []);
  const activeClass = stage.active ? '' : 'inactive';
  const linkedTip = stage.linkedOrderCount > 0
    ? `<span class="meta-item"><i data-lucide="package-2"></i><span>${stage.linkedOrderCount} active order${stage.linkedOrderCount !== 1 ? 's' : ''}</span></span>`
    : '';

  const imgHtml = stage.imageUrl
    ? `<img src="${formatStageImgUrl(stage.imageUrl)}" alt="${escHtml(stage.displayName)}" onerror="this.onerror=null; this.src='../../assets/designs/blouse-stage.png';" />`
    : `<div class="stage-img-placeholder">${escHtml(stage.displayName.charAt(0))}</div>`;

  const imgWrapper = `
    <div class="stage-img-wrapper" title="Click camera icon to change stage artwork">
      ${imgHtml}
      <button type="button" class="stage-img-upload-btn" onclick="triggerCardUpload('${stage.id}', event)" title="Upload photo for ${escHtml(stage.displayName)}">
        <i data-lucide="camera" style="width:16px;height:16px;"></i>
      </button>
    </div>`;

  return `
  <div class="stage-card ${activeClass}"
       data-id="${stage.id}"
       data-sort="${stage.sortOrder}"
       draggable="true"
       id="stageCard_${stage.id}">

    <!-- Drag handle -->
    <div class="drag-handle" title="Drag to reorder">
      <span></span><span></span><span></span>
    </div>

    <!-- Stage Image Thumbnail -->
    ${imgWrapper}

    <!-- Body -->
    <div class="stage-card-body">
      <div class="stage-card-top">
        <span class="stage-dot ${dotClass}"></span>
        <span class="stage-key-badge">${escHtml(stage.stageKey)}</span>
        <span class="stage-display-name">${escHtml(stage.displayName)}</span>
        ${!stage.active ? '<span class="inactive-tag">Inactive</span>' : ''}
      </div>
      <div class="stage-card-meta">
        ${stage.requiredRole ? `<span class="meta-item"><i data-lucide="user-check"></i><span class="meta-value">${titleCase(stage.requiredRole)}</span></span>` : ''}
        ${stage.deptLabel ? `<span class="meta-item"><i data-lucide="building-2"></i><span class="meta-value">${escHtml(stage.deptLabel)}</span></span>` : ''}
        ${linkedTip}
        ${empHtml}
      </div>
    </div>

    <!-- Actions -->
    <div class="stage-card-actions">
      <span class="sort-chip" title="Sort order">${stage.sortOrder}</span>

      <!-- Toggle active -->
      <button class="btn-icon ${stage.active ? '' : 'warn'}" title="${stage.active ? 'Deactivate stage' : 'Activate stage'}"
              onclick="toggleActive('${stage.id}', this)">
        <i data-lucide="${stage.active ? 'eye' : 'eye-off'}" style="width:14px;height:14px;"></i>
      </button>

      <!-- Assign employees -->
      <button class="btn-icon" title="Assign employees"
              onclick="openEmpPanel('${stage.id}', '${escHtml(stage.displayName)}', '${stage.requiredRole || ''}')">
        <i data-lucide="users" style="width:14px;height:14px;"></i>
      </button>

      <!-- Edit -->
      <button class="btn-icon" title="Edit stage"
              onclick="openEditModal(${JSON.stringify(stage).replace(/"/g, '&quot;')})">
        <i data-lucide="pencil" style="width:14px;height:14px;"></i>
      </button>

      <!-- Delete -->
      <button class="btn-icon danger" title="Delete stage"
              onclick="openDeleteModal('${stage.id}', '${escHtml(stage.displayName)}', ${stage.linkedOrderCount})">
        <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
      </button>
    </div>
  </div>`;
}

function buildEmpPills(employees) {
  if (!employees || employees.length === 0) return '';
  const shown = employees.slice(0, 3);
  const more  = employees.length - shown.length;
  const pills = shown.map(e => {
    const initials = (e.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const avatar = e.avatarUrl
      ? `<img src="../../${e.avatarUrl}" alt="${escHtml(e.name)}" />`
      : `<span class="emp-pill-placeholder">${initials}</span>`;
    return `<span class="emp-pill">${avatar}${escHtml(e.name.split(' ')[0])}</span>`;
  }).join('');
  const moreHtml = more > 0 ? `<span class="emp-count-more">+${more} more</span>` : '';
  return `<span class="meta-item"><div class="emp-pills">${pills}${moreHtml}</div></span>`;
}

// ─── Drag and Drop Reorder ────────────────────────────────────────────────────
function initDragAndDrop() {
  const cards = stagesGrid.querySelectorAll('.stage-card');

  cards.forEach((card, idx) => {
    card.addEventListener('dragstart', e => {
      dragSrcIndex = idx;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      stagesGrid.querySelectorAll('.stage-card').forEach(c => c.classList.remove('drag-over'));
    });
    card.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      stagesGrid.querySelectorAll('.stage-card').forEach(c => c.classList.remove('drag-over'));
      card.classList.add('drag-over');
    });
    card.addEventListener('drop', async e => {
      e.preventDefault();
      card.classList.remove('drag-over');
      const targetIdx = idx;
      if (dragSrcIndex === null || dragSrcIndex === targetIdx) return;

      const filtered = filterStages();
      const moved = filtered.splice(dragSrcIndex, 1)[0];
      filtered.splice(targetIdx, 0, moved);

      // Update allStages order to match
      const filteredIds = new Set(filtered.map(s => s.id));
      const others = allStages.filter(s => !filteredIds.has(s.id));
      allStages = [...filtered, ...others];
      renderStages();

      try {
        const orderedIds = filtered.map(s => s.id);
        await api.production.stageDefinitions.reorder(orderedIds);
        showToast('Stage order saved', 'success');
        await loadStages();
      } catch (err) {
        showToast('Failed to save order', 'error');
        await loadStages();
      }
      dragSrcIndex = null;
    });
  });
}

// ─── Toggle Active ────────────────────────────────────────────────────────────
window.toggleActive = async (stageId, btn) => {
  btn.disabled = true;
  try {
    const updated = await api.production.stageDefinitions.toggle(stageId);
    const idx = allStages.findIndex(s => s.id === stageId);
    if (idx !== -1) allStages[idx] = updated;
    renderStages();
    showToast(`Stage ${updated.active ? 'activated' : 'deactivated'}`, 'info');
  } catch (e) {
    showToast('Failed to update stage status', 'error');
  } finally {
    btn.disabled = false;
  }
};

// ─── 1-Click Card Image Upload ───────────────────────────────────────────────
window.triggerCardUpload = (stageId, e) => {
  if (e && e.stopPropagation) e.stopPropagation();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      showToast('Uploading stage image...', 'info');
      const updated = await api.production.stageDefinitions.uploadImage(stageId, file);
      const idx = allStages.findIndex(s => s.id === stageId);
      if (idx !== -1) allStages[idx] = updated;
      renderStages();
      showToast(`Image updated for ${updated.displayName}!`, 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to upload stage image', 'error');
    }
  };
  input.click();
};

// ─── Add / Edit Modal & Preset Selection ───────────────────────────────────────
window.switchImageTab = (tab) => {
  const isPresets = tab === 'presets';
  document.getElementById('tabBtnPresets')?.classList.toggle('active', isPresets);
  document.getElementById('tabBtnUpload')?.classList.toggle('active', !isPresets);
  const panePresets = document.getElementById('panePresets');
  const paneUpload = document.getElementById('paneUpload');
  if (panePresets) panePresets.style.display = isPresets ? 'block' : 'none';
  if (paneUpload) paneUpload.style.display = isPresets ? 'none' : 'block';
  setTimeout(() => lucide.createIcons(), 30);
};

function renderPresetGallery(selectedUrl = '') {
  const grid = document.getElementById('presetGalleryGrid');
  if (!grid) return;

  // Renders the generic artwork gallery — images are visual options only,
  // not tied to any specific stage name. Users pick by appearance.
  grid.innerHTML = ARTWORK_GALLERY.map(p => {
    const isSel = selectedUrl && p.imageUrl && (
      p.imageUrl === selectedUrl || selectedUrl.endsWith(p.imageUrl.split('/').pop())
    );
    return `
      <div class="preset-card ${isSel ? 'selected' : ''}" onclick="selectPresetImage('${p.imageUrl}', '${escHtml(p.label)}')">
        <div class="preset-thumb-wrap">
          <img src="${formatStageImgUrl(p.imageUrl)}" alt="${escHtml(p.label)}" onerror="this.onerror=null; this.src='../../assets/designs/blouse-stage.png';" />
        </div>
        <span class="preset-label" title="${escHtml(p.label)}">${escHtml(p.label)}</span>
      </div>
    `;
  }).join('');
}

window.selectPresetImage = (url, name) => {
  const hiddenUrl = document.getElementById('fImageUrl');
  const fileInput = document.getElementById('fStageImageFile');
  if (hiddenUrl) hiddenUrl.value = url;
  if (fileInput) fileInput.value = '';

  updateBadgePreview(url, name);
  renderPresetGallery(url);
};

function updateBadgePreview(url, name) {
  const previewImg = document.getElementById('stageImgPreview');
  const placeholder = document.getElementById('stageImgPreviewPlaceholder');
  const titleEl = document.getElementById('previewBadgeName');
  const subEl = document.getElementById('previewBadgeSub');
  const clearBtn = document.getElementById('btnRemoveStageImg');

  if (url) {
    if (previewImg) {
      previewImg.src = url.startsWith('data:') ? url : formatStageImgUrl(url);
      previewImg.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (titleEl) titleEl.textContent = name || 'Selected Stage Badge';
    if (subEl) subEl.textContent = 'Active circular framed atelier artwork';
    if (clearBtn) clearBtn.style.display = 'inline-flex';
  } else {
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'flex';
    if (titleEl) titleEl.textContent = 'No image selected';
    if (subEl) subEl.textContent = 'Select a circular framed preset below or upload custom photo';
    if (clearBtn) clearBtn.style.display = 'none';
  }
}

function openAddModal() {
  document.getElementById('editingStageId').value = '';
  document.getElementById('stageModalTitle').textContent   = 'New Production Stage';
  document.getElementById('stageModalSubtitle').textContent = 'Define a new step in your workflow.';
  document.getElementById('btnSaveStageLabel').textContent  = 'Create Stage';
  document.getElementById('stageForm').reset();
  document.getElementById('stageKeyPreview').textContent = '';
  selectColor('dot-purple');

  // Reset image upload zone
  const fileInput = document.getElementById('fStageImageFile');
  if (fileInput) fileInput.value = '';
  const hiddenUrl = document.getElementById('fImageUrl');
  if (hiddenUrl) hiddenUrl.value = '';

  updateBadgePreview(null);
  switchImageTab('presets');
  renderPresetGallery('');

  openModal(stageModal);
}

window.openEditModal = (stage) => {
  document.getElementById('editingStageId').value   = stage.id;
  document.getElementById('stageModalTitle').textContent    = 'Edit Stage';
  document.getElementById('stageModalSubtitle').textContent = `Editing: ${stage.displayName}`;
  document.getElementById('btnSaveStageLabel').textContent  = 'Save Changes';
  document.getElementById('fDisplayName').value    = stage.displayName || '';
  document.getElementById('fDescription').value    = stage.description || '';
  document.getElementById('fRequiredRole').value   = stage.requiredRole || '';
  document.getElementById('fSortOrder').value      = stage.sortOrder || '';
  document.getElementById('fDeptLabel').value      = stage.deptLabel || '';
  document.getElementById('fActive').checked       = stage.active;
  document.getElementById('stageKeyPreview').textContent = `Key: ${stage.stageKey}`;
  selectColor(stage.colorClass || 'dot-purple');

  // Configure image selection
  const fileInput = document.getElementById('fStageImageFile');
  if (fileInput) fileInput.value = '';
  const hiddenUrl = document.getElementById('fImageUrl');
  if (hiddenUrl) hiddenUrl.value = stage.imageUrl || '';

  updateBadgePreview(stage.imageUrl, stage.displayName);
  switchImageTab('presets');
  renderPresetGallery(stage.imageUrl || '');

  openModal(stageModal);
};

document.getElementById('stageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id          = document.getElementById('editingStageId').value;
  const saveBtn     = document.getElementById('btnSaveStage');
  saveBtn.disabled  = true;

  const fileToUpload = document.getElementById('fStageImageFile')?.files?.[0];
  const imageUrlVal  = document.getElementById('fImageUrl')?.value?.trim() || null;

  const payload = {
    displayName:  document.getElementById('fDisplayName').value.trim(),
    description:  document.getElementById('fDescription').value.trim() || null,
    requiredRole: document.getElementById('fRequiredRole').value || null,
    sortOrder:    parseInt(document.getElementById('fSortOrder').value) || null,
    deptLabel:    document.getElementById('fDeptLabel').value.trim() || null,
    colorClass:   document.getElementById('fColorClass').value || 'dot-silver',
    active:       document.getElementById('fActive').checked,
    imageUrl:     imageUrlVal,
  };

  try {
    let savedStage;
    if (id) {
      savedStage = await api.production.stageDefinitions.update(id, payload);
      const idx = allStages.findIndex(s => s.id === id);
      if (idx !== -1) allStages[idx] = savedStage; else allStages.push(savedStage);
      showToast('Stage updated', 'success');
    } else {
      savedStage = await api.production.stageDefinitions.create(payload);
      allStages.push(savedStage);
      showToast('Stage created!', 'success');
    }

    // If new file chosen in modal, upload it now
    if (fileToUpload && savedStage?.id) {
      try {
        showToast('Uploading stage image...', 'info');
        const withImg = await api.production.stageDefinitions.uploadImage(savedStage.id, fileToUpload);
        const idx = allStages.findIndex(s => s.id === savedStage.id);
        if (idx !== -1) allStages[idx] = withImg;
        showToast(`Image saved as ${withImg.imageUrl.split('/').pop()}!`, 'success');
      } catch (upErr) {
        showToast('Stage saved, but image upload failed: ' + (upErr.message || ''), 'error');
      }
    }

    closeModal(stageModal);
    renderStages();
  } catch (err) {
    const msg = err?.message || 'Failed to save stage';
    showToast(msg, 'error');
  } finally {
    saveBtn.disabled = false;
  }
});

// ─── Color Picker ─────────────────────────────────────────────────────────────
function selectColor(colorClass) {
  document.getElementById('fColorClass').value = colorClass;
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('selected', s.dataset.color === colorClass);
  });
}

document.getElementById('colorPickerRow').addEventListener('click', e => {
  const swatch = e.target.closest('.color-swatch');
  if (swatch) selectColor(swatch.dataset.color);
});

// Live stage key preview
document.getElementById('fDisplayName').addEventListener('input', e => {
  const key = e.target.value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  const id  = document.getElementById('editingStageId').value;
  document.getElementById('stageKeyPreview').textContent = key ? (id ? `Key: ${key}` : `→ key: ${key}`) : '';
});

// ─── Delete Modal ─────────────────────────────────────────────────────────────
let pendingDeleteId = null;

window.openDeleteModal = (stageId, stageName, linkedCount) => {
  pendingDeleteId = stageId;
  document.getElementById('deleteTargetName').textContent = stageName;
  const statEl = document.getElementById('deleteLinkedStat');
  if (linkedCount > 0) {
    document.getElementById('deleteLinkedMsg').textContent =
      `${linkedCount} production order record${linkedCount !== 1 ? 's' : ''} reference this stage. Hard delete is blocked — deactivate it instead.`;
    statEl.style.display = 'flex';
    document.getElementById('btnConfirmDelete').disabled = true;
  } else {
    statEl.style.display = 'none';
    document.getElementById('btnConfirmDelete').disabled = false;
  }
  openModal(deleteModal);
};

document.getElementById('btnConfirmDelete').addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  try {
    await api.production.stageDefinitions.delete(pendingDeleteId);
    allStages = allStages.filter(s => s.id !== pendingDeleteId);
    renderStages();
    closeModal(deleteModal);
    showToast('Stage deleted', 'info');
  } catch (err) {
    showToast(err?.message || 'Delete failed', 'error');
  }
});

// ─── Employee Panel ───────────────────────────────────────────────────────────
window.openEmpPanel = async (stageId, stageName, requiredRole) => {
  currentEmpStageId = stageId;
  document.getElementById('empModalTitle').textContent    = `Employees — ${stageName}`;
  document.getElementById('empModalSubtitle').textContent = requiredRole
    ? `Showing ${titleCase(requiredRole)} employees. Others can also be searched.`
    : 'Pin specialists to this stage.';
  document.getElementById('empSearchInput').value = '';
  openModal(empModal);
  renderEmpList(stageId, '');
};

document.getElementById('empSearchInput').addEventListener('input', e => {
  if (currentEmpStageId) renderEmpList(currentEmpStageId, e.target.value);
});

function renderEmpList(stageId, search) {
  const stage     = allStages.find(s => s.id === stageId);
  const pinned    = new Set((stage?.pinnedEmployees || []).map(e => e.id));
  const query     = search.toLowerCase();
  const filtered  = allEmployees.filter(e =>
    !query ||
    e.name?.toLowerCase().includes(query) ||
    e.role?.toLowerCase().includes(query)
  );
  const container = document.getElementById('empListContainer');
  if (!filtered.length) {
    container.innerHTML = `<p style="text-align:center;color:var(--clr-muted);font-size:13px;padding:20px 0;">No employees found</p>`;
    return;
  }

  container.innerHTML = filtered.map(e => {
    const initials = (e.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const isPinned = pinned.has(e.id);
    const avatar   = e.avatarUrl
      ? `<img src="../../${e.avatarUrl}" alt="${escHtml(e.name)}" />`
      : `<div class="emp-avatar-fallback">${initials}</div>`;
    return `
    <div class="emp-list-item ${isPinned ? 'pinned' : ''}" data-empid="${e.id}">
      ${avatar}
      <div class="emp-list-item-info">
        <div class="emp-list-item-name">${escHtml(e.name)}</div>
        <div class="emp-list-item-role">${titleCase(e.role || '—')} · ${e.status || ''}</div>
      </div>
      <button class="emp-pin-btn ${isPinned ? 'remove' : 'add'}"
              onclick="toggleEmpPin('${stageId}', '${e.id}', ${isPinned}, this)">
        ${isPinned ? 'Unpin' : 'Pin'}
      </button>
    </div>`;
  }).join('');
}

window.toggleEmpPin = async (stageId, empId, isPinned, btn) => {
  btn.disabled = true;
  try {
    let updated;
    if (isPinned) {
      updated = await api.production.stageDefinitions.removeEmployee(stageId, empId);
    } else {
      updated = await api.production.stageDefinitions.assignEmployee(stageId, empId);
    }
    const idx = allStages.findIndex(s => s.id === stageId);
    if (idx !== -1) allStages[idx] = updated;
    renderStages();
    renderEmpList(stageId, document.getElementById('empSearchInput').value);
    showToast(isPinned ? 'Employee unpinned' : 'Employee pinned', 'success');
  } catch (err) {
    showToast('Failed to update employee assignment', 'error');
  } finally {
    btn.disabled = false;
  }
};

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
['filterAll', 'filterActive', 'filterInactive'].forEach(btnId => {
  document.getElementById(btnId).addEventListener('click', () => {
    filterMode = btnId === 'filterAll' ? 'all' : btnId === 'filterActive' ? 'active' : 'inactive';
    document.querySelectorAll('.filter-toggle button').forEach(b => b.classList.remove('active'));
    document.getElementById(btnId).classList.add('active');
    renderStages();
  });
});

// ─── Modal Image Upload Handlers ──────────────────────────────────────────────
function initImageUploadHandlers() {
  const fileInput = document.getElementById('fStageImageFile');
  const dropzone  = document.getElementById('stageUploadDropzone');
  const removeBtn = document.getElementById('btnRemoveStageImg');
  const hiddenUrl = document.getElementById('fImageUrl');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files?.length) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelected(fileInput.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      fileInput.value = '';
      if (hiddenUrl) hiddenUrl.value = '';
      updateBadgePreview(null);
      renderPresetGallery('');
    });
  }

  function handleFileSelected(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please choose an image file (PNG, JPG, WEBP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      updateBadgePreview(e.target.result, file.name);
      if (hiddenUrl) hiddenUrl.value = ''; // Will upload file on save
      renderPresetGallery('');
    };
    reader.readAsDataURL(file);
  }
}

// ─── UI Event Bindings ────────────────────────────────────────────────────────
function bindUIEvents() {
  initImageUploadHandlers();
  document.getElementById('btnNewStage').addEventListener('click', openAddModal);
  document.getElementById('btnBackToProduction').addEventListener('click', () => {
    window.location.href = '../production.html';
  });

  // Stage modal close
  document.getElementById('btnCloseStageModal').addEventListener('click', () => closeModal(stageModal));
  document.getElementById('btnCancelStageModal').addEventListener('click', () => closeModal(stageModal));

  // Delete modal close
  document.getElementById('btnCloseDeleteModal').addEventListener('click', () => closeModal(deleteModal));
  document.getElementById('btnCancelDeleteModal').addEventListener('click', () => closeModal(deleteModal));

  // Emp modal close
  document.getElementById('btnCloseEmpModal').addEventListener('click', () => closeModal(empModal));

  // Close on overlay click
  [stageModal, deleteModal, empModal].forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
  });

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      [stageModal, deleteModal, empModal].forEach(m => { if (m.classList.contains('open')) closeModal(m); });
    }
  });
}

// ─── Modal helpers ────────────────────────────────────────────────────────────
function openModal(modal) {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => lucide.createIcons(), 50);
}
function closeModal(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: 'check-circle', error: 'x-circle', info: 'info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i data-lucide="${icons[type] || 'info'}" style="width:16px;height:16px;flex-shrink:0;"></i><span>${escHtml(message)}</span>`;
  container.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(32px)';
    toast.style.transition = 'opacity .3s, transform .3s';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ─── Util ─────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function titleCase(str) {
  return (str || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
