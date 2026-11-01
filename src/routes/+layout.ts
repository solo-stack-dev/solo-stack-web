// The whole site is static: every page is prerendered at build time, including the data from `prerender()` remote
// functions (latest video, commits, stats). Blog posts are found by the crawler through the links on /blog (drafts
// are never linked). Server routes set their own option (see src/routes/media/).
export const prerender = true;
