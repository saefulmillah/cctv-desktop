(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createPlayerRuntime = ({
    constants,
    getState,
    updateState,
    callbacks,
  } = {}) => {
    const logPlayerEvent = (eventName, detail = {}) => {
      try {
        console.info('[player-runtime]', eventName, detail);
      } catch (_) {
        // Ignore logging failures.
      }
    };

    const getReconnectRegistrySize = () => getState().reconnectTimers.size;

    const logPerfSnapshot = () => {
      if (!constants.PERF_FLAGS.ENABLE_PERF_OBSERVER) {
        return;
      }
      const state = getState();
      console.info('[perf]', {
        activePlayers: state.playerControllers.size,
        reconnectTimers: getReconnectRegistrySize(),
        watchdogActive: Boolean(state.globalWatchdogTimer),
        searchRequests: state.perfStats.searchRequests,
      });
    };

    const clearReconnectTimer = (key) => {
      const state = getState();
      if (!state.reconnectTimers.has(key)) {
        return;
      }
      clearTimeout(state.reconnectTimers.get(key));
      state.reconnectTimers.delete(key);
    };

    const scheduleReconnectTimer = (key, callback, delayMs) => {
      const state = getState();
      if (!constants.PERF_FLAGS.USE_RECONNECT_GUARDS) {
        globalScope.setTimeout(callback, delayMs);
        return;
      }
      clearReconnectTimer(key);
      state.perfStats.reconnectSchedules += 1;
      const timerId = globalScope.setTimeout(() => {
        state.reconnectTimers.delete(key);
        callback();
      }, delayMs);
      state.reconnectTimers.set(key, timerId);
    };

    const ensureGlobalWatchdog = () => {
      const state = getState();
      if (
        !constants.PERF_FLAGS.USE_CENTRAL_WATCHDOG ||
        state.globalWatchdogTimer ||
        state.playerControllers.size === 0
      ) {
        return;
      }

      updateState({
        globalWatchdogTimer: globalScope.setInterval(() => {
          getState().playerControllers.forEach((controller) => {
            if (!controller || controller.destroyed || !controller.watchdogEligible) {
              return;
            }
            controller.checkPlaybackHealth();
          });
        }, constants.WATCHDOG_INTERVAL_MS),
      });
    };

    const syncGlobalWatchdogState = () => {
      const state = getState();
      if (!constants.PERF_FLAGS.USE_CENTRAL_WATCHDOG) {
        return;
      }

      if (state.playerControllers.size === 0) {
        if (state.globalWatchdogTimer) {
          clearInterval(state.globalWatchdogTimer);
          updateState({ globalWatchdogTimer: null });
        }
        return;
      }

      ensureGlobalWatchdog();
    };

    const startPerfObserver = () => {
      if (!constants.PERF_FLAGS.ENABLE_PERF_OBSERVER || getState().perfObserverTimer) {
        return;
      }
      updateState({
        perfObserverTimer: globalScope.setInterval(logPerfSnapshot, 60000),
      });
    };

    const stopPerfObserver = () => {
      const state = getState();
      if (!state.perfObserverTimer) {
        return;
      }
      clearInterval(state.perfObserverTimer);
      updateState({ perfObserverTimer: null });
    };

    const clearPlayers = () => {
      const state = getState();
      logPlayerEvent('clear-players-started', {
        activePlayers: state.playerControllers.size,
        reconnectTimers: state.reconnectTimers.size,
      });
      state.reconnectTimers.forEach((timerId) => clearTimeout(timerId));
      state.reconnectTimers.clear();
      state.playerControllers.forEach((controller) => {
        if (controller && typeof controller.destroy === 'function') {
          controller.destroy();
        }
      });
      state.playerControllers.clear();
      if (state.globalWatchdogTimer) {
        clearInterval(state.globalWatchdogTimer);
        updateState({ globalWatchdogTimer: null });
      }

      while (state.hlsPlayers.length > 0) {
        const player = state.hlsPlayers.pop();
        if (player && typeof player.destroy === 'function') {
          player.destroy();
        }
      }
      logPerfSnapshot();
      logPlayerEvent('clear-players-completed');
    };

    const attachStreamWithRetry = (videoEl, streamUrl, statusEl, cameraId) => {
      const maxRetryDelayMs = 30000;
      let retryCount = 0;
      let lastPlaybackAt = Date.now();
      let lastCurrentTime = 0;
      let activeHls = null;
      let mediaRecoveryAttempts = 0;
      let reconnectInProgress = false;
      let destroyed = false;
      let localWatchdogTimer = null;
      let consecutiveStuckSamples = 0;
      let recoveryAttemptCount = 0;
      let lastRecoveryReason = '';
      let sourceUnavailableAttemptCount = 0;
      const nextAttachSequence = Number(getState().playerAttachSequence || 0) + 1;
      updateState({ playerAttachSequence: nextAttachSequence });
      const controllerKey = `${cameraId}:${nextAttachSequence}`;
      logPlayerEvent('attach-started', {
        cameraId,
        controllerKey,
      });

      const normalizeRecoveryReason = (reason) => {
        if (!reason) {
          return 'retry';
        }
        if (typeof reason === 'string') {
          return reason;
        }
        if (reason instanceof Error) {
          return `${reason.name || 'Error'}: ${reason.message || 'Unknown error'}`;
        }
        if (typeof reason === 'object' && reason.message) {
          return String(reason.message);
        }
        return String(reason);
      };

      const isTransientSourceUnavailable = (reasonText) => {
        const normalized = String(reasonText || '').toLowerCase();
        return (
          normalized.includes('notsupportederror') ||
          normalized.includes('no supported source was found') ||
          normalized.includes('manifest load error') ||
          normalized.includes('level load error')
        );
      };

      const logStreamRecovery = (_eventName, _extra = {}) => {};

      const clearLocalWatchdog = () => {
        if (!localWatchdogTimer) {
          return;
        }
        clearInterval(localWatchdogTimer);
        localWatchdogTimer = null;
      };

      const checkPlaybackHealth = () => {
        if (
          destroyed ||
          videoEl.paused ||
          videoEl.ended ||
          videoEl.readyState < 2 ||
          reconnectInProgress ||
          Date.now() - controller.attachedAt < constants.WATCHDOG_WARMUP_MS
        ) {
          return;
        }

        const currentTime = videoEl.currentTime || 0;
        if (currentTime > lastCurrentTime + 0.01) {
          lastCurrentTime = currentTime;
          lastPlaybackAt = Date.now();
          consecutiveStuckSamples = 0;
          return;
        }

        if (Date.now() - lastPlaybackAt >= constants.WATCHDOG_FREEZE_THRESHOLD_MS) {
          consecutiveStuckSamples += 1;
          if (consecutiveStuckSamples >= constants.WATCHDOG_CONSECUTIVE_STUCK_SAMPLES) {
            logStreamRecovery('stuck-detected', {
              consecutiveStuckSamples,
              stalledForMs: Date.now() - lastPlaybackAt,
            });
            scheduleRetry('watchdog');
          }
        }
      };

      const scheduleRetry = (reason = 'retry') => {
        if (destroyed || reconnectInProgress) {
          return;
        }

        const normalizedReason = normalizeRecoveryReason(reason);
        const transientSourceUnavailable = isTransientSourceUnavailable(normalizedReason);
        reconnectInProgress = true;
        controller.recovering = true;
        lastRecoveryReason = normalizedReason;
        consecutiveStuckSamples = 0;
        callbacks.setStreamStatus(statusEl, cameraId, 'reconnecting');
        clearReconnectTimer(controllerKey);

        if (activeHls) {
          activeHls.destroy();
          activeHls = null;
        }

        recoveryAttemptCount += 1;
        if (!transientSourceUnavailable && recoveryAttemptCount > constants.STREAM_RECOVERY_MAX_RETRIES) {
          reconnectInProgress = false;
          controller.recovering = false;
          controller.watchdogEligible = false;
          callbacks.setStreamStatus(statusEl, cameraId, 'offline');
          callbacks.addActivity(
            'Stream recovery stopped',
            `Camera ${cameraId} exceeded recovery limit after ${normalizedReason}.`,
            'warning'
          );
          return;
        }

        let delayMs;
        if (transientSourceUnavailable) {
          sourceUnavailableAttemptCount += 1;
          if (sourceUnavailableAttemptCount <= constants.STREAM_SOURCE_FAST_RETRIES) {
            delayMs = [2000, 5000, 10000][sourceUnavailableAttemptCount - 1] || 10000;
          } else {
            const cooldownIndex = Math.min(
              sourceUnavailableAttemptCount - constants.STREAM_SOURCE_FAST_RETRIES - 1,
              constants.STREAM_SOURCE_COOLDOWN_DELAYS_MS.length - 1
            );
            delayMs = constants.STREAM_SOURCE_COOLDOWN_DELAYS_MS[cooldownIndex];
          }
        } else {
          sourceUnavailableAttemptCount = 0;
          const baseDelayMs = Math.min(maxRetryDelayMs, 2000 * 2 ** Math.min(retryCount, 4));
          delayMs = baseDelayMs + Math.floor(Math.random() * 1000);
        }
        logStreamRecovery('recovery-scheduled', {
          delayMs,
          reason: normalizedReason,
          transientSourceUnavailable,
          sourceUnavailableAttemptCount,
        });
        logPlayerEvent('retry-scheduled', {
          cameraId,
          controllerKey,
          delayMs,
          reason: normalizedReason,
        });
        retryCount += 1;
        scheduleReconnectTimer(controllerKey, connect, delayMs);
      };

      const connect = () => {
        if (destroyed) {
          return;
        }
        reconnectInProgress = false;
        controller.recovering = false;
        mediaRecoveryAttempts = 0;
        controller.attachedAt = Date.now();
        logStreamRecovery('rebind-started');
        callbacks.setStreamStatus(statusEl, cameraId, retryCount > 0 ? 'reconnecting' : 'connecting');
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();

        if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
          videoEl.src = callbacks.withCacheBuster(streamUrl);
          videoEl.load();
          videoEl.play().catch(scheduleRetry);
          return;
        }

        if (globalScope.Hls && globalScope.Hls.isSupported()) {
          const hls = new globalScope.Hls({
            lowLatencyMode: false,
            backBufferLength: 10,
            maxBufferLength: 10,
            maxMaxBufferLength: 20,
            liveSyncDurationCount: 3,
            enableWorker: true,
          });

          activeHls = hls;
          hls.on(globalScope.Hls.Events.MEDIA_ATTACHED, () => {
            if (destroyed || getState().playerControllers.get(controllerKey) !== controller) {
              return;
            }
            hls.loadSource(callbacks.withCacheBuster(streamUrl));
          });
          hls.on(globalScope.Hls.Events.MANIFEST_PARSED, () => {
            if (destroyed || getState().playerControllers.get(controllerKey) !== controller) {
              return;
            }
            mediaRecoveryAttempts = 0;
            videoEl.play().catch(scheduleRetry);
          });
          hls.on(globalScope.Hls.Events.ERROR, (_event, data) => {
            if (destroyed || getState().playerControllers.get(controllerKey) !== controller) {
              return;
            }
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === globalScope.Hls.ErrorTypes.MEDIA_ERROR && mediaRecoveryAttempts < 1) {
              mediaRecoveryAttempts += 1;
              hls.recoverMediaError();
              return;
            }

            hls.destroy();
            activeHls = null;
            scheduleRetry();
          });
          hls.attachMedia(videoEl);
          getState().hlsPlayers.push(hls);
          return;
        }

        throw new Error('HLS is not supported in this runtime.');
      };

      const handlePlaying = () => {
        if (destroyed) {
          return;
        }
        retryCount = 0;
        const recoverySucceeded = recoveryAttemptCount > 0 || Boolean(lastRecoveryReason);
        recoveryAttemptCount = 0;
        sourceUnavailableAttemptCount = 0;
        lastRecoveryReason = '';
        consecutiveStuckSamples = 0;
        clearReconnectTimer(controllerKey);
        clearLocalWatchdog();
        reconnectInProgress = false;
        controller.recovering = false;
        mediaRecoveryAttempts = 0;
        lastPlaybackAt = Date.now();
        lastCurrentTime = videoEl.currentTime || 0;
        controller.watchdogEligible = true;
        if (!constants.PERF_FLAGS.USE_CENTRAL_WATCHDOG) {
          localWatchdogTimer = globalScope.setInterval(checkPlaybackHealth, constants.WATCHDOG_INTERVAL_MS);
        }
        callbacks.setStreamStatus(statusEl, cameraId, 'online');
        logPlayerEvent('attach-online', {
          cameraId,
          controllerKey,
          retries: retryCount,
        });
        if (recoverySucceeded) {
          logStreamRecovery('recovery-succeeded');
        }
      };

      const handleTimeUpdate = () => {
        if (destroyed) {
          return;
        }
        const currentTime = videoEl.currentTime || 0;
        if (currentTime > lastCurrentTime + 0.01) {
          lastCurrentTime = currentTime;
          lastPlaybackAt = Date.now();
          consecutiveStuckSamples = 0;
        }
      };

      const handleError = () => {
        if (destroyed) {
          return;
        }
        controller.watchdogEligible = false;
        clearLocalWatchdog();
        callbacks.setStreamStatus(statusEl, cameraId, 'offline');
        logStreamRecovery('media-error');
        logPlayerEvent('attach-error', {
          cameraId,
          controllerKey,
        });
        scheduleRetry('media-error');
      };

      const controller = {
        key: controllerKey,
        cameraId,
        videoEl,
        statusEl,
        watchdogEligible: false,
        destroyed: false,
        recovering: false,
        attachedAt: Date.now(),
        checkPlaybackHealth,
        destroy() {
          if (destroyed) {
            return;
          }
          destroyed = true;
          this.destroyed = true;
          this.watchdogEligible = false;
          this.recovering = false;
          clearReconnectTimer(controllerKey);
          clearLocalWatchdog();
          videoEl.removeEventListener('playing', handlePlaying);
          videoEl.removeEventListener('timeupdate', handleTimeUpdate);
          videoEl.removeEventListener('error', handleError);
          videoEl.removeEventListener('stalled', scheduleRetry);
          videoEl.removeEventListener('emptied', scheduleRetry);
          videoEl.pause();
          videoEl.removeAttribute('src');
          videoEl.load();
          if (activeHls) {
            activeHls.destroy();
            activeHls = null;
          }
          getState().playerControllers.delete(controllerKey);
          logPlayerEvent('attach-destroyed', {
            cameraId,
            controllerKey,
          });
          syncGlobalWatchdogState();
        },
      };

      getState().playerControllers.set(controllerKey, controller);

      videoEl.addEventListener('playing', handlePlaying);
      videoEl.addEventListener('timeupdate', handleTimeUpdate);
      videoEl.addEventListener('error', handleError);
      videoEl.addEventListener('stalled', scheduleRetry);
      videoEl.addEventListener('emptied', scheduleRetry);

      connect();
      syncGlobalWatchdogState();
      logPerfSnapshot();
      return controller;
    };

    return {
      attachStreamWithRetry,
      clearPlayers,
      clearReconnectTimer,
      ensureGlobalWatchdog,
      getReconnectRegistrySize,
      logPerfSnapshot,
      scheduleReconnectTimer,
      startPerfObserver,
      stopPerfObserver,
      syncGlobalWatchdogState,
    };
  };

  modules.createPlayerRuntime = createPlayerRuntime;
})(typeof window !== 'undefined' ? window : globalThis);
