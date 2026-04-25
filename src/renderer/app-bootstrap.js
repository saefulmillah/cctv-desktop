(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createAppBootstrap = ({
    services,
    addActivity,
    setInstalledVersionText,
    loadAppearanceConfig,
    setUpdateStatusText,
    syncUpdateInfoCard,
    normalizeUpdateMessage,
    getUpdateTone,
    setUpdateButtonState,
    syncSessionState,
    handleSessionStateChange,
    applyApiConfigState,
    openApiBaseUrlConfig,
    redirectToApiConfigFlow,
    restoreWorkspaceState,
    renderWelcomeState,
    canUseCctv,
    getIsApiConfigRequired,
    getLatestUpdatePayload,
    setLatestUpdatePayload,
    getActiveBranch,
    ensureGridHasVisibleContent,
    stopPerfObserver,
    clearPlayers,
    setAuthStatus,
    updatePagingUi,
    setPagingVisible,
    setReloadButtonState,
    setToolbarMenuVisible,
    setToolbarVisible,
    applyAppearanceConfig,
    defaultAppearanceConfig,
    activeUiTheme,
    syncLayoutControls,
    applySessionToUi,
    anonymousSession,
    setAuthModalVisible,
    setApiConfigRequirementState,
    startPerfObserver,
    onOpenBranchPicker,
    onOpenApiBaseUrlConfig,
    onOpenUpdateFeedConfig,
    onOpenHelp,
    onOpenCameraSearch,
    onOpenLayoutConfig,
    onEnterFocusMode,
    onLeaveFocusMode,
    onReloadStreams,
    showHelp,
    openQuickSearch,
    openLayoutConfig,
    openUpdateFeedConfig,
    enterFocusMode,
    leaveFocusMode,
    refreshCurrentStreams,
    isSosModeActive,
    onBootstrapComplete,
  } = {}) => {
    const initialize = () => {
      updatePagingUi();
      setPagingVisible(false);
      setReloadButtonState(false);
      setToolbarMenuVisible(false);
      setToolbarVisible(false);
      applyAppearanceConfig(defaultAppearanceConfig);
      if (activeUiTheme) {
        document.body.classList.add(activeUiTheme);
      }
      syncLayoutControls();
      renderWelcomeState();
      setUpdateStatusText('Updater idle', 'ready');
      addActivity('Dashboard ready', 'Waiting for branch selection or quick search.', 'neutral');
      startPerfObserver();
      applySessionToUi(anonymousSession);
      setAuthModalVisible(false);
      setApiConfigRequirementState(false);
      setAuthStatus('Memuat session yang tersimpan...', 'neutral');

      globalScope.addEventListener('beforeunload', () => {
        stopPerfObserver();
        clearPlayers();
      });

      services.info
        .getVersion()
        .then((version) => setInstalledVersionText(version))
        .catch(() => setInstalledVersionText('-'));

      loadAppearanceConfig().catch((error) => {
        addActivity('Appearance restore failed', error.message || 'Failed to restore appearance setting.', 'warning');
      });

      globalScope.setTimeout(ensureGridHasVisibleContent, 250);
      globalScope.setTimeout(ensureGridHasVisibleContent, 1000);

      services.auth.onSessionChanged((session) => {
        syncSessionState(session || anonymousSession);
        void handleSessionStateChange(session || anonymousSession);
      });

      const bootstrapAuthSession = async () => {
        try {
          const configResponse = await services.camera.getApiConfigState();
          if (configResponse.status >= 400) {
            throw new Error(configResponse.message || 'Failed to load API configuration state.');
          }
          const configState = applyApiConfigState(configResponse.data);
          if (!configState.isPersisted) {
            syncSessionState(anonymousSession);
            await handleSessionStateChange(anonymousSession, { suppressAuthModal: true });
            await openApiBaseUrlConfig({
              requireConfiguration: true,
              returnToAuth: true,
              statusMessage:
                'Konfigurasikan alamat backend terlebih dahulu, lalu simpan untuk melanjutkan ke login.',
              statusTone: 'neutral',
            });
            return;
          }

          const response = await services.auth.restoreSession();
          if (response.status >= 400) {
            if (response.errorCode === 'api_unreachable') {
              await redirectToApiConfigFlow(
                response.message || 'Unable to reach API server. Check API_BASE_URL and network connection.',
                'danger'
              );
              return;
            }
            throw new Error(response.message || 'Failed to restore session.');
          }
          const session = response.data || anonymousSession;
          syncSessionState(session);
          await handleSessionStateChange(session);
          if (session.isAuthenticated && canUseCctv()) {
            await restoreWorkspaceState();
          } else {
            renderWelcomeState();
          }
        } catch (error) {
          addActivity('Session restore failed', error.message || 'Failed to restore session.', 'warning');
          syncSessionState(anonymousSession);
          await handleSessionStateChange(anonymousSession, {
            suppressAuthModal: typeof getIsApiConfigRequired === 'function' ? getIsApiConfigRequired() : false,
          });
          renderWelcomeState();
        } finally {
          if (typeof onBootstrapComplete === 'function') {
            onBootstrapComplete();
          }
        }
      };

      globalScope.__HKTV_AUTH_BOOTSTRAP_PROMISE__ = bootstrapAuthSession();

      services.updater
        .getStatus()
        .then((response) => {
          if (response.status >= 400) {
            throw new Error(response.message || 'Failed to load updater status.');
          }
          if (typeof setLatestUpdatePayload === 'function') {
            setLatestUpdatePayload(response.data || null);
          }
          syncUpdateInfoCard(
            typeof getLatestUpdatePayload === 'function' ? getLatestUpdatePayload() : response.data || null
          );
          setUpdateStatusText(normalizeUpdateMessage(response.data), response.data && response.data.state);
        })
        .catch((error) => {
          setUpdateStatusText(error.message || 'Updater status unavailable.', 'error');
        });

      services.updater.onStatus((payload) => {
        const state = payload && payload.state ? String(payload.state) : '';
        if (typeof setLatestUpdatePayload === 'function') {
          setLatestUpdatePayload(payload || (typeof getLatestUpdatePayload === 'function' ? getLatestUpdatePayload() : null));
        }
        syncUpdateInfoCard(
          typeof getLatestUpdatePayload === 'function' ? getLatestUpdatePayload() : payload || null
        );
        setUpdateStatusText(normalizeUpdateMessage(payload), state);

        if (state === 'checking' || state === 'downloading') {
          setUpdateButtonState(true);
          return;
        }

        if (state) {
          addActivity('Updater status changed', normalizeUpdateMessage(payload), getUpdateTone(state));
        }
        setUpdateButtonState(false);
      });

      services.camera.onOpenBranchPicker(onOpenBranchPicker);
      services.camera.onOpenApiBaseUrlConfig(onOpenApiBaseUrlConfig);
      services.camera.onOpenUpdateFeedConfig(onOpenUpdateFeedConfig);
      services.camera.onOpenHelp(onOpenHelp || showHelp);
      services.camera.onOpenCameraSearch(onOpenCameraSearch);
      services.camera.onOpenLayoutConfig(onOpenLayoutConfig || openLayoutConfig);
      services.camera.onEnterFocusMode(onEnterFocusMode || enterFocusMode);
      services.camera.onLeaveFocusMode(onLeaveFocusMode || leaveFocusMode);
      services.camera.onReloadStreams(onReloadStreams);

      globalScope.__HKTV_PAUSE_GRID_STREAMS__ = () => {
        clearPlayers();
        addActivity('Grid streams paused', 'Streaming grid dihentikan sementara saat Asset Monitoring aktif.', 'warning');
      };

      globalScope.__HKTV_RESUME_GRID_STREAMS__ = async () => {
        if (isSosModeActive()) {
          return;
        }
        const activeBranch = typeof getActiveBranch === 'function' ? getActiveBranch() : null;
        if (!activeBranch || !activeBranch.id) {
          return;
        }
        await refreshCurrentStreams();
      };
    };

    return {
      initialize,
    };
  };

  modules.createAppBootstrap = createAppBootstrap;
})(typeof window !== 'undefined' ? window : globalThis);
