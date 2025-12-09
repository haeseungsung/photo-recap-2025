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

  // Thin-film interference colors (더 미묘하게)
  vec3 thinFilmColor(float cosTheta) {
    float phase = cosTheta * 8.0 + time * 0.3;
    vec3 color1 = vec3(0.8, 0.95, 1.0); // Very light blue
    vec3 color2 = vec3(1.0, 0.9, 0.95); // Very light pink
    return mix(color1, color2, sin(phase) * 0.5 + 0.5);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel effect (얇은 유리 - 더 약하게)
    float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 4.0);

    // Specular from directional light ONLY (no reflections)
    vec3 reflectDir = reflect(-lightDirection, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);

    // Thin-film interference (매우 미묘하게)
    vec3 filmColor = thinFilmColor(dot(viewDir, normal));

    // Final color: transparent base with blue tint + very subtle thin-film + specular highlight
    vec3 baseColor = vec3(0.95, 0.97, 1.0); // 약간 파란색 틴트
    vec3 finalColor = mix(baseColor, filmColor, fresnel * 0.15) + vec3(spec * 0.3);

    // Very high transmission (얇은 유리 - 거의 투명)
    float alpha = 0.12 + fresnel * 0.06;

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
    scene.background = new THREE.Color(0x0d1117) // Midnight navy (거의 검정색에 가까운 남색)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      35,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    )
    camera.position.set(-1.5, 0.3, 2.0) // Closer for smaller globe
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

    // Glass globe with custom shader (NO reflections) - 30% 축소 (0.35)
    const globeGeometry = new THREE.IcosahedronGeometry(0.35, 64)
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

    // Base (wooden platform) - 30% 축소
    const baseGeometry = new THREE.CylinderGeometry(0.455, 0.49, 0.105, 32)
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xA0826D, // 밝은 나무색
      roughness: 0.8,
      metalness: 0.1
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = -0.4025
    base.castShadow = true
    base.receiveShadow = true
    scene.add(base)

    // Simple cabin (box + pyramid roof) - 절반 크기
    const cabinGroup = new THREE.Group()

    // Cabin base - 30% 축소
    const cabinGeometry = new THREE.BoxGeometry(0.175, 0.14, 0.175)
    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: 0xB87333, // 밝은 갈색
      roughness: 0.7
    })
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial)
    cabin.position.y = -0.266
    cabin.castShadow = true
    cabin.receiveShadow = true
    cabinGroup.add(cabin)

    // Roof - 30% 축소
    const roofGeometry = new THREE.ConeGeometry(0.154, 0.126, 4)
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0xF5F5F5, // 하얀색 지붕 (눈 덮인 느낌)
      roughness: 0.6
    })
    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.position.y = -0.133
    roof.rotation.y = Math.PI / 4
    roof.castShadow = true
    cabinGroup.add(roof)

    // Door - 30% 축소
    const doorGeometry = new THREE.BoxGeometry(0.042, 0.07, 0.01)
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A5568,
      roughness: 0.8
    })
    const door = new THREE.Mesh(doorGeometry, doorMaterial)
    door.position.set(0, -0.301, 0.0882)
    cabinGroup.add(door)

    // Window lights - 30% 축소
    const windowGeometry = new THREE.BoxGeometry(0.035, 0.035, 0.01)
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFF00,
      emissive: 0xFFAA00,
      emissiveIntensity: 2
    })
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial)
    window1.position.set(0.056, -0.224, 0.0882)
    cabinGroup.add(window1)

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial)
    window2.position.set(-0.056, -0.224, 0.0882)
    cabinGroup.add(window2)

    scene.add(cabinGroup)

    // Christmas Trees - 30% 축소
    // Tree 1 (왼쪽)
    const tree1Group = new THREE.Group()
    const treeGeometry1 = new THREE.ConeGeometry(0.056, 0.105, 8)
    const treeGeometry2 = new THREE.ConeGeometry(0.049, 0.091, 8)
    const treeGeometry3 = new THREE.ConeGeometry(0.042, 0.077, 8)
    const treeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2D5A3D, // 어두운 녹색
      roughness: 0.8
    })

    const treeBottom = new THREE.Mesh(treeGeometry1, treeMaterial)
    treeBottom.position.y = -0.294
    treeBottom.castShadow = true
    tree1Group.add(treeBottom)

    const treeMiddle = new THREE.Mesh(treeGeometry2, treeMaterial)
    treeMiddle.position.y = -0.224
    treeMiddle.castShadow = true
    tree1Group.add(treeMiddle)

    const treeTop = new THREE.Mesh(treeGeometry3, treeMaterial)
    treeTop.position.y = -0.161
    treeTop.castShadow = true
    tree1Group.add(treeTop)

    // Tree trunk - 30% 축소
    const trunkGeometry = new THREE.CylinderGeometry(0.0105, 0.014, 0.035, 8)
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A3728,
      roughness: 0.9
    })
    const trunk1 = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk1.position.y = -0.329
    trunk1.castShadow = true
    tree1Group.add(trunk1)

    tree1Group.position.set(-0.14, 0, 0.105)
    scene.add(tree1Group)

    // Tree 2 (오른쪽)
    const tree2Group = tree1Group.clone()
    tree2Group.position.set(0.14, 0, -0.105)
    scene.add(tree2Group)

    // Snow ground - 30% 축소
    const snowGroundGeometry = new THREE.CylinderGeometry(0.336, 0.336, 0.042, 32)
    const snowGroundMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      emissive: 0xFFFFFF,
      emissiveIntensity: 0.2,
      roughness: 0.7,
      metalness: 0.05
    })
    const snowGround = new THREE.Mesh(snowGroundGeometry, snowGroundMaterial)
    snowGround.position.y = -0.329
    snowGround.receiveShadow = true
    snowGround.castShadow = true
    scene.add(snowGround)

    // Initialize 4000 snow particles (더 많이, 더 작게) - 반짝이는 하얀 눈
    const particleCount = 4000
    const particleGeometry = new THREE.SphereGeometry(0.003, 6, 6) // 더 작게
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      emissive: 0xFFFFFF, // 반짝이는 효과
      emissiveIntensity: 0.5,
      roughness: 0.15, // 더 반짝이게
      metalness: 0.15
    })
    const snowMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, particleCount)

    const dummy = new THREE.Object3D()
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      // Random position inside sphere - 더 많이 채우기
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * 0.2975 // 30% 축소 (0.425 * 0.7)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, -0.001, 0),
        scale: 0.4 + Math.random() * 0.4 // 크기 변화 더 작게
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

      // Update snow particles (viscous liquid physics - like glycerin)
      const { mesh, particles, dummy } = snowParticlesRef.current
      const gravity = new THREE.Vector3(0, -0.00015, 0) // Much weaker gravity
      const globeRadius = 0.2975 // 30% 축소 (0.425 * 0.7)
      const dragCoefficient = 0.92 // High drag for viscous liquid (0.92 = 8% velocity loss per frame)
      const buoyancy = 0.00008 // Slight upward force

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]

        // Apply gravity (very gentle)
        particle.velocity.add(gravity)

        // Apply buoyancy (slight upward force)
        particle.velocity.y += buoyancy

        // Apply viscous drag (this is key for slow, floaty motion)
        particle.velocity.multiplyScalar(dragCoefficient)

        // Apply gentle swirling motion (like liquid currents)
        const swirl = Math.sin(particle.position.x * 3 + elapsed * 0.3) * 0.00008
        const swirlZ = Math.cos(particle.position.z * 3 + elapsed * 0.3) * 0.00008
        particle.velocity.x += swirl
        particle.velocity.z += swirlZ

        // Add gentle turbulence
        const turbulence = new THREE.Vector3(
          (Math.random() - 0.5) * 0.00002,
          (Math.random() - 0.5) * 0.00002,
          (Math.random() - 0.5) * 0.00002
        )
        particle.velocity.add(turbulence)

        // Update position
        particle.position.add(particle.velocity)

        // Soft collision with globe sphere (viscous bounce)
        const dist = particle.position.length()
        if (dist > globeRadius) {
          const normal = particle.position.clone().normalize()
          particle.position.copy(normal.multiplyScalar(globeRadius))
          // Very soft bounce with high energy loss
          particle.velocity.reflect(normal).multiplyScalar(0.15)
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

    // Shake effect in viscous liquid - slower, more graceful swirling
    particles.forEach(particle => {
      // Create a circular motion around the center
      const pos = particle.position.clone()

      // Tangential velocity (perpendicular to radius) for spinning effect
      const tangent = new THREE.Vector3(-pos.z, 0, pos.x).normalize()
      const upwardBoost = new THREE.Vector3(0, 1, 0)

      // Gentler shake for viscous liquid (will slow down quickly due to drag)
      particle.velocity.add(
        tangent.multiplyScalar(0.04 + Math.random() * 0.03) // Gentler spin
      )
      particle.velocity.add(
        upwardBoost.multiplyScalar(0.02 + Math.random() * 0.01) // Gentle upward burst
      )
      particle.velocity.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03
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
