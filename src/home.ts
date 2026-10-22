// Home page animation: a drifting "data network" background + tilt on the choice cards.

const canvas = document.getElementById("bg") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

interface Dot { x: number; y: number; vx: number; vy: number; }
let dots: Dot[] = [];
let w = 0, h = 0;
const mouse = { x: -9999, y: -9999 };

function resize(): void {
  const r = canvas.getBoundingClientRect();
  w = r.width; h = r.height;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(90, Math.floor((w * h) / 15000));
  dots = Array.from({ length: count }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
  }));
}

function frame(): void {
  ctx.clearRect(0, 0, w, h);
  for (const d of dots) {
    if (!reduce) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
    }
    ctx.fillStyle = "rgba(120,170,255,0.7)";
    ctx.beginPath(); ctx.arc(d.x, d.y, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
      if (dist < 130) {
        ctx.strokeStyle = `rgba(110,160,255,${0.22 * (1 - dist / 130)})`;
        ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
      }
    }
    const dm = Math.hypot(dots[i].x - mouse.x, dots[i].y - mouse.y);
    if (dm < 170) {
      ctx.strokeStyle = `rgba(251,191,36,${0.55 * (1 - dm / 170)})`;
      ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  }
  if (!reduce) requestAnimationFrame(frame);
}

window.addEventListener("resize", resize);
window.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});
resize();
frame();

// 3D tilt on the two choice cards
document.querySelectorAll<HTMLElement>(".choice").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});
