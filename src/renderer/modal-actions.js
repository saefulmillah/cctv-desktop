(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createModalActions = ({
    elements,
    services,
    defaults,
    getState,
    updateState,
    callbacks,
  } = {}) => {
    const {
      apiConfigModalEl,
      apiBaseUrlInputEl,
      authModalEl,
      authPasswordInputEl,
      appearanceConfigModalEl,
      appearanceFontFamilySelectEl,
      appearanceWeatherIconStyleSelectEl,
      appearanceWeatherIconColorInputEl,
      appearanceWeatherIconAnimatedEl,
      layoutConfigModalEl,
      updateConfigModalEl,
      updateFeedUrlInputEl,
      updateGithubOwnerInputEl,
      updateGithubRepoInputEl,
      useGithubReleaseCheckboxEl,
      saveUpdateConfigBtn,
      pickerEl,
      searchModalEl,
      helpModalEl,
    } = elements;

    const {
      applyAppearanceConfig,
      normalizeAppearanceConfig,
      focusAndSelectInput,
      setApiCheckStatus,
      setApiCheckButtonState,
      setApiConfigRequirementState,
      setAuthModalVisible,
      setAuthStatus,
      showModal,
      hideModal,
      hideHelp,
      syncLayoutControls,
      syncUpdateInfoCard,
      reopenAuthModalAfterApiConfig,
      handleSessionStateChange,
      addActivity,
    } = callbacks;

    const openApiBaseUrlConfig = async (options = {}) => {
      const now = Date.now();
      const state = getState();
      if (now - state.lastApiConfigOpenAt < 300) {
        return;
      }
      updateState({ lastApiConfigOpenAt: now });

      const normalizedOptions = options && typeof options === 'object' ? options : {};
      const requireConfiguration = Boolean(normalizedOptions.requireConfiguration);
      const returnToAuth =
        normalizedOptions.returnToAuth === undefined
          ? authModalEl.classList.contains('visible')
          : Boolean(normalizedOptions.returnToAuth);
      const currentApiBaseUrl =
        state.apiConfigBootstrapState.apiBaseUrl || (await services.camera.getApiBaseUrl());

      updateState({ shouldReturnToAuthAfterApiConfig: returnToAuth });
      setApiConfigRequirementState(requireConfiguration);
      apiBaseUrlInputEl.value = currentApiBaseUrl || '';
      setApiCheckStatus(
        normalizedOptions.statusMessage || 'Enter an API URL, then use Check URL to verify connectivity.',
        normalizedOptions.statusTone || 'neutral'
      );
      setApiCheckButtonState(false);
      if (returnToAuth || requireConfiguration) {
        setAuthModalVisible(false);
      }
      showModal(apiConfigModalEl);
      focusAndSelectInput(apiBaseUrlInputEl);
    };

    const closeApiConfigFlow = ({ force = false } = {}) => {
      const state = getState();
      if (state.isApiConfigRequired && !force) {
        return;
      }
      hideModal(apiConfigModalEl);
      setApiConfigRequirementState(false);
      reopenAuthModalAfterApiConfig();
    };

    const redirectToApiConfigFlow = async (message, tone = 'warning') => {
      authPasswordInputEl.value = '';
      setAuthStatus('Perbarui koneksi backend sebelum mencoba login lagi.', 'warning');
      await handleSessionStateChange(defaults.anonymousSession, { suppressAuthModal: true });
      await openApiBaseUrlConfig({
        requireConfiguration: true,
        returnToAuth: true,
        statusMessage:
          message || 'Unable to reach API server. Check API_BASE_URL and network connection.',
        statusTone: tone,
      });
    };

    const openAppearanceConfig = async () => {
      const now = Date.now();
      const state = getState();
      if (now - state.lastAppearanceConfigOpenAt < 300) {
        return;
      }
      updateState({ lastAppearanceConfigOpenAt: now });

      if (services.config && typeof services.config.getAppearance === 'function') {
        const response = await services.config.getAppearance();
        if (response.status >= 400) {
          throw new Error(response.message || 'Failed to load appearance configuration.');
        }
        applyAppearanceConfig(response.data || defaults.defaultAppearanceConfig);
      } else {
        applyAppearanceConfig(state.currentAppearanceConfig);
      }

      showModal(appearanceConfigModalEl);
      if (appearanceFontFamilySelectEl) {
        appearanceFontFamilySelectEl.focus();
      }
    };

    const loadAppearanceConfig = async () => {
      if (!services.config || typeof services.config.getAppearance !== 'function') {
        applyAppearanceConfig(defaults.defaultAppearanceConfig);
        return;
      }
      const response = await services.config.getAppearance();
      if (response.status >= 400) {
        throw new Error(response.message || 'Failed to load appearance configuration.');
      }
      applyAppearanceConfig(response.data || defaults.defaultAppearanceConfig);
    };

    const openLayoutConfig = () => {
      syncLayoutControls();
      showModal(layoutConfigModalEl);
    };

    const openUpdateFeedConfig = async () => {
      const now = Date.now();
      const state = getState();
      if (now - state.lastUpdateConfigOpenAt < 300) {
        return;
      }
      updateState({ lastUpdateConfigOpenAt: now });

      const response = await services.updater.getConfig();
      if (response.status >= 400) {
        throw new Error(response.message || 'Failed to load update configuration.');
      }

      const data = response.data || {};
      const readOnlyMode = data.mode === 'electron-updater';
      updateFeedUrlInputEl.value = data.feedUrl || data.suggestedFeedUrl || '';
      updateGithubOwnerInputEl.value = data.githubOwner || data.suggestedGitHubOwner || '';
      updateGithubRepoInputEl.value = data.githubRepo || data.suggestedGitHubRepo || '';
      useGithubReleaseCheckboxEl.checked = Boolean(data.githubOwner && data.githubRepo);
      updateFeedUrlInputEl.disabled = readOnlyMode;
      updateGithubOwnerInputEl.disabled = readOnlyMode;
      updateGithubRepoInputEl.disabled = readOnlyMode;
      useGithubReleaseCheckboxEl.disabled = readOnlyMode;
      saveUpdateConfigBtn.disabled = readOnlyMode;
      if (readOnlyMode) {
        elements.pickerStatusEl.textContent =
          data.message || 'Auto update feed is managed by build configuration.';
      }
      syncUpdateInfoCard(getState().latestUpdatePayload, data);
      showModal(updateConfigModalEl);
      focusAndSelectInput(updateFeedUrlInputEl);
    };

    const closeAllTransientUi = () => {
      callbacks.setToolbarMenuVisible(false);
      callbacks.setProfileMenuVisible(false);
      hideModal(pickerEl);
      hideModal(searchModalEl);
      hideModal(appearanceConfigModalEl);
      hideModal(layoutConfigModalEl);
      if (apiConfigModalEl.classList.contains('visible')) {
        if (!getState().isApiConfigRequired) {
          closeApiConfigFlow();
        }
      }
      hideModal(updateConfigModalEl);
      hideHelp();
    };

    const bindConfigForms = () => {
      elements.authFormEl.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (getState().isSubmittingLogin) {
          return;
        }

        const username = String(elements.authUsernameInputEl.value || '').trim();
        const password = String(elements.authPasswordInputEl.value || '');
        if (!username || !password) {
          setAuthStatus('Username dan password wajib diisi.', 'warning');
          return;
        }

        callbacks.setLoginButtonState(true);
        setAuthStatus('Memverifikasi login dan capability...', 'warning');
        try {
          const response = await services.auth.login(username, password);
          if (response.status >= 400) {
            if (response.errorCode === 'api_unreachable') {
              await redirectToApiConfigFlow(
                response.message || 'Unable to reach API server. Check API_BASE_URL and network connection.',
                'danger'
              );
              return;
            }
            throw new Error(response.message || 'Login gagal.');
          }
          callbacks.syncSessionState(response.data || defaults.anonymousSession);
          elements.authPasswordInputEl.value = '';
          await callbacks.handleSessionStateChange(response.data || defaults.anonymousSession);
          if (callbacks.canUseCctv()) {
            await callbacks.restoreWorkspaceState();
          }
        } catch (error) {
          setAuthStatus(error.message || 'Login gagal.', 'danger');
        } finally {
          callbacks.setLoginButtonState(false);
        }
      });

      elements.appearanceConfigFormEl.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nextAppearance = normalizeAppearanceConfig({
          fontFamily: appearanceFontFamilySelectEl.value,
          weatherIconStyle: appearanceWeatherIconStyleSelectEl
            ? appearanceWeatherIconStyleSelectEl.value
            : defaults.defaultAppearanceConfig.weatherIconStyle,
          weatherIconMonochromeColor: appearanceWeatherIconColorInputEl
            ? appearanceWeatherIconColorInputEl.value
            : defaults.defaultAppearanceConfig.weatherIconMonochromeColor,
          weatherIconAnimated: appearanceWeatherIconAnimatedEl
            ? appearanceWeatherIconAnimatedEl.checked
            : defaults.defaultAppearanceConfig.weatherIconAnimated,
        });

        if (!services.config || typeof services.config.setAppearance !== 'function') {
          applyAppearanceConfig(nextAppearance);
          hideModal(appearanceConfigModalEl);
          addActivity('Appearance updated', `Font set to ${nextAppearance.fontFamily}.`, 'success');
          return;
        }

        const response = await services.config.setAppearance(nextAppearance);
        if (response.status >= 400) {
          elements.pickerStatusEl.textContent =
            response.message || 'Failed to save appearance configuration.';
          addActivity('Appearance update failed', response.message || 'Failed to save font setting.', 'danger');
          return;
        }

        applyAppearanceConfig(response.data || nextAppearance);
        hideModal(appearanceConfigModalEl);
        addActivity(
          'Appearance updated',
          `Font set to ${String(nextAppearance.fontFamily || '').toUpperCase()}.`,
          'success'
        );
      });

      if (appearanceWeatherIconStyleSelectEl && appearanceWeatherIconColorInputEl) {
        appearanceWeatherIconStyleSelectEl.addEventListener('change', () => {
          const nextAppearance = normalizeAppearanceConfig({
            ...getState().currentAppearanceConfig,
            weatherIconStyle: appearanceWeatherIconStyleSelectEl.value,
            weatherIconMonochromeColor: appearanceWeatherIconColorInputEl.value,
            weatherIconAnimated: appearanceWeatherIconAnimatedEl
              ? appearanceWeatherIconAnimatedEl.checked
              : getState().currentAppearanceConfig.weatherIconAnimated,
          });
          applyAppearanceConfig(nextAppearance);
        });
      }

      if (appearanceWeatherIconColorInputEl) {
        const isValidAppearanceHexColor = (value) => {
          const raw = String(value || '').trim();
          const normalized = raw.startsWith('#') ? raw.slice(1) : raw;
          return /^[0-9a-fA-F]{6}$/.test(normalized);
        };

        appearanceWeatherIconColorInputEl.addEventListener('input', () => {
          if (
            !appearanceWeatherIconStyleSelectEl ||
            appearanceWeatherIconStyleSelectEl.value !== 'monochrome-color'
          ) {
            return;
          }
          const typedValue = String(appearanceWeatherIconColorInputEl.value || '').trim();
          if (!isValidAppearanceHexColor(typedValue)) {
            return;
          }
          const nextAppearance = normalizeAppearanceConfig({
            ...getState().currentAppearanceConfig,
            weatherIconStyle: appearanceWeatherIconStyleSelectEl.value,
            weatherIconMonochromeColor: typedValue,
            weatherIconAnimated: appearanceWeatherIconAnimatedEl
              ? appearanceWeatherIconAnimatedEl.checked
              : getState().currentAppearanceConfig.weatherIconAnimated,
          });
          applyAppearanceConfig(nextAppearance);
        });

        appearanceWeatherIconColorInputEl.addEventListener('blur', () => {
          if (
            !appearanceWeatherIconStyleSelectEl ||
            appearanceWeatherIconStyleSelectEl.value !== 'monochrome-color'
          ) {
            return;
          }
          const typedValue = String(appearanceWeatherIconColorInputEl.value || '').trim();
          const nextAppearance = normalizeAppearanceConfig({
            ...getState().currentAppearanceConfig,
            weatherIconStyle: appearanceWeatherIconStyleSelectEl.value,
            weatherIconMonochromeColor: isValidAppearanceHexColor(typedValue)
              ? typedValue
              : getState().currentAppearanceConfig.weatherIconMonochromeColor,
            weatherIconAnimated: appearanceWeatherIconAnimatedEl
              ? appearanceWeatherIconAnimatedEl.checked
              : getState().currentAppearanceConfig.weatherIconAnimated,
          });
          applyAppearanceConfig(nextAppearance);
        });
      }

      if (appearanceWeatherIconAnimatedEl) {
        appearanceWeatherIconAnimatedEl.addEventListener('change', () => {
          const nextAppearance = normalizeAppearanceConfig({
            ...getState().currentAppearanceConfig,
            weatherIconStyle: appearanceWeatherIconStyleSelectEl
              ? appearanceWeatherIconStyleSelectEl.value
              : getState().currentAppearanceConfig.weatherIconStyle,
            weatherIconMonochromeColor: appearanceWeatherIconColorInputEl
              ? appearanceWeatherIconColorInputEl.value
              : getState().currentAppearanceConfig.weatherIconMonochromeColor,
            weatherIconAnimated: appearanceWeatherIconAnimatedEl.checked,
          });
          applyAppearanceConfig(nextAppearance);
        });
      }

      elements.apiConfigFormEl.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nextApiBaseUrl = apiBaseUrlInputEl.value.trim();
        if (!nextApiBaseUrl) {
          elements.pickerStatusEl.textContent = 'API_BASE_URL cannot be empty.';
          return;
        }

        const response = await services.camera.setApiConfig(nextApiBaseUrl);
        if (response.status >= 400) {
          elements.pickerStatusEl.textContent = response.message || 'Failed to update API_BASE_URL.';
          addActivity('API update failed', response.message || 'Failed to update API base URL.', 'danger');
          return;
        }

        const updatedApiBaseUrl =
          response && response.data && response.data.apiBaseUrl ? response.data.apiBaseUrl : '';
        callbacks.applyApiConfigState({
          apiBaseUrl: updatedApiBaseUrl,
          isPersisted: true,
          isUsingDefault: false,
        });
        elements.pickerStatusEl.textContent = `API_BASE_URL updated to ${updatedApiBaseUrl}`;
        setApiCheckStatus('API_BASE_URL saved. Continue to login.', 'success');
        closeApiConfigFlow({ force: true });
        addActivity('API updated', `API base URL updated to ${updatedApiBaseUrl}.`, 'success');
      });

      elements.checkApiConfigBtn.addEventListener('click', async () => {
        if (getState().isCheckingApiConfig) {
          return;
        }

        const candidateApiBaseUrl = apiBaseUrlInputEl.value.trim();
        if (!candidateApiBaseUrl) {
          setApiCheckStatus('API_BASE_URL cannot be empty.', 'warning');
          return;
        }

        setApiCheckButtonState(true);
        setApiCheckStatus('Checking API health endpoint...', 'neutral');

        try {
          const response = await services.camera.checkApiBaseUrl(candidateApiBaseUrl);
          if (response.status >= 400) {
            throw new Error(response.message || 'Failed to verify API URL.');
          }

          const data = response.data || {};
          setApiCheckStatus(
            `${data.message || 'API health check succeeded.'} (${data.apiBaseUrl || candidateApiBaseUrl})`,
            'success'
          );
        } catch (error) {
          setApiCheckStatus(error.message || 'API URL check failed.', 'danger');
        } finally {
          setApiCheckButtonState(false);
        }
      });

      elements.updateConfigFormEl.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (saveUpdateConfigBtn.disabled) {
          elements.pickerStatusEl.textContent =
            'Auto update feed is read-only in electron-updater mode.';
          hideModal(updateConfigModalEl);
          return;
        }

        const feedUrl = updateFeedUrlInputEl.value.trim();
        const githubOwner = updateGithubOwnerInputEl.value.trim();
        const githubRepo = updateGithubRepoInputEl.value.trim();
        const useGitHubRelease = useGithubReleaseCheckboxEl.checked;
        const response = await services.updater.setConfig({
          feedUrl,
          githubOwner,
          githubRepo,
          useGitHubRelease,
        });

        if (response.status >= 400) {
          elements.pickerStatusEl.textContent =
            response.message || 'Failed to update auto update feed.';
          addActivity('Update config failed', response.message || 'Failed to update feed.', 'danger');
          return;
        }

        const data = response.data || {};
        callbacks.setUpdateStatusText(`Feed configured (${data.source || 'config'}).`, 'ready');
        elements.pickerStatusEl.textContent = `Update source configured to ${data.feedUrl || '-'}`;
        hideModal(updateConfigModalEl);
        addActivity('Updater configured', `Update source set to ${data.feedUrl || '-'}.`, 'success');
      });

      elements.layoutConfigFormEl.addEventListener('submit', (event) => {
        event.preventDefault();
        const preset = String(elements.layoutPresetSelectEl.value || '5x4');
        const mainCount = Math.max(1, Number.parseInt(elements.layoutMainCountInputEl.value, 10) || 1);
        const sideCount = Math.max(1, Number.parseInt(elements.layoutSideCountInputEl.value, 10) || 6);

        if (preset === '4x4') {
          callbacks.setGridLayoutState({ type: '4x4', columns: 4, rows: 4, limit: 16, mainCount, sideCount });
        } else if (preset === '3x3') {
          callbacks.setGridLayoutState({ type: '3x3', columns: 3, rows: 3, limit: 9, mainCount, sideCount });
        } else if (preset === 'spotlight') {
          callbacks.setGridLayoutState({
            type: 'spotlight',
            columns: 4,
            rows: 4,
            limit: mainCount + sideCount,
            mainCount,
            sideCount,
          });
        } else {
          callbacks.setGridLayoutState({ type: '5x4', columns: 5, rows: 4, limit: 20, mainCount, sideCount });
        }

        hideModal(layoutConfigModalEl);
        addActivity(
          'Grid layout updated',
          preset === 'spotlight'
            ? `Layout main ${mainCount} + side ${sideCount} applied.`
            : `Layout ${preset} applied.`,
          'success'
        );
        callbacks.renderCameras(callbacks.getCurrentCameras());
      });

      elements.apiBaseUrlInputEl.addEventListener('input', () => {
        setApiCheckStatus('Click Check URL to validate the current API address.', 'neutral');
      });
    };

    return {
      bindConfigForms,
      closeAllTransientUi,
      closeApiConfigFlow,
      loadAppearanceConfig,
      openApiBaseUrlConfig,
      openAppearanceConfig,
      openLayoutConfig,
      openUpdateFeedConfig,
      redirectToApiConfigFlow,
    };
  };

  modules.createModalActions = createModalActions;
})(typeof window !== 'undefined' ? window : globalThis);
