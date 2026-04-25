(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const identity = (value) => value;

  const createFallbackChannel = (shape = {}) => ({
    ...shape,
  });

  const createServiceAdapters = (root = globalScope) => {
    const camera = root.cameraService || createFallbackChannel();
    const auth = root.auth || createFallbackChannel();
    const updater = root.appUpdater || createFallbackChannel();
    const info = root.appInfo || createFallbackChannel();
    const state = root.appState || createFallbackChannel();
    const config = root.appConfig || createFallbackChannel();

    return {
      auth: {
        getSession: auth.getSession || identity,
        login: auth.login || identity,
        logout: auth.logout || identity,
        restoreSession: auth.restoreSession || identity,
        onSessionChanged: auth.onSessionChanged || (() => () => {}),
      },
      camera: {
        ...camera,
        onOpenBranchPicker: camera.onOpenBranchPicker || (() => () => {}),
        onOpenApiBaseUrlConfig: camera.onOpenApiBaseUrlConfig || (() => () => {}),
        onOpenUpdateFeedConfig: camera.onOpenUpdateFeedConfig || (() => () => {}),
        onOpenHelp: camera.onOpenHelp || (() => () => {}),
        onOpenCameraSearch: camera.onOpenCameraSearch || (() => () => {}),
        onOpenLayoutConfig: camera.onOpenLayoutConfig || (() => () => {}),
        onEnterFocusMode: camera.onEnterFocusMode || (() => () => {}),
        onLeaveFocusMode: camera.onLeaveFocusMode || (() => () => {}),
        onReloadStreams: camera.onReloadStreams || (() => () => {}),
      },
      config,
      info,
      state,
      updater: {
        ...updater,
        onStatus: updater.onStatus || (() => () => {}),
      },
    };
  };

  modules.createServiceAdapters = createServiceAdapters;
})(typeof window !== 'undefined' ? window : globalThis);
