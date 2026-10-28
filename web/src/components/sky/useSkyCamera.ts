"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
/** Holgura de paneo sin zoom, en fracción del tamaño de la escena: el cielo se siente vivo sin perderse */
const SLACK = 0.08;
/** Píxeles que hay que mover antes de que un arrastre deje de ser un clic */
const DRAG_THRESHOLD = 6;
const BUTTON_STEP = 1.5;

interface Camera {
  x: number;
  y: number;
  z: number;
}

const clampNum = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Cámara del cielo: arrastrar para moverse, pellizcar o ctrl + rueda para acercarse.
 * Escribe --cam-x, --cam-y y --cam-z en el escenario; las escenas y el polvo de fondo las leen en CSS,
 * así el movimiento no re-renderiza el SVG.
 */
export function useSkyCamera(enabled: boolean) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cam = useRef<Camera>({ x: 0, y: 0, z: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef({ moved: false, startX: 0, startY: 0, pinch: 0, vx: 0, vy: 0, t: 0 });
  const suppressClick = useRef(false);
  const inertia = useRef(0);
  const [zoomed, setZoomed] = useState(false);

  /** La escena visible (apaisada o vertical) */
  const visibleScene = useCallback((): HTMLElement | null => {
    const scenes = stageRef.current?.querySelectorAll<HTMLElement>("[data-orientation]") ?? [];
    return Array.from(scenes).find((s) => s.clientWidth > 0) ?? null;
  }, []);

  const apply = useCallback(
    (animate = false) => {
      const stage = stageRef.current;
      const scene = visibleScene();
      if (!stage || !scene) return;
      const c = cam.current;
      const w = scene.clientWidth;
      const h = scene.clientHeight;
      c.z = clampNum(c.z, MIN_ZOOM, MAX_ZOOM);
      const maxX = (w * (c.z - 1)) / 2 + w * SLACK;
      const maxY = (h * (c.z - 1)) / 2 + h * SLACK;
      c.x = clampNum(c.x, -maxX, maxX);
      c.y = clampNum(c.y, -maxY, maxY);
      stage.toggleAttribute("data-cam-animate", animate);
      stage.style.setProperty("--cam-x", `${c.x.toFixed(1)}px`);
      stage.style.setProperty("--cam-y", `${c.y.toFixed(1)}px`);
      stage.style.setProperty("--cam-z", c.z.toFixed(3));
      setZoomed(c.z > 1.01);
    },
    [visibleScene],
  );

  /** Acerca o aleja manteniendo fijo el punto (px, py), relativo al centro de la escena */
  const zoomAt = useCallback(
    (factor: number, px = 0, py = 0, animate = false) => {
      const c = cam.current;
      const z = clampNum(c.z * factor, MIN_ZOOM, MAX_ZOOM);
      const ratio = z / c.z;
      c.x = px - (px - c.x) * ratio;
      c.y = py - (py - c.y) * ratio;
      c.z = z;
      apply(animate);
    },
    [apply],
  );

  const stopInertia = () => cancelAnimationFrame(inertia.current);

  const zoomIn = useCallback(() => zoomAt(BUTTON_STEP, 0, 0, true), [zoomAt]);
  const zoomOut = useCallback(() => zoomAt(1 / BUTTON_STEP, 0, 0, true), [zoomAt]);
  const reset = useCallback(() => {
    stopInertia();
    cam.current = { x: 0, y: 0, z: 1 };
    apply(true);
  }, [apply]);

  /** Lleva a la vista un punto dado en fracciones de la escena (0–1), si quedó fuera */
  const reveal = useCallback(
    (fx: number, fy: number) => {
      const scene = visibleScene();
      if (!enabled || !scene) return;
      const c = cam.current;
      const px = (fx - 0.5) * scene.clientWidth * c.z;
      const py = (fy - 0.5) * scene.clientHeight * c.z;
      const sx = px + c.x;
      const sy = py + c.y;
      if (Math.abs(sx) < scene.clientWidth * 0.4 && Math.abs(sy) < scene.clientHeight * 0.4) return;
      c.x = -px;
      c.y = -py;
      apply(true);
    },
    [apply, enabled, visibleScene],
  );

  // La rueda solo acerca con ctrl (también el pellizco del trackpad); sin ctrl la página sigue bajando
  useEffect(() => {
    const stage = stageRef.current;
    if (!enabled || !stage) return;
    const onWheel = (event: WheelEvent) => {
      const scene = visibleScene();
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      if (event.ctrlKey) {
        event.preventDefault();
        stopInertia();
        zoomAt(
          Math.exp(-event.deltaY * 0.01),
          event.clientX - rect.left - rect.width / 2,
          event.clientY - rect.top - rect.height / 2,
        );
      } else if (cam.current.z > 1.01 && Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        event.preventDefault();
        cam.current.x -= event.deltaX;
        apply();
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [apply, enabled, visibleScene, zoomAt]);

  useEffect(() => {
    if (!enabled) return;
    const onResize = () => apply();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      stopInertia();
    };
  }, [apply, enabled]);

  function glide() {
    const d = drag.current;
    d.vx *= 0.92;
    d.vy *= 0.92;
    if (Math.hypot(d.vx, d.vy) < 0.3) return;
    cam.current.x += d.vx;
    cam.current.y += d.vy;
    apply();
    inertia.current = requestAnimationFrame(glide);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // El panel de señal se desplaza y se selecciona sin mover el cielo
    if ((event.target as Element).closest("[data-nopan]")) return;
    stopInertia();
    suppressClick.current = false;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const d = drag.current;
    d.moved = false;
    d.startX = event.clientX;
    d.startY = event.clientY;
    d.vx = 0;
    d.vy = 0;
    d.t = performance.now();
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      d.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const prev = pointers.current.get(event.pointerId);
    if (!prev) return;
    const d = drag.current;
    const next = { x: event.clientX, y: event.clientY };

    if (pointers.current.size === 2) {
      pointers.current.set(event.pointerId, next);
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = event.currentTarget.getBoundingClientRect();
      if (d.pinch > 0) {
        zoomAt(
          dist / d.pinch,
          (a.x + b.x) / 2 - rect.left - rect.width / 2,
          (a.y + b.y) / 2 - rect.top - rect.height / 2,
        );
      }
      d.pinch = dist;
      d.moved = true;
      stageRef.current?.setAttribute("data-dragging", "");
      return;
    }

    if (!d.moved) {
      if (Math.hypot(next.x - d.startX, next.y - d.startY) < DRAG_THRESHOLD) return;
      d.moved = true;
      stageRef.current?.setAttribute("data-dragging", "");
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    pointers.current.set(event.pointerId, next);
    cam.current.x += dx;
    cam.current.y += dy;
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    d.vx = (dx / dt) * 16;
    d.vy = (dy / dt) * 16;
    d.t = now;
    apply();
  }

  function onPointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (!pointers.current.delete(event.pointerId)) return;
    const d = drag.current;
    if (d.moved) {
      suppressClick.current = true;
      // Si el navegador no manda el click tras el arrastre, no debe quedar pendiente
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
    if (pointers.current.size === 0) stageRef.current?.removeAttribute("data-dragging");
    if (pointers.current.size === 0 && d.moved && performance.now() - d.t < 80) {
      inertia.current = requestAnimationFrame(glide);
    }
    d.pinch = 0;
  }

  /** Un arrastre que empezó sobre una estrella no la abre */
  function onClickCapture(event: ReactMouseEvent) {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  const sceneHandlers = enabled
    ? {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
        onClickCapture,
      }
    : {};

  return { stageRef, sceneHandlers, zoomed, zoomIn, zoomOut, reset, reveal };
}
