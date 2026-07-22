import React, { useRef, useMemo, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const SpiralSwarm = () => {
  const ref = useRef();
  
  const points = useMemo(() => {
    try {
      return random.inSphere(new Float32Array(6000), { radius: 1.6 });
    } catch {
      const p = new Float32Array(6000);
      for (let i = 0; i < 6000; i += 3) {
        const theta = (i / 6000) * Math.PI * 8;
        const r = (i / 6000) * 1.5;
        p[i] = Math.cos(theta) * r;
        p[i + 1] = (Math.random() - 0.5) * 1.5;
        p[i + 2] = Math.sin(theta) * r;
      }
      return p;
    }
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 18;
      ref.current.rotation.y -= delta / 12;
      ref.current.rotation.z += delta / 25;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#FFB800"
          size={0.0035}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.85}
        />
      </Points>
    </group>
  );
};

class CanvasErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("WebGL Canvas rendering fallback engaged:", err);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export const CyberBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-black overflow-hidden pointer-events-none" style={{ backgroundColor: '#000000' }}>
      <CanvasErrorBoundary>
        <Canvas 
          camera={{ position: [0, 0, 1] }} 
          onCreated={({ gl }) => gl.setClearColor('#000000', 1)}
          style={{ background: '#000000' }}
        >
          <SpiralSwarm />
        </Canvas>
      </CanvasErrorBoundary>
      {/* Pure Pitch Black Overlay with Gold Glow */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-black to-black pointer-events-none" />
    </div>
  );
};
