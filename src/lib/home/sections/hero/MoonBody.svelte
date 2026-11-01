<!--
	@component
	Scene content of MoonScene: an orthographic camera that maps the unit sphere exactly onto the canvas (so the
	moon's edge matches the wordmark clip circle), the painted texture, and a watercolor toon material whose single
	light direction is the moon phase. Threlte's own animation loop is replaced by a RafLoop (30 fps, paused off
	screen and in hidden tabs).
-->
<script lang="ts">
	import { on } from 'svelte/events';
	import { T, useScheduler, useThrelte } from '@threlte/core';
	import { Mesh, NoColorSpace, OrthographicCamera, ShaderMaterial, SphereGeometry, TextureLoader, Vector3, type Texture } from 'three';
	import { RafLoop } from '#lib/home/shared/motion.svelte.ts';
	import { lightDirection } from './moon.ts';
	import moonTexture from './assets/hero-moon-texture.webp?url';

	type Props = {
		angle: number;
		onready?: () => void;
		onlost?: () => void;
	};

	let { angle, onready, onlost }: Props = $props();

	const { renderer, scheduler, invalidate, canvas } = useThrelte();
	const { frameInvalidated } = useScheduler();

	/** Radians per second around the moon's axis. Slow enough to feel like drift, not spin. */
	const ROTATION_SPEED = 0.03;

	const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
	camera.position.set(0, 0, 5);

	const material = new ShaderMaterial({
		uniforms: {
			map: { value: null },
			lightDir: { value: new Vector3(0, 0, 1) },
			shadowColor: { value: new Vector3(24 / 255, 25 / 255, 27 / 255) },
			// the painted disc's outer ring (docs/art/hero/hero-moon-disc.png, last 6 % of the radius) is paler
			rimColor: { value: new Vector3(251 / 255, 236 / 255, 172 / 255) },
			umber: { value: new Vector3(176 / 255, 122 / 255, 40 / 255) }
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
		// Colors stay in sRGB on purpose (texture without color space, no output conversion), so the first frame
		// matches the painted disc image pixel for pixel in tone.
		fragmentShader: /* glsl */ `
			uniform sampler2D map;
			uniform vec3 lightDir;
			uniform vec3 shadowColor;
			uniform vec3 rimColor;
			uniform vec3 umber;
			varying vec2 vUv;
			varying vec3 vNormal;

			void main() {
				vec3 n = normalize(vNormal);
				vec3 albedo = texture2D(map, vUv).rgb;
				float mu = clamp(n.z, 0.0, 1.0);
				vec3 light = normalize(lightDir);
				// Terminator effects fade out towards full moon, where the terminator sits on the limb
				float terminator = 1.0 - smoothstep(0.85, 0.99, light.z);

				// Watercolor terminator: the pigment (darker blooms) makes the edge wobble a little
				float lum = dot(albedo, vec3(0.299, 0.587, 0.114));
				float ndl = dot(n, light) + (lum - 0.78) * 0.22;
				float lit = smoothstep(-0.015, 0.035, ndl);
				// Toon band: a soft second tone before the shadow, like a second wash
				float band = mix(1.0 - 0.14 * terminator, 1.0, smoothstep(0.08, 0.28, ndl));
				vec3 day = albedo * band;
				// Pigment edge along the terminator
				day = mix(day, umber, exp(-pow((ndl - 0.03) / 0.03, 2.0)) * 0.35 * terminator);
				// Pale outer ring, as on the painted disc, so the 2D → 3D crossfade stays quiet
				day = mix(day, rimColor, smoothstep(0.8, 1.0, sqrt(1.0 - mu * mu)) * 0.55);
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

	new TextureLoader().load(moonTexture, (texture: Texture) => {
		texture.colorSpace = NoColorSpace;
		texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
		material.uniforms.map.value = texture;
		textureLoaded = true;
		invalidate();
	});

	$effect(() => {
		(material.uniforms.lightDir.value as Vector3).set(...lightDirection(angle));
		invalidate();
	});

	// Threlte's built-in animation loop runs every display frame; the RafLoop below replaces it.
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
