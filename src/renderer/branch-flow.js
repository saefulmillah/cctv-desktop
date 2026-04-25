(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createBranchFlow = ({
    elements,
    services,
    getState,
    callbacks,
  } = {}) => {
    const { pagingControlEl, pageInfoEl, prevPageBtn, nextPageBtn, pickerEl, searchModalEl, layoutConfigModalEl, pickerStatusEl } = elements;
    const {
      addActivity,
      ensureCctvAccess,
      getCameraOperationalState,
      hideModal,
      renderCameras,
      renderSkeletonCards,
      scheduleSidebarMapRefresh,
      scheduleWorkspacePersist,
      setReloadButtonState,
      setTextIfChanged,
    } = callbacks;

    const logBranchEvent = (eventName, detail = {}) => {
      try {
        console.info('[branch-flow]', eventName, detail);
      } catch (_) {
        // Ignore logging failures.
      }
    };

    const updatePagingUi = () => {
      const state = getState();
      setTextIfChanged(pageInfoEl, `Page ${state.activePage} / ${state.totalPages}`);
      prevPageBtn.disabled = state.activePage <= 1;
      nextPageBtn.disabled = state.activePage >= state.totalPages;
    };

    const setPagingVisible = (visible) => {
      pagingControlEl.classList.toggle('hidden', !visible);
    };

    const updateCurrentBranchLabels = () => {
      const state = getState();
      setTextIfChanged(
        elements.currentBranchEl,
        state.activeBranch
          ? `Active branch: ${state.activeBranch.branch_code} - ${state.activeBranch.branch_name} (Page ${state.activePage})`
          : 'Active branch: -'
      );
      callbacks.updateMiniPanel();
      void callbacks.updateSidebarMap();
    };

    const loadBranchPages = async (branchId) => {
      logBranchEvent('load-pages-started', { branchId });
      ensureCctvAccess();
      if (!callbacks.isBranchAllowed(branchId)) {
        throw new Error('Branch ini tidak termasuk scope akses Anda.');
      }
      const pageResponse = await services.camera.getBranchPages(branchId);
      if (pageResponse.status >= 400) {
        throw new Error(pageResponse.message || 'Failed to load total pages.');
      }

      const payload = Array.isArray(pageResponse.data) ? pageResponse.data[0] : null;
      const parsedTotalPages = Number(payload && payload.total_pages ? payload.total_pages : 1);
      callbacks.setTotalPages(
        Number.isFinite(parsedTotalPages) && parsedTotalPages > 0 ? parsedTotalPages : 1
      );
      logBranchEvent('load-pages-completed', {
        branchId,
        totalPages: getState().totalPages,
      });
      updatePagingUi();
    };

    const loadAllBranchCamerasForMap = async (branch) => {
      const state = getState();
      if (!branch || !branch.id) {
        callbacks.setBranchWideCameras([]);
        callbacks.setSidebarMapShouldAutoFit(!state.sidebarMapViewportLocked);
        scheduleSidebarMapRefresh();
        return;
      }

      ensureCctvAccess();
      if (!callbacks.isBranchAllowed(branch.id)) {
        throw new Error('Branch map ini tidak termasuk scope akses Anda.');
      }

      const cacheKey = String(branch.id);
      if (state.branchWideCameraCache.has(cacheKey)) {
        callbacks.setBranchWideCameras(state.branchWideCameraCache.get(cacheKey) || []);
        callbacks.setSidebarMapShouldAutoFit(!getState().sidebarMapViewportLocked);
        callbacks.updateMiniPanel();
        scheduleSidebarMapRefresh();
        return;
      }

      try {
        const response = await services.camera.getCameras({ branch_id: branch.id, limit: 500 });
        if (response.status >= 400) {
          throw new Error(response.message || 'Failed to load branch map cameras.');
        }
        const nextBranchWideCameras = (Array.isArray(response.data) ? response.data : []).map((camera) => ({
          ...camera,
          __sourcePage: camera.__sourcePage || camera.page || null,
        }));
        callbacks.setBranchWideCameras(nextBranchWideCameras);
        state.branchWideCameraCache.set(cacheKey, nextBranchWideCameras);
        callbacks.setSidebarMapShouldAutoFit(!getState().sidebarMapViewportLocked);
      } catch (error) {
        callbacks.setBranchWideCameras(
          getState().currentCameras.map((camera) => ({
            ...camera,
            __sourcePage: getState().activePage,
          }))
        );
        callbacks.setSidebarMapShouldAutoFit(!getState().sidebarMapViewportLocked);
        addActivity('Map camera sync failed', error.message || 'Unable to load all map markers.', 'warning');
      }

      callbacks.updateMiniPanel();
      scheduleSidebarMapRefresh();
    };

    const loadBranchCameras = async (branch, page = 1) => {
      const state = getState();
      logBranchEvent('load-cameras-started', {
        branchId: branch && branch.id,
        branchCode: branch && branch.branch_code,
        page,
      });
      ensureCctvAccess();
      if (!(branch && branch.id) || !callbacks.isBranchAllowed(branch.id)) {
        throw new Error('Branch ini tidak termasuk scope akses Anda.');
      }
      pickerStatusEl.textContent = `Loading cameras for ${branch.branch_name}...`;
      callbacks.setBranchWideCameras([]);
      renderSkeletonCards(
        state.currentMode === 'focus'
          ? Math.max(state.selectedCameraIds.size, 1)
          : callbacks.getLayoutCount()
      );
      addActivity(
        'Loading branch cameras',
        `${branch.branch_code} - ${branch.branch_name} page ${page} is being prepared.`,
        'warning'
      );

      const response = await services.camera.getCamerasByBranch(branch.id, page);
      if (response.status >= 400) {
        throw new Error(response.message || 'Failed to load cameras.');
      }

      callbacks.setActiveBranch(branch);
      callbacks.setActivePage(page);
      const nextCurrentCameras = (Array.isArray(response.data) ? response.data : []).map((camera) => ({
        ...camera,
        __sourcePage: page,
      }));
      callbacks.setCurrentCameras(nextCurrentCameras);
      nextCurrentCameras.forEach((camera) => {
        if (state.selectedCameraIds.has(String(camera.id))) {
          state.selectedCameraMap.set(String(camera.id), camera);
        }
      });
      renderCameras(nextCurrentCameras);
      updateCurrentBranchLabels();
      updatePagingUi();
      setReloadButtonState(false);
      hideModal(pickerEl);
      hideModal(searchModalEl);
      hideModal(layoutConfigModalEl);
      addActivity(
        'Camera grid ready',
        `${nextCurrentCameras.length} camera stream(s) loaded for ${branch.branch_name} page ${page}.`,
        'success'
      );
      logBranchEvent('load-cameras-completed', {
        branchId: branch.id,
        page,
        cameraCount: nextCurrentCameras.length,
        selectedCount: state.selectedCameraIds.size,
      });
      void loadAllBranchCamerasForMap(branch);
      scheduleWorkspacePersist();
    };

    const refreshCurrentStreams = async () => {
      const state = getState();
      if (state.isRefreshingStreams) {
        return;
      }

      ensureCctvAccess();

      if (!state.activeBranch || !state.activeBranch.id) {
        pickerStatusEl.textContent = 'Select branch first before reloading streams.';
        addActivity('Reload skipped', 'Choose a branch first.', 'warning');
        return;
      }

      state.branchWideCameraCache.delete(String(state.activeBranch.id));

      setReloadButtonState(true);
      logBranchEvent('reload-streams-started', {
        branchId: state.activeBranch.id,
        page: state.activePage,
      });
      renderSkeletonCards(
        state.currentMode === 'focus'
          ? Math.max(state.selectedCameraIds.size, 1)
          : callbacks.getLayoutCount()
      );
      try {
        callbacks.setSidebarMapViewportLocked(false);
        callbacks.setSidebarMapShouldAutoFit(true);
        await loadBranchCameras(state.activeBranch, state.activePage);
        pickerStatusEl.textContent = `Streams reloaded for ${state.activeBranch.branch_name} (Page ${state.activePage}).`;
        logBranchEvent('reload-streams-completed', {
          branchId: state.activeBranch.id,
          page: state.activePage,
        });
      } catch (error) {
        pickerStatusEl.textContent = error.message || 'Failed to reload streams.';
        addActivity('Reload failed', error.message || 'Failed to reload streams.', 'danger');
        logBranchEvent('reload-streams-failed', {
          branchId: state.activeBranch && state.activeBranch.id,
          page: state.activePage,
          message: error && error.message ? error.message : 'Unknown error',
        });
      } finally {
        setReloadButtonState(false);
      }
    };

    return {
      loadAllBranchCamerasForMap,
      loadBranchCameras,
      loadBranchPages,
      refreshCurrentStreams,
      setPagingVisible,
      updateCurrentBranchLabels,
      updatePagingUi,
    };
  };

  modules.createBranchFlow = createBranchFlow;
})(typeof window !== 'undefined' ? window : globalThis);
