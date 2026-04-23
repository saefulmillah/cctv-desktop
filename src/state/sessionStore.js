(function (globalScope) {
  const capabilityApi =
    globalScope.appCapability && typeof globalScope.appCapability.createAnonymousSession === 'function'
      ? globalScope.appCapability
      : null;

  const createFallbackAnonymousSession = () => ({
    isAuthenticated: false,
    token: '',
    user: null,
    roles: [],
    permissions: [],
    branchScopes: [],
    canViewAllBranches: false,
  });

  const createSessionStore = () => {
    let state = capabilityApi
      ? capabilityApi.createAnonymousSession()
      : createFallbackAnonymousSession();
    const listeners = new Set();

    const emit = () => {
      const snapshot = {
        ...state,
        roles: Array.isArray(state.roles) ? [...state.roles] : [],
        permissions: Array.isArray(state.permissions) ? [...state.permissions] : [],
        branchScopes: Array.isArray(state.branchScopes) ? [...state.branchScopes] : [],
      };
      listeners.forEach((listener) => listener(snapshot));
      globalScope.dispatchEvent(
        new CustomEvent('app-session-changed', {
          detail: snapshot,
        })
      );
    };

    return {
      clear() {
        state = capabilityApi
          ? capabilityApi.createAnonymousSession()
          : createFallbackAnonymousSession();
        emit();
      },
      getState() {
        return {
          ...state,
          roles: Array.isArray(state.roles) ? [...state.roles] : [],
          permissions: Array.isArray(state.permissions) ? [...state.permissions] : [],
          branchScopes: Array.isArray(state.branchScopes) ? [...state.branchScopes] : [],
        };
      },
      set(nextState) {
        state = {
          ...(capabilityApi
            ? capabilityApi.createAnonymousSession()
            : createFallbackAnonymousSession()),
          ...(nextState && typeof nextState === 'object' ? nextState : {}),
        };
        emit();
      },
      subscribe(listener) {
        if (typeof listener !== 'function') {
          return () => {};
        }
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  };

  globalScope.appSessionStore = createSessionStore();
})(typeof window !== 'undefined' ? window : globalThis);
