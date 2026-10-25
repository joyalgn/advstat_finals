"use client";

import { useEffect, useRef } from "react";

interface Dot { x: number; y: number; vx: number; vy: number }

export default function HomeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      cancelAnimationFrame(frameId);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.floor((width * height) / 15000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
      if (reduce) paint();
      else frameId = requestAnimationFrame(paint);
    }

    function paint() {
      ctx!.clearRect(0, 0, width, height);
      for (const dot of dots) {
        if (!reduce) {
          dot.x += dot.vx;
          dot.y += dot.vy;
          if (dot.x < 0 || dot.x > width) dot.vx *= -1;
          if (dot.y < 0 || dot.y > height) dot.vy *= -1;
        }
        ctx!.fillStyle = "rgba(102,120,95,0.48)";
        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, 1.8, 0, Math.PI * 2);
        ctx!.fill();
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const distance = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (distance < 130) {
            ctx!.strokeStyle = `rgba(102,120,95,${0.14 * (1 - distance / 130)})`;
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.stroke();
          }
        }
        const mouseDistance = Math.hypot(dots[i].x - mouse.x, dots[i].y - mouse.y);
        if (mouseDistance < 170) {
          ctx!.strokeStyle = `rgba(212,168,91,${0.28 * (1 - mouseDistance / 170)})`;
          ctx!.beginPath();
          ctx!.moveTo(dots[i].x, dots[i].y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
        }
      }
      if (!reduce) frameId = requestAnimationFrame(paint);
    }

    function move(event: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }

    const cards = Array.from(document.querySelectorAll<HTMLElement>(".home-tool"));
    const cleanups = cards.map((card) => {
      const tilt = (event: MouseEvent) => {
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
    resize();
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", move);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return <canvas id="bg" ref={canvasRef} aria-hidden="true" />;
}