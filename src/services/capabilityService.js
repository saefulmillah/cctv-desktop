(function (globalScope) {
  const FEATURE_CCTV_VIEW = 'feature.cctv.view';
  const FEATURE_ASSET_VIEW = 'feature.asset.view';
  const FEATURE_SOS_VIEW = 'feature.sos.view';
  const BRANCH_VIEW_ALL = 'branch.view.all';

  const toArray = (value) => (Array.isArray(value) ? value : value == null ? [] : [value]);

  const uniqStrings = (value) =>
    Array.from(
      new Set(
        toArray(value)
          .map((entry) => String(entry || '').trim())
          .filter(Boolean)
      )
    );

  const normalizeBranchScope = (item) => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const id = item.id ?? item.branch_id ?? item.branchId ?? '';
    if (id === '') {
      return null;
    }

    return {
      id: String(id),
      branch_code: String(item.branch_code || item.branchCode || '').trim(),
      branch_name: String(item.branch_name || item.branchName || '').trim(),
    };
  };

  const createAnonymousSession = () => ({
    isAuthenticated: false,
    token: '',
    user: null,
    roles: [],
    permissions: [],
    branchScopes: [],
    canViewAllBranches: false,
  });

  const normalizeCapabilityPayload = (payload, token = '') => {
    const data =
      payload && payload.data && typeof payload.data === 'object'
        ? payload.data
        : payload && typeof payload === 'object'
          ? payload
          : {};
    const user = data.user && typeof data.user === 'object'
      ? {
          id: String(data.user.id || '').trim(),
          username: String(data.user.username || '').trim(),
          email: String(data.user.email || '').trim(),
          display_name: String(data.user.display_name || data.user.displayName || '').trim(),
        }
      : null;
    const roles = uniqStrings(data.roles);
    const permissions = uniqStrings(data.permissions);
    const branchScopes = toArray(data.branch_scopes)
      .map(normalizeBranchScope)
      .filter(Boolean);
    const canViewAllBranches =
      permissions.includes(BRANCH_VIEW_ALL) || roles.includes('super_admin');

    return {
      isAuthenticated: Boolean(String(token || '').trim()),
      token: String(token || '').trim(),
      user,
      roles,
      permissions,
      branchScopes,
      canViewAllBranches,
    };
  };

  const hasPermission = (session, permissionCode) => {
    const normalizedCode = String(permissionCode || '').trim();
    if (!normalizedCode) {
      return false;
    }
    const permissions = uniqStrings(session && session.permissions);
    return permissions.includes(normalizedCode);
  };

  const hasAnyPermission = (session, permissionCodes) =>
    uniqStrings(permissionCodes).some((permissionCode) => hasPermission(session, permissionCode));

  const hasAnyRole = (session, roleCodes) => {
    const roles = uniqStrings(session && session.roles);
    return uniqStrings(roleCodes).some((roleCode) => roles.includes(roleCode));
  };

  const canAccessBranch = (session, branchId) => {
    const normalizedBranchId = String(branchId || '').trim();
    if (!normalizedBranchId) {
      return false;
    }
    if (session && session.canViewAllBranches) {
      return true;
    }
    return toArray(session && session.branchScopes).some(
      (branch) => branch && String(branch.id || '').trim() === normalizedBranchId
    );
  };

  const filterAllowedBranches = (session, branches) => {
    const normalizedBranches = toArray(branches).filter(
      (branch) => branch && typeof branch === 'object' && branch.id != null
    );
    if (session && session.canViewAllBranches) {
      return normalizedBranches;
    }
    return normalizedBranches.filter((branch) => canAccessBranch(session, branch.id));
  };

  const canUseCctv = (session) => hasPermission(session, FEATURE_CCTV_VIEW);
  const canUseAssetMonitoring = (session) =>
    hasAnyPermission(session, [FEATURE_ASSET_VIEW, FEATURE_SOS_VIEW]);
  const canDispatchSos = (session) => hasPermission(session, 'sos.ticket.dispatch');
  const canCompleteSos = (session) => hasPermission(session, 'sos.ticket.complete');

  const capabilityApi = {
    BRANCH_VIEW_ALL,
    FEATURE_ASSET_VIEW,
    FEATURE_CCTV_VIEW,
    FEATURE_SOS_VIEW,
    createAnonymousSession,
    normalizeCapabilityPayload,
    hasPermission,
    hasAnyPermission,
    hasAnyRole,
    canAccessBranch,
    filterAllowedBranches,
    canUseCctv,
    canUseAssetMonitoring,
    canDispatchSos,
    canCompleteSos,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = capabilityApi;
  }

  globalScope.appCapability = capabilityApi;
})(typeof window !== 'undefined' ? window : globalThis);
