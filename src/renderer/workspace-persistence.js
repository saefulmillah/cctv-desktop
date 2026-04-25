(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createWorkspacePersistence = ({
    delayMs = 1400,
    serializeWorkspaceState,
    saveWorkspaceState,
    onPersistError,
    shouldSkipPersist,
  } = {}) => {
    let persistTimer = null;

    const cancel = () => {
      if (persistTimer) {
        globalScope.clearTimeout(persistTimer);
        persistTimer = null;
      }
    };

    const persist = async () => {
      if (typeof shouldSkipPersist === 'function' && shouldSkipPersist()) {
        return;
      }
      const response = await saveWorkspaceState(serializeWorkspaceState());
      if (response.status >= 400) {
        throw new Error(response.message || 'Failed to save workspace state.');
      }
    };

    const schedule = () => {
      if (typeof shouldSkipPersist === 'function' && shouldSkipPersist()) {
        return;
      }
      cancel();
      persistTimer = globalScope.setTimeout(() => {
        persistTimer = null;
        persist().catch((error) => {
          if (typeof onPersistError === 'function') {
            onPersistError(error);
          }
        });
      }, delayMs);
    };

    return {
      cancel,
      persist,
      schedule,
    };
  };

  modules.createWorkspacePersistence = createWorkspacePersistence;
})(typeof window !== 'undefined' ? window : globalThis);
