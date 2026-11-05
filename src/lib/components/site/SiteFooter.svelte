<!--
	@component
	Footer of the non-home pages (the homepage has the sunrise). Social icons use the same Simple Icons paths as the sunrise.
-->
<script lang="ts">
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import { SOCIAL_ICON_PATHS } from '#lib/home/sections/sunrise/icons.ts';
	import { LEGAL_LINKS } from '#lib/home/sections/sunrise/layout.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	const socials = linkedSocials();
	// TODO(owner): imprint and privacy pages do not exist yet (/kontakt does; same in the sunrise footer).
	// rel="external" keeps the prerender crawler from failing on them; drop it once they exist.
	const legalLabels = { imprint: m.site_footer_imprint, privacy: m.site_footer_privacy, contact: m.site_footer_contact };
	const year = new Date().getFullYear();
</script>

<footer class="site-footer border-t border-border">
	<div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-8 md:grid-cols-2 md:items-end">
		<div class="grid gap-2">
			<a
				href={localizeHref('/')}
				class="-my-2 inline-flex min-h-11 w-fit items-center font-display text-lg font-black tracking-wordmark uppercase"
				aria-label={m.site_nav_wordmark_label()}>SOLO STACK</a
			>
			<p class="text-sm text-muted-foreground">{m.site_footer_tagline()}</p>
			<p class="font-mono text-xs tracking-clock text-muted-foreground tabular-nums">© {year} SOLO STACK</p>
		</div>

		<div class="grid gap-4 md:justify-items-end">
			<nav aria-label={m.site_footer_socials_label()}>
				<ul class="-mx-2 flex flex-wrap gap-0.5 md:justify-end">
					{#each socials as social (social.id)}
						<li>
							<a
								href={social.url}
								target="_blank"
								rel="me noopener"
								title={social.name}
								aria-label={m.site_footer_social_link({ name: social.name })}
								class="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							>
								<svg viewBox="0 0 24 24" class="size-4.5 fill-current" aria-hidden="true" focusable="false"><path d={SOCIAL_ICON_PATHS[social.icon]} /></svg>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
			<nav aria-label={m.site_footer_legal_label()}>
				<ul class="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
					{#each LEGAL_LINKS as link (link.id)}
						<li>
							<a href={localizeHref(link.path)} rel={link.id === 'contact' ? undefined : 'external'} class="inline-flex min-h-11 items-center hover:text-foreground"
								>{legalLabels[link.id]()}</a
							>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</div>
</footer>
