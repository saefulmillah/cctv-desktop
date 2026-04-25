(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createQuickSearch = ({
    elements,
    services,
    getState,
    callbacks,
  } = {}) => {
    const { quickSearchInputEl, quickSearchResultsEl, searchModalEl, searchModalTitleEl } = elements;
    const {
      addActivity,
      ensureCctvAccess,
      focusAndSelectInput,
      hideModal,
      renderEmptyStateCard,
      scheduleWorkspacePersist,
      showModal,
      updateMiniPanel,
    } = callbacks;

    const searchCameraCatalog = async (query) => {
      const response = await services.camera.searchCameras({
        q: String(query || '').trim(),
        page: 1,
        limit: 24,
        sort_by: 'relevance',
        sort_order: 'desc',
      });

      if (response.status >= 400) {
        throw new Error(response.message || 'Failed to search camera catalog.');
      }

      const payload = response.data && typeof response.data === 'object' ? response.data : {};
      return Array.isArray(payload.items) ? payload.items : [];
    };

    const renderQuickSearchResults = async () => {
      const state = getState();
      const requestId = state.quickSearchRequestId + 1;
      callbacks.setQuickSearchRequestId(requestId);
      quickSearchResultsEl.innerHTML = '';
      quickSearchResultsEl.appendChild(renderEmptyStateCard('Searching cameras...'));
      callbacks.bumpSearchRequests();

      let filteredCameras = [];
      try {
        filteredCameras = await searchCameraCatalog(quickSearchInputEl.value);
      } catch (error) {
        if (getState().quickSearchRequestId !== requestId) {
          return;
        }
        quickSearchResultsEl.innerHTML = '';
        quickSearchResultsEl.appendChild(
          renderEmptyStateCard(error.message || 'Failed to search camera catalog.')
        );
        return;
      }

      if (getState().quickSearchRequestId !== requestId) {
        return;
      }

      quickSearchResultsEl.innerHTML = '';

      if (!filteredCameras.length) {
        quickSearchResultsEl.appendChild(renderEmptyStateCard('No camera matched your search.'));
        return;
      }

      filteredCameras.forEach((camera) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'branch-search-item';
        const detailParts = [camera.gate_name, camera.branch_name]
          .map((value) => String(value || '').trim())
          .filter(Boolean);
        button.innerHTML = `
          <strong>${camera.cctv_name || `Camera ${camera.id || '-'}`}</strong>
          <span>${detailParts.join(' | ')}</span>
        `;
        button.addEventListener('click', () => {
          const currentState = getState();
          if (
            currentState.quickSearchContext.mode === 'replace-slot' &&
            Number.isInteger(currentState.quickSearchContext.slotIndex)
          ) {
            const slotIndex = currentState.quickSearchContext.slotIndex;
            currentState.slotOverrides.set(callbacks.getSlotOverrideKey(slotIndex), camera);
            hideModal(searchModalEl);
            addActivity(
              'Camera slot updated',
              `${camera.cctv_name || 'Camera'} assigned to slot ${slotIndex + 1}.`,
              'success'
            );
            scheduleWorkspacePersist();
            callbacks.renderCameras();
            return;
          }

          currentState.selectedCameraIds.add(String(camera.id));
          currentState.selectedCameraMap.set(String(camera.id), camera);
          hideModal(searchModalEl);
          addActivity(
            'Camera selected',
            `${camera.cctv_name || 'Camera'} added to selection list.`,
            'success'
          );
          updateMiniPanel();
          scheduleWorkspacePersist();
          if (currentState.currentMode === 'focus') {
            callbacks.renderCameras();
          }
        });
        quickSearchResultsEl.appendChild(button);
      });
    };

    const scheduleQuickSearch = () => {
      const state = getState();
      if (state.quickSearchDebounceTimer) {
        clearTimeout(state.quickSearchDebounceTimer);
      }

      callbacks.setQuickSearchDebounceTimer(
        globalScope.setTimeout(() => {
          callbacks.setQuickSearchDebounceTimer(null);
          renderQuickSearchResults().catch((error) => {
            quickSearchResultsEl.innerHTML = '';
            quickSearchResultsEl.appendChild(
              renderEmptyStateCard(error.message || 'Failed to search camera catalog.')
            );
          });
        }, 280)
      );
    };

    const openQuickSearch = async (options = {}) => {
      ensureCctvAccess();
      callbacks.setQuickSearchContext({
        mode: options.mode === 'replace-slot' ? 'replace-slot' : 'select',
        slotIndex: Number.isInteger(options.slotIndex) ? options.slotIndex : null,
      });

      showModal(searchModalEl);
      quickSearchInputEl.value = '';
      quickSearchResultsEl.innerHTML = '';
      const state = getState();
      searchModalTitleEl.textContent =
        state.quickSearchContext.mode === 'replace-slot' &&
        Number.isInteger(state.quickSearchContext.slotIndex)
          ? `Replace Slot ${state.quickSearchContext.slotIndex + 1}`
          : 'Find Camera Item';
      quickSearchInputEl.placeholder =
        state.quickSearchContext.mode === 'replace-slot'
          ? 'Search camera to place into selected slot'
          : 'Search camera name, gate, branch, or code';

      try {
        await renderQuickSearchResults();
        focusAndSelectInput(quickSearchInputEl);
        addActivity(
          'Camera search opened',
          state.quickSearchContext.mode === 'replace-slot'
            ? `Choose a camera item for slot ${state.quickSearchContext.slotIndex + 1}.`
            : 'Search camera items and add them to selection.',
          'neutral'
        );
      } catch (error) {
        quickSearchResultsEl.appendChild(
          renderEmptyStateCard(error.message || 'Failed to load camera search catalog.')
        );
        addActivity('Camera search failed', error.message || 'Unable to load camera search.', 'danger');
      }
    };

    return {
      openQuickSearch,
      renderQuickSearchResults,
      scheduleQuickSearch,
      searchCameraCatalog,
    };
  };

  modules.createQuickSearch = createQuickSearch;
})(typeof window !== 'undefined' ? window : globalThis);
