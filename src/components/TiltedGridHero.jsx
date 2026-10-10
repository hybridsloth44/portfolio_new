import { useEffect, useRef, useState } from 'react';

const CAMERA = 1.6;
const radians = (degrees) => degrees * Math.PI / 180;

function renderer(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: false, stencil: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const shaders = [];
  function shader(type, source) {
    const compiled = gl.createShader(type);
    gl.shaderSource(compiled, source); gl.compileShader(compiled);
    shaders.push(compiled);
    if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS)) throw new Error('Curve shader unavailable');
    return compiled;
  }
  const program = gl.createProgram();
  try {
    gl.attachShader(program, shader(gl.VERTEX_SHADER, `
      attribute vec2 a_uv;
      uniform vec2 u_view;
      uniform mediump vec2 u_photo;
      uniform float u_radius, u_angle, u_edge, u_axis;
      varying mediump vec2 v_uv;
      void main() {
        float angle = clamp(u_angle + (.5 - a_uv.x) * u_photo.x / u_radius, -u_edge, u_edge);
        float camera = 1.6 * u_radius;
        float w = 1.0 - u_radius * (1.0 - cos(angle)) / camera;
        float x = -u_radius * sin(angle);
        float y = (.5 - u_axis) * u_view.y * w + (.5 - a_uv.y) * u_photo.y;
        gl_Position = vec4(2.0 * x / u_view.x, 2.0 * y / u_view.y, 0.0, w);
        v_uv = a_uv;
      }
    `));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform sampler2D u_image;
      uniform mediump vec2 u_photo;
      varying mediump vec2 v_uv;
      void main() {
        vec2 p = abs((v_uv - .5) * u_photo) - (u_photo * .5 - 8.0);
        float distance = length(max(p, 0.0)) + min(max(p.x, p.y), 0.0) - 8.0;
        vec4 color = texture2D(u_image, v_uv);
        float alpha = color.a * (1.0 - smoothstep(-.7, .7, distance));
        gl_FragColor = vec4(color.rgb * alpha, alpha);
      }
    `));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Curve renderer unavailable');
  } catch {
    shaders.forEach(compiled => gl.deleteShader(compiled)); gl.deleteProgram(program);
    return null;
  }
  const vertices = [];
  const segments = 64;
  for (let column = 0; column < segments; column++) {
    const a = column / segments, b = (column + 1) / segments;
    vertices.push(a, 0, b, 0, a, 1, a, 1, b, 0, b, 1);
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.useProgram(program);
  const uv = gl.getAttribLocation(program, 'a_uv');
  gl.enableVertexAttribArray(uv); gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
  const uniform = Object.fromEntries(['view', 'photo', 'radius', 'angle', 'edge', 'axis', 'image'].map(name => [name, gl.getUniformLocation(program, `u_${name}`)]));
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const textures = [];
  return {
    upload(image, maximum) {
      const texture = gl.createTexture(); textures.push(texture);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      // Bound GPU memory on phones; originals remain available in the galleries.
      const resized = document.createElement('canvas');
      resized.width = Math.min(maximum, image.naturalWidth);
      resized.height = Math.round(resized.width * image.naturalHeight / image.naturalWidth);
      resized.getContext('2d').drawImage(image, 0, 0, resized.width, resized.height);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resized);
      return texture;
    },
    begin(width, height, radius, edge, axis) {
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uniform.view, width, height);
      gl.uniform1f(uniform.radius, radius); gl.uniform1f(uniform.edge, edge); gl.uniform1f(uniform.axis, axis / 100);
      gl.uniform1i(uniform.image, 0);
    },
    photo(texture, angle, width, height) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1f(uniform.angle, angle); gl.uniform2f(uniform.photo, width, height);
      gl.drawArrays(gl.TRIANGLES, 0, segments * 6);
    },
    dispose() {
      textures.forEach(texture => gl.deleteTexture(texture));
      gl.deleteBuffer(buffer); shaders.forEach(compiled => gl.deleteShader(compiled)); gl.deleteProgram(program);
    },
  };
}

// Draw all photographs together in one GPU frame, with fixed textures and one
// continuous mesh per photograph. No animated visibility gates or joined DOM strips.
export default function TiltedGridHero({ images, speed = 4, tileHeight = 44, aspectRatio = .8, gap = 6, axis = 50, curve = 80, fade = 10, className = '' }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = renderer(canvas);
    if (!scene) { setFallback(true); return; }
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, frame = 0, previous = 0, seconds = 0;
    let width = 0, height = 0, density = 1, visible = false, loaded = [];
    let drag = null;

    function paint() {
      if (!width || !height || !loaded.length) return;
      const mobile = width < 768;
      const bend = radians(mobile ? 40 : Math.min(85, Math.max(5, curve)));
      const radius = width * (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
      const photoHeight = Math.min(height * (mobile ? .62 : tileHeight / 100), width * (mobile ? .54 : .55) / aspectRatio);
      const pitch = (aspectRatio + gap / 100) * photoHeight / radius;
      const circumference = images.length * pitch;
      const phase = seconds / speed * pitch;
      const edge = bend + radians(5);
      scene.begin(width, height, radius, edge, axis);
      loaded.forEach((texture, index) => {
        if (!texture) return;
        const angle = ((phase - index * pitch + circumference / 2) % circumference + circumference) % circumference - circumference / 2;
        const imageWidth = photoHeight * images[index].width / images[index].height;
        const halfAngle = imageWidth / radius / 2;
        if (Math.abs(angle) - halfAngle > edge) return;
        scene.photo(texture, angle, imageWidth, photoHeight);
      });
    }

    function tick(now) {
      frame = 0;
      if (previous && !drag) seconds += Math.min(now - previous, 50) / 1000;
      previous = now;
      paint();
      if (visible && !document.hidden && !reducedMotion.matches && !drag) frame = requestAnimationFrame(tick);
    }
    function schedule() {
      cancelAnimationFrame(frame);
      previous = 0;
      if (visible && !document.hidden && !reducedMotion.matches && !drag) frame = requestAnimationFrame(tick);
    }
    function resize() {
      const box = canvas.getBoundingClientRect();
      const nextDensity = Math.min(devicePixelRatio || 1, 2);
      if (width === box.width && height === box.height && density === nextDensity) return;
      width = box.width; height = box.height; density = nextDensity;
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      paint(); // Keep the same position through orientation changes and resizing.
    }
    function pointerDown(event) {
      if (!event.isPrimary || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, seconds };
      canvas.setPointerCapture(event.pointerId);
      schedule();
    }
    function pointerMove(event) {
      if (!drag) return;
      if (Math.abs(event.clientX - drag.x) < 8 || Math.abs(event.clientX - drag.x) < Math.abs(event.clientY - drag.y)) return;
      const photoHeight = Math.min(height * (width < 768 ? .62 : tileHeight / 100), width * .54 / aspectRatio);
      seconds = drag.seconds - (event.clientX - drag.x) / (photoHeight * (aspectRatio + gap / 100)) * speed;
      paint();
    }
    function pointerUp() { drag = null; schedule(); }
    function contextLost(event) { event.preventDefault(); cancelAnimationFrame(frame); setFallback(true); }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    intersectionObserver.observe(canvas);
    reducedMotion.addEventListener('change', schedule);
    document.addEventListener('visibilitychange', schedule);
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    canvas.addEventListener('lostpointercapture', pointerUp);
    canvas.addEventListener('webglcontextlost', contextLost);
    Promise.all(images.map(({ src }) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => image.decode().then(() => resolve(image), () => resolve(image));
      image.onerror = () => resolve(null);
      image.src = src;
    }))).then((decoded) => {
      if (disposed) return;
      loaded = decoded.map(image => image ? scene.upload(image, width < 768 ? 480 : 768) : null);
      if (!loaded.some(Boolean)) { setFallback(true); return; }
      resize(); paint(); schedule(); setReady(true);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      reducedMotion.removeEventListener('change', schedule);
      document.removeEventListener('visibilitychange', schedule);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('lostpointercapture', pointerUp);
      canvas.removeEventListener('webglcontextlost', contextLost);
      scene.dispose();
    };
  }, [images, speed, tileHeight, aspectRatio, gap, axis, curve]);

  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)`;
  return <div className={`tilted-grid-hero ${ready ? 'is-ready' : ''} ${className}`}>
    <canvas ref={canvasRef} className="tilted-grid-canvas" aria-hidden="true" style={{ maskImage: mask, WebkitMaskImage: mask, display: fallback ? 'none' : undefined }} />
    {fallback && <div className="curve-fallback">{images.map((image) => <img key={image.id} src={image.src} alt={image.alt} width={image.width} height={image.height} />)}</div>}
    <span className="sr-only">Selected photographs from Shreesh’s portfolio.</span>
  </div>;
}
