import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import '../styles/SnowGlobeSpec.css'

// Custom Glass Shader with thin-film interference and NO reflections
const glassVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const glassFragmentShader = `
  uniform vec3 lightDirection;
  uniform float time;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  // Thin-film interference colors
  vec3 thinFilmColor(float cosTheta) {
    float phase = cosTheta * 10.0 + time * 0.5;
    vec3 color1 = vec3(0.7, 0.9, 1.0); // Light blue
    vec3 color2 = vec3(1.0, 0.8, 0.9); // Pink
    return mix(color1, color2, sin(phase) * 0.5 + 0.5);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel effect
    float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 3.0);

    // Specular from directional light ONLY (no reflections)
    vec3 reflectDir = reflect(-lightDirection, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

    // Thin-film interference
    vec3 filmColor = thinFilmColor(dot(viewDir, normal));

    // Final color: transparent base + thin-film + specular highlight
    vec3 baseColor = vec3(1.0, 1.0, 1.0);
    vec3 finalColor = mix(baseColor, filmColor, fresnel * 0.3) + vec3(spec * 0.5);

    // High transmission (very transparent)
    float alpha = 0.15 + fresnel * 0.1;

    gl_FragColor = vec4(finalColor, alpha);
  }
`

function SnowGlobeSpec() {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const clockRef = useRef(new THREE.Clock())
  const snowParticlesRef = useRef(null)
  const globeRef = useRef(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    // Check WebGL2 support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) {
      console.error('WebGL2 not supported')
      return
    }

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB) // Sky blue
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      35,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    )
    camera.position.set(-2.5, 0.5, 3.5)
    cameraRef.current = camera

    // Renderer with optimizations
    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Top-right directional light ONLY (no HDRI, no envMap)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
    sunLight.position.set(5, 7, -6) // Top-right position
    sunLight.castShadow = true
    sunLight.shadow.mapSize.set(1024, 1024)
    scene.add(sunLight)

    // Ambient light (minimal)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    // Glass globe with custom shader (NO reflections)
    const globeGeometry = new THREE.IcosahedronGeometry(1, 64)
    const glassMaterial = new THREE.ShaderMaterial({
      vertexShader: glassVertexShader,
      fragmentShader: glassFragmentShader,
      uniforms: {
        lightDirection: { value: sunLight.position.clone().normalize() },
        time: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    })
    const globe = new THREE.Mesh(globeGeometry, glassMaterial)
    scene.add(globe)
    globeRef.current = globe

    // Base (wooden platform)
    const baseGeometry = new THREE.CylinderGeometry(1.1, 1.2, 0.2, 32)
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.1
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = -1.1
    base.castShadow = true
    base.receiveShadow = true
    scene.add(base)

    // Simple cabin (box + pyramid roof)
    const cabinGroup = new THREE.Group()

    // Cabin base
    const cabinGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.4)
    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: 0xD2691E,
      roughness: 0.7
    })
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial)
    cabin.position.y = -0.75
    cabin.castShadow = true
    cabin.receiveShadow = true
    cabinGroup.add(cabin)

    // Roof
    const roofGeometry = new THREE.ConeGeometry(0.35, 0.25, 4)
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0xDC143C,
      roughness: 0.6
    })
    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.position.y = -0.475
    roof.rotation.y = Math.PI / 4
    roof.castShadow = true
    cabinGroup.add(roof)

    // Window lights (emissive)
    const windowGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.02)
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFF00,
      emissive: 0xFFAA00,
      emissiveIntensity: 2
    })
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial)
    window1.position.set(0.1, -0.7, 0.21)
    cabinGroup.add(window1)

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial)
    window2.position.set(-0.1, -0.7, 0.21)
    cabinGroup.add(window2)

    scene.add(cabinGroup)

    // Snow ground
    const snowGroundGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.05, 32)
    const snowGroundMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.9,
      metalness: 0.1
    })
    const snowGround = new THREE.Mesh(snowGroundGeometry, snowGroundMaterial)
    snowGround.position.y = -0.9
    snowGround.receiveShadow = true
    scene.add(snowGround)

    // Initialize 2000 snow particles (InstancedMesh for performance)
    const particleCount = 2000
    const particleGeometry = new THREE.SphereGeometry(0.01, 6, 6)
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.5
    })
    const snowMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount)

    const dummy = new THREE.Object3D()
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      // Random position inside sphere
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * 0.85

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, -0.001, 0),
        scale: 0.5 + Math.random() * 0.5
      })

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(particles[i].scale)
      dummy.updateMatrix()
      snowMesh.setMatrixAt(i, dummy.matrix)
    }

    scene.add(snowMesh)
    snowParticlesRef.current = { mesh: snowMesh, particles, dummy }

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controlsRef.current = controls

    setLoading(false)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      const elapsed = clockRef.current.getElapsedTime()

      // Update glass shader time
      if (glassMaterial.uniforms) {
        glassMaterial.uniforms.time.value = elapsed
      }

      // Update snow particles (simple physics)
      const { mesh, particles, dummy } = snowParticlesRef.current
      const gravity = new THREE.Vector3(0, -0.0005, 0)
      const globeRadius = 0.85

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]

        // Apply gravity
        particle.velocity.add(gravity)

        // Apply simple curl noise
        const noise = Math.sin(particle.position.x * 5 + elapsed) * 0.0002
        particle.velocity.x += noise
        particle.velocity.z += Math.cos(particle.position.z * 5 + elapsed) * 0.0002

        // Update position
        particle.position.add(particle.velocity)

        // Collision with globe sphere
        const dist = particle.position.length()
        if (dist > globeRadius) {
          const normal = particle.position.clone().normalize()
          particle.position.copy(normal.multiplyScalar(globeRadius))
          particle.velocity.reflect(normal).multiplyScalar(0.5)
        }

        // Update matrix
        dummy.position.copy(particle.position)
        dummy.scale.setScalar(particle.scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }

      mesh.instanceMatrix.needsUpdate = true

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      controls.dispose()
    }
  }, [])

  const handleShake = () => {
    if (!snowParticlesRef.current) return
    const { particles } = snowParticlesRef.current

    // VERY strong shake effect - swirl around the globe
    particles.forEach(particle => {
      // Create a circular motion around the center
      const pos = particle.position.clone()

      // Tangential velocity (perpendicular to radius) for spinning effect
      const tangent = new THREE.Vector3(-pos.z, 0, pos.x).normalize()
      const upwardBoost = new THREE.Vector3(0, 1, 0)

      // Combine spinning + upward + random chaos
      particle.velocity.add(
        tangent.multiplyScalar(0.15 + Math.random() * 0.1) // Strong spin
      )
      particle.velocity.add(
        upwardBoost.multiplyScalar(0.08 + Math.random() * 0.04) // Upward burst
      )
      particle.velocity.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ))
    })
  }

  return (
    <div className="snowglobe-spec-container">
      {loading && <div className="loading-indicator">Loading Snow Globe...</div>}
      <canvas ref={containerRef} className="snowglobe-canvas" />
      <button className="shake-btn" onClick={handleShake}>
        Shake ❄️
      </button>
    </div>
  )
}

export default SnowGlobeSpec
