(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createCameraGrid = ({
    elements,
    constants,
    getState,
    callbacks,
  } = {}) => {
    const { gridEl, currentBranchMiniEl, activeRouteTitleEl, modeBadgeEl, onlineCountEl, offlineCountEl, selectedCountEl, focusModeBtn } = elements;
    const { DEFAULT_GRID_COUNT } = constants;
    const {
      addActivity,
      applyGridMetrics,
      attachStreamWithRetry,
      canUseCctv,
      clearPlayers,
      getCameraOperationalState,
      hideModal,
      renderEmptyStateCard,
      requestFullscreen,
      scheduleSidebarMapRefresh,
      scheduleWorkspacePersist,
      setMode,
      setStreamStatus,
      updateCardSelectionUiFallback,
    } = callbacks;

    const getRenderableCameras = () => {
      const state = getState();
      if (state.currentMode !== 'focus') {
        return state.currentCameras;
      }

      const focused = Array.from(state.selectedCameraIds)
        .map((cameraId) => state.selectedCameraMap.get(String(cameraId)))
        .filter(Boolean);
      return focused.length ? focused : state.currentCameras;
    };

    const getCameraBySlotIndex = (slotIndex) => {
      const state = getState();
      const overrideCamera = state.slotOverrides.get(callbacks.getSlotOverrideKey(slotIndex));
      if (overrideCamera) {
        return overrideCamera;
      }
      return state.currentCameras[slotIndex] || null;
    };

    const getLayoutCount = () => {
      const state = getState();
      if (state.gridLayout.type === 'spotlight') {
        return Math.max(
          1,
          Number(state.gridLayout.mainCount || 1) + Number(state.gridLayout.sideCount || 0)
        );
      }
      return Math.max(1, Number(state.gridLayout.limit || DEFAULT_GRID_COUNT));
    };

    const getDisplayCamerasForGrid = () => {
      const limit = getLayoutCount();
      return Array.from({ length: limit }, (_unused, index) => getCameraBySlotIndex(index));
    };

    const updateMiniPanel = () => {
      const state = getState();
      const visibleCameras = getRenderableCameras();
      const branchSummarySource = state.branchWideCameras.length ? state.branchWideCameras : state.currentCameras;
      const branchSummaryMap = new Map();
      visibleCameras
        .filter(Boolean)
        .forEach((camera) => {
          const branchId = String(camera.branch_id || camera.branch_code || camera.branch_name || '');
          if (!branchId) {
            return;
          }
          const existing = branchSummaryMap.get(branchId);
          if (existing) {
            existing.count += 1;
            return;
          }
          branchSummaryMap.set(branchId, {
            branchCode: camera.branch_code || '-',
            branchName: camera.branch_name || camera.branch_code || 'Ruas',
            count: 1,
          });
        });
      const uniqueBranches = Array.from(branchSummaryMap.values());
      const onlineCount = branchSummarySource.filter((camera) => getCameraOperationalState(camera) === 'online').length;
      const offlineCount = branchSummarySource.filter((camera) => getCameraOperationalState(camera) !== 'online').length;
      callbacks.setTextIfChanged(onlineCountEl, String(onlineCount));
      callbacks.setTextIfChanged(offlineCountEl, String(offlineCount));
      callbacks.setTextIfChanged(selectedCountEl, String(state.selectedCameraIds.size));
      const branchPills =
        state.currentMode === 'focus'
          ? uniqueBranches.length
            ? uniqueBranches
                .slice(0, 4)
                .map(
                  (item) =>
                    `<span class="meta-pill route-chip">${item.branchCode || item.branchName}<strong class="route-chip__count">${item.count}</strong></span>`
                )
                .join('') +
              (uniqueBranches.length > 4
                ? `<span class="meta-pill route-chip">+${uniqueBranches.length - 4}</span>`
                : '')
            : '<span class="meta-pill route-chip">Ruas: -</span>'
          : state.activeBranch
            ? `<span class="meta-pill route-chip">${state.activeBranch.branch_name || state.activeBranch.branch_code || '-'}</span>`
            : '<span class="meta-pill route-chip">Branch: -</span>';
      callbacks.setInnerHtmlIfChanged(currentBranchMiniEl, branchPills);
      callbacks.setTextIfChanged(
        activeRouteTitleEl,
        state.currentMode === 'focus'
          ? 'FOCUS MODE'
          : state.activeBranch
            ? state.activeBranch.branch_name || state.activeBranch.branch_code || 'Ruas Aktif'
            : 'Ruas Belum Dipilih'
      );
      callbacks.setTextIfChanged(
        modeBadgeEl,
        state.currentMode === 'focus' ? `Focus Mode (${visibleCameras.length} cams)` : 'Normal Mode'
      );
      focusModeBtn.disabled = state.selectedCameraIds.size === 0 || !canUseCctv();
    };

    const ensureGridHasVisibleContent = () => {
      if (gridEl.children.length > 0) {
        return;
      }
      callbacks.renderWelcomeStateFallback();
    };

    const createCameraCard = (camera, index, options = {}) => {
      const state = getState();
      const slotIndex = Number.isInteger(options.slotIndex) ? options.slotIndex : index;
      const replaceable = Boolean(options.replaceable);
      const article = document.createElement('article');
      const selected = state.selectedCameraIds.has(String(camera.id));
      article.className = 'camera-card';
      article.style.animationDelay = `${Math.min(index * 45, 320)}ms`;
      article.classList.toggle('is-selected', selected);
      article.dataset.cameraId = String(camera.id);
      article.dataset.slotIndex = String(slotIndex);

      const videoWrap = document.createElement('div');
      videoWrap.className = 'camera-card__video-wrap';

      const videoEl = document.createElement('video');
      videoEl.className = 'stream-video';
      videoEl.autoplay = true;
      videoEl.muted = true;
      videoEl.controls = false;
      videoEl.playsInline = true;
      videoWrap.appendChild(videoEl);

      const headerEl = document.createElement('div');
      headerEl.className = 'camera-card__header';

      const badgesEl = document.createElement('div');
      badgesEl.className = 'camera-card__badges';
      const statusEl = document.createElement('span');
      statusEl.className = 'stream-status connecting';
      statusEl.textContent = 'Connecting';
      badgesEl.appendChild(statusEl);
      if (camera.gate_name) {
        const gateEl = document.createElement('span');
        gateEl.className = 'camera-card__tag';
        gateEl.textContent = camera.gate_name;
        badgesEl.appendChild(gateEl);
      }

      const actionsEl = document.createElement('div');
      actionsEl.className = 'camera-card__actions';
      const selectBtn = document.createElement('button');
      selectBtn.type = 'button';
      selectBtn.className = 'camera-card__select';
      selectBtn.classList.toggle('active', selected);
      selectBtn.textContent = selected ? 'Selected' : 'Select';
      selectBtn.dataset.action = 'toggle-select';
      selectBtn.dataset.cameraId = String(camera.id);
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.type = 'button';
      fullscreenBtn.className = 'camera-card__action';
      fullscreenBtn.textContent = '\u26F6';
      fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
      fullscreenBtn.title = 'Fullscreen';
      fullscreenBtn.dataset.action = 'fullscreen';
      fullscreenBtn.dataset.cameraId = String(camera.id);
      if (replaceable) {
        const replaceBtn = document.createElement('button');
        replaceBtn.type = 'button';
        replaceBtn.className = 'camera-card__action';
        replaceBtn.textContent = '\u21c4';
        replaceBtn.setAttribute('aria-label', 'Replace slot');
        replaceBtn.title = 'Replace slot';
        replaceBtn.dataset.action = 'replace-slot';
        replaceBtn.dataset.slotIndex = String(slotIndex);
        actionsEl.appendChild(replaceBtn);
      }
      actionsEl.appendChild(selectBtn);
      actionsEl.appendChild(fullscreenBtn);
      headerEl.appendChild(badgesEl);
      headerEl.appendChild(actionsEl);

      const footerEl = document.createElement('div');
      footerEl.className = 'camera-card__footer';
      const metaEl = document.createElement('div');
      metaEl.className = 'camera-card__meta';
      const titleEl = document.createElement('h3');
      titleEl.className = 'camera-card__title';
      titleEl.textContent = camera.cctv_name || `Camera ${index + 1}`;
      const subtitleEl = document.createElement('p');
      subtitleEl.className = 'camera-card__subtitle';
      const cameraBranchName = String(camera.branch_name || '').trim();
      const activeBranchName = String((state.activeBranch && state.activeBranch.branch_name) || '').trim();

      if (cameraBranchName) {
        subtitleEl.textContent = cameraBranchName || 'Ruas kamera';
      } else if (activeBranchName) {
        subtitleEl.textContent = activeBranchName || 'Ruas aktif';
      } else {
        subtitleEl.textContent = 'Ruas belum dipilih';
      }
      metaEl.appendChild(titleEl);
      metaEl.appendChild(subtitleEl);
      footerEl.appendChild(metaEl);
      article.appendChild(videoWrap);
      article.appendChild(headerEl);
      article.appendChild(footerEl);

      const focusBarEl = document.createElement('div');
      focusBarEl.className = 'camera-card__focus-bar';
      article.appendChild(focusBarEl);

      if (!camera.stream_play_url) {
        article.appendChild(renderEmptyStateCard(`${camera.cctv_name || 'Camera'}: no stream URL`));
        setStreamStatus(statusEl, camera.id, 'offline');
        return article;
      }

      try {
        attachStreamWithRetry(videoEl, camera.stream_play_url, statusEl, camera.id);
      } catch (error) {
        article.appendChild(renderEmptyStateCard(error.message));
        setStreamStatus(statusEl, camera.id, 'offline');
      }

      return article;
    };

    const renderWelcomeState = () => {
      clearPlayers();
      gridEl.classList.remove('loading', 'grid--spotlight');
      gridEl.innerHTML = '';
      applyGridMetrics(1, 1);

      const panel = document.createElement('section');
      panel.className = 'welcome-state';
      panel.innerHTML = `
        <div class="welcome-state__inner">
          <p class="welcome-state__eyebrow">MOVISION</p>
          <h2 class="welcome-state__title">Pilih Ruas Untuk Memulai</h2>
          <p class="welcome-state__description">
            Buka daftar branch untuk memuat grid CCTV, atau gunakan quick search untuk memilih kamera tertentu.
          </p>
          <div class="welcome-state__actions">
            <button class="toolbar-btn" type="button" data-action="open-branches">Open Branches</button>
            <button class="toolbar-btn" type="button" data-action="open-search">Quick Search</button>
          </div>
        </div>
      `;
      const openBranchesBtn = panel.querySelector('[data-action="open-branches"]');
      if (openBranchesBtn) {
        openBranchesBtn.addEventListener('click', () => {
          callbacks.openBranchPicker().catch((error) => {
            addActivity('Branch picker failed', error.message || 'Unable to open branch picker.', 'danger');
          });
        });
      }
      const openSearchBtn = panel.querySelector('[data-action="open-search"]');
      if (openSearchBtn) {
        openSearchBtn.addEventListener('click', () => {
          callbacks.openQuickSearch().catch((error) => {
            addActivity('Quick search failed', error.message || 'Unable to open quick search.', 'danger');
          });
        });
      }
      gridEl.appendChild(panel);
      updateMiniPanel();
    };

    const renderCameras = () => {
      const state = getState();
      clearPlayers();
      gridEl.classList.remove('loading');
      gridEl.innerHTML = '';
      gridEl.classList.toggle('grid--spotlight', state.currentMode !== 'focus' && state.gridLayout.type === 'spotlight');

      const visibleCameras = getRenderableCameras();
      if (!visibleCameras.length) {
        applyGridMetrics(1, 1);
        gridEl.appendChild(
          renderEmptyStateCard(
            state.currentMode === 'focus'
              ? 'No selected cameras available in this page.'
              : 'No camera data available for this page.'
          )
        );
        updateMiniPanel();
        return;
      }

      if (state.currentMode === 'focus') {
        const count = visibleCameras.length;
        const columns = count <= 2 ? count : count <= 4 ? 2 : count <= 6 ? 3 : count <= 9 ? 3 : 4;
        const rows = Math.max(1, Math.ceil(count / Math.max(columns, 1)));
        applyGridMetrics(columns || 1, rows);
        visibleCameras.forEach((camera, index) => {
          gridEl.appendChild(createCameraCard(camera, index, { replaceable: false }));
        });
        updateMiniPanel();
        return;
      }

      const limit = getLayoutCount();
      const normalVisible = getDisplayCamerasForGrid();

      if (state.gridLayout.type === 'spotlight') {
        applyGridMetrics(4, Math.max(2, Math.ceil(limit / 4)));
        for (let index = 0; index < limit; index += 1) {
          const camera = normalVisible[index];
          const node = camera
            ? createCameraCard(camera, index, { slotIndex: index, replaceable: true })
            : renderEmptyStateCard(`Slot ${index + 1} is empty`);
          if (camera && index < Number(state.gridLayout.mainCount || 1)) {
            node.classList.add('camera-card--main');
          }
          gridEl.appendChild(node);
        }
        updateMiniPanel();
        return;
      }

      applyGridMetrics(state.gridLayout.columns, state.gridLayout.rows);
      for (let index = 0; index < limit; index += 1) {
        const camera = normalVisible[index];
        gridEl.appendChild(
          camera
            ? createCameraCard(camera, index, { slotIndex: index, replaceable: true })
            : renderEmptyStateCard(`Slot ${index + 1} is empty`)
        );
      }
      updateMiniPanel();
    };

    const updateCardSelectionUi = (cameraId) => {
      const normalizedId = String(cameraId);
      const cardEl = gridEl.querySelector(`.camera-card[data-camera-id="${normalizedId}"]`);
      if (!cardEl) {
        if (typeof updateCardSelectionUiFallback === 'function') {
          updateCardSelectionUiFallback(cameraId);
        }
        return;
      }

      const selected = getState().selectedCameraIds.has(normalizedId);
      cardEl.classList.toggle('is-selected', selected);
      const selectBtn = cardEl.querySelector('.camera-card__select');
      if (selectBtn) {
        selectBtn.textContent = selected ? 'Selected' : 'Select';
        selectBtn.classList.toggle('active', selected);
      }
    };

    const toggleSelectedCamera = (cameraId, cameraData) => {
      const state = getState();
      const normalizedId = String(cameraId);
      let removedLastSelectionFromFocus = false;
      if (state.selectedCameraIds.has(normalizedId)) {
        state.selectedCameraIds.delete(normalizedId);
        state.selectedCameraMap.delete(normalizedId);
        if (state.selectedMapCameraId() === normalizedId) {
          callbacks.setSelectedMapCameraId(state.selectedCameraIds.size ? Array.from(state.selectedCameraIds)[0] : null);
        }
        removedLastSelectionFromFocus = state.currentMode === 'focus' && state.selectedCameraIds.size === 0;
      } else {
        state.selectedCameraIds.add(normalizedId);
        callbacks.setSelectedMapCameraId(normalizedId);
        if (cameraData) {
          state.selectedCameraMap.set(normalizedId, cameraData);
        }
      }

      if (removedLastSelectionFromFocus) {
        addActivity('Normal mode restored', 'Semua kamera focus sudah di-unselect.', 'neutral');
        setMode('normal');
        return;
      }

      updateCardSelectionUi(normalizedId);
      updateMiniPanel();
      scheduleSidebarMapRefresh();
      scheduleWorkspacePersist();
      if (getState().currentMode === 'focus') {
        renderCameras();
      }
    };

    const enterFocusMode = () => {
      const state = getState();
      if (!canUseCctv()) {
        addActivity('Focus mode blocked', 'Akun ini tidak memiliki akses CCTV.', 'warning');
        return;
      }
      if (state.selectedCameraIds.size === 0) {
        addActivity('Focus mode skipped', 'Select one or more cameras first.', 'warning');
        return;
      }

      addActivity(
        'Focus mode enabled',
        `${state.selectedCameraIds.size} camera card(s) moved into multi-focus layout.`,
        'success'
      );
      setMode('focus');
    };

    const leaveFocusMode = () => {
      if (getState().currentMode !== 'focus') {
        return;
      }

      addActivity('Normal mode restored', 'Toolbar stays hidden until you hover near the bottom.', 'neutral');
      setMode('normal');
    };

    const handleGridClick = async (event) => {
      const actionButton = event.target instanceof HTMLElement ? event.target.closest('[data-action]') : null;
      if (!actionButton) {
        return;
      }

      event.stopPropagation();
      const action = actionButton.dataset.action;
      if (action === 'toggle-select') {
        const camera = callbacks.resolveCameraById(actionButton.dataset.cameraId);
        if (camera) {
          toggleSelectedCamera(camera.id, camera);
        }
        return;
      }

      if (action === 'fullscreen') {
        const cardEl = actionButton.closest('.camera-card');
        if (!cardEl) {
          return;
        }
        try {
          await requestFullscreen(cardEl);
        } catch (_) {
          addActivity('Fullscreen blocked', 'Runtime denied the fullscreen request.', 'warning');
        }
        return;
      }

      if (action === 'replace-slot') {
        const slotIndex = Number.parseInt(actionButton.dataset.slotIndex || '-1', 10);
        if (!Number.isInteger(slotIndex) || slotIndex < 0) {
          return;
        }
        callbacks.openQuickSearch({
          mode: 'replace-slot',
          slotIndex,
        }).catch((error) => {
          addActivity('Camera search failed', error.message || 'Unable to open camera search.', 'danger');
        });
      }
    };

    const handleGridDoubleClick = (event) => {
      if (getState().currentMode === 'focus') {
        return;
      }
      const cardEl = event.target instanceof HTMLElement ? event.target.closest('.camera-card') : null;
      if (!cardEl || !cardEl.dataset.cameraId) {
        return;
      }
      const camera = callbacks.resolveCameraById(cardEl.dataset.cameraId);
      if (!camera) {
        return;
      }
      if (!getState().selectedCameraIds.has(String(camera.id))) {
        getState().selectedCameraIds.add(String(camera.id));
        getState().selectedCameraMap.set(String(camera.id), camera);
      }
      enterFocusMode();
    };

    return {
      createCameraCard,
      ensureGridHasVisibleContent,
      enterFocusMode,
      getCameraBySlotIndex,
      getDisplayCamerasForGrid,
      getLayoutCount,
      getRenderableCameras,
      handleGridClick,
      handleGridDoubleClick,
      leaveFocusMode,
      renderCameras,
      renderWelcomeState,
      toggleSelectedCamera,
      updateCardSelectionUi,
      updateMiniPanel,
    };
  };

  modules.createCameraGrid = createCameraGrid;
})(typeof window !== 'undefined' ? window : globalThis);
