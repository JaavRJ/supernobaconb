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
/** Tope del alejamiento a mitad del viaje, en logaritmo natural del zoom */
const MAX_LIFT = 0.35;
/** Con movimiento reducido no hay viaje: corte directo con un fundido corto */
const CUT_MS = 300;

interface Camera {
  x: number;
  y: number;
  z: number;
}

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
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
  const traveling = useRef(false);
  const travelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const travelRaf = useRef(0);
  const [zoomed, setZoomed] = useState(false);

  /** La escena visible (apaisada o vertical) */
  const visibleScene = useCallback((): HTMLElement | null => {
    const scenes = stageRef.current?.querySelectorAll<HTMLElement>("[data-orientation]") ?? [];
    return Array.from(scenes).find((s) => s.clientWidth > 0) ?? null;
  }, []);

  const apply = useCallback(
    (animate = false, free = false) => {
      const stage = stageRef.current;
      const scene = visibleScene();
      if (!stage || !scene) return;
      const c = cam.current;
      const w = scene.clientWidth;
      const h = scene.clientHeight;
      // En pleno vuelo el zoom puede bajar de 1 al despegar y la cámara no se recorta
      if (!free) {
        c.z = clampNum(c.z, MIN_ZOOM, MAX_ZOOM);
        const maxX = (w * (c.z - 1)) / 2 + w * SLACK;
        const maxY = (h * (c.z - 1)) / 2 + h * SLACK;
        c.x = clampNum(c.x, -maxX, maxX);
        c.y = clampNum(c.y, -maxY, maxY);
      }
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
      if (traveling.current) return;
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

  /** Coloca la cámara en (fx, fy, z) sin animar; sirve para reencuadrar tras un cambio de tamaño */
  const frameTo = useCallback(
    (fx: number, fy: number, z: number) => {
      const scene = visibleScene();
      if (!enabled || !scene || traveling.current) return;
      const c = cam.current;
      c.z = clampNum(z, MIN_ZOOM, MAX_ZOOM);
      c.x = -(fx - 0.5) * scene.clientWidth * c.z;
      c.y = -(fy - 0.5) * scene.clientHeight * c.z;
      apply(false);
    },
    [apply, enabled, visibleScene],
  );

  const isTraveling = useCallback(() => traveling.current, []);

  /** Corta un viaje en curso (sin avisar de la llegada) */
  const endTravel = useCallback(() => {
    clearTimeout(travelTimer.current);
    cancelAnimationFrame(travelRaf.current);
    traveling.current = false;
    stageRef.current?.style.removeProperty("--travel");
    stageRef.current?.style.removeProperty("--travel-ms");
    stageRef.current?.removeAttribute("data-cam-travel");
    stageRef.current?.removeAttribute("data-cam-cut");
  }, []);

  const reset = useCallback(() => {
    stopInertia();
    endTravel();
    cam.current = { x: 0, y: 0, z: 1 };
    apply(true);
  }, [apply, endTravel]);

  /**
   * Viaja hasta el punto (fx, fy), en fracciones de la escena (0–1), con zoom `z`.
   * `onArrive` se llama al terminar, salvo que otro viaje o `reset` lo interrumpa.
   */
  const flyTo = useCallback(
    (fx: number, fy: number, z: number, onArrive?: () => void) => {
      const stage = stageRef.current;
      const scene = visibleScene();
      if (!enabled || !stage || !scene) return;
      stopInertia();
      endTravel();
      pointers.current.clear();
      stage.removeAttribute("data-dragging");
      const c = cam.current;
      const from = { ...c };
      // El destino pasa por los mismos topes que cualquier posición de la cámara
      c.z = clampNum(z, MIN_ZOOM, MAX_ZOOM);
      c.x = -(fx - 0.5) * scene.clientWidth * c.z;
      c.y = -(fy - 0.5) * scene.clientHeight * c.z;
      apply(false);
      const to = { ...c };
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      traveling.current = true;
      if (reduced) {
        stage.setAttribute("data-cam-cut", "");
        travelTimer.current = setTimeout(() => {
          endTravel();
          onArrive?.();
        }, CUT_MS);
        return;
      }
      cam.current = from;
      stage.setAttribute("data-cam-travel", "");
      const w = scene.clientWidth;
      const h = scene.clientHeight;
      // Se interpola lo que se ve (el punto mirado y el zoom en escala logarítmica), no los píxeles
      const fx0 = 0.5 - from.x / (w * from.z);
      const fy0 = 0.5 - from.y / (h * from.z);
      const fx1 = 0.5 - to.x / (w * to.z);
      const fy1 = 0.5 - to.y / (h * to.z);
      const lz0 = Math.log(from.z);
      const lz1 = Math.log(to.z);
      const dist = Math.hypot(fx1 - fx0, fy1 - fy0);
      // Cuanto más lejos el destino, más se aleja la cámara a mitad del vuelo
      const lift = Math.min(MAX_LIFT, dist * 0.6);
      const duration = clampNum(900 + dist * 900, 900, 1500);
      stage.style.setProperty("--travel-ms", `${Math.round(duration)}ms`);
      const start = performance.now();
      const frame = (now: number) => {
        const t = Math.max(0, Math.min(1, (now - start) / duration));
        const e = easeInOutSine(t);
        const cur = cam.current;
        cur.z = Math.exp(lz0 + (lz1 - lz0) * e - lift * Math.sin(Math.PI * e));
        cur.x = -(fx0 + (fx1 - fx0) * e - 0.5) * w * cur.z;
        cur.y = -(fy0 + (fy1 - fy0) * e - 0.5) * h * cur.z;
        stage.style.setProperty("--travel", Math.sin(Math.PI * t).toFixed(3));
        apply(false, true);
        if (t < 1) {
          travelRaf.current = requestAnimationFrame(frame);
          return;
        }
        endTravel();
        onArrive?.();
      };
      travelRaf.current = requestAnimationFrame(frame);
    },
    [apply, enabled, endTravel, visibleScene],
  );

  /** Lleva a la vista un punto dado en fracciones de la escena (0–1), si quedó fuera */
  const reveal = useCallback(
    (fx: number, fy: number) => {
      const scene = visibleScene();
      if (!enabled || !scene || traveling.current) return;
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
      if (traveling.current) {
        if (event.ctrlKey) event.preventDefault();
      } else if (event.ctrlKey) {
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
      clearTimeout(travelTimer.current);
      cancelAnimationFrame(travelRaf.current);
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
    // Durante el viaje el arrastre se ignora
    if (traveling.current) return;
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

  return { stageRef, sceneHandlers, zoomed, zoomIn, zoomOut, reset, reveal, flyTo, frameTo, isTraveling };
}
