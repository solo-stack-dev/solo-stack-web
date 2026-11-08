---
# Based on the owner interview and verified thread history (2026-11-08); prompts and model outputs: docs/copy/blog/.
title: 'How I Built My Website with AI Agents'
slug: building-my-website-with-ai-agents
description: 'My website built with AI agents: my own design ideas, a familiar stack, seven rounds of critique and about six hours of active personal work.'
summary: 'I built solo-stack.dev with AI agents, taking care of the design direction, setup and key decisions myself. Here I share why the design needed the most revision, what surprised me about the SVG charts and how I estimate my own time spent on the project.'
# TODO(owner): youtubeId, durationSeconds, chapters and final transcript once the video is published.
youtubeId: null
publishedAt: '2026-11-01'
updatedAt: '2026-11-08'
durationSeconds: null
format: project
chapters: []
takeaways:
  - 'The design direction needed the most iterations and my ongoing feedback.'
  - 'I handled the project setup, infrastructure and security decisions myself.'
  - 'Seven rounds of critique helped bring spacing, animations and pages into alignment.'
  - 'Claude surprised me with custom SVG charts for my stats page.'
  - 'My active personal work came to about six hours, probably spread over three to four days.'
tags:
  - 'AI'
  - 'Web Development'
  - 'SvelteKit'
  - 'Design'
  - 'Agents'
links:
  - url: https://svelte.dev/docs/kit
    label: 'SvelteKit Documentation'
  - url: https://developers.cloudflare.com/workers/
    label: 'Cloudflare Workers Documentation'
  - url: https://valibot.dev/
    label: 'Validation with Valibot'
  - url: https://developers.cloudflare.com/turnstile/
    label: 'Cloudflare Turnstile Documentation'
  - url: https://www.youtube.com/@solostack_dev
    label: 'My YouTube Channel'
transcript: []
lang: en
translationOf: meine-website-mit-ai-agenten
generatedBy: gpt-6.1-sol
---

My own website was a chance to build and publish something the way I wanted again. For solo-stack.dev, I worked with AI agents. I supplied the ideas and direction, while the agents handled much of the implementation. The design in particular took a few attempts.

## Why I Wanted to Build the Website

I'm a software developer focused on web development, and I simply enjoy building things. With the changes brought by AI, I also wanted to put my own skills to the test and use my familiar stack in practice. A personal website was a good fit: I can introduce myself online and perhaps encourage others to build something themselves.

I also had two practical goals. I wanted an overview of my social media presence and a contact form for business inquiries. Having my own published project also lets me show the decisions involved in building a personal website. For me, that includes forms and handling input as well as design.

## From Yellow Branding to the Moon

I didn't have the finished design in mind at the start. The starting point was the shade of yellow in my existing branding, which got me thinking about the moon. That also fits with being a night owl who enjoys working on personal projects at night. The owl by the contact form has a personal connection too.

I described my own ideas for image concepts and tried different design directions. I rejected the first drafts because they felt too generic or didn't work together. To me, a personal website can be more playful and a little over the top in places. It took plenty of feedback before the homepage, individual sections and subpages shared a common direction. This part needed the most iterations.

I felt the moon appeared too often across the subpages, and I found it out of place on the stats page. So I asked for trees, silhouettes and an owl as additional motifs within the existing nighttime theme.

## My Tasks and the Agents' Work

I handled the initial project setup entirely myself. That included the tech stack, libraries, Cloudflare, Git and security decisions. I used T3 Code as the interface for working with the agents. I find its ability to combine different models and providers particularly useful. I used Claude for coding, OpenAI GPT Image for images and gpt-6.1-sol for text.

The technical foundation consists of SvelteKit, Svelte, Tailwind CSS and Cloudflare Workers. I was already familiar with this stack before working with AI. For me, it combines performance, a pleasant development experience and a structure that agents can work with well too. My own experience lets me step into the code myself when problems arise. During the project, I reviewed selected important parts of the code.

I like using Git worktrees for parallel work. Larger tasks ran in parallel, especially at the start: some agents worked on the homepage, while others used it to develop the design for the blog and stats page. The agents handled merging the work themselves. I continued to guide the design and theme and gave ongoing feedback.

## Seven Rounds of Critique and Improvement

Once the overall design was established, I went through seven rounds of hill climbing. By that, I mean repeatedly having the current version critically reviewed, addressing the critique and looking at the result again. In each round, a lead agent brought in two more agents to provide critique. They assessed the user interface and usability.

The internal target was for the agents' ratings to exceed 9.5 out of 10. That number served as a guide within the process and, on its own, says little about how you experience the website. In practice, the focus was mainly on consistent spacing, animations and a cohesive design across multiple pages. Design guidelines and linting helped keep things within the requirements and identify inconsistencies.

Before the critique rounds, I had already raised the issue of the homepage section with the drawings blocking scrolling. You can now scroll straight through it while the drawings change automatically.

## The Surprise on the Stats Page

My favorite area is the [stats page](/en/stats). The ideas came from me, while Claude contributed ideas of its own to the layout. I had originally planned to use LayerChart as the charting library. Instead, Claude generated custom SVG charts, and the result was a pleasant surprise. I liked how the implementation turned out for this page.

After a few iterations, I felt the images fitted in well too. I particularly like the silhouettes of me, the tree on the blog page, the owl on the contact page and the tree in the stats section. OpenAI GPT Image was my preferred tool for generating these images. My experience was that the results became more useful to me when I knew what direction I wanted and could describe what I had in mind.

## What Mattered to Me About the Contact Form

The [contact form](/en/kontakt) is intended for business inquiries, so this part was particularly important to me. I also worked through the security decisions here. The form uses Cloudflare Turnstile, with verification taking place on the server. The input is also validated on the server using a Valibot schema.

These are specific decisions involved in implementing a form. With a personal website, it's easy to spend a long time on colors and images, while the processing of an inquiry is less visible. I wanted to set up this part deliberately too. Reviewing selected important parts of the code was my contribution to checking the implementation.

## How Much Time Went Into It

I estimate my own active work at about six hours. That was probably spread over three or four days. The agents ran intermittently when I had time for them, rather than continuously. I can't use that to determine an exact total runtime or make a reliable comparison with a fully manual implementation.

My biggest takeaway is that working with multiple models in T3 Code worked well for me. After the necessary iterations, image generation fitted well into the project. The overall design remained more difficult: it needed my own direction and repeated feedback before the pages worked together. This article is being published before the accompanying video, which I'll add later.
