"use client";

import { useEffect, useRef } from "react";

class FluidSimulation {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private positionBuffer: WebGLBuffer;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private particles: Float32Array;
  private numParticles: number = 1000;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl");
    if (!gl) throw new Error("WebGL not supported");
    this.gl = gl;

    // Create shader program
    const vertexShader = this.createShader(
      gl.VERTEX_SHADER,
      `
      attribute vec2 position;
      uniform vec2 mouse;
      uniform vec2 resolution;
      
      void main() {
        vec2 pos = position;
        vec2 mouseNorm = mouse / resolution;
        float dist = distance(pos, mouseNorm);
        float strength = 1.0 - smoothstep(0.0, 0.2, dist);
        pos = mix(pos, mouseNorm, strength * 0.1);
        gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
        gl_PointSize = mix(2.0, 4.0, strength);
      }
    `
    );

    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        gl_FragColor = vec4(0.2, 0.4, 1.0, alpha * 0.5);
      }
    `
    );

    this.program = this.createProgram(vertexShader, fragmentShader);
    gl.useProgram(this.program);

    // Create particles
    this.particles = new Float32Array(this.numParticles * 2);
    for (let i = 0; i < this.numParticles * 2; i += 2) {
      this.particles[i] = Math.random();
      this.particles[i + 1] = Math.random();
    }

    // Create buffer
    this.positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particles, gl.DYNAMIC_DRAW);

    // Set up attributes
    const positionLocation = gl.getAttribLocation(this.program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set up uniforms
    this.resize();
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(shader)!);
    }

    return shader;
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(this.gl.getProgramInfoLog(program)!);
    }

    return program;
  }

  public resize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    this.canvas.width = width * window.devicePixelRatio;
    this.canvas.height = height * window.devicePixelRatio;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const resolutionLocation = this.gl.getUniformLocation(
      this.program,
      "resolution"
    );
    this.gl.uniform2f(
      resolutionLocation,
      this.canvas.width,
      this.canvas.height
    );
  }

  public updateMouse(x: number, y: number) {
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    this.mouseX = x * window.devicePixelRatio;
    this.mouseY = this.canvas.height - y * window.devicePixelRatio;

    const mouseLocation = this.gl.getUniformLocation(this.program, "mouse");
    this.gl.uniform2f(mouseLocation, this.mouseX, this.mouseY);
  }

  public render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Update particles
    for (let i = 0; i < this.numParticles * 2; i += 2) {
      const dx = this.mouseX - this.lastMouseX;
      const dy = this.mouseY - this.lastMouseY;
      this.particles[i] += dx * 0.0001;
      this.particles[i + 1] += dy * 0.0001;

      // Keep particles within bounds
      this.particles[i] = Math.max(0, Math.min(1, this.particles[i]));
      this.particles[i + 1] = Math.max(0, Math.min(1, this.particles[i + 1]));
    }

    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.particles);
    this.gl.drawArrays(this.gl.POINTS, 0, this.numParticles);
  }
}

export function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<FluidSimulation | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    simulationRef.current = new FluidSimulation(canvas);

    const handleResize = () => {
      if (simulationRef.current) {
        simulationRef.current.resize();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (simulationRef.current) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        simulationRef.current.updateMouse(x, y);
      }
    };

    const animate = () => {
      if (simulationRef.current) {
        simulationRef.current.render();
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
