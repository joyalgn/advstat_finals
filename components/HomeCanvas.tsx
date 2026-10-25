"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  gold: boolean;
}

interface HomeCanvasProps {
  persistent?: boolean;
}

export default function HomeCanvas({ persistent = false }: HomeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const activeRef = useRef(!persistent || isAuthRoute);
  const controlRef = useRef<((active: boolean) => void) | null>(null);
  activeRef.current = !persistent || isAuthRoute;

  useEffect(() => {
    if (persistent) controlRef.current?.(isAuthRoute);
  }, [isAuthRoute, persistent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const isAuthCanvas = persistent || canvas.closest(".auth-container") !== null;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let reduceMotion = motionPreference.matches;
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrame = 0;
    const mouse = { x: -9999, y: -9999 };
    const isAuthActive = () => !persistent || activeRef.current;

    function schedule() {
      if (!reduceMotion && isAuthActive() && !frameId) frameId = requestAnimationFrame(paint);
    }

    function drawDetails(timestamp: number) {
      const dark = document.documentElement.dataset.theme === "dark";
      const gridColor = dark ? "rgba(195,204,185,0.035)" : "rgba(102,120,95,0.052)";
      const gridOffset = reduceMotion ? 0 : (timestamp / 140) % 76;
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = gridColor;
      ctx!.beginPath();
      for (let x = 52 - gridOffset; x < width; x += 76) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
      }
      for (let y = 52 - gridOffset; y < height; y += 76) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
      }
      ctx!.stroke();

      const graphPanelElement = isAuthCanvas
        ? document.querySelector<HTMLElement>(".auth-graph-panel")
        : undefined;
      const graphPanel = graphPanelElement?.getBoundingClientRect();
      if (graphPanel && graphPanelElement) {
        ctx!.beginPath();
        ctx!.roundRect(
          graphPanel.left,
          graphPanel.top,
          graphPanel.width,
          graphPanel.height,
          parseFloat(getComputedStyle(graphPanelElement).borderTopLeftRadius),
        );
        if (dark) {
          const panelGradient = ctx!.createLinearGradient(
            graphPanel.left,
            graphPanel.top,
            graphPanel.left + graphPanel.width,
            graphPanel.top + graphPanel.height,
          );
          panelGradient.addColorStop(0, "#8A6037");
          panelGradient.addColorStop(1, "#69492F");
          ctx!.fillStyle = panelGradient;
        } else {
          ctx!.fillStyle = "#35483D";
        }
        ctx!.fill();
      }
      const curveWidth = isAuthCanvas
        ? Math.min((graphPanel?.width ?? width * 0.78) * 0.84, 560)
        : Math.min(210, width * 0.28);
      let curveHeight = isAuthCanvas
        ? Math.min((graphPanel?.height ?? height * 0.48) * (graphPanel && graphPanel.height <= 300 ? 0.27 : 0.34), curveWidth * 0.27, 128)
        : Math.min(74, height * 0.12);
      const centerX = isAuthCanvas
        ? graphPanel ? graphPanel.left + graphPanel.width / 2 : width / 2
        : width * 0.78;
      const baseline = isAuthCanvas
        ? graphPanel ? graphPanel.top + graphPanel.height * (graphPanel.height <= 300 ? 0.62 : 0.65) : height * 0.72
        : height * 0.25;

      curveHeight += isAuthCanvas && !reduceMotion ? Math.sin(timestamp / 4700) * 2.5 : 0;
      const startX = centerX - curveWidth / 2;
      const breathe = reduceMotion ? 0 : (Math.sin(timestamp / 3600) + 1) / 2;
      const curveAlpha = isAuthCanvas ? 0.68 + breathe * 0.1 : 0.095;
      const fillAlpha = isAuthCanvas ? 0.22 + breathe * 0.05 : 0.035;

      ctx!.beginPath();
      ctx!.moveTo(startX, baseline);
      for (let step = 0; step <= 40; step++) {
        const x = startX + curveWidth * step / 40;
        const z = (step / 40 - 0.5) * 5.6;
        const y = baseline - curveHeight * Math.exp(-0.5 * z * z);
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(startX + curveWidth, baseline);
      ctx!.closePath();
      ctx!.fillStyle = isAuthCanvas
        ? `rgba(212,168,91,${fillAlpha})`
        : dark ? `rgba(212,168,91,${fillAlpha})` : `rgba(102,120,95,${fillAlpha})`;
      ctx!.fill();

      ctx!.strokeStyle = isAuthCanvas
        ? `rgba(235,199,128,${curveAlpha})`
        : dark ? `rgba(212,168,91,${curveAlpha})` : `rgba(173,125,44,${curveAlpha})`;
      ctx!.lineWidth = isAuthCanvas ? 1.5 : 1.25;
      if (isAuthCanvas) {
        ctx!.save();
        ctx!.shadowColor = dark ? "rgba(212,168,91,0.22)" : "rgba(173,125,44,0.2)";
        ctx!.shadowBlur = 14;
      }
      ctx!.beginPath();
      for (let step = 0; step <= 40; step++) {
        const x = startX + curveWidth * step / 40;
        const z = (step / 40 - 0.5) * 5.6;
        const y = baseline - curveHeight * Math.exp(-0.5 * z * z);
        if (step === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.stroke();
      if (isAuthCanvas) ctx!.restore();

      if (isAuthCanvas) {
        ctx!.save();
        ctx!.setLineDash([2, 6]);
        ctx!.strokeStyle = "rgba(212,168,91,0.4)";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(startX, baseline);
        ctx!.lineTo(startX + curveWidth, baseline);
        ctx!.stroke();
        ctx!.setLineDash([]);

        const deviations = [
          { position: 0.04, label: "-3σ" },
          { position: 0.16, label: "-2σ" },
          { position: 0.5, label: "μ" },
          { position: 0.84, label: "+2σ" },
          { position: 0.96, label: "+3σ" },
        ];
        ctx!.font = "11px Georgia, serif";
        ctx!.textAlign = "center";
        ctx!.fillStyle = "rgba(232,235,222,0.88)";
        for (const deviation of deviations) {
          const tickX = startX + curveWidth * deviation.position;
          ctx!.beginPath();
          ctx!.moveTo(tickX, baseline - 3);
          ctx!.lineTo(tickX, baseline + 5);
          ctx!.stroke();
          ctx!.fillText(deviation.label, tickX, baseline + 20);
        }

        ctx!.setLineDash([2, 4]);
        ctx!.strokeStyle = "rgba(212,168,91,0.46)";
        ctx!.beginPath();
        ctx!.moveTo(centerX, baseline - curveHeight - 8);
        ctx!.lineTo(centerX, baseline + 4);
        ctx!.stroke();
        ctx!.restore();

        const symbolAlpha = 0.44 + breathe * 0.2;
        const symbolDrift = reduceMotion ? 0 : Math.sin(timestamp / 1800) * 5;
        ctx!.fillStyle = `rgba(221,229,214,${Math.max(symbolAlpha, 0.84)})`;
        ctx!.font = "14px Georgia, serif";
        ctx!.textAlign = "left";
        ctx!.fillText("σ", Math.min(width - 22, startX + curveWidth + 12), baseline - curveHeight * 0.55 + symbolDrift);
        ctx!.fillText("x̄", Math.max(12, startX - 23), baseline - 10 - symbolDrift * 0.7);
        ctx!.font = "13px Georgia, serif";
        ctx!.fillText("P(A)", graphPanel ? graphPanel.left + 20 : 24, graphPanel ? graphPanel.top + graphPanel.height * 0.47 + symbolDrift : height * 0.66 + symbolDrift);

        const progress = reduceMotion ? 0.5 : 0.5 - Math.cos(timestamp / 4700) * 0.48;
        const pointX = startX + curveWidth * progress;
        const z = (progress - 0.5) * 5.6;
        const pointY = baseline - curveHeight * Math.exp(-0.5 * z * z);
        ctx!.fillStyle = dark ? "rgba(212,168,91,0.2)" : "rgba(190,143,59,0.2)";
        ctx!.beginPath();
        ctx!.arc(pointX, pointY, 7, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = dark ? "rgba(212,168,91,0.96)" : "rgba(173,125,44,0.96)";
        ctx!.beginPath();
        ctx!.arc(pointX, pointY, 3.2, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function paint(timestamp = 0) {
      const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0;
      lastFrame = timestamp;
      ctx!.clearRect(0, 0, width, height);
      drawDetails(timestamp);

      const dark = document.documentElement.dataset.theme === "dark";
      const dotColor = dark ? "155,174,141" : "102,120,95";
      const lineColor = dark ? "155,174,141" : "102,120,95";
      const goldColor = "212,168,91";

      if (!reduceMotion) {
        const time = timestamp / 1000;
        for (const dot of dots) {
          dot.x += (dot.vx + Math.sin(time * 0.38 + dot.phase) * 1.4) * delta;
          dot.y += (dot.vy + Math.cos(time * 0.31 + dot.phase) * 1.4) * delta;
          if (dot.x < 0 || dot.x > width) dot.vx *= -1;
          if (dot.y < 0 || dot.y > height) dot.vy *= -1;
          dot.x = Math.max(0, Math.min(width, dot.x));
          dot.y = Math.max(0, Math.min(height, dot.y));
        }
      }

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const other = dots[j];
          const distance = Math.hypot(dot.x - other.x, dot.y - other.y);
          if (distance < 145) {
            const opacity = (isAuthCanvas ? 0.16 : 0.15) * (1 - distance / 145);
            ctx!.strokeStyle = `rgba(${lineColor},${opacity})`;
            ctx!.lineWidth = 0.8;
            ctx!.beginPath();
            ctx!.moveTo(dot.x, dot.y);
            ctx!.lineTo(other.x, other.y);
            ctx!.stroke();
            if (isAuthCanvas && (i + j) % 17 === 0 && !reduceMotion) {
              const progress = 0.5 + Math.sin(timestamp / 1300 + i) * 0.48;
              ctx!.fillStyle = `rgba(${goldColor},${0.82 * (1 - distance / 190)})`;
              ctx!.beginPath();
              ctx!.arc(dot.x + (other.x - dot.x) * progress, dot.y + (other.y - dot.y) * progress, 2, 0, Math.PI * 2);
              ctx!.fill();
            }
          }
        }

        const mouseDistance = Math.hypot(dot.x - mouse.x, dot.y - mouse.y);
        if (mouseDistance < 170) {
          ctx!.strokeStyle = `rgba(${goldColor},${0.1 * (1 - mouseDistance / 170)})`;
          ctx!.lineWidth = 0.8;
          ctx!.beginPath();
          ctx!.moveTo(dot.x, dot.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
        }

        ctx!.fillStyle = isAuthCanvas
          ? dot.gold ? "rgba(212,168,91,0.58)" : "rgba(195,204,185,0.46)"
          : dot.gold
            ? `rgba(${goldColor},0.3)`
            : `rgba(${dotColor},${dark ? 0.33 : 0.3})`;
        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, dot.gold ? 1.6 : isAuthCanvas ? 1.8 : 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }

      frameId = 0;
      schedule();
    }

    function resize() {
      cancelAnimationFrame(frameId);
      frameId = 0;
      const rect = canvas!.getBoundingClientRect();
      const previousWidth = width;
      const previousHeight = height;
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (previousWidth && previousHeight) {
        dots = dots.map((dot) => ({ ...dot, x: dot.x * width / previousWidth, y: dot.y * height / previousHeight }));
      }
      const count = Math.min(78, Math.max(18, Math.floor((width * height) / 19000)));
      while (dots.length > count) dots.pop();
      while (dots.length < count) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 5;
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          phase: Math.random() * Math.PI * 2,
          gold: isAuthCanvas && Math.random() < 0.22,
        });
      }
      lastFrame = 0;
      if (reduceMotion) paint();
      else schedule();
    }

    function move(event: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }

    function themeChanged() {
      if (reduceMotion) paint();
    }

    function motionChanged(event: MediaQueryListEvent) {
      reduceMotion = event.matches;
      cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrame = 0;
      if (reduceMotion) paint();
      else schedule();
    }

    controlRef.current = (active) => {
      if (active) {
        if (reduceMotion) paint();
        else schedule();
      } else {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const cards = Array.from(document.querySelectorAll<HTMLElement>(".home-tool"));
    const cleanups = cards.map((card) => {
      const tilt = (event: MouseEvent) => {
        if (reduceMotion) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${(-y * 2).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg) translateY(-2px)`;
      };
      const reset = () => { card.style.transform = ""; };
      card.addEventListener("mousemove", tilt);
      card.addEventListener("mouseleave", reset);
      return () => {
        card.removeEventListener("mousemove", tilt);
        card.removeEventListener("mouseleave", reset);
      };
    });

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", move);
    window.addEventListener("advstat-theme-change", themeChanged);
    motionPreference.addEventListener("change", motionChanged);
    resize();
    return () => {
      cancelAnimationFrame(frameId);
      controlRef.current = null;
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("advstat-theme-change", themeChanged);
      motionPreference.removeEventListener("change", motionChanged);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [persistent]);

  return persistent
    ? <canvas id="auth-bg" className={`auth-background-canvas${isAuthRoute ? " is-visible" : ""}`} ref={canvasRef} aria-hidden="true" />
    : <canvas id="bg" ref={canvasRef} aria-hidden="true" />;
}
