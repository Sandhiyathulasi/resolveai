/**
 * SmartResolve AI - Main Application Controller
 * Handles UI interactions, view switching, form submissions,
 * live AI preview, complaint tracking, and administrative controls.
 */

(function() {
  'use strict';

  // State
  let currentTab = 'dashboard';
  let liveAnalysisTimeout = null;

  // DOM Elements
  const tabs = document.querySelectorAll('.nav-link[data-tab]');
  const tabViews = document.querySelectorAll('.tab-view');
  const adminBadge = document.getElementById('nav-admin-badge');
  const brandHomeLink = document.getElementById('brand-home-link');

  // Stats DOM
  const statTotal = document.getElementById('stat-total');
  const statPending = document.getElementById('stat-pending');
  const statInProgress = document.getElementById('stat-in-progress');
  const statResolved = document.getElementById('stat-resolved');
  const statRate = document.getElementById('stat-rate');
  const catDistributionBar = document.getElementById('cat-distribution-bar');
  const recentComplaintsTbody = document.getElementById('recent-complaints-tbody');

  // Form DOM
  const complaintForm = document.getElementById('complaint-form');
  const studentNameInput = document.getElementById('studentName');
  const studentRollInput = document.getElementById('studentRoll');
  const studentEmailInput = document.getElementById('studentEmail');
  const locationInput = document.getElementById('location');
  const categorySelect = document.getElementById('categorySelect');
  const complaintTitleInput = document.getElementById('complaintTitle');
  const complaintDescInput = document.getElementById('complaintDescription');
  const btnResetForm = document.getElementById('btn-reset-form');

  // Live AI Preview DOM
  const aiLiveBox = document.getElementById('ai-live-preview-box');
  const aiConfIndicator = document.getElementById('ai-confidence-indicator');
  const aiPredCategory = document.getElementById('ai-pred-category');
  const aiPredPriority = document.getElementById('ai-pred-priority');
  const aiPredDept = document.getElementById('ai-pred-dept');
  const aiPredAction = document.getElementById('ai-pred-action');

  // Tracking DOM
  const trackSearchInput = document.getElementById('track-search-input');
  const btnTrackSearch = document.getElementById('btn-track-search');
  const trackResultContainer = document.getElementById('track-result-container');
  const quickTrackChips = document.getElementById('quick-track-chips');

  // Admin DOM
  const adminSearchInput = document.getElementById('admin-search-input');
  const adminFilterStatus = document.getElementById('admin-filter-status');
  const adminFilterCategory = document.getElementById('admin-filter-category');
  const adminFilterPriority = document.getElementById('admin-filter-priority');
  const adminSortBy = document.getElementById('admin-sort-by');
  const adminComplaintsTbody = document.getElementById('admin-complaints-tbody');
  const btnAdminExport = document.getElementById('btn-admin-export');
  const btnAdminSeed = document.getElementById('btn-admin-seed');
  const btnAdminClear = document.getElementById('btn-admin-clear');

  // Top header actions
  const btnQuickSampleData = document.getElementById('btn-quick-sample-data');
  const btnQuickClearData = document.getElementById('btn-quick-clear-data');

  // Modals DOM
  const modalSuccess = document.getElementById('modal-success');
  const modalSuccessId = document.getElementById('modal-success-id');
  const modalSuccessCategory = document.getElementById('modal-success-category');
  const modalSuccessPriority = document.getElementById('modal-success-priority');
  const modalSuccessDept = document.getElementById('modal-success-dept');
  const btnCopyId = document.getElementById('btn-copy-id');
  const btnModalGoTrack = document.getElementById('btn-modal-go-track');

  const modalAdminManage = document.getElementById('modal-admin-manage');
  const manageComplaintId = document.getElementById('manage-complaint-id');
  const manageInfoId = document.getElementById('manage-info-id');
  const manageInfoBadges = document.getElementById('manage-info-badges');
  const manageInfoSubject = document.getElementById('manage-info-subject');
  const manageInfoDesc = document.getElementById('manage-info-desc');
  const manageInfoStudent = document.getElementById('manage-info-student');
  const manageInfoLocation = document.getElementById('manage-info-location');
  const manageInfoDate = document.getElementById('manage-info-date');
  const manageInfoAction = document.getElementById('manage-info-action');
  const manageSelectStatus = document.getElementById('manage-select-status');
  const manageTextareaRemarks = document.getElementById('manage-textarea-remarks');
  const btnSaveAdminUpdate = document.getElementById('btn-save-admin-update');
  const btnAdminDeleteComplaint = document.getElementById('btn-admin-delete-complaint');

  const toastContainer = document.getElementById('toast-container');

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    setupNavigation();
    setupComplaintForm();
    setupTrackingView();
    setupAdminView();
    setupModals();
    setupGlobalDemoActions();

    // Check URL Hash or default to dashboard
    const initialHash = window.location.hash.replace('#', '');
    if (['dashboard', 'submit', 'track', 'admin', 'about-ai'].includes(initialHash)) {
      switchTab(initialHash);
    } else {
      switchTab('dashboard');
    }

    refreshAllData();
  }

  // ==========================================
  // NAVIGATION
  // ==========================================
  function switchTab(tabId) {
    currentTab = tabId;

    tabs.forEach(tab => {
      if (tab.dataset.tab === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    tabViews.forEach(view => {
      if (view.id === `view-${tabId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    window.location.hash = tabId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Tab-specific refreshes
    if (tabId === 'dashboard') {
      refreshDashboard();
    } else if (tabId === 'admin') {
      refreshAdminTable();
    } else if (tabId === 'track') {
      refreshQuickTrackChips();
    }
  }

  function setupNavigation() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
      });
    });

    if (brandHomeLink) {
      brandHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('dashboard');
      });
    }

    // Direct action buttons (e.g. Hero cards)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;

      if (action === 'go-to-submit') {
        switchTab('submit');
      } else if (action === 'go-to-track') {
        switchTab('track');
      } else if (action === 'go-to-admin') {
        switchTab('admin');
      } else if (action === 'go-to-dashboard') {
        switchTab('dashboard');
      }
    });

    // Also support any footer or inline link with [data-tab]
    document.addEventListener('click', (e) => {
      const tabLink = e.target.closest('[data-tab]:not(.nav-link)');
      if (tabLink && tabLink.dataset.tab) {
        e.preventDefault();
        switchTab(tabLink.dataset.tab);
      }
    });

    // Handle browser back/forward buttons
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'submit', 'track', 'admin', 'about-ai'].includes(hash) && hash !== currentTab) {
        switchTab(hash);
      }
    });
  }

  // ==========================================
  // DASHBOARD & STATS REFRESH
  // ==========================================
  function refreshAllData() {
    refreshDashboard();
    refreshAdminTable();
    refreshQuickTrackChips();
  }

  function refreshDashboard() {
    const stats = ComplaintStorage.getStatistics();
    const complaints = ComplaintStorage.getAll();

    // Update stat numbers
    if (statTotal) statTotal.textContent = stats.total;
    if (statPending) statPending.textContent = stats.pending;
    if (statInProgress) statInProgress.textContent = stats.inProgress;
    if (statResolved) statResolved.textContent = stats.resolved;
    if (statRate) statRate.textContent = `${stats.resolutionRate}% resolution rate`;
    if (adminBadge) adminBadge.textContent = stats.total;

    // Render category distribution pills
    renderCategoryDistribution(stats.categoryCounts);

    // Render recent complaints table (top 5)
    renderRecentComplaints(complaints.slice(0, 5));
  }

  function renderCategoryDistribution(counts) {
    if (!catDistributionBar) return;
    catDistributionBar.innerHTML = '';

    const categories = ['Water', 'Electricity', 'Wi-Fi', 'Cleanliness', 'Maintenance', 'Other'];
    categories.forEach(cat => {
      const count = counts[cat] || 0;
      const pill = document.createElement('div');
      pill.className = 'cat-stat-pill';
      pill.innerHTML = `
        <span class="cat-name">${cat}</span>
        <span class="cat-count">${count}</span>
      `;
      catDistributionBar.appendChild(pill);
    });
  }

  function renderRecentComplaints(recentList) {
    if (!recentComplaintsTbody) return;
    recentComplaintsTbody.innerHTML = '';

    if (recentList.length === 0) {
      recentComplaintsTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--slate-400);">
            No complaints logged yet. Click "Load Sample Complaints" above or submit a new grievance.
          </td>
        </tr>
      `;
      return;
    }

    recentList.forEach(c => {
      const tr = document.createElement('tr');
      const timeStr = formatDate(c.createdAt);

      tr.innerHTML = `
        <td class="id-cell">${escapeHtml(c.id)}</td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(c.studentName)}</div>
          <div style="font-size: 0.75rem; color: var(--slate-400);">${escapeHtml(c.studentRoll)}</div>
        </td>
        <td class="title-cell">
          <div class="title-main" title="${escapeHtml(c.title)}">${escapeHtml(c.title)}</div>
          <div class="title-sub">${escapeHtml(c.location)}</div>
        </td>
        <td>
          <span class="badge badge-cat">${escapeHtml(c.category)}</span>
        </td>
        <td>
          <span class="badge ${getPriorityBadgeClass(c.priority)}">${escapeHtml(c.priority)}</span>
        </td>
        <td>
          <span class="badge ${getStatusBadgeClass(c.status)}">
            <span class="badge-dot"></span>
            ${escapeHtml(c.status)}
          </span>
        </td>
        <td style="font-size: 0.8125rem; color: var(--slate-500); white-space: nowrap;">${timeStr}</td>
        <td>
          <button class="btn btn-secondary btn-sm" data-track-id="${escapeHtml(c.id)}">
            Track →
          </button>
        </td>
      `;

      // Click to track handler
      const trackBtn = tr.querySelector('[data-track-id]');
      trackBtn.addEventListener('click', () => {
        switchTab('track');
        if (trackSearchInput) trackSearchInput.value = c.id;
        performSearch(c.id);
      });

      recentComplaintsTbody.appendChild(tr);
    });
  }

  // ==========================================
  // COMPLAINT FORM & LIVE AI PREVIEW
  // ==========================================
  function setupComplaintForm() {
    if (!complaintForm) return;

    // Live AI debounced analysis as student types
    const triggerLiveAnalysis = () => {
      clearTimeout(liveAnalysisTimeout);
      liveAnalysisTimeout = setTimeout(runLiveAIAnalysis, 200);
    };

    complaintTitleInput.addEventListener('input', triggerLiveAnalysis);
    complaintDescInput.addEventListener('input', triggerLiveAnalysis);
    locationInput.addEventListener('input', triggerLiveAnalysis);
    categorySelect.addEventListener('change', triggerLiveAnalysis);

    // Reset Form
    btnResetForm.addEventListener('click', () => {
      complaintForm.reset();
      resetLiveAIPanel();
      showToast('Form Reset', 'All input fields cleared.', 'info');
    });

    // Form Submit
    complaintForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const studentName = studentNameInput.value.trim();
      const studentRoll = studentRollInput.value.trim();
      const studentEmail = studentEmailInput.value.trim();
      const location = locationInput.value.trim();
      const manualCategory = categorySelect.value;
      const title = complaintTitleInput.value.trim();
      const description = complaintDescInput.value.trim();

      // Basic validation
      if (!studentName || !studentRoll || !studentEmail || !location || !title || !description) {
        showToast('Validation Error', 'Please complete all required fields.', 'error');
        return;
      }

      // Email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
        showToast('Invalid Email', 'Please enter a valid campus email address.', 'error');
        studentEmailInput.focus();
        return;
      }

      // Analyze with AI
      const submitBtn = document.getElementById('btn-submit-complaint');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Analyzing & Submitting...';

      try {
        const analysis = await SmartResolveAI.analyzeComplaint({
          title,
          description,
          location,
          manualCategory
        });

        // Store into localStorage
        const newComplaint = ComplaintStorage.create({
          studentName,
          studentRoll,
          studentEmail,
          location,
          title,
          description,
          category: analysis.category,
          priority: analysis.priority,
          aiAnalysis: analysis
        });

        // Refresh views
        refreshAllData();

        // Reset form inputs
        complaintForm.reset();
        resetLiveAIPanel();

        // Show Success Modal
        showSubmissionSuccessModal(newComplaint);

        showToast('Complaint Registered', `Generated Ticket ID: ${newComplaint.id}`, 'success');
      } catch (err) {
        console.error('Submission error:', err);
        showToast('Submission Failed', 'An error occurred while filing complaint.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
          Submit Complaint
        `;
      }
    });
  }

  async function runLiveAIAnalysis() {
    const title = complaintTitleInput.value.trim();
    const description = complaintDescInput.value.trim();
    const location = locationInput.value.trim();
    const manualCategory = categorySelect.value;

    if (!title && !description) {
      resetLiveAIPanel();
      return;
    }

    if (aiLiveBox) aiLiveBox.classList.add('analyzing');
    if (aiConfIndicator) aiConfIndicator.textContent = 'Analyzing heuristics...';

    const analysis = await SmartResolveAI.analyzeComplaint({
      title,
      description,
      location,
      manualCategory
    });

    if (aiLiveBox) aiLiveBox.classList.remove('analyzing');

    if (aiPredCategory) {
      aiPredCategory.textContent = analysis.category;
    }
    if (aiPredPriority) {
      aiPredPriority.innerHTML = `
        <span class="badge ${getPriorityBadgeClass(analysis.priority)}">
          ${analysis.priority}
        </span>
      `;
    }
    if (aiPredDept) {
      aiPredDept.textContent = analysis.department;
    }
    if (aiPredAction) {
      aiPredAction.textContent = analysis.suggestedAction;
    }
    if (aiConfIndicator) {
      aiConfIndicator.textContent = `Confidence: ~${analysis.categoryConfidence}% (Rule-Based NLP)`;
    }
  }

  function resetLiveAIPanel() {
    if (aiPredCategory) aiPredCategory.textContent = '—';
    if (aiPredPriority) aiPredPriority.textContent = '—';
    if (aiPredDept) aiPredDept.textContent = '—';
    if (aiPredAction) {
      aiPredAction.textContent = 'Type your issue title & description above to see live automated categorization, urgency scoring, and suggested response actions.';
    }
    if (aiConfIndicator) aiConfIndicator.textContent = 'Awaiting input...';
  }

  function showSubmissionSuccessModal(complaint) {
    if (!modalSuccess) return;

    modalSuccessId.textContent = complaint.id;
    modalSuccessCategory.textContent = complaint.category;
    modalSuccessPriority.textContent = complaint.priority;
    modalSuccessDept.textContent = complaint.aiAnalysis ? complaint.aiAnalysis.department : 'Campus Administration';

    openModal(modalSuccess);

    // One-click copy ID
    btnCopyId.onclick = () => {
      navigator.clipboard.writeText(complaint.id).then(() => {
        showToast('Copied!', `Complaint ID ${complaint.id} copied to clipboard.`, 'success');
      }).catch(() => {
        showToast('Notice', `Complaint ID: ${complaint.id}`, 'info');
      });
    };

    // Track button
    btnModalGoTrack.onclick = () => {
      closeModal(modalSuccess);
      switchTab('track');
      if (trackSearchInput) trackSearchInput.value = complaint.id;
      performSearch(complaint.id);
    };
  }

  // ==========================================
  // COMPLAINT TRACKING VIEW
  // ==========================================
  function setupTrackingView() {
    if (!btnTrackSearch || !trackSearchInput) return;

    btnTrackSearch.addEventListener('click', () => {
      performSearch(trackSearchInput.value);
    });

    trackSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch(trackSearchInput.value);
      }
    });

    refreshQuickTrackChips();
  }

  function refreshQuickTrackChips() {
    if (!quickTrackChips) return;
    quickTrackChips.innerHTML = '';

    const all = ComplaintStorage.getAll();
    if (all.length === 0) {
      quickTrackChips.innerHTML = '<span style="color: var(--slate-400);">No complaints logged.</span>';
      return;
    }

    // Show up to 4 sample clickable chips
    all.slice(0, 4).forEach(c => {
      const chip = document.createElement('span');
      chip.className = 'sample-id-chip';
      chip.textContent = c.id;
      chip.title = `Click to inspect ${c.id}`;
      chip.addEventListener('click', () => {
        if (trackSearchInput) trackSearchInput.value = c.id;
        performSearch(c.id);
      });
      quickTrackChips.appendChild(chip);
    });
  }

  function performSearch(id) {
    if (!id || !id.trim()) {
      showToast('Search Required', 'Please enter a Complaint ID to track.', 'warning');
      return;
    }

    const cleanId = id.trim().toUpperCase();
    const complaint = ComplaintStorage.getById(cleanId);

    if (!complaint) {
      renderTrackNotFound(cleanId);
      return;
    }

    renderTrackDetail(complaint);
  }

  function renderTrackNotFound(id) {
    if (!trackResultContainer) return;
    trackResultContainer.innerHTML = `
      <div class="card">
        <div class="card-body empty-state">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3>Complaint ID "${escapeHtml(id)}" Not Found</h3>
          <p>Please double-check your ID format. Sample format is <code>CMP-2026-1001</code>. You can also view recent complaints on the dashboard.</p>
          <button class="btn btn-secondary btn-sm" data-action="go-to-dashboard">
            ← Return to Dashboard
          </button>
        </div>
      </div>
    `;
  }

  function renderTrackDetail(c) {
    if (!trackResultContainer) return;

    // Step states calculation
    const isStep1Done = true;
    const isStep2Done = c.status === 'In Progress' || c.status === 'Resolved';
    const isStep2Active = c.status === 'In Progress';
    const isStep3Done = c.status === 'Resolved';

    const step1Class = 'completed';
    const step2Class = isStep3Done ? 'completed' : (isStep2Active ? 'active' : '');
    const step3Class = isStep3Done ? 'completed' : '';

    const ai = c.aiAnalysis || {};

    trackResultContainer.innerHTML = `
      <div class="complaint-detail-card">
        <!-- Top ID & Badges -->
        <div class="detail-top-bar">
          <div>
            <div style="font-family: monospace; font-size: 1.35rem; font-weight: 800; color: var(--primary-900);">
              ${escapeHtml(c.id)}
            </div>
            <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--slate-900); margin-top: 0.25rem;">
              ${escapeHtml(c.title)}
            </h2>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge badge-cat">${escapeHtml(c.category)}</span>
            <span class="badge ${getPriorityBadgeClass(c.priority)}">${escapeHtml(c.priority)} Priority</span>
            <span class="badge ${getStatusBadgeClass(c.status)}">
              <span class="badge-dot"></span>
              ${escapeHtml(c.status)}
            </span>
          </div>
        </div>

        <!-- 3-Step Interactive Timeline Stepper -->
        <div class="stepper-container">
          <div class="stepper-step ${step1Class}">
            <div class="step-circle">✓</div>
            <div class="step-label">1. Submitted</div>
            <div class="step-sub">${formatDate(c.createdAt)}</div>
          </div>
          <div class="stepper-step ${step2Class}">
            <div class="step-circle">${isStep2Done ? '✓' : '2'}</div>
            <div class="step-label">2. In Progress / Review</div>
            <div class="step-sub">${isStep2Done ? 'Work Order Issued' : 'Pending Review'}</div>
          </div>
          <div class="stepper-step ${step3Class}">
            <div class="step-circle">${isStep3Done ? '✓' : '3'}</div>
            <div class="step-label">3. Resolved</div>
            <div class="step-sub">${isStep3Done ? formatDate(c.updatedAt) : 'Pending Work Completion'}</div>
          </div>
        </div>

        <!-- Metadata Grid -->
        <div class="detail-meta-grid">
          <div class="detail-meta-item">
            <div class="label">Student Name</div>
            <div class="val">${escapeHtml(c.studentName)}</div>
          </div>
          <div class="detail-meta-item">
            <div class="label">Roll Number</div>
            <div class="val">${escapeHtml(c.studentRoll)}</div>
          </div>
          <div class="detail-meta-item">
            <div class="label">Location</div>
            <div class="val">${escapeHtml(c.location)}</div>
          </div>
          <div class="detail-meta-item">
            <div class="label">Registered On</div>
            <div class="val">${formatDate(c.createdAt)}</div>
          </div>
        </div>

        <!-- Complaint Full Description -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.875rem; text-transform: uppercase; color: var(--slate-500); margin-bottom: 0.4rem; letter-spacing: 0.03em;">
            Student Complaint Description
          </h4>
          <p style="background: var(--slate-50); border: 1px solid var(--slate-200); padding: 1rem; border-radius: var(--radius-md); font-size: 0.9375rem; color: var(--slate-800); line-height: 1.6;">
            ${escapeHtml(c.description)}
          </p>
        </div>

        <!-- AI Triage Insights Box -->
        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; color: #6d28d9; font-weight: 700; font-size: 0.875rem;">
              <span>🤖 SmartResolve AI Triage Assessment</span>
            </div>
            <span style="font-size: 0.72rem; color: #8b5cf6; background: #ede9fe; padding: 0.15rem 0.5rem; border-radius: 9999px; font-weight: 600;">
              Rule-Based NLP
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; font-size: 0.8125rem; margin-bottom: 0.75rem;">
            <div>
              <span style="color: #6d28d9; font-weight: 600;">Assigned Dept:</span>
              <div style="color: var(--slate-800);">${escapeHtml(ai.department || 'Campus Maintenance')}</div>
            </div>
            <div>
              <span style="color: #6d28d9; font-weight: 600;">Urgency Rationale:</span>
              <div style="color: var(--slate-800);">${escapeHtml(ai.priorityReason || 'Standard queue priority.')}</div>
            </div>
          </div>

          <div style="background: #fff; border: 1px solid #e9d5ff; border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; font-size: 0.8125rem; color: #5b21b6;">
            <strong>Suggested Campus Action:</strong> ${escapeHtml(ai.suggestedAction || 'Assign routine maintenance technician.')}
          </div>
        </div>

        <!-- Official Administration Remarks -->
        <div style="border-top: 1px solid var(--slate-200); padding-top: 1.25rem;">
          <h4 style="font-size: 0.875rem; text-transform: uppercase; color: var(--slate-500); margin-bottom: 0.4rem; letter-spacing: 0.03em;">
            Administrative Remarks & Status Updates
          </h4>
          ${c.adminRemarks ? `
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-md); padding: 0.85rem 1rem; color: #065f46; font-size: 0.875rem; font-weight: 500;">
              ${escapeHtml(c.adminRemarks)}
            </div>
          ` : `
            <div style="color: var(--slate-400); font-size: 0.8125rem; font-style: italic;">
              No administrator remarks entered yet. Complaint is queued for review by the campus facilities office.
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ==========================================
  // ADMIN PORTAL & WORKFLOW MANAGEMENT
  // ==========================================
  function setupAdminView() {
    if (!adminSearchInput) return;

    // Filter change listeners
    adminSearchInput.addEventListener('input', refreshAdminTable);
    adminFilterStatus.addEventListener('change', refreshAdminTable);
    adminFilterCategory.addEventListener('change', refreshAdminTable);
    adminFilterPriority.addEventListener('change', refreshAdminTable);
    adminSortBy.addEventListener('change', refreshAdminTable);

    // Export button
    btnAdminExport.addEventListener('click', () => {
      const data = ComplaintStorage.getAll();
      const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `smartresolve_complaints_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Export Successful', 'Downloaded complaint records backup.', 'success');
    });

    // Seed sample button
    btnAdminSeed.addEventListener('click', () => {
      ComplaintStorage.loadDemoData();
      refreshAllData();
      showToast('Sample Data Loaded', 'Populated 6 demonstration complaints.', 'success');
    });

    // Clear all button
    btnAdminClear.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all complaints? This cannot be undone.')) {
        ComplaintStorage.clearAll();
        refreshAllData();
        showToast('Database Purged', 'All local complaint records removed.', 'warning');
      }
    });

    // Save Admin Update Modal
    btnSaveAdminUpdate.addEventListener('click', () => {
      const id = manageComplaintId.value;
      const newStatus = manageSelectStatus.value;
      const remarks = manageTextareaRemarks.value.trim();

      ComplaintStorage.update(id, {
        status: newStatus,
        adminRemarks: remarks
      });

      closeModal(modalAdminManage);
      refreshAllData();
      showToast('Status Updated', `Complaint ${id} set to ${newStatus}.`, 'success');
    });

    // Delete Complaint from Admin Modal
    btnAdminDeleteComplaint.addEventListener('click', () => {
      const id = manageComplaintId.value;
      if (confirm(`Are you sure you want to delete complaint ${id}?`)) {
        ComplaintStorage.delete(id);
        closeModal(modalAdminManage);
        refreshAllData();
        showToast('Record Deleted', `Complaint ${id} removed.`, 'warning');
      }
    });
  }

  function refreshAdminTable() {
    if (!adminComplaintsTbody) return;

    let complaints = ComplaintStorage.getAll();
    const query = adminSearchInput.value.trim().toLowerCase();
    const statusVal = adminFilterStatus.value;
    const catVal = adminFilterCategory.value;
    const prioVal = adminFilterPriority.value;
    const sortVal = adminSortBy.value;

    // Filter by search query
    if (query) {
      complaints = complaints.filter(c => {
        return (
          c.id.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.studentName.toLowerCase().includes(query) ||
          c.studentRoll.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query)
        );
      });
    }

    // Filter by status
    if (statusVal !== 'all') {
      complaints = complaints.filter(c => c.status === statusVal);
    }

    // Filter by category
    if (catVal !== 'all') {
      complaints = complaints.filter(c => c.category === catVal);
    }

    // Filter by priority
    if (prioVal !== 'all') {
      complaints = complaints.filter(c => c.priority === prioVal);
    }

    // Sort
    if (sortVal === 'newest') {
      complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortVal === 'oldest') {
      complaints.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortVal === 'priority') {
      const weight = { High: 3, Medium: 2, Low: 1 };
      complaints.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0));
    }

    // Render Rows
    adminComplaintsTbody.innerHTML = '';

    if (complaints.length === 0) {
      adminComplaintsTbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 3rem; color: var(--slate-400);">
            No matching complaints found. Adjust your search filters or click "Load Sample Data".
          </td>
        </tr>
      `;
      return;
    }

    complaints.forEach(c => {
      const tr = document.createElement('tr');
      const timeStr = formatDate(c.createdAt);

      tr.innerHTML = `
        <td class="id-cell">${escapeHtml(c.id)}</td>
        <td style="font-size: 0.75rem; color: var(--slate-500); white-space: nowrap;">${timeStr}</td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(c.studentName)}</div>
          <div style="font-size: 0.75rem; color: var(--slate-400);">${escapeHtml(c.studentRoll)}</div>
        </td>
        <td style="font-size: 0.8125rem;">${escapeHtml(c.location)}</td>
        <td class="title-cell">
          <div class="title-main" title="${escapeHtml(c.title)}">${escapeHtml(c.title)}</div>
          <div class="title-sub">${escapeHtml(truncate(c.description, 60))}</div>
        </td>
        <td>
          <span class="badge badge-cat">${escapeHtml(c.category)}</span>
        </td>
        <td>
          <span class="badge ${getPriorityBadgeClass(c.priority)}">${escapeHtml(c.priority)}</span>
        </td>
        <td>
          <span class="badge ${getStatusBadgeClass(c.status)}">
            <span class="badge-dot"></span>
            ${escapeHtml(c.status)}
          </span>
        </td>
        <td>
          <button class="btn btn-primary btn-sm" data-manage-id="${escapeHtml(c.id)}">
            Manage
          </button>
        </td>
      `;

      // Manage Modal Click
      const manageBtn = tr.querySelector('[data-manage-id]');
      manageBtn.addEventListener('click', () => {
        openAdminManageModal(c);
      });

      adminComplaintsTbody.appendChild(tr);
    });
  }

  function openAdminManageModal(c) {
    if (!modalAdminManage) return;

    manageComplaintId.value = c.id;
    manageInfoId.textContent = c.id;
    manageInfoSubject.textContent = c.title;
    manageInfoDesc.textContent = c.description;
    manageInfoStudent.textContent = `${c.studentName} (${c.studentRoll})`;
    manageInfoLocation.textContent = c.location;
    manageInfoDate.textContent = formatDate(c.createdAt);

    manageInfoBadges.innerHTML = `
      <span class="badge badge-cat">${escapeHtml(c.category)}</span>
      <span class="badge ${getPriorityBadgeClass(c.priority)}">${escapeHtml(c.priority)}</span>
      <span class="badge ${getStatusBadgeClass(c.status)}">${escapeHtml(c.status)}</span>
    `;

    const ai = c.aiAnalysis || {};
    manageInfoAction.textContent = ai.suggestedAction || 'Assign to campus supervisor.';

    manageSelectStatus.value = c.status;
    manageTextareaRemarks.value = c.adminRemarks || '';

    openModal(modalAdminManage);
  }

  // ==========================================
  // TOP BAR QUICK ACTIONS
  // ==========================================
  function setupGlobalDemoActions() {
    if (btnQuickSampleData) {
      btnQuickSampleData.addEventListener('click', () => {
        ComplaintStorage.loadDemoData();
        refreshAllData();
        showToast('Sample Data Loaded', '6 realistic sample complaints loaded.', 'success');
      });
    }

    if (btnQuickClearData) {
      btnQuickClearData.addEventListener('click', () => {
        if (confirm('Clear all complaint records from browser localStorage?')) {
          ComplaintStorage.clearAll();
          refreshAllData();
          showToast('Data Cleared', 'LocalStorage cleared successfully.', 'info');
        }
      });
    }
  }

  // ==========================================
  // MODAL MANAGEMENT UTILITIES
  // ==========================================
  function setupModals() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.closeModal;
        const modal = document.getElementById(modalId);
        if (modal) closeModal(modal);
      });
    });

    // Close when clicking overlay backdrop
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(overlay);
        }
      });
    });
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ==========================================
  // TOAST NOTIFICATIONS SYSTEM
  // ==========================================
  function showToast(title, message, type = 'success') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title)}</div>
        <div class="toast-msg">${escapeHtml(message)}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ==========================================
  // HELPER FORMATTERS & CLASS GENERATORS
  // ==========================================
  function formatDate(isoStr) {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Pending': return 'badge-status-pending';
      case 'In Progress': return 'badge-status-in-progress';
      case 'Resolved': return 'badge-status-resolved';
      default: return 'badge-cat';
    }
  }

  function getPriorityBadgeClass(priority) {
    switch (priority) {
      case 'High': return 'badge-priority-high';
      case 'Medium': return 'badge-priority-medium';
      case 'Low': return 'badge-priority-low';
      default: return 'badge-cat';
    }
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max - 3) + '...' : str;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Bootstrap on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
