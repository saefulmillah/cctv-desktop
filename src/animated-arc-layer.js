(function () {
  const deckGlobal = window.deck || {};
  const ArcLayerCtor =
    deckGlobal.ArcLayer ||
    (deckGlobal.layers && deckGlobal.layers.ArcLayer) ||
    (window.deckLayers && window.deckLayers.ArcLayer);

  if (!ArcLayerCtor) {
    return;
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  class AnimatedArcLayer extends ArcLayerCtor {
    getShaders() {
      const shaders = super.getShaders();
      return {
        ...shaders,
        inject: {
          ...(shaders.inject || {}),
          'fs:#decl': `
uniform float uTime;
uniform float uSpeed;
uniform float uHeadSize;
uniform float uTailSize;
uniform float uMinAlpha;
`,
          'fs:DECKGL_FILTER_COLOR': `
float progress = clamp(geometry.uv.x, 0.0, 1.0);
float head = fract(uTime * max(uSpeed, 0.0));
float wrappedDistance = head - progress;
if (wrappedDistance < 0.0) {
  wrappedDistance += 1.0;
}
float safeHeadSize = max(uHeadSize, 0.0001);
float safeTailSize = max(uTailSize, safeHeadSize + 0.0001);
if (wrappedDistance > safeTailSize) {
  discard;
}
float headGlow = 1.0 - smoothstep(0.0, safeHeadSize, wrappedDistance);
float trailGlow = 1.0 - smoothstep(safeHeadSize, safeTailSize, wrappedDistance);
float pulse = max(headGlow, trailGlow * 0.92);
float alpha = mix(uMinAlpha, 1.0, pulse);
color.rgb = mix(color.rgb * 0.92, vec3(1.0), pulse * 0.42);
color.a *= alpha;
`,
        },
      };
    }

    draw({ uniforms = {} } = {}) {
      const currentTime = Number(this.props.currentTime);
      const speed = Number(this.props.speed);
      const headSize = Number(this.props.headSize);
      const tailSize = Number(this.props.tailSize);
      const minAlpha = Number(this.props.minAlpha);

      const nextUniforms = {
        ...uniforms,
        uTime: Number.isFinite(currentTime) ? currentTime : 0,
        uSpeed: Number.isFinite(speed) ? speed : 0.18,
        uHeadSize: clamp(Number.isFinite(headSize) ? headSize : 0.035, 0.001, 1),
        uTailSize: clamp(Number.isFinite(tailSize) ? tailSize : 0.22, 0.002, 1),
        uMinAlpha: clamp(Number.isFinite(minAlpha) ? minAlpha : 0.1, 0, 1),
      };

      const model =
        (this.state && (this.state.model || this.state.models && this.state.models[0])) ||
        (typeof this.getModels === 'function' ? this.getModels()[0] : null);

      if (model && typeof model.setUniforms === 'function') {
        model.setUniforms(nextUniforms);
      }

      super.draw({
        uniforms: nextUniforms,
      });
    }
  }

  AnimatedArcLayer.layerName = 'AnimatedArcLayer';
  AnimatedArcLayer.defaultProps = {
    ...ArcLayerCtor.defaultProps,
    currentTime: 0,
    speed: 0.18,
    headSize: 0.04,
    tailSize: 0.26,
    minAlpha: 0.18,
  };

  window.AnimatedArcLayer = AnimatedArcLayer;
})();
