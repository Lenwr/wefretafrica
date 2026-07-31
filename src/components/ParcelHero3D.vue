<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)
let renderer
let scene
let camera
let frameId
let boxGroup
let routeDots = []

function resize() {
  if (!renderer || !camera || !canvasRef.value) return

  const { clientWidth, clientHeight } = canvasRef.value
  renderer.setSize(clientWidth, clientHeight, false)
  camera.aspect = clientWidth / clientHeight
  camera.updateProjectionMatrix()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 1.2, 7)

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.7)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.3)
  keyLight.position.set(4, 5, 6)
  scene.add(keyLight)

  const rimLight = new THREE.PointLight(0xff7a18, 55, 12)
  rimLight.position.set(-3, 2, 4)
  scene.add(rimLight)

  boxGroup = new THREE.Group()
  boxGroup.scale.setScalar(1.14)
  scene.add(boxGroup)

  const cardboard = new THREE.MeshStandardMaterial({
    color: 0xd68a34,
    emissive: 0x5b2d0c,
    emissiveIntensity: 0.12,
    roughness: 0.58,
    metalness: 0.08
  })
  const darkTape = new THREE.MeshStandardMaterial({
    color: 0x4b2f19,
    roughness: 0.45,
    metalness: 0.06
  })
  const orangeTape = new THREE.MeshStandardMaterial({
    color: 0xff6b00,
    roughness: 0.36,
    metalness: 0.1
  })

  const box = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 2.1), cardboard)
  boxGroup.add(box)

  const bandX = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.18, 2.22), orangeTape)
  bandX.position.y = 0.93
  boxGroup.add(bandX)

  const bandZ = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.94, 2.24), darkTape)
  bandZ.position.x = -0.42
  boxGroup.add(bandZ)

  const label = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.52, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.3 })
  )
  label.position.set(0.58, 0.2, 1.08)
  boxGroup.add(label)

  const labelLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.05, 0.05),
    new THREE.MeshBasicMaterial({ color: 0x1f2937 })
  )
  labelLine.position.set(0.58, 0.2, 1.115)
  boxGroup.add(labelLine)

  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x16a34a,
    emissiveIntensity: 1.8,
    roughness: 0.2
  })

  routeDots = Array.from({ length: 7 }, (_, index) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 18, 18), glowMaterial)
    dot.position.set(-3 + index, -1.55 + Math.sin(index * 0.8) * 0.18, -0.3)
    scene.add(dot)
    return dot
  })

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.018, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 })
  )
  ring.rotation.x = Math.PI / 2.4
  scene.add(ring)

  const baseGlow = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.13
    })
  )
  baseGlow.position.set(0, -1.55, -0.7)
  baseGlow.rotation.x = -Math.PI / 2
  scene.add(baseGlow)

  resize()
  window.addEventListener('resize', resize)

  const animate = time => {
    const t = time * 0.001

    boxGroup.rotation.y = Math.sin(t * 0.7) * 0.34
    boxGroup.rotation.x = -0.16 + Math.sin(t * 0.55) * 0.05
    boxGroup.position.y = Math.sin(t * 1.2) * 0.12

    ring.rotation.z = t * 0.18

    routeDots.forEach((dot, index) => {
      dot.scale.setScalar(0.75 + Math.sin(t * 2.2 + index) * 0.25)
    })

    renderer.render(scene, camera)
    frameId = window.requestAnimationFrame(animate)
  }

  frameId = window.requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  if (frameId) window.cancelAnimationFrame(frameId)
  renderer?.dispose()
})
</script>

<template>
  <div class="parcel-scene" aria-label="Colis 3D animé">
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full"></canvas>

    <div class="css-parcel" aria-hidden="true">
      <div class="parcel-cube">
        <span class="face front">
          <i class="label"></i>
        </span>
        <span class="face back"></span>
        <span class="face right"></span>
        <span class="face left"></span>
        <span class="face top"></span>
        <span class="face bottom"></span>
      </div>
      <div class="orbit orbit-one"></div>
      <div class="orbit orbit-two"></div>
    </div>
  </div>
</template>

<style scoped>
.parcel-scene {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.css-parcel {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  perspective: 900px;
  pointer-events: none;
}

.parcel-cube {
  position: relative;
  height: 108px;
  width: 108px;
  transform-style: preserve-3d;
  animation: parcel-float 5s ease-in-out infinite;
}

.face {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: linear-gradient(135deg, #f59e0b, #b45309);
  box-shadow: inset 0 0 28px rgba(255, 255, 255, 0.12);
}

.front {
  transform: translateZ(54px);
}

.back {
  transform: rotateY(180deg) translateZ(54px);
}

.right {
  background: linear-gradient(135deg, #ea580c, #7c2d12);
  transform: rotateY(90deg) translateZ(54px);
}

.left {
  background: linear-gradient(135deg, #fbbf24, #92400e);
  transform: rotateY(-90deg) translateZ(54px);
}

.top {
  background: linear-gradient(135deg, #fed7aa, #f97316);
  transform: rotateX(90deg) translateZ(54px);
}

.bottom {
  background: #7c2d12;
  transform: rotateX(-90deg) translateZ(54px);
}

.front::before,
.top::before {
  content: "";
  position: absolute;
  left: 44px;
  top: 0;
  height: 100%;
  width: 18px;
  background: rgba(30, 41, 59, 0.52);
}

.label {
  position: absolute;
  right: 15px;
  top: 23px;
  height: 34px;
  width: 44px;
  border-radius: 6px;
  background: #fff7ed;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
}

.label::after {
  content: "";
  position: absolute;
  left: 10px;
  top: 16px;
  height: 4px;
  width: 24px;
  border-radius: 999px;
  background: #0f172a;
  opacity: 0.65;
}

.orbit {
  position: absolute;
  height: 190px;
  width: 190px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  transform: rotateX(66deg) rotateZ(18deg);
}

.orbit-two {
  height: 250px;
  width: 250px;
  border-color: rgba(125, 211, 252, 0.28);
  transform: rotateX(72deg) rotateZ(-24deg);
}

@keyframes parcel-float {
  0%,
  100% {
    transform: translateY(8px) rotateX(-16deg) rotateY(-28deg) rotateZ(2deg);
  }
  50% {
    transform: translateY(-10px) rotateX(-9deg) rotateY(34deg) rotateZ(-2deg);
  }
}
</style>
