(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createBranchPicker = ({
    elements,
    services,
    getAvailableBranches,
    setAvailableBranches,
    getAllowedBranches,
    renderEmptyStateCard,
    loadBranchPages,
    loadBranchCameras,
    setPagingVisible,
    getTotalPages,
    addActivity,
    focusAndSelectInput,
    ensureCctvAccess,
    showModal,
    prepareForBranchSelection,
  } = {}) => {
    const {
      branchListEl,
      branchSearchInputEl,
      pickerEl,
      pickerStatusEl,
    } = elements;

    const createBranchButton = (branch, onSelect) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'branch-search-item';
      button.innerHTML = `<strong>${branch.branch_code || '-'}</strong><span>${branch.branch_name || '-'}</span>`;
      button.addEventListener('click', async () => {
        try {
          if (typeof prepareForBranchSelection === 'function') {
            prepareForBranchSelection();
          }
          await loadBranchPages(branch.id);
          await loadBranchCameras(branch, 1);
          setPagingVisible(getTotalPages() > 1);
          if (typeof onSelect === 'function') {
            onSelect();
          }
        } catch (error) {
          pickerStatusEl.textContent = error.message || 'Failed to load cameras.';
          addActivity('Branch load failed', error.message || 'Failed to load cameras.', 'danger');
          setPagingVisible(false);
        }
      });
      return button;
    };

    const filterBranches = (query) => {
      const normalized = String(query || '').trim().toLowerCase();
      const branches = getAvailableBranches();
      if (!normalized) {
        return branches;
      }

      return branches.filter((branch) => {
        const code = String(branch.branch_code || '').toLowerCase();
        const name = String(branch.branch_name || '').toLowerCase();
        return code.includes(normalized) || name.includes(normalized);
      });
    };

    const renderBranchCollection = (containerEl, branches, emptyMessage, onSelect) => {
      containerEl.innerHTML = '';
      if (!branches.length) {
        containerEl.appendChild(renderEmptyStateCard(emptyMessage));
        return;
      }

      branches.forEach((branch) => containerEl.appendChild(createBranchButton(branch, onSelect)));
    };

    const ensureBranchList = async () => {
      const branches = getAvailableBranches();
      if (branches.length) {
        return branches;
      }

      const response = await services.camera.getBranches();
      if (response.status >= 400) {
        throw new Error(response.message || 'Failed to load branches.');
      }

      const nextBranches = getAllowedBranches(Array.isArray(response.data) ? response.data : []);
      setAvailableBranches(nextBranches);
      return nextBranches;
    };

    const renderResults = () => {
      const filteredBranches = filterBranches(branchSearchInputEl.value);
      pickerStatusEl.textContent = filteredBranches.length
        ? `Showing ${filteredBranches.length} branch result(s).`
        : 'No branch matched your search.';
      renderBranchCollection(
        branchListEl,
        filteredBranches,
        'No branch matched your search.',
        () => branchSearchInputEl.blur()
      );
    };

    const open = async () => {
      ensureCctvAccess();
      showModal(pickerEl);
      pickerStatusEl.textContent = 'Loading branch list...';
      branchListEl.innerHTML = '';
      branchSearchInputEl.value = '';

      try {
        await ensureBranchList();
        renderResults();
        focusAndSelectInput(branchSearchInputEl);
        addActivity('Branch browser opened', 'Search or browse a branch to load camera cards.', 'neutral');
      } catch (error) {
        pickerStatusEl.textContent = error.message || 'Failed to load branches.';
        addActivity('Branch list unavailable', error.message || 'Failed to load branches.', 'danger');
      }
    };

    return {
      ensureBranchList,
      open,
      renderResults,
    };
  };

  modules.createBranchPicker = createBranchPicker;
})(typeof window !== 'undefined' ? window : globalThis);
