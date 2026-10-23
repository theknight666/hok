import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, PresentationControls } from "@react-three/drei";
import * as THREE from "three";

const GOLD = "#C9A45C";
const OCT = Math.PI / 8;

function Gold({ rough = 0.22 }) {
  return <meshStandardMaterial color={GOLD} metalness={1} roughness={rough} flatShading />;
}

function useShield() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.34);
    s.lineTo(0.27, 0.25);
    s.lineTo(0.27, 0.02);
    s.bezierCurveTo(0.27, -0.18, 0.12, -0.3, 0, -0.36);
    s.bezierCurveTo(-0.12, -0.3, -0.27, -0.18, -0.27, 0.02);
    s.lineTo(-0.27, 0.25);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });
  }, []);
}

function Bottle({ color }) {
  const group = useRef();
  const liquid = useRef();
  const target = useRef(new THREE.Color(color));
  const shield = useShield();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = Math.min(1, t / 2.6);
    const e = 1 - Math.pow(1 - p, 4);
    const g = group.current;
    if (!g) return;
    g.position.y = -0.55 - 2.4 * (1 - e) + Math.sin(t * 0.9) * 0.05;
    g.rotation.y = (1 - e) * Math.PI * 1.6 + Math.sin(t * 0.35) * 0.5 + state.pointer.x * 0.35;
    g.rotation.x = state.pointer.y * -0.06;
    g.scale.setScalar(0.55 + 0.45 * e);
    target.current.set(color);
    if (liquid.current) {
      liquid.current.color.lerp(target.current, 0.06);
      liquid.current.emissive.lerp(target.current, 0.06);
    }
  });

  return (
    <group ref={group}>
      {/* faceted crystal body */}
      <mesh rotation={[0, OCT, 0]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[1.05, 1.05, 1.9, 8, 1]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.14} depthWrite={false} roughness={0} metalness={0.2} clearcoat={1} envMapIntensity={3} flatShading />
      </mesh>
      {/* shoulders */}
      <mesh position={[0, 1.08, 0]} rotation={[0, OCT, 0]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[0.55, 1.05, 0.26, 8, 1]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} roughness={0} clearcoat={1} envMapIntensity={3} flatShading />
      </mesh>
      <mesh position={[0, -1.08, 0]} rotation={[0, OCT, 0]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[1.05, 0.82, 0.26, 8, 1]} />
        <meshPhysicalMaterial color="#f4f1ea" transparent opacity={0.55} roughness={0.02} clearcoat={1} envMapIntensity={2.4} flatShading />
      </mesh>
      {/* liquid */}
      <mesh position={[0, -0.06, 0]} rotation={[0, OCT, 0]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[0.9, 0.9, 1.72, 8, 1]} />
        <meshPhysicalMaterial ref={liquid} color={color} emissive={color} emissiveIntensity={0.08} roughness={0.12} metalness={0.25} clearcoat={0.6} envMapIntensity={0.9} flatShading />
      </mesh>
      {/* neck + cap */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.2, 24]} />
        <Gold rough={0.3} />
      </mesh>
      <mesh position={[0, 1.72, 0]} rotation={[0, OCT, 0]}>
        <cylinderGeometry args={[0.44, 0.48, 0.68, 8]} />
        <Gold />
      </mesh>
      <mesh position={[0, 2.1, 0]} rotation={[0, OCT, 0]}>
        <cylinderGeometry args={[0.24, 0.44, 0.1, 8]} />
        <Gold rough={0.15} />
      </mesh>
      <mesh position={[0, 2.22, 0]}>
        <sphereGeometry args={[0.12, 20, 20]} />
        <Gold rough={0.1} />
      </mesh>
      {/* crest */}
      <mesh geometry={shield} position={[0, 0.05, 0.585]}>
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} />
      </mesh>
    </group>
  );
}

export default function BottleScene({ color = "#D4A24C", className = "" }) {
  return (
    <div className={className} data-testid="bottle-3d-canvas">
      <Canvas dpr={[1, 1.8]} camera={{ position: [0, 0.3, 8.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[0, 8, 4]} angle={0.4} penumbra={1} intensity={70} color="#fff4dc" />
        <directionalLight position={[-4, 2, 3]} intensity={1.4} />
        <directionalLight position={[4, -1, 2]} intensity={0.6} color="#f2d39a" />
        <Suspense fallback={null}>
          <PresentationControls global={false} cursor snap polar={[-0.2, 0.2]} azimuth={[-0.9, 0.9]} speed={1.4}>
            <Bottle color={color} />
          </PresentationControls>
          <ContactShadows position={[0, -1.85, 0]} opacity={0.35} scale={6} blur={2.8} far={3} />
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={4} position={[0, 4, -2]} scale={[8, 1, 1]} />
            <Lightformer form="rect" intensity={3} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[2, 6, 1]} />
            <Lightformer form="rect" intensity={3} position={[4, 1, 2]} rotation-y={-Math.PI / 2} scale={[2, 6, 1]} />
            <Lightformer form="ring" color="#f2d39a" intensity={2} position={[0, 0, 6]} scale={2} />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
