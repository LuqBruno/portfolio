'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dictionary } from '@/i18n/types';
import { Picture } from '@/components/ui/Picture';
import styles from './ParticleSphere.module.css';

/**
 * Adaptação visual da esfera do Bruno Assistente (assistant-ui/src/Orb.tsx).
 * Mantém a distribuição de Fibonacci e o shader WGSL originais, recoloridos em roxo.
 * - Inicializa apenas quando a seção se aproxima da tela; pausa fora dela ou com a aba oculta.
 * - WebGPU → Canvas 2D → imagem estática.
 * - Movimento reduzido: um único quadro por mudança de estado.
 * - Estados são ilustrativos: nenhum microfone, serviço ou dado real é acessado.
 */

type OrbState = 'ready' | 'listening' | 'thinking' | 'speaking';
type Renderer = 'idle' | 'webgpu' | 'canvas' | 'static';

const STATES: OrbState[] = ['ready', 'listening', 'thinking', 'speaking'];

const shader = /* wgsl */ `
struct Uniforms { time: f32, width: f32, height: f32, activity: f32, reduced: f32, count: f32, morph: f32, pad3: f32 }
@group(0) @binding(0) var<uniform> u: Uniforms;
struct VertexOut { @builtin(position) position: vec4f, @location(0) uv: vec2f, @location(1) color: vec3f, @location(2) alpha: f32 }
fn hash(n: f32) -> f32 { return fract(sin(n * 127.1) * 43758.5453); }
@vertex fn vertex(@builtin(vertex_index) vi: u32, @builtin(instance_index) index: u32) -> VertexOut {
  let quad = array<vec2f, 6>(vec2f(-1,-1), vec2f(1,-1), vec2f(-1,1), vec2f(-1,1), vec2f(1,-1), vec2f(1,1));
  let i = f32(index);
  let y = 1.0 - 2.0 * (i + 0.5) / u.count;
  let radius = sqrt(max(0.0, 1.0 - y * y));
  let theta = i * 2.39996323;
  var p = vec3f(cos(theta) * radius, y, sin(theta) * radius);
  // reorganização: as partículas migram para um anel orbital (estado “processando”)
  let ang = i / u.count * 6.2831853 * 9.0;
  let ringR = 0.98 + 0.1 * sin(i * 0.37);
  let ringP = vec3f(cos(ang) * ringR, (hash(i + 3.0) - 0.5) * 0.16, sin(ang) * ringR);
  p = mix(p, ringP, u.morph);
  let t = u.time * (0.1 + u.activity * 0.12);
  let wave = sin(p.x * 6.0 + t * 3.1) * cos(p.y * 5.0 - t * 2.3) * sin(p.z * 5.0 + t * 1.7);
  let ripple = sin(p.y * 12.0 + p.x * 4.0 + t * 4.0) * 0.035;
  p = p * (1.0 + wave * (0.055 + u.activity * 0.07) + ripple);
  let c = cos(t); let s = sin(t);
  p = vec3f(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  let tilt = 0.18;
  p = vec3f(p.x, p.y * cos(tilt) - p.z * sin(tilt), p.y * sin(tilt) + p.z * cos(tilt));
  let depth = (p.z + 1.3) / 2.6;
  let perspective = 2.7 / (3.1 - p.z);
  let aspect = u.height / max(u.width, 1.0);
  let center = vec2f(p.x * 0.6 * perspective * aspect, p.y * 0.6 * perspective);
  let point = (0.7 + hash(i) * 1.0) * (0.6 + depth) * 2.0;
  let offset = quad[vi] * vec2f(point / u.width, point / u.height) * 2.0;
  var out: VertexOut;
  out.position = vec4f(center + offset, 0, 1);
  out.uv = quad[vi];
  let deep = vec3f(0.36, 0.13, 0.71);
  let violet = vec3f(0.55, 0.36, 0.96);
  let lavender = vec3f(0.89, 0.86, 1.0);
  out.color = mix(mix(deep, violet, clamp(depth * 1.25, 0.0, 1.0)), lavender, clamp((depth - 0.55) * 1.7, 0.0, 0.85));
  out.alpha = (0.17 + depth * 0.64) * (0.65 + hash(i + 1.0) * 0.35);
  return out;
}
@fragment fn fragment(in: VertexOut) -> @location(0) vec4f {
  let d = length(in.uv);
  if (d > 1.0) { discard; }
  let alpha = pow(1.0 - d, 1.3) * in.alpha;
  return vec4f(in.color * alpha, alpha);
}`;

export function ParticleSphere({ t, controlled = false, compact = false }: { t: Dictionary['work']['assistant']['orb']; controlled?: boolean; compact?: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const gpuCanvas = useRef<HTMLCanvasElement>(null);
  const cpuCanvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<OrbState>('ready');
  const [renderer, setRenderer] = useState<Renderer>('idle');
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Estados conduzidos pela rolagem na apresentação de projetos (demonstração)
  useEffect(() => {
    if (!controlled) return;
    const onState = (e: Event) => {
      const next = (e as CustomEvent<OrbState>).detail;
      if (STATES.includes(next)) setState(next);
    };
    window.addEventListener('bl:orb-state', onState);
    return () => window.removeEventListener('bl:orb-state', onState);
  }, [controlled]);

  useEffect(() => {
    const stage = stageRef.current;
    const target = gpuCanvas.current;
    const fallbackTarget = cpuCanvas.current;
    if (!stage || !target || !fallbackTarget) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Telas de toque / celulares: menos partículas e menor resolução (fluidez)
    const light = window.matchMedia('(pointer: coarse), (max-width: 859px)').matches;
    let started = false;
    let stopped = false;
    let visible = false;
    let frame = 0;
    let device: GPUDevice | undefined;
    let buffer: GPUBuffer | undefined;
    let lastDrawnState = '';
    let intensity = 0;
    let morph = 0;
    let last = 0;

    const resize = () => {
      const rect = target.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, light ? 1.25 : 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      target.width = fallbackTarget.width = w;
      target.height = fallbackTarget.height = h;
      lastDrawnState = '';
    };

    const activity = (time: number) => {
      const s = stateRef.current;
      const level = 0.5 + 0.5 * Math.sin(time * 6.2) * Math.sin(time * 2.3);
      const goal = s === 'speaking' ? 0.2 + level * 1.4 : s === 'listening' || s === 'thinking' ? 1 : 0;
      intensity += (goal - intensity) * 0.08;
      const morphGoal = s === 'thinking' ? 1 : 0;
      morph += (morphGoal - morph) * 0.05;
      if (reduce.matches) morph = morphGoal;
      return reduce.matches ? goal : intensity;
    };

    const loop = (draw: (time: number) => void) => {
      const tick = (time: number) => {
        if (stopped) return;
        frame = 0;
        if (!visible || document.hidden) return; // retomado pelo observador
        const interval = intensity > 0.05 ? 1000 / 60 : 1000 / 30;
        const needsFrame = !reduce.matches || lastDrawnState !== stateRef.current;
        if (needsFrame && time - last >= interval) {
          last = time;
          draw(reduce.matches ? 1.2 : time / 1000);
          lastDrawnState = stateRef.current;
        }
        frame = requestAnimationFrame(tick);
      };
      resume = () => {
        if (!frame && !stopped) frame = requestAnimationFrame(tick);
      };
      resume();
    };
    let resume = () => {};

    const startCanvas = () => {
      const ctx = fallbackTarget.getContext('2d');
      if (!ctx) {
        setRenderer('static');
        return;
      }
      setRenderer('canvas');
      const count = light ? 900 : 1800;
      const points = Array.from({ length: count }, (_, i) => {
        const y = 1 - (2 * (i + 0.5)) / count;
        const r = Math.sqrt(1 - y * y);
        const a = i * 2.39996323;
        const ang = (i / count) * Math.PI * 2 * 9;
        const rr = 0.98 + 0.1 * Math.sin(i * 0.37);
        return { x: Math.cos(a) * r, y, z: Math.sin(a) * r, rx: Math.cos(ang) * rr, ry: (((i * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.16, rz: Math.sin(ang) * rr };
      });
      loop((time) => {
        const w = fallbackTarget.width;
        const h = fallbackTarget.height;
        ctx.clearRect(0, 0, w, h);
        const act = activity(time);
        const tt = time * (0.1 + act * 0.12);
        const s = Math.sin(tt);
        const c = Math.cos(tt);
        const size = Math.min(w, h);
        points.forEach((p0, i) => {
          const p = { x: p0.x + (p0.rx - p0.x) * morph, y: p0.y + (p0.ry - p0.y) * morph, z: p0.z + (p0.rz - p0.z) * morph };
          const k = 1 + Math.sin(p.x * 6 + tt * 3) * Math.cos(p.y * 5 - tt * 2) * Math.sin(p.z * 5 + tt) * (0.055 + act * 0.07);
          const x = (p.x * c + p.z * s) * k;
          const z = (-p.x * s + p.z * c) * k;
          const y = p.y * k;
          const depth = (z + 1.3) / 2.6;
          const scale = 2.7 / (3.1 - z);
          ctx.globalAlpha = 0.15 + depth * 0.6;
          ctx.fillStyle = i % 7 === 0 ? '#8b5cf6' : depth > 0.62 ? '#ddd6fe' : '#7c3aed';
          ctx.beginPath();
          ctx.arc(w / 2 + x * size * 0.3 * scale, h / 2 - y * size * 0.3 * scale, ((0.5 + depth) * size) / 420, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      });
    };

    const startGpu = async () => {
      if (!('gpu' in navigator) || !navigator.gpu) return startCanvas();
      try {
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'low-power' });
        if (!adapter || stopped) return startCanvas();
        device = await adapter.requestDevice();
        if (stopped) {
          device.destroy();
          return;
        }
        const context = target.getContext('webgpu');
        if (!context) {
          device.destroy();
          device = undefined;
          return startCanvas();
        }
        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({ device, format, alphaMode: 'premultiplied' });
        const shaderModule = device.createShaderModule({ code: shader });
        const pipeline = await device.createRenderPipelineAsync({
          layout: 'auto',
          vertex: { module: shaderModule, entryPoint: 'vertex' },
          fragment: {
            module: shaderModule,
            entryPoint: 'fragment',
            targets: [
              {
                format,
                blend: {
                  color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
                  alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
                },
              },
            ],
          },
          primitive: { topology: 'triangle-list' },
        });
        if (stopped) return;
        buffer = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        const group = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer } }] });
        setRenderer('webgpu');
        device.lost.then(() => {
          if (!stopped) {
            cancelAnimationFrame(frame);
            frame = 0;
            device = undefined;
            startCanvas();
          }
        });
        loop((time) => {
          if (!device || stopped) return;
          const count = reduce.matches ? 2500 : light ? 4000 : 10000;
          device.queue.writeBuffer(buffer!, 0, new Float32Array([time, target.width, target.height, activity(time), reduce.matches ? 1 : 0, count, morph, 0]));
          const encoder = device.createCommandEncoder();
          const pass = encoder.beginRenderPass({
            colorAttachments: [{ view: context.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' }],
          });
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, group);
          pass.draw(6, count);
          pass.end();
          device.queue.submit([encoder.finish()]);
        });
      } catch {
        device?.destroy();
        device = undefined;
        startCanvas();
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(target);
    resize();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) {
          started = true;
          void startGpu();
        } else if (visible) {
          resume();
        }
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(stage);
    const onVisibility = () => {
      if (!document.hidden) resume();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      buffer?.destroy();
      device?.destroy();
    };
  }, []);

  const live = renderer === 'webgpu' || renderer === 'canvas';

  return (
    <div className={`${styles.panel} ${compact ? styles.compact : ''}`} data-state={state}>
      <div ref={stageRef} className={styles.stage} role="img" aria-label={t.label}>
        <div className={styles.halo} aria-hidden="true" />
        <Picture name="art/sphere" alt="" sizes="(min-width: 1024px) 30vw, 80vw" className={`${styles.poster} ${live ? styles.posterHidden : ''}`} />
        <canvas ref={gpuCanvas} className={styles.canvas} aria-hidden="true" style={{ visibility: renderer === 'webgpu' ? 'visible' : 'hidden' }} />
        <canvas ref={cpuCanvas} className={styles.canvas} aria-hidden="true" style={{ visibility: renderer === 'canvas' ? 'visible' : 'hidden' }} />
        <div className={styles.platform} aria-hidden="true">
          <span />
          <span />
        </div>
      </div>

      <div className={styles.controls}>
        <p className={`mono ${styles.controlsLabel}`} id="orb-states-label">
          {t.statesLabel}
        </p>
        <div className={styles.buttons} role="group" aria-labelledby="orb-states-label">
          {STATES.map((s) => (
            <button key={s} type="button" aria-pressed={state === s} onClick={() => setState(s)} className={styles.stateBtn}>
              <span className={styles.stateDot} aria-hidden="true" />
              {t.states[s]}
            </button>
          ))}
        </div>
        <p className={styles.caption} aria-live="polite">
          {t.captions[state]}
        </p>
        <p className={`mono ${styles.renderer}`}>
          {t.renderer}: <span>{t.rendererNames[renderer]}</span>
        </p>
      </div>
      <p className={styles.note}>{t.note}</p>
    </div>
  );
}
