(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createActivityFeed = ({ container, limit = 6, onRender } = {}) => {
    let items = [];

    const render = () => {
      if (!container) {
        return;
      }
      container.innerHTML = '';
      items.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'activity-item';
        row.innerHTML = `
          <span class="activity-dot ${item.tone}"></span>
          <div>
            <strong>${item.title}</strong>
            <p>${item.detail}</p>
          </div>
        `;
        container.appendChild(row);
      });
      if (typeof onRender === 'function') {
        onRender(items);
      }
    };

    return {
      add(title, detail, tone = 'neutral') {
        const normalizedTone = ['success', 'warning', 'danger'].includes(tone) ? tone : 'neutral';
        items = [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: String(title || 'Activity'),
            detail: String(detail || ''),
            tone: normalizedTone,
          },
          ...items,
        ].slice(0, limit);
        render();
      },
      getItems() {
        return items.slice();
      },
      clear() {
        items = [];
        render();
      },
      render,
    };
  };

  modules.createActivityFeed = createActivityFeed;
})(typeof window !== 'undefined' ? window : globalThis);
