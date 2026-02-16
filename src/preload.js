const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cameraService', {
  createCamera: (payload) => ipcRenderer.invoke('camera-service:create-camera', payload),
  getApiDocsUrl: () => ipcRenderer.invoke('camera-service:get-api-docs-url'),
  getBranchPages: (branchId) =>
    ipcRenderer.invoke('camera-service:get-branch-pages', branchId),
  getBranches: (query) => ipcRenderer.invoke('camera-service:get-branches', query),
  getCameras: (query) => ipcRenderer.invoke('camera-service:get-cameras', query),
  getCamerasByBranch: (branchId, page) =>
    ipcRenderer.invoke('camera-service:get-cameras-by-branch', branchId, page),
  getGates: (query) => ipcRenderer.invoke('camera-service:get-gates', query),
  getHealth: () => ipcRenderer.invoke('camera-service:get-health'),
  onOpenBranchPicker: (callback) => {
    const channel = 'shortcut:open-branch-picker';
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
});
