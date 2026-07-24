import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Ferrofluid.css';

// Helper to convert HEX color to RGB array (0-1)
const hexToRGB = (hex: string) => {
  const clean = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

// Prepare color uniforms for the shader
const prepColors = (input: string[]) => {
  const base = (input && input.length ? input : ['#4F46E5', '#06B6D4', '#E0F2FE']).slice(0, 8);
  const arr: number[][] = [];
  for (let i = 0; i < 8; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));
  const avg = [0, 0, 0];
  for (let i = 0; i < base.length; i++) {
    avg[0] += arr[i][0];
    avg[1] += arr[i][1];
    avg[2] += arr[i][2];
  }
  avg[0] /= base.length;
  avg[1] /= base.length;
  avg[2] /= base.length;
  return { arr, count: base.length, avg };
};

type FerrofluidProps = {
  colors?: string[];
  speed?: number;
  scale?: number;
  turbulence?: number;
  fluidity?: number;
  rimWidth?: number;
  sharpness?: number;
  shimmer?: number;
  glow?: number;
  flowDirection?: 'up' | 'down' | 'left' | 'right';
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
};

export const Ferrofluid: React.FC<FerrofluidProps> = (props) => {
  const {
    colors = ['#4F46E5', '#06B6D4', '#E0F2FE'],
    speed = 0.5,
    opacity = 1,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const isWebGL2 = !!canvasRef.current.getContext('webgl2');
    if (!isWebGL2) return; // fallback renders empty canvas
    const renderer = new Renderer({ canvas: canvasRef.current });
    const gl = renderer.gl;
    const { width, height } = { width: canvasRef.current.width || 1, height: canvasRef.current.height || 1 };

    const program = new Program(gl, {
      vertex: `
        attribute vec2 uv;
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = vec4(uv.x * 2.0 - 1.0, uv.y * -2.0 + 1.0, 0.0, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        varying vec2 vUv;
        uniform vec3 colors[8];
        uniform float time;
        uniform vec2 resolution;
        uniform float opacity;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
        float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
          return mix(mix(hash(i+vec2(0.0,0.0)),hash(i+vec2(1.0,0.0)),f.x),
                     mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);
        }
          float n = noise(uv * 3.0 + time * 0.2);
          vec3 color = mix(colors[0], colors[1], n);
          gl_FragColor = vec4(color, opacity);
        }
      `,
      uniforms: {
        time: { value: 0 },
        resolution: { value: [width, height] },
        opacity: { value: opacity },
        colors: { value: prepColors(colors).arr.flat() }
      }
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    let animationId: number;

    const render = (t: number) => {
      program.uniforms.time.value = t * 0.001 * speed;
      renderer.render({ scene: mesh });
      animationId = requestAnimationFrame(render);
    };
    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [colors, speed, opacity]);

  return <canvas ref={canvasRef} className="ferrofluid-canvas" />;
};

export default Ferrofluid;
