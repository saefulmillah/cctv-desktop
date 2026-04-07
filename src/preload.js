const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cameraService', {
  createCamera: (payload) => ipcRenderer.invoke('camera-service:create-camera', payload),
  getApiAuthToken: () => ipcRenderer.invoke('camera-service:get-api-auth-token'),
  getApiBaseUrl: () => ipcRenderer.invoke('camera-service:get-api-base-url'),
  getApiDocsUrl: () => ipcRenderer.invoke('camera-service:get-api-docs-url'),
  checkApiBaseUrl: (candidateApiBaseUrl, candidateApiAuthToken) =>
    ipcRenderer.invoke(
      'camera-service:check-api-base-url',
      candidateApiBaseUrl,
      candidateApiAuthToken
    ),
  getBranchPages: (branchId) =>
    ipcRenderer.invoke('camera-service:get-branch-pages', branchId),
  getBranches: (query) => ipcRenderer.invoke('camera-service:get-branches', query),
  getCameras: (query) => ipcRenderer.invoke('camera-service:get-cameras', query),
  searchCameras: (query) => ipcRenderer.invoke('camera-service:search-cameras', query),
  getCamerasByBranch: (branchId, page) =>
    ipcRenderer.invoke('camera-service:get-cameras-by-branch', branchId, page),
  getGates: (query) => ipcRenderer.invoke('camera-service:get-gates', query),
  getHealth: () => ipcRenderer.invoke('camera-service:get-health'),
  getSosAlerts: () => ipcRenderer.invoke('camera-service:get-sos-alerts'),
  getOpenSosTickets: () => ipcRenderer.invoke('camera-service:get-open-sos-tickets'),
  getSosTicketDetail: (ticketNo) =>
    ipcRenderer.invoke('camera-service:get-sos-ticket-detail', ticketNo),
  dispatchSosTicket: (payload) => ipcRenderer.invoke('camera-service:dispatch-sos-ticket', payload),
  completeSosTicket: (ticketNo, payload) =>
    ipcRenderer.invoke('camera-service:complete-sos-ticket', ticketNo, payload),
  onOpenBranchPicker: (callback) => {
    const channel = 'shortcut:open-branch-picker';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onOpenApiBaseUrlConfig: (callback) => {
    const channel = 'shortcut:open-api-base-url-config';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onOpenUpdateFeedConfig: (callback) => {
    const channel = 'shortcut:open-update-feed-config';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onOpenHelp: (callback) => {
    const channel = 'shortcut:open-help';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onOpenCameraSearch: (callback) => {
    const channel = 'shortcut:open-camera-search';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onOpenLayoutConfig: (callback) => {
    const channel = 'shortcut:open-layout-config';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onEnterFocusMode: (callback) => {
    const channel = 'shortcut:enter-focus-mode';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onLeaveFocusMode: (callback) => {
    const channel = 'shortcut:leave-focus-mode';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onReloadStreams: (callback) => {
    const channel = 'shortcut:reload-streams';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  setApiConfig: (nextApiBaseUrl, nextApiAuthToken) =>
    ipcRenderer.invoke('camera-service:set-api-config', nextApiBaseUrl, nextApiAuthToken),
});

contextBridge.exposeInMainWorld('appUpdater', {
  checkForUpdates: () => ipcRenderer.invoke('app-update:check'),
  getConfig: () => ipcRenderer.invoke('app-update:get-config'),
  getStatus: () => ipcRenderer.invoke('app-update:get-status'),
  onStatus: (callback) => {
    const channel = 'app-update:status';
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  setConfig: (payload) => ipcRenderer.invoke('app-update:set-config', payload),
});

contextBridge.exposeInMainWorld('appInfo', {
  getVersion: () => ipcRenderer.invoke('app:get-version'),
});

contextBridge.exposeInMainWorld('appState', {
  getWorkspaceState: () => ipcRenderer.invoke('app-state:get-workspace'),
  saveWorkspaceState: (payload) => ipcRenderer.invoke('app-state:save-workspace', payload),
  clearWorkspaceState: () => ipcRenderer.invoke('app-state:clear-workspace'),
});
