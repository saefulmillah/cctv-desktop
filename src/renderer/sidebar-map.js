(function (globalScope) {
  const modules = (globalScope.HKTVRendererModules = globalScope.HKTVRendererModules || {});

  const createSidebarMap = ({
    elements,
    constants,
    getState,
    updateState,
    callbacks,
  } = {}) => {
    const getCameraCoordinates = (camera) => {
      if (!camera || typeof camera !== 'object') {
        return null;
      }
      const lat = Number(camera.cctv_lat);
      const lng = Number(camera.cctv_lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }
      return { lat, lng };
    };

    const getMapCameraCollection = () => {
      const state = getState();
      return state.branchWideCameras.length ? state.branchWideCameras : state.currentCameras;
    };

    const getMapMarkerIconUrl = (camera) =>
      callbacks.getCameraOperationalState(camera) === 'online'
        ? constants.ONLINE_MARKER_URL
        : constants.OFFLINE_MARKER_URL;

    const getMapMarkerScaledSize = (camera) =>
      String(camera && camera.id) === String(getState().selectedMapCameraId) ? 40 : 32;

    const shortenMarkerLabel = (text, maxLength) => {
      const normalized = String(text || '').trim();
      if (!normalized) {
        return '';
      }
      if (normalized.length <= maxLength) {
        return normalized;
      }
      return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
    };

    const normalizeMarkerLabelSource = (camera) => {
      const rawName = String((camera && camera.cctv_name) || '').trim();
      if (!rawName) {
        return 'CCTV';
      }
      const parts = rawName.split(/\s+/).filter(Boolean);
      if (parts.length <= 1) {
        return rawName;
      }
      const trimmed = parts.slice(1).join(' ').trim();
      return trimmed || rawName;
    };

    const buildSpiderfyLabelConfig = (camera) => {
      const state = getState();
      if (!camera || !state.spiderfiedMarkerIds.has(String(camera.id))) {
        return null;
      }
      const selected = String(camera.id) === String(state.selectedMapCameraId);
      return {
        text: shortenMarkerLabel(normalizeMarkerLabelSource(camera), selected ? 18 : 12),
        className: selected ? 'map-marker-label map-marker-label--selected' : 'map-marker-label',
      };
    };

    const getSpiderfyLabelOrigin = (_xOffset, yOffset) => {
      if (yOffset <= 0) {
        return new window.google.maps.Point(16, -14);
      }
      return new window.google.maps.Point(16, 42);
    };

    const applySpiderfyMarkerLabels = () => {
      getState().sidebarMapMarkers.forEach((entry) => {
        if (!entry || !entry.marker || !entry.camera) {
          return;
        }
        entry.marker.setLabel(buildSpiderfyLabelConfig(entry.camera));
        entry.marker.setZIndex(
          String(entry.camera && entry.camera.id) === String(getState().selectedMapCameraId)
            ? 1000
            : undefined
        );
      });
    };

    const scheduleSidebarMapRefresh = () => {
      const state = getState();
      if (state.sidebarMapRefreshTimer) {
        clearTimeout(state.sidebarMapRefreshTimer);
      }
      updateState({
        sidebarMapRefreshTimer: window.setTimeout(() => {
          updateState({ sidebarMapRefreshTimer: null });
          void updateSidebarMap();
        }, 180),
      });
    };

    const getBranchPageCameraMap = () => {
      const pageMap = new Map();
      getMapCameraCollection().forEach((camera) => {
        const pageNumber = Number(camera.__sourcePage || camera.page || getState().activePage || 1);
        pageMap.set(
          String(camera.id),
          Number.isFinite(pageNumber) && pageNumber > 0
            ? pageNumber
            : Math.max(1, Number(getState().activePage || 1))
        );
      });
      return pageMap;
    };

    const clearSidebarMapMarkers = () => {
      const state = getState();
      if (state.sidebarClusterHoverOpenTimer) {
        clearTimeout(state.sidebarClusterHoverOpenTimer);
        updateState({ sidebarClusterHoverOpenTimer: null });
      }
      if (state.sidebarClusterHoverCloseTimer) {
        clearTimeout(state.sidebarClusterHoverCloseTimer);
        updateState({ sidebarClusterHoverCloseTimer: null });
      }
      if (state.sidebarClusterTooltipEl) {
        state.sidebarClusterTooltipEl.classList.remove('is-visible');
      }
      updateState({ activeClusterTooltipKey: null });
      if (state.sidebarMarkerCluster) {
        if (typeof state.sidebarMarkerCluster.clearMarkers === 'function') {
          state.sidebarMarkerCluster.clearMarkers();
        }
        if (typeof state.sidebarMarkerCluster.setMap === 'function') {
          state.sidebarMarkerCluster.setMap(null);
        }
        updateState({ sidebarMarkerCluster: null });
      }

      state.spiderfyLegs.forEach((leg) => {
        if (leg && typeof leg.setMap === 'function') {
          leg.setMap(null);
        }
      });
      state.spiderfyTempMarkers.forEach((marker) => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      });
      if (state.spiderfyClusterMarker && typeof state.spiderfyClusterMarker.setOpacity === 'function') {
        state.spiderfyClusterMarker.setOpacity(1);
      }
      state.sidebarMapMarkers.forEach((entry) => {
        if (entry && entry.marker && typeof entry.marker.setMap === 'function') {
          entry.marker.setMap(null);
        }
      });
      updateState({
        spiderfyLegs: [],
        spiderfyTempMarkers: [],
        spiderfiedMarkerIds: new Set(),
        spiderfySourceCameraId: null,
        spiderfyClusterMarker: null,
        sidebarMapMarkers: [],
      });
    };

    const collapseSpiderfy = () => {
      const state = getState();
      if (!state.spiderfiedMarkerIds.size) {
        return;
      }

      state.spiderfyLegs.forEach((leg) => {
        if (leg && typeof leg.setMap === 'function') {
          leg.setMap(null);
        }
      });
      state.spiderfyTempMarkers.forEach((marker) => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      });
      if (state.spiderfyClusterMarker && typeof state.spiderfyClusterMarker.setOpacity === 'function') {
        state.spiderfyClusterMarker.setOpacity(1);
      }

      state.sidebarMapMarkers.forEach((entry) => {
        if (!entry || !entry.marker || !entry.originalPosition) {
          return;
        }
        entry.marker.setPosition(entry.originalPosition);
      });

      updateState({
        spiderfyLegs: [],
        spiderfyTempMarkers: [],
        spiderfiedMarkerIds: new Set(),
        spiderfySourceCameraId: null,
        spiderfyClusterMarker: null,
      });
      applySpiderfyMarkerLabels();
    };

    const interpolateLatLng = (fromLatLng, toLatLng, progress) => {
      if (!fromLatLng || !toLatLng) {
        return toLatLng || fromLatLng || null;
      }
      const startLat = typeof fromLatLng.lat === 'function' ? fromLatLng.lat() : fromLatLng.lat;
      const startLng = typeof fromLatLng.lng === 'function' ? fromLatLng.lng() : fromLatLng.lng;
      const endLat = typeof toLatLng.lat === 'function' ? toLatLng.lat() : toLatLng.lat;
      const endLng = typeof toLatLng.lng === 'function' ? toLatLng.lng() : toLatLng.lng;
      return new window.google.maps.LatLng(
        startLat + (endLat - startLat) * progress,
        startLng + (endLng - startLng) * progress
      );
    };

    const animateSpiderfyMarker = (marker, fromLatLng, toLatLng, leg, legAnchorLatLng, duration = 180) => {
      if (!marker || !fromLatLng || !toLatLng) {
        return;
      }

      const startAt = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - startAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextLatLng = interpolateLatLng(fromLatLng, toLatLng, eased);
        if (nextLatLng) {
          marker.setPosition(nextLatLng);
          if (leg && typeof leg.setPath === 'function') {
            leg.setPath([legAnchorLatLng, nextLatLng]);
          }
        }
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    };

    const getNearbyMarkerEntries = (sourceEntry, projection) => {
      if (!sourceEntry || !projection) {
        return [];
      }
      const sourcePixel = projection.fromLatLngToDivPixel(
        sourceEntry.originalPosition || sourceEntry.marker.getPosition()
      );
      if (!sourcePixel) {
        return [];
      }
      return getState().sidebarMapMarkers.filter((entry) => {
        if (!entry || !entry.marker) {
          return false;
        }
        const pixel = projection.fromLatLngToDivPixel(
          entry.originalPosition || entry.marker.getPosition()
        );
        if (!pixel) {
          return false;
        }
        return Math.abs(pixel.x - sourcePixel.x) <= 18 && Math.abs(pixel.y - sourcePixel.y) <= 18;
      });
    };

    const spiderfyMarkerGroup = (sourceEntry, customEntries = null, customCenter = null) => {
      const state = getState();
      if (!state.sidebarMapInstance || !state.sidebarMapProjectionOverlay || !sourceEntry) {
        return false;
      }
      const projection = state.sidebarMapProjectionOverlay.getProjection();
      if (!projection) {
        return false;
      }

      const nearbyEntries =
        Array.isArray(customEntries) && customEntries.length
          ? customEntries
          : getNearbyMarkerEntries(sourceEntry, projection);
      if (nearbyEntries.length <= 1) {
        collapseSpiderfy();
        return false;
      }

      collapseSpiderfy();
      const centerLatLng = customCenter || sourceEntry.originalPosition || sourceEntry.marker.getPosition();
      const centerPixel = projection.fromLatLngToDivPixel(centerLatLng);
      if (!centerPixel) {
        return false;
      }

      const spacing = Math.max(68, Math.min(90, 56 + nearbyEntries.length * 4));
      const baseYOffsets = [0, -16, 16, -28, 28, -38, 38, -48, 48];
      const middleIndex = (nearbyEntries.length - 1) / 2;
      const nextSpiderfiedMarkerIds = new Set();
      const nextSpiderfyLegs = [];
      const nextSpiderfyTempMarkers = [];

      nearbyEntries.forEach((entry, index) => {
        const xOffset = (index - middleIndex) * spacing;
        const yOffset =
          baseYOffsets[index] ??
          ((index % 2 === 0 ? 1 : -1) * (18 + Math.floor(index / 2) * 12));
        const targetPixel = new window.google.maps.Point(centerPixel.x + xOffset, centerPixel.y + yOffset);
        const targetLatLng = projection.fromDivPixelToLatLng(targetPixel);
        if (!targetLatLng) {
          return;
        }

        nextSpiderfiedMarkerIds.add(String(entry.camera.id));

        if (customEntries) {
          const scaledSize = getMapMarkerScaledSize(entry.camera);
          const spiderfyMarker = new window.google.maps.Marker({
            map: state.sidebarMapInstance,
            position: centerLatLng,
            title: entry.camera.cctv_name || 'CCTV',
            icon: {
              url: getMapMarkerIconUrl(entry.camera),
              scaledSize: new window.google.maps.Size(scaledSize, scaledSize),
              labelOrigin: getSpiderfyLabelOrigin(xOffset, yOffset),
            },
            label: buildSpiderfyLabelConfig(entry.camera),
            zIndex:
              String(entry.camera && entry.camera.id) === String(getState().selectedMapCameraId)
                ? 1000
                : 950,
          });

          spiderfyMarker.addListener('click', () => {
            updateState({ suppressSidebarMapClickUntil: Date.now() + 250 });
            void focusCameraFromMap(entry.camera);
          });

          nextSpiderfyTempMarkers.push(spiderfyMarker);
          const leg = new window.google.maps.Polyline({
            map: state.sidebarMapInstance,
            path: [centerLatLng, centerLatLng],
            strokeColor: '#ffffff',
            strokeOpacity: 0.85,
            strokeWeight: 1.5,
            clickable: false,
            zIndex: 1,
          });
          nextSpiderfyLegs.push(leg);
          animateSpiderfyMarker(spiderfyMarker, centerLatLng, targetLatLng, leg, centerLatLng);
          return;
        }

        entry.marker.setPosition(entry.originalPosition);
        const leg = new window.google.maps.Polyline({
          map: state.sidebarMapInstance,
          path: [entry.originalPosition, entry.originalPosition],
          strokeColor: '#ffffff',
          strokeOpacity: 0.85,
          strokeWeight: 1.5,
          clickable: false,
          zIndex: 1,
        });
        nextSpiderfyLegs.push(leg);
        animateSpiderfyMarker(entry.marker, entry.originalPosition, targetLatLng, leg, entry.originalPosition);
      });

      updateState({
        spiderfiedMarkerIds: nextSpiderfiedMarkerIds,
        spiderfyLegs: nextSpiderfyLegs,
        spiderfySourceCameraId: String(sourceEntry.camera.id),
        spiderfyTempMarkers: nextSpiderfyTempMarkers,
      });
      applySpiderfyMarkerLabels();
      return true;
    };

    const loadGoogleMapsApi = () => {
      if (window.google && window.google.maps) {
        return Promise.resolve(window.google.maps);
      }

      if (getState().googleMapsLoaderPromise) {
        return getState().googleMapsLoaderPromise;
      }

      const loaderPromise = new Promise((resolve, reject) => {
        const callbackName = `initGoogleMaps${Date.now()}`;
        window[callbackName] = () => {
          delete window[callbackName];
          resolve(window.google.maps);
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(constants.GOOGLE_MAPS_API_KEY)}&loading=async&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          delete window[callbackName];
          reject(new Error('Failed to load Google Maps.'));
        };
        document.head.appendChild(script);
      });
      updateState({ googleMapsLoaderPromise: loaderPromise });
      return loaderPromise;
    };

    const loadMarkerClustererLibrary = () => {
      if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
        return Promise.resolve(window.markerClusterer);
      }

      if (getState().markerClustererLoaderPromise) {
        return getState().markerClustererLoaderPromise;
      }

      const loaderPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
            resolve(window.markerClusterer);
            return;
          }
          reject(new Error('Failed to initialize MarkerClusterer.'));
        };
        script.onerror = () => reject(new Error('Failed to load MarkerClusterer.'));
        document.head.appendChild(script);
      });
      updateState({ markerClustererLoaderPromise: loaderPromise });
      return loaderPromise;
    };

    const getClusterTone = (onlineCount, offlineCount) => {
      const total = Math.max(1, Number(onlineCount || 0) + Number(offlineCount || 0));
      const onlineRatio = Number(onlineCount || 0) / total;
      const offlineRatio = Number(offlineCount || 0) / total;
      if (onlineRatio >= 0.7) {
        return { fill: 'rgba(65, 231, 93, 0.82)', border: 'rgba(65, 231, 93, 0.22)' };
      }
      if (offlineRatio >= 0.7) {
        return { fill: 'rgba(255, 63, 77, 0.82)', border: 'rgba(255, 63, 77, 0.22)' };
      }
      return { fill: 'rgba(255, 156, 28, 0.82)', border: 'rgba(255, 156, 28, 0.22)' };
    };

    const describeClusterStatus = (markers) => {
      const summary = { onlineCount: 0, offlineCount: 0 };
      markers.forEach((marker) => {
        const entry = getState().sidebarMapMarkers.find((item) => item && item.marker === marker);
        if (!entry || !entry.camera) {
          return;
        }
        if (callbacks.getCameraOperationalState(entry.camera) === 'online') {
          summary.onlineCount += 1;
          return;
        }
        summary.offlineCount += 1;
      });
      return summary;
    };

    const buildClusterSvgDataUrl = (count, onlineCount, offlineCount) => {
      const size = count >= 100 ? 62 : count >= 10 ? 56 : 52;
      const tone = getClusterTone(onlineCount, offlineCount);
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="${tone.fill}" stroke="${tone.border}" stroke-width="4" />
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 10}" fill="rgba(255,255,255,0.08)" />
        </svg>
      `.trim();
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    };

    const animateMapZoom = (map, targetZoom, center, stepDelay = 90) => {
      if (!map || !Number.isFinite(targetZoom)) {
        return;
      }
      const startZoom = Number(map.getZoom() || 0);
      if (center) {
        map.panTo(center);
      }
      if (startZoom >= targetZoom) {
        return;
      }

      let nextZoom = startZoom + 1;
      const tick = () => {
        if (nextZoom > targetZoom) {
          return;
        }
        map.setZoom(nextZoom);
        nextZoom += 1;
        if (nextZoom <= targetZoom) {
          window.setTimeout(tick, stepDelay);
        }
      };
      window.setTimeout(tick, stepDelay);
    };

    const ensureSidebarClusterTooltip = () => {
      const state = getState();
      if (state.sidebarClusterTooltipEl && state.sidebarClusterTooltipEl.isConnected) {
        return state.sidebarClusterTooltipEl;
      }
      if (state.sidebarClusterTooltipEl && !state.sidebarClusterTooltipEl.isConnected) {
        elements.sidebarMapEl.appendChild(state.sidebarClusterTooltipEl);
        return state.sidebarClusterTooltipEl;
      }
      const tooltipEl = document.createElement('div');
      tooltipEl.className = 'sidebar-cluster-tooltip';
      elements.sidebarMapEl.appendChild(tooltipEl);
      updateState({ sidebarClusterTooltipEl: tooltipEl });
      return tooltipEl;
    };

    const hideSidebarClusterTooltip = () => {
      const state = getState();
      if (state.sidebarClusterHoverOpenTimer) {
        clearTimeout(state.sidebarClusterHoverOpenTimer);
      }
      if (state.sidebarClusterHoverCloseTimer) {
        clearTimeout(state.sidebarClusterHoverCloseTimer);
      }
      if (state.sidebarClusterTooltipEl) {
        state.sidebarClusterTooltipEl.classList.remove('is-visible');
      }
      updateState({
        activeClusterTooltipKey: null,
        sidebarClusterHoverCloseTimer: null,
        sidebarClusterHoverOpenTimer: null,
      });
    };

    const waitForSidebarMapProjectionReady = async () => {
      const state = getState();
      if (!state.sidebarMapProjectionOverlay) {
        return null;
      }

      const existingProjection = state.sidebarMapProjectionOverlay.getProjection();
      if (existingProjection) {
        return existingProjection;
      }

      if (!state.sidebarMapProjectionReadyPromise) {
        const projectionPromise = new Promise((resolve) => {
          let attempts = 0;
          const poll = () => {
            const projection =
              getState().sidebarMapProjectionOverlay &&
              getState().sidebarMapProjectionOverlay.getProjection
                ? getState().sidebarMapProjectionOverlay.getProjection()
                : null;
            if (projection || attempts >= 30) {
              resolve(projection || null);
              return;
            }
            attempts += 1;
            window.setTimeout(poll, 50);
          };
          poll();
        }).finally(() => {
          updateState({ sidebarMapProjectionReadyPromise: null });
        });
        updateState({ sidebarMapProjectionReadyPromise: projectionPromise });
      }

      return getState().sidebarMapProjectionReadyPromise;
    };

    const showSidebarClusterTooltip = async (marker, summary, tooltipKey) => {
      const state = getState();
      if (!state.sidebarMapProjectionOverlay || !state.sidebarMapInstance || !marker || !summary) {
        return;
      }
      const projection = await waitForSidebarMapProjectionReady();
      const position = marker.getPosition();
      if (!projection || !position) {
        return;
      }
      const pixel = projection.fromLatLngToContainerPixel(position);
      if (!pixel) {
        return;
      }
      if (
        tooltipKey &&
        state.activeClusterTooltipKey === tooltipKey &&
        state.sidebarClusterTooltipEl?.classList.contains('is-visible')
      ) {
        return;
      }
      const tooltipEl = ensureSidebarClusterTooltip();
      tooltipEl.innerHTML = `
        <div class="sidebar-cluster-tooltip__title">${summary.count} camera</div>
        <div>${summary.onlineCount} online</div>
        <div>${summary.offlineCount} offline</div>
      `;
      const mapWidth = elements.sidebarMapEl.clientWidth || 0;
      const mapHeight = elements.sidebarMapEl.clientHeight || 0;
      const tooltipWidth = tooltipEl.offsetWidth || 120;
      const tooltipHeight = tooltipEl.offsetHeight || 72;
      const desiredLeft = pixel.x - 10;
      const desiredTop = pixel.y;
      const minLeft = tooltipWidth + 12;
      const maxLeft = Math.max(minLeft, mapWidth - 12);
      const minTop = tooltipHeight / 2 + 12;
      const maxTop = Math.max(minTop, mapHeight - tooltipHeight / 2 - 12);
      const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
      const clampedTop = Math.min(Math.max(desiredTop, minTop), maxTop);
      tooltipEl.style.left = `${clampedLeft}px`;
      tooltipEl.style.top = `${clampedTop}px`;
      tooltipEl.classList.add('is-visible');
      updateState({ activeClusterTooltipKey: tooltipKey || null });
    };

    const createSidebarMarkerCluster = async (map, markers) => {
      if (!map || !markers.length) {
        return null;
      }

      const markerClustererLib = await loadMarkerClustererLibrary();
      const MarkerClustererCtor = markerClustererLib.MarkerClusterer;
      const SuperClusterAlgorithmCtor = markerClustererLib.SuperClusterAlgorithm;
      if (!MarkerClustererCtor) {
        throw new Error('MarkerClusterer constructor unavailable.');
      }

      const renderer = {
        render({ count, position, markers: clusterMarkers }) {
          const { onlineCount, offlineCount } = describeClusterStatus(
            Array.isArray(clusterMarkers) ? clusterMarkers : []
          );
          const iconUrl = buildClusterSvgDataUrl(count, onlineCount, offlineCount);
          const size = count >= 100 ? 62 : count >= 10 ? 56 : 52;
          const marker = new window.google.maps.Marker({
            position,
            icon: {
              url: iconUrl,
              scaledSize: new window.google.maps.Size(size, size),
            },
            label: {
              text: String(count),
              color: '#ffffff',
              fontSize: count >= 100 ? '13px' : '12px',
              fontWeight: '600',
            },
            zIndex: 900,
          });
          marker.__clusterSummary = { count, onlineCount, offlineCount };
          marker.__clusterTooltipKey = `${count}:${onlineCount}:${offlineCount}:${position && position.lat ? position.lat() : ''}:${position && position.lng ? position.lng() : ''}`;
          marker.addListener('mouseover', () => {
            const state = getState();
            if (state.sidebarClusterHoverCloseTimer) {
              clearTimeout(state.sidebarClusterHoverCloseTimer);
              updateState({ sidebarClusterHoverCloseTimer: null });
            }
            const summary = marker.__clusterSummary || { count, onlineCount, offlineCount };
            if (state.sidebarClusterHoverOpenTimer) {
              clearTimeout(state.sidebarClusterHoverOpenTimer);
            }
            showSidebarClusterTooltip(marker, summary, marker.__clusterTooltipKey);
          });
          marker.addListener('mouseout', () => {
            const state = getState();
            if (state.sidebarClusterHoverOpenTimer) {
              clearTimeout(state.sidebarClusterHoverOpenTimer);
            }
            if (state.sidebarClusterHoverCloseTimer) {
              clearTimeout(state.sidebarClusterHoverCloseTimer);
            }
            updateState({
              sidebarClusterHoverCloseTimer: window.setTimeout(() => {
                updateState({ sidebarClusterHoverCloseTimer: null });
                hideSidebarClusterTooltip();
              }, 180),
              sidebarClusterHoverOpenTimer: null,
            });
          });
          return marker;
        },
      };

      return new MarkerClustererCtor({
        map,
        markers,
        algorithm: SuperClusterAlgorithmCtor
          ? new SuperClusterAlgorithmCtor({ radius: 170, maxZoom: 22 })
          : undefined,
        renderer,
        onClusterClick: (_, cluster) => {
          collapseSpiderfy();
          hideSidebarClusterTooltip();
          updateState({
            sidebarMapShouldAutoFit: false,
            sidebarMapViewportLocked: true,
            suppressSidebarMapClickUntil: Date.now() + 250,
          });
          const clusterMarkers = Array.isArray(cluster && cluster.markers) ? cluster.markers : [];
          const entries = clusterMarkers
            .map((marker) => getState().sidebarMapMarkers.find((entry) => entry && entry.marker === marker))
            .filter(Boolean);

          if (entries.length <= 1) {
            const singleCamera = entries[0] && entries[0].camera;
            if (singleCamera) {
              void focusCameraFromMap(singleCamera);
            }
            return;
          }

          const clusterCenter =
            (cluster && cluster.position) ||
            entries[0].originalPosition ||
            (entries[0].marker && entries[0].marker.getPosition && entries[0].marker.getPosition());
          const currentZoom = Number(map.getZoom() || 4);
          if (entries.length > 4) {
            const zoomStep = entries.length >= 10 ? 1 : 2;
            const nextZoom = Math.min(currentZoom + zoomStep, 20);
            const shouldSpiderfyInstead = currentZoom >= 19 || nextZoom === currentZoom;
            if (!shouldSpiderfyInstead) {
              collapseSpiderfy();
              animateMapZoom(map, nextZoom, clusterCenter);
              return;
            }
          }

          const clusterMarker = cluster && (cluster.marker || cluster._marker || null);
          if (clusterMarker && typeof clusterMarker.setOpacity === 'function') {
            clusterMarker.setOpacity(entries.length === 2 ? 0.22 : 0.32);
            updateState({ spiderfyClusterMarker: clusterMarker });
          }
          spiderfyMarkerGroup(entries[0], entries, clusterCenter);
        },
      });
    };

    const ensureSidebarMap = async () => {
      const state = getState();
      if (state.sidebarMapInstance) {
        return state.sidebarMapInstance;
      }

      const maps = await loadGoogleMapsApi();
      const sidebarMapInstance = new maps.Map(elements.sidebarMapEl, {
        center: { lat: -2.5489, lng: 118.0149 },
        zoom: 4,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1f4c85' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#e7f6ff' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1c3f6e' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#10396a' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#27558c' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      });
      const sidebarTrafficLayer = new maps.TrafficLayer();
      sidebarTrafficLayer.setMap(sidebarMapInstance);
      ensureSidebarClusterTooltip();
      const sidebarMapProjectionOverlay = new maps.OverlayView();
      sidebarMapProjectionOverlay.onAdd = () => {};
      sidebarMapProjectionOverlay.draw = () => {};
      sidebarMapProjectionOverlay.onRemove = () => {};
      sidebarMapProjectionOverlay.setMap(sidebarMapInstance);
      updateState({
        sidebarMapInstance,
        sidebarTrafficLayer,
        sidebarMapProjectionOverlay,
      });
      void waitForSidebarMapProjectionReady();
      sidebarMapInstance.addListener('dragstart', () => {
        updateState({ sidebarMapShouldAutoFit: false, sidebarMapViewportLocked: true });
        collapseSpiderfy();
        hideSidebarClusterTooltip();
      });
      sidebarMapInstance.addListener('zoom_changed', () => {
        updateState({ sidebarMapShouldAutoFit: false, sidebarMapViewportLocked: true });
        collapseSpiderfy();
        hideSidebarClusterTooltip();
      });
      sidebarMapInstance.addListener('click', () => {
        if (Date.now() < getState().suppressSidebarMapClickUntil) {
          return;
        }
        collapseSpiderfy();
        hideSidebarClusterTooltip();
      });
      sidebarMapInstance.addListener('idle', () => {
        if (!getState().sidebarMapViewportLocked) {
          return;
        }
        callbacks.scheduleWorkspacePersist();
      });
      return sidebarMapInstance;
    };

    const focusCameraFromMap = async (camera) => {
      const state = getState();
      if (!camera || !state.activeBranch || !state.activeBranch.id) {
        return;
      }

      const pageMap = getBranchPageCameraMap();
      const targetPage = pageMap.get(String(camera.id)) || 1;
      updateState({
        selectedMapCameraId: String(camera.id),
        sidebarMapShouldAutoFit: false,
        sidebarMapViewportLocked: true,
      });
      state.selectedCameraIds.add(String(camera.id));
      state.selectedCameraMap.set(String(camera.id), camera);

      if (state.activePage !== targetPage) {
        await callbacks.loadBranchCameras(state.activeBranch, targetPage);
      } else {
        callbacks.updateCardSelectionUi(camera.id);
        callbacks.updateMiniPanel();
      }

      callbacks.addActivity(
        'Camera focused from map',
        `${camera.cctv_name || 'Camera'} ditambahkan dari marker peta.`,
        'success'
      );
      callbacks.enterFocusMode();
      scheduleSidebarMapRefresh();
    };

    const updateSidebarMap = async () => {
      const state = getState();
      if (state.currentMode !== 'focus') {
        clearSidebarMapMarkers();
        callbacks.setSidebarMapLoadingVisible(false);
        elements.sidebarMapEl.classList.add('sidebar-section-hidden');
        elements.sidebarMapEmptyEl.classList.remove('sidebar-section-hidden');
        callbacks.setTextIfChanged(
          elements.sidebarMapTitleEl,
          state.activeBranch
            ? `Peta ${state.activeBranch.branch_name || state.activeBranch.branch_code || 'CCTV'}`
            : 'Peta CCTV'
        );
        callbacks.setTextIfChanged(elements.sidebarMapEmptyEl, 'Masuk ke Focus Mode untuk melihat peta CCTV.');
        return;
      }

      const camerasWithCoordinates = getMapCameraCollection().filter((camera) => getCameraCoordinates(camera));
      callbacks.setTextIfChanged(
        elements.sidebarMapTitleEl,
        state.activeBranch
          ? `Peta ${state.activeBranch.branch_name || state.activeBranch.branch_code || 'CCTV'}`
          : 'Peta CCTV'
      );

      if (!camerasWithCoordinates.length) {
        clearSidebarMapMarkers();
        callbacks.setSidebarMapLoadingVisible(false);
        elements.sidebarMapEl.classList.add('sidebar-section-hidden');
        elements.sidebarMapEmptyEl.classList.remove('sidebar-section-hidden');
        callbacks.setTextIfChanged(
          elements.sidebarMapEmptyEl,
          state.activeBranch
            ? 'Ruas ini belum memiliki koordinat CCTV yang valid.'
            : 'Pilih ruas untuk memuat marker CCTV berdasarkan koordinat kamera.'
        );
        return;
      }

      elements.sidebarMapEmptyEl.classList.add('sidebar-section-hidden');
      elements.sidebarMapEl.classList.remove('sidebar-section-hidden');
      callbacks.setSidebarMapLoadingVisible(true);

      try {
        const map = await ensureSidebarMap();
        clearSidebarMapMarkers();
        const bounds = new window.google.maps.LatLngBounds();
        const nextSidebarMapMarkers = [];

        camerasWithCoordinates.forEach((camera) => {
          const position = getCameraCoordinates(camera);
          if (!position) {
            return;
          }

          const marker = new window.google.maps.Marker({
            map,
            position,
            title: camera.cctv_name || 'CCTV',
            icon: {
              url: getMapMarkerIconUrl(camera),
              scaledSize: new window.google.maps.Size(
                getMapMarkerScaledSize(camera),
                getMapMarkerScaledSize(camera)
              ),
            },
            zIndex: String(camera && camera.id) === String(getState().selectedMapCameraId) ? 1000 : undefined,
          });

          marker.addListener('click', () => {
            updateState({ suppressSidebarMapClickUntil: Date.now() + 250 });
            hideSidebarClusterTooltip();
            void focusCameraFromMap(camera);
          });

          nextSidebarMapMarkers.push({
            marker,
            camera,
            originalPosition: position,
          });
          bounds.extend(position);
        });
        updateState({ sidebarMapMarkers: nextSidebarMapMarkers });

        try {
          const sidebarMarkerCluster = await createSidebarMarkerCluster(
            map,
            nextSidebarMapMarkers.map((entry) => entry.marker)
          );
          updateState({ sidebarMarkerCluster });
        } catch (clusterError) {
          console.warn('[sidebarMap] cluster fallback:', clusterError);
          updateState({ sidebarMarkerCluster: null });
        }

        if (getState().sidebarMapShouldAutoFit && camerasWithCoordinates.length === 1) {
          map.setCenter(getCameraCoordinates(camerasWithCoordinates[0]));
          map.setZoom(15);
        } else if (getState().sidebarMapShouldAutoFit) {
          map.fitBounds(bounds, 48);
        }
        callbacks.setSidebarMapLoadingVisible(false);
      } catch (error) {
        clearSidebarMapMarkers();
        callbacks.setSidebarMapLoadingVisible(false);
        elements.sidebarMapEl.classList.add('sidebar-section-hidden');
        elements.sidebarMapEmptyEl.classList.remove('sidebar-section-hidden');
        callbacks.setTextIfChanged(elements.sidebarMapEmptyEl, error.message || 'Failed to load Google Maps.');
      }
    };

    return {
      clearSidebarMapMarkers,
      ensureSidebarMap,
      focusCameraFromMap,
      loadGoogleMapsApi,
      loadMarkerClustererLibrary,
      scheduleSidebarMapRefresh,
      updateSidebarMap,
    };
  };

  modules.createSidebarMap = createSidebarMap;
})(typeof window !== 'undefined' ? window : globalThis);
