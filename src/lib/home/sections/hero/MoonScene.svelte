<!--
	@component
	STUB (Phase 0): proves Threlte loads as a lazy chunk. The hero agent replaces it with the painted, rotating moon
	with phases (docs/HANDOFF-HOMEPAGE.md §5.1). `renderMode="on-demand"` renders only when something changes.
-->
<script lang="ts">
	import { Canvas, T } from '@threlte/core';
</script>

<Canvas renderMode="on-demand">
	<T.PerspectiveCamera makeDefault position={[0, 0, 4]} fov={40} />
	<T.AmbientLight intensity={0.15} />
	<T.DirectionalLight position={[3, 1.5, 3]} intensity={2.4} />
	<T.Mesh>
		<T.SphereGeometry args={[1.3, 64, 32]} />
		<T.MeshToonMaterial color="#fcd772" />
	</T.Mesh>
</Canvas>
