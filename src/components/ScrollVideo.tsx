"use client";
import React, { useEffect, useRef } from "react";

export default function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Cria o elemento de vídeo de forma dinâmica para rodar em background
    const video = document.createElement("video");
    video.src = "/video_looping.mp4";
    video.muted = true;
    video.loop = false; // Desativa o looping contínuo
    video.playsInline = true;
    video.autoplay = false; // Não inicia automaticamente até cruzar o scroll
    video.crossOrigin = "anonymous";

    let animationId: number;
    let wasPassedHalf = false;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Resolução fixa de renderização do canvas para otimizar processamento de pixels
      // Aumentamos a largura para 520 para evitar cortes nos cotovelos durante o movimento
      canvas.width = 520 * dpr;
      canvas.height = 540 * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      
      ctx.scale(dpr, dpr);
    };

    const drawVideoFrame = () => {
      // Desenha mesmo com o vídeo pausado para que o frame estático inicial apareça cortado sem o fundo azul
      ctx.clearRect(0, 0, 520, 540);

      // Desenha o vídeo centralizado horizontalmente com bastante folga nas laterais (52.5px de margem)
      // Proporção de 900x1080 (5:6) -> 415x498
      const wVideo = 415;
      const hVideo = 498;
      const xVideo = (520 - wVideo) / 2; // = 52.5px de cada lado
      const yVideo = 540 - hVideo; // Alinha a base do vídeo com a base do canvas
      ctx.drawImage(video, xVideo, yVideo, wVideo, hVideo);

      // Chroma Key Premium Real-time calibrado para Fundo Azul (Blue Screen Keying)
      const dpr = window.devicePixelRatio || 1;
      const canvasW = 520 * dpr;
      const canvasH = 540 * dpr;
      const imageData = ctx.getImageData(0, 0, canvasW, canvasH);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 1. Detecção refinada de azul (croma azul de estúdio)
        const maxRG = r > g ? r : g;
        const blueness = b - maxRG;
        
        // Proteção para tons escuros (evitar que a blusa preta fique transparente)
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        
        if (blueness > 8 && luma > 15) {
          if (blueness < 28) {
            // Transição gradual (suavidade de recorte nas bordas e fios de cabelo)
            const factor = (blueness - 8) / 20;
            data[i + 3] = Math.round((1 - factor) * 255);
            
            // Spill suppression do azul nas bordas
            data[i + 2] = Math.round(b * (1 - factor) + maxRG * factor * 0.85);
          } else {
            // Fundo azul puro -> Transparência total
            data[i + 3] = 0;
          }
        }
        
        // 2. Spill Suppression geral para remover reflexos azulados no cabelo loiro e contornos
        if (data[i + 3] > 0) {
          const avgRG = (r + g) / 2;
          if (b > avgRG * 0.98) {
            // Limita o canal azul para tons neutros e quentes
            data[i + 2] = Math.round(avgRG * 0.95);
          }
          // Remove tons arroxeados indesejados nas bordas (combinação de vermelho com vazamento azul)
          if (r > g && b > g) {
            data[i + 2] = Math.round(g * 0.95);
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    const render = () => {
      drawVideoFrame();
      animationId = requestAnimationFrame(render);
    };

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const halfViewport = window.innerHeight * 0.5;
      
      // Verifica se o topo do contêiner ultrapassou a metade da tela (dobra do meio)
      const isPassedHalf = rect.top < halfViewport;
      
      if (isPassedHalf && !wasPassedHalf) {
        // Dispara a animação (dá play do início)
        video.currentTime = 0;
        video.play().catch((err) => console.log("Autoplay bloqueado:", err));
        wasPassedHalf = true;
      } else if (!isPassedHalf && wasPassedHalf) {
        // Reseta o vídeo ao subir acima da dobra
        video.pause();
        video.currentTime = 0;
        wasPassedHalf = false;
      }
    };

    video.onloadedmetadata = () => {
      resizeCanvas();
      // Desenha o primeiro frame imediatamente para que não fique vazio ao carregar a página
      setTimeout(() => {
        drawVideoFrame();
      }, 150);
    };

    // Inicializa o canvas e inicia o loop de renderização constante
    resizeCanvas();
    render();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", handleScroll);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      video.pause();
      video.src = "";
      video.load();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-visible">
      <canvas ref={canvasRef} className="absolute bottom-0 left-0 w-full h-full" />
    </div>
  );
}
