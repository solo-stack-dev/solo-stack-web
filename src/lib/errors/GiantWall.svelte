<!--
	@component
	500 scene: a huge, faceless ink giant slowly rises behind a stone wall, hooks its fingers over the top and peers
	down at a tiny lit studio, where the mascot sits outside and looks up. Layered SVGs that share one 1000 × 800
	coordinate box (`wall.ts`), so the animated layers (head, hands) are separate composited elements over static,
	once-rasterized painted layers. Reduced motion: the final composition, no movement.
-->
<script lang="ts">
	import StarField from '#lib/home/shared/StarField.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import mascot from './assets/error-mascot-sitting.webp?enhanced';
	import room from './assets/error-studio-room.webp?enhanced';
	import { HANDS, STONES, WALL } from './wall.ts';
</script>

<div class="giant-wall" role="img" aria-label={m.error_500_scene_alt()}>
	<!-- Full-width backdrop: sky, crescent, distant hills, water -->
	<div class="sky" aria-hidden="true">
		<StarField density={0.9} brightness={0.85} seed={500} />
		<svg class="backdrop" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice">
			<defs>
				<radialGradient id="gw-crescent-glow">
					<stop offset="0" stop-color="#fcd772" stop-opacity="0.35" />
					<stop offset="1" stop-color="#fcd772" stop-opacity="0" />
				</radialGradient>
				<mask id="gw-crescent">
					<circle cx="660" cy="130" r="46" fill="#fff" />
					<circle cx="682" cy="116" r="42" fill="#000" />
				</mask>
				<linearGradient id="gw-water" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color="#1d1b18" />
					<stop offset="1" stop-color="#0e0f10" />
				</linearGradient>
			</defs>
			<circle cx="655" cy="135" r="150" fill="url(#gw-crescent-glow)" />
			<circle cx="660" cy="130" r="46" fill="#fcd772" mask="url(#gw-crescent)" />
			<path d="M0 820 C120 770 200 760 300 790 C380 760 470 748 560 780 C640 762 720 770 800 800 L800 860 L0 860 Z" fill="#1c1b19" />
			<path d="M0 845 C140 815 260 818 380 838 C470 826 560 828 660 846 L660 870 L0 870 Z" fill="#151514" />
			<rect x="0" y="858" width="1600" height="142" fill="url(#gw-water)" />
			<g fill="#fcd772" opacity="0.5">
				<rect x="200" y="880" width="70" height="2.5" rx="1.2" />
				<rect x="215" y="900" width="46" height="2" rx="1" />
				<rect x="190" y="924" width="90" height="2.5" rx="1.2" />
				<rect x="226" y="950" width="34" height="2" rx="1" />
				<rect x="560" y="890" width="22" height="1.5" rx="0.8" opacity="0.6" />
			</g>
		</svg>
	</div>

	<div class="stage" aria-hidden="true">
		<!-- Ink-wash clouds lit from behind, static (the giant rises in front of them) -->
		<svg class="layer" viewBox="0 0 1000 800">
			<defs>
				<filter id="gw-cloud" x="-20%" y="-30%" width="140%" height="160%">
					<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="5" />
					<feDisplacementMap in="SourceGraphic" scale="22" />
					<feGaussianBlur stdDeviation="1.2" />
				</filter>
			</defs>
			<g filter="url(#gw-cloud)">
				<g fill="#6b5426" opacity="0.55">
					<circle cx="540" cy="300" r="46" />
					<circle cx="590" cy="276" r="58" />
					<circle cx="650" cy="300" r="44" />
					<circle cx="930" cy="250" r="50" />
					<circle cx="980" cy="222" r="62" />
				</g>
				<g fill="#211f1b">
					<circle cx="548" cy="316" r="44" />
					<circle cx="598" cy="296" r="54" />
					<circle cx="656" cy="318" r="40" />
					<rect x="500" y="318" width="190" height="40" rx="20" />
					<circle cx="936" cy="268" r="46" />
					<circle cx="986" cy="244" r="58" />
					<rect x="890" y="270" width="140" height="40" rx="20" />
				</g>
			</g>
		</svg>

		<!-- Giant head with its aura, behind the wall -->
		<svg class="layer giant" viewBox="0 0 1000 800">
			<defs>
				<radialGradient id="gw-aura" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stop-color="#e2a93b" stop-opacity="0.55" />
					<stop offset="0.55" stop-color="#e2a93b" stop-opacity="0.18" />
					<stop offset="1" stop-color="#e2a93b" stop-opacity="0" />
				</radialGradient>
				<radialGradient id="gw-skin" cx="0.4" cy="0.3" r="0.75">
					<stop offset="0" stop-color="#232220" />
					<stop offset="0.6" stop-color="#151516" />
					<stop offset="1" stop-color="#0e0f10" />
				</radialGradient>
				<linearGradient id="gw-rim" x1="0" y1="1" x2="1" y2="0">
					<stop offset="0" stop-color="#fcd772" stop-opacity="0" />
					<stop offset="0.35" stop-color="#fcd772" stop-opacity="0.9" />
					<stop offset="1" stop-color="#fbf3dd" stop-opacity="0.2" />
				</linearGradient>
				<filter id="gw-ink" x="-10%" y="-10%" width="120%" height="120%">
					<feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="9" />
					<feDisplacementMap in="SourceGraphic" scale="16" />
				</filter>
				<filter id="gw-glow" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation="5" />
				</filter>
			</defs>
			<circle class="aura" cx="770" cy="270" r="320" fill="url(#gw-aura)" />
			<g filter="url(#gw-ink)">
				<!-- shoulder and back, sloping away behind the wall -->
				<path d="M820 520 C840 400 900 330 960 318 C1000 310 1030 330 1040 360 L1040 520 Z" fill="#111213" />
				<!-- head, leaning towards the studio -->
				<path d="M596 520 C584 400 600 268 668 190 C716 136 800 118 862 150 C920 180 952 250 950 330 C948 400 930 460 918 520 Z" fill="url(#gw-skin)" />
				<!-- the hint of a jaw turning, no face -->
				<path d="M626 420 C640 470 690 500 744 506" fill="none" stroke="#0b0c0d" stroke-width="10" stroke-linecap="round" opacity="0.6" />
				<path d="M664 262 C690 220 728 196 772 186" fill="none" stroke="#2c2a26" stroke-width="6" stroke-linecap="round" opacity="0.55" />
			</g>
			<path d="M608 410 C600 316 626 236 680 186 C724 146 790 130 850 150" fill="none" stroke="url(#gw-rim)" stroke-width="12" filter="url(#gw-glow)" opacity="0.8" />
			<path d="M608 410 C600 316 626 236 680 186 C724 146 790 130 850 150" fill="none" stroke="url(#gw-rim)" stroke-width="2.5" />
		</svg>

		<!-- The wall -->
		<svg class="layer" viewBox="0 0 1000 800">
			<defs>
				<filter id="gw-rough" x="-5%" y="-5%" width="110%" height="110%">
					<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" />
					<feDisplacementMap in="SourceGraphic" scale="4" />
				</filter>
				<linearGradient id="gw-wall-shade" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stop-color="#0e0f10" stop-opacity="0.55" />
					<stop offset="0.35" stop-color="#0e0f10" stop-opacity="0" />
					<stop offset="1" stop-color="#0e0f10" stop-opacity="0.25" />
				</linearGradient>
				<linearGradient id="gw-wall-moon" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color="#e2a93b" stop-opacity="0.16" />
					<stop offset="1" stop-color="#e2a93b" stop-opacity="0" />
				</linearGradient>
				<radialGradient id="gw-studio-spill" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stop-color="#fcd772" stop-opacity="0.3" />
					<stop offset="1" stop-color="#fcd772" stop-opacity="0" />
				</radialGradient>
			</defs>
			<g filter="url(#gw-rough)">
				<!-- tower end -->
				<path d="M262 356 L322 352 L326 800 L258 800 Z" fill="#1b1a18" />
				<path d="M258 352 L326 348 L328 362 L256 366 Z" fill="#3d372c" />
				<rect x={WALL.left} y={WALL.top} width={WALL.right - WALL.left} height={WALL.bottom - WALL.top} fill="#121314" />
				<path d={STONES[0]} fill="#26241f" />
				<path d={STONES[1]} fill="#2d2a24" />
				<path d={STONES[2]} fill="#211f1c" />
				<!-- moonlit coping -->
				<rect x={WALL.left - 4} y={WALL.top} width={WALL.right - WALL.left + 8} height={WALL.coping} fill="#3d372c" />
				<path d="M{WALL.left - 4} {WALL.top + 1} L{WALL.right} {WALL.top + 1}" stroke="#a88a4a" stroke-width="2" opacity="0.7" />
			</g>
			<rect x={WALL.left} y={WALL.top} width={WALL.right - WALL.left} height={WALL.bottom - WALL.top} fill="url(#gw-wall-shade)" />
			<rect x={WALL.left} y={WALL.top} width={WALL.right - WALL.left} height="120" fill="url(#gw-wall-moon)" />
			<ellipse cx="612" cy="610" rx="190" ry="120" fill="url(#gw-studio-spill)" />
			<!-- hanging vines -->
			<g fill="#25241a">
				<path d="M412 404 C420 440 408 470 418 506 C424 470 432 444 428 404 Z" />
				<path d="M780 404 C792 444 776 498 790 540 C800 492 806 446 800 404 Z" />
				<path d="M974 404 C984 470 968 540 980 600 L1000 600 L1000 404 Z" />
			</g>
		</svg>

		<!-- Fingers hooked over the coping -->
		<svg class="layer hands" viewBox="0 0 1000 800">
			<defs>
				<linearGradient id="gw-finger" gradientUnits="userSpaceOnUse" x1="0" y1="350" x2="0" y2="460">
					<stop offset="0" stop-color="#34302a" />
					<stop offset="0.35" stop-color="#18181a" />
					<stop offset="1" stop-color="#0e0f10" />
				</linearGradient>
				<filter id="gw-ink-soft" x="-5%" y="-5%" width="110%" height="110%">
					<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="21" />
					<feDisplacementMap in="SourceGraphic" scale="4" />
				</filter>
			</defs>
			<g fill="url(#gw-finger)" stroke="#a88a4a" stroke-width="1.4" stroke-opacity="0.5" filter="url(#gw-ink-soft)">
				<path d={HANDS.leftPalm} />
				<path d={HANDS.rightPalm} />
				<path d={HANDS.leftThumb} />
				<path d={HANDS.left} />
				<path d={HANDS.right} />
				<path class="tapper" d={HANDS.tapper} />
			</g>
		</svg>

		<!-- Ledge -->
		<svg class="layer" viewBox="0 0 1000 800">
			<defs>
				<linearGradient id="gw-ledge" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color="#2a2723" />
					<stop offset="0.4" stop-color="#171716" />
					<stop offset="1" stop-color="#0e0f10" />
				</linearGradient>
				<radialGradient id="gw-ground-light" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stop-color="#fcd772" stop-opacity="0.55" />
					<stop offset="1" stop-color="#fcd772" stop-opacity="0" />
				</radialGradient>
				<filter id="gw-rock" x="-5%" y="-5%" width="110%" height="110%">
					<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="12" />
					<feDisplacementMap in="SourceGraphic" scale="10" />
				</filter>
			</defs>
			<g filter="url(#gw-rock)">
				<path d="M1010 810 L1010 686 L860 690 L720 692 L560 688 L450 692 L404 700 L376 716 L360 748 L346 780 L330 810 Z" fill="url(#gw-ledge)" />
				<path d="M404 700 L450 692 L560 688 L720 692 L860 690 L1000 686" fill="none" stroke="#6b5426" stroke-width="3" />
				<path d="M380 740 L420 760 M470 730 L520 770 M760 720 L800 760 M880 730 L930 744" stroke="#0e0f10" stroke-width="3" fill="none" />
			</g>
			<ellipse cx="610" cy="694" rx="150" ry="16" fill="url(#gw-ground-light)" />
		</svg>

		<!-- Studio: painted room through the window, frame drawn over it -->
		<enhanced:img class="room" src={room} alt="" sizes="(min-width: 64rem) 14vw, 30vw" />
		<svg class="layer" viewBox="0 0 1000 800">
			<defs>
				<radialGradient id="gw-lantern" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stop-color="#fcd772" stop-opacity="0.75" />
					<stop offset="1" stop-color="#fcd772" stop-opacity="0" />
				</radialGradient>
			</defs>
			<!-- roof -->
			<path d="M500 548 L522 532 L708 532 L726 548 Z" fill="#2a2723" />
			<rect x="500" y="546" width="226" height="10" fill="#171615" />
			<path d="M500 547 L726 547" stroke="#a88a4a" stroke-width="1.5" opacity="0.6" />
			<!-- frame: posts, sill, mullions -->
			<g fill="#1e1b17">
				<rect x="532" y="556" width="10" height="134" />
				<rect x="684" y="556" width="10" height="134" />
				<rect x="532" y="556" width="162" height="7" />
				<rect x="532" y="676" width="162" height="14" />
				<rect x="606" y="563" width="5" height="113" />
			</g>
			<!-- the wall right of the window -->
			<rect x="694" y="556" width="22" height="134" fill="#2a2723" />
			<rect x="510" y="556" width="22" height="134" fill="#2a2723" />
			<!-- plant pot -->
			<path d="M732 690 L736 670 L758 670 L762 690 Z" fill="#6b4a26" />
			<path d="M746 670 C736 652 728 648 722 642 C736 646 744 652 746 662 C750 648 756 638 768 632 C760 644 754 656 750 670 Z" fill="#3a3a24" />
			<!-- lantern -->
			<circle class="lantern-glow" cx="712" cy="590" r="46" fill="url(#gw-lantern)" />
			<g class="lantern">
				<path d="M712 556 L712 576" stroke="#0e0f10" stroke-width="2" />
				<rect x="705" y="576" width="14" height="20" rx="2" fill="#fcd772" stroke="#1e1b17" stroke-width="2.5" />
				<path d="M703 576 L721 576 L716 571 L708 571 Z" fill="#1e1b17" />
			</g>
		</svg>

		<enhanced:img class="mascot" src={mascot} alt="" sizes="(min-width: 64rem) 10vw, 22vw" />
	</div>
</div>

<style>
	.giant-wall {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background: linear-gradient(to bottom, #0e0f10 0%, #131416 40%, #221f1c 78%, #2a2723 100%);
	}

	.sky {
		position: absolute;
		inset: 0;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* One 5:4 box for the composed scene. Phones: top part, anchored right (giant, studio, mascot sit in its right
	   two thirds). Desktop: full height, anchored right, text sits over the open sky on the left. */
	.stage {
		position: absolute;
		right: 0;
		top: 3svh;
		height: 55svh;
		aspect-ratio: 5 / 4;
		container-type: size;
	}

	@media (min-width: 64rem) {
		.stage {
			top: auto;
			bottom: 0;
			height: min(100svh, 72vw);
		}
	}

	.layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.room {
		position: absolute;
		left: 54.2%;
		top: 70%;
		width: 14.2%;
		height: 15%;
		object-fit: cover;
		object-position: 30% 60%;
		filter: sepia(0.25) saturate(1.1) brightness(1.05);
	}

	.mascot {
		position: absolute;
		left: 40.5%;
		bottom: 12.6%;
		width: auto;
		height: 12.5%;
	}

	.giant {
		transform-origin: 77% 60%;
	}

	.lantern {
		transform-origin: 712px 556px;
		transform-box: view-box;
	}

	.tapper {
		transform-origin: 861px 380px;
		transform-box: view-box;
	}

	@media (prefers-reduced-motion: no-preference) {
		.giant {
			will-change: transform;
			animation:
				peek 3.2s cubic-bezier(0.3, 0.7, 0.2, 1) 0.2s both,
				peer 9s ease-in-out 3.4s infinite;
		}

		.giant .aura {
			animation: pulse 6s ease-in-out 3.4s infinite;
		}

		.hands {
			will-change: transform, opacity;
			animation: grip 0.55s cubic-bezier(0.55, 0, 0.9, 0.5) 2.3s both;
		}

		.tapper {
			animation: tap 7s ease-in-out 4s infinite;
		}

		.lantern {
			animation: swing 2.6s ease-out 2.85s both;
		}

		.lantern-glow {
			animation: flicker 3.4s steps(6, end) infinite;
		}
	}

	@keyframes peek {
		from {
			translate: 0 48%;
			rotate: 3deg;
		}
		60% {
			rotate: -1deg;
		}
	}

	@keyframes peer {
		0%,
		100% {
			translate: 0 0;
			rotate: 0deg;
		}
		40% {
			translate: -0.6% 1.2%;
			rotate: -3deg;
		}
		70% {
			translate: 0 0.4%;
			rotate: -1.5deg;
		}
	}

	@keyframes pulse {
		50% {
			opacity: 0.65;
		}
	}

	@keyframes grip {
		from {
			opacity: 0;
			translate: 0 -9%;
		}
		60% {
			opacity: 1;
		}
	}

	@keyframes tap {
		0%,
		86%,
		100% {
			rotate: 0deg;
		}
		89% {
			rotate: -14deg;
		}
		92% {
			rotate: 0deg;
		}
		95% {
			rotate: -10deg;
		}
	}

	@keyframes swing {
		0% {
			rotate: 0deg;
		}
		12% {
			rotate: 14deg;
		}
		32% {
			rotate: -9deg;
		}
		52% {
			rotate: 5deg;
		}
		72% {
			rotate: -2deg;
		}
		100% {
			rotate: 0deg;
		}
	}

	@keyframes flicker {
		0%,
		100% {
			opacity: 1;
		}
		30% {
			opacity: 0.82;
		}
		55% {
			opacity: 0.94;
		}
		80% {
			opacity: 0.86;
		}
	}
</style>
