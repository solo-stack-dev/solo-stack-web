<!--
	@component
	MoonScene content: orthographic camera mapping the unit sphere exactly onto the canvas (edge = wordmark clip circle), painted texture,
	watercolor material lit from the viewer (always full). A 30 fps RafLoop (paused off screen / hidden tab) replaces Threlte's loop.
-->
<script lang="ts">
	import { on } from 'svelte/events';
	import { T, useScheduler, useThrelte } from '@threlte/core';
	import { Mesh, NoColorSpace, OrthographicCamera, ShaderMaterial, SphereGeometry, TextureLoader, Vector3, type Texture } from 'three';
	import { RafLoop } from '#lib/home/shared/motion.svelte.ts';
	import moonTexture from './assets/hero-moon-texture.webp?url';

	type Props = {
		onready?: () => void;
		onlost?: () => void;
	};

	let { onready, onlost }: Props = $props();

	const { renderer, scheduler, invalidate, canvas } = useThrelte();
	const { frameInvalidated } = useScheduler();

	/** Rad/s around the moon's axis: drift, not spin. */
	const ROTATION_SPEED = 0.03;

	const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
	camera.position.set(0, 0, 5);

	const material = new ShaderMaterial({
		uniforms: {
			map: { value: null },
			shadowColor: { value: new Vector3(24 / 255, 25 / 255, 27 / 255) },
			// the painted disc's outer ring (docs/art/hero/hero-moon-disc.png, last 6 % of the radius) is paler
			rimColor: { value: new Vector3(251 / 255, 236 / 255, 172 / 255) }
		},
		vertexShader: /* glsl */ `
			varying vec2 vUv;
			varying vec3 vNormal;
			void main() {
				vUv = uv;
				vNormal = normalize(normalMatrix * normal);
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		// Deliberately sRGB throughout (no texture color space, no output conversion) so the first frame matches the painted disc's tones.
		// Light comes from the viewer (full moon), so dot(n, light) is just n.z.
		fragmentShader: /* glsl */ `
			uniform sampler2D map;
			uniform vec3 shadowColor;
			uniform vec3 rimColor;
			varying vec2 vUv;
			varying vec3 vNormal;

			void main() {
				vec3 n = normalize(vNormal);
				vec3 albedo = texture2D(map, vUv).rgb;
				float mu = clamp(n.z, 0.0, 1.0);

				// Watercolor limb: the pigment (darker blooms) makes the edge wobble a little
				float lum = dot(albedo, vec3(0.299, 0.587, 0.114));
				float ndl = n.z + (lum - 0.78) * 0.22;
				float lit = smoothstep(-0.015, 0.035, ndl);
				// Pale outer ring, as on the painted disc, so the 2D → 3D crossfade stays quiet
				vec3 day = mix(albedo, rimColor, smoothstep(0.8, 1.0, sqrt(1.0 - mu * mu)) * 0.55);
				// Night side: anthracite wash with faint earthshine of the painted surface
				vec3 night = mix(shadowColor, albedo * 0.32, 0.22);
				gl_FragColor = vec4(mix(night, day, lit), 1.0);
			}
		`
	});

	const geometry = new SphereGeometry(1, 128, 64);
	const mesh = new Mesh(geometry, material);

	let ready = false;
	let textureLoaded = false;
	let disposed = false;

	new TextureLoader().load(moonTexture, (texture: Texture) => {
		// 3D switched off before the texture arrived: the material is gone, nothing else would dispose it.
		if (disposed) return texture.dispose();
		texture.colorSpace = NoColorSpace;
		texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
		material.uniforms.map.value = texture;
		textureLoaded = true;
		invalidate();
	});

	// Threlte's loop renders every display frame; the RafLoop below replaces it.
	renderer.setAnimationLoop(null);

	const loop = new RafLoop(
		(dt, time) => {
			if (!textureLoaded) return;
			mesh.rotation.y += dt * ROTATION_SPEED;
			invalidate();
			scheduler.run(time);
			frameInvalidated.current = false;
			if (!ready) {
				ready = true;
				onready?.();
			}
		},
		{ fps: 30 }
	);

	$effect(() => {
		const detach = loop.attach(canvas);
		const offLost = on(canvas, 'webglcontextlost', (event) => {
			event.preventDefault();
			onlost?.();
		});
		return () => {
			disposed = true;
			detach?.();
			offLost();
			geometry.dispose();
			material.dispose();
			(material.uniforms.map.value as Texture | null)?.dispose();
		};
	});
</script>

<T is={camera} makeDefault manual />
<T is={mesh} />
