"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./show.module.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  particles: Particle[];
}

const defaultColors = ["#ff2d75", "#ffd700", "#00f5ff", "#ff6b35", "#a855f7", "#22c55e", "#f43f5e"];

function ShowContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [showMessage, setShowMessage] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const message = searchParams.get("msg") || "";
  const imageData = searchParams.get("img") || null;

  const extractColorsFromImage = (imgSrc: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(defaultColors);
          return;
        }
        
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const pixels = imageData.data;
        const colorCounts: { [key: string]: number } = {};
        
        for (let i = 0; i < pixels.length; i += 16) {
          const r = Math.round(pixels[i] / 32) * 32;
          const g = Math.round(pixels[i + 1] / 32) * 32;
          const b = Math.round(pixels[i + 2] / 32) * 32;
          const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }
        
        const sortedColors = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7)
          .map(([color]) => color);
        
        resolve(sortedColors.length > 0 ? sortedColors : defaultColors);
      };
      img.onerror = () => resolve(defaultColors);
      img.src = imgSrc;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let fireworks: Firework[] = [];
    let colors = defaultColors;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createFirework = (customColors?: string[]): Firework => {
      const colorArray = customColors || colors;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height,
        targetY: Math.random() * (canvas.height * 0.5) + 50,
        vy: -Math.random() * 8 - 10,
        color: colorArray[Math.floor(Math.random() * colorArray.length)],
        exploded: false,
        particles: [],
      };
    };

    const explode = (firework: Firework, customColors?: string[]) => {
      const colorArray = customColors || colors;
      const particleCount = Math.floor(Math.random() * 50) + 80;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 6 + 2;
        const particle: Particle = {
          x: firework.x,
          y: firework.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: Math.random() * 0.5 + 0.5,
          color: colorArray[Math.floor(Math.random() * colorArray.length)],
          size: Math.random() * 3 + 2,
          trail: [],
        };
        firework.particles.push(particle);
      }
    };

    const update = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (fireworks.length < 6 && Math.random() < 0.08) {
        fireworks.push(createFirework(colors.length > 0 ? colors : undefined));
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];

        if (!fw.exploded) {
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = fw.color;
          ctx.fill();

          fw.vy += 0.15;
          fw.y += fw.vy;

          if (fw.y <= fw.targetY || fw.vy >= 0) {
            fw.exploded = true;
            explode(fw, colors.length > 0 ? colors : undefined);
          }
        } else {
          for (let j = fw.particles.length - 1; j >= 0; j--) {
            const p = fw.particles[j];
            
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 8) p.trail.shift();

            ctx.beginPath();
            for (let k = 0; k < p.trail.length; k++) {
              const t = p.trail[k];
              const alpha = (k / p.trail.length) * p.life * 0.5;
              ctx.lineTo(t.x, t.y);
            }
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.stroke();

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.vx *= 0.98;
            p.life -= 0.015;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
            ctx.globalAlpha = 1;

            if (p.life <= 0) {
              fw.particles.splice(j, 1);
            }
          }

          if (fw.particles.length === 0) {
            fireworks.splice(i, 1);
          }
        }
      }

      animationId = requestAnimationFrame(update);
    };

    const init = async () => {
      resize();
      window.addEventListener("resize", resize);
      
      if (imageData) {
        colors = await extractColorsFromImage(imageData);
      }
      
      update();
    };

    init();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [imageData]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Firework Message",
          text: message || "Xem màn pháo hoa tuyệt đẹp!",
          url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy");
      }
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <main className={styles.main} ref={containerRef}>
      <canvas ref={canvasRef} className={styles.canvas} />
      
      <div className={`${styles.messageContainer} ${showMessage ? styles.visible : ""}`}>
        {message && (
          <h1 className={styles.message}>{decodeURIComponent(message)}</h1>
        )}
        {!message && (
          <h1 className={styles.message}>🎆</h1>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={handleBack}>
          ← Quay về
        </button>
        <button className={styles.shareBtn} onClick={handleShare}>
          {copied ? "✓ Đã copy!" : " Chia sẻ"}
        </button>
      </div>
    </main>
  );
}

function Loading() {
  return (
    <main style={{ 
      background: "#000", 
      width: "100vw", 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center" 
    }}>
      <div style={{ color: "#fff", fontSize: "1.5rem" }}>Loading...</div>
    </main>
  );
}

export default function Show() {
  return (
    <Suspense fallback={<Loading />}>
      <ShowContent />
    </Suspense>
  );
}
