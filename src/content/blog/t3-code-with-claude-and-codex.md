---
title: 'Everyday T3 Code with Claude Code and Codex'
slug: t3-code-with-claude-and-codex
description: 'How I use Claude Code and Codex together in T3 Code, gather ideas with Decision Maker and run model tests on an old Linux laptop.'
summary: 'T3 Code brings Claude Code and Codex together in one app for me. I find Decision Maker especially useful for new ideas, along with my old Linux laptop for model tests. I show what I like about using it every day and the two things I still miss.'
youtubeId: k1ogKXVOuOE
publishedAt: '2026-11-22'
durationSeconds: 569
format: ai-test
chapters:
  - start: 0
    title: 'What this is about'
  - start: 50
    title: 'Download and interface'
  - start: 141
    title: 'How Claude and Codex work together'
  - start: 233
    title: 'Providers and subscription limits'
  - start: 292
    title: 'Tasks on another computer with T3 Connect'
  - start: 344
    title: 'Worktrees, pull requests and scheduled tasks'
  - start: 428
    title: 'Threads, browser and Android simulator'
  - start: 490
    title: 'Orca as an alternative'
takeaways:
  - 'With Decision Maker, I bring in agents from different providers through my existing subscriptions to help brainstorm ideas.'
  - 'Claude can hand image generation over to Codex for my game project, and I can follow the handoff in the app.'
  - 'My model tests run through T3 Code on an old Linux laptop while I prepare the video on my main computer.'
  - 'I still want an easier way to set up global skills across multiple AI harnesses and a Markdown preview.'
tags:
  - 'T3 Code'
  - 'Claude Code'
  - 'Codex'
  - 'AI Agents'
  - 'Decision Maker'
links:
  - url: https://t3.codes/
    label: 'T3 Code Website'
  - url: https://github.com/pingdotgg/t3code
    label: 'T3 Code on GitHub'
  - url: https://www.youtube.com/@solostack_dev
    label: 'Solo Stack on YouTube'
transcript:
  - start: 0
    text: 'Have you ever switched back and forth between Claude Code and Codex and wished you could have just one interface?'
  - start: 5
    text: "Then you might want to give T3 Code a chance, and that's what we're looking at in today's video."
  - start: 13
    text: 'And with that, welcome back to a new video.'
  - start: 15
    text: 'Thanks for the feedback on the last video.'
  - start: 17
    text: "I'm still getting used to things and need to adjust a few recording settings, but that's not what today is about."
  - start: 24
    text: 'Today is about T3 Code.'
  - start: 26
    text: "It's software I've really come to love over the last few weeks, and I think my vibe coding has doubled or tripled."
  - start: 33
    text: 'And one reason is this open source software, which was started by the YouTuber Theo, or is maintained by him.'
  - start: 43
    text: 'You can think what you like about that YouTuber, but this software is really, really good, and I think we should take a closer look.'
  - start: 50
    text: "So, let's just take a look at the interface."
  - start: 52
    text: 'If you want to download the software, platform support is very good.'
  - start: 57
    text: "So whether you're on Mac, Linux or Windows, it should run perfectly."
  - start: 62
    text: "I already tested the software in alpha, and it didn't win me over then."
  - start: 66
    text: "Now it's already in beta, and you can see it has something like 13,000 commits and is really well maintained."
  - start: 72
    text: "Of course, his reach also means there are quite a few open pull requests, but that's not what we're here for."
  - start: 78
    text: 'When we look at the software, a few things are different compared with Codex or similar apps, for example.'
  - start: 84
    text: "For one thing, there's the sidebar, which is worlds better, I'd just like to point out."
  - start: 88
    text: 'We have the four different projects here, and you can immediately tell from the abbreviation and the different colors that this thread belongs to this project and that thread belongs to that project.'
  - start: 100
    text: 'And when I open a new thread here, I can select this here, for example, and then choose my provider.'
  - start: 107
    text: "I've already mentioned that you can use various AI subscriptions with it."
  - start: 113
    text: 'And if I now use this one skill and say, "Ask for the next direction for this game," we can immediately see that this thread is under Working.'
  - start: 125
    text: "That means it moves down here, and you can immediately see that it's still working, and then it moves back up as soon as it's done."
  - start: 132
    text: "We'll see that in a moment too."
  - start: 134
    text: 'And the good thing here is that you can also see directly, okay, this one has a GPT thread, that one has a Claude thread.'
  - start: 141
    text: 'I think the real killer feature is simply that Claude can access GPT models and other providers directly in the thread.'
  - start: 150
    text: 'The orchestration feature, basically.'
  - start: 152
    text: "And that's what this skill I just called does."
  - start: 155
    text: "Because this thread will now call various subagents from other providers, and that has an advantage. For example, the project I'm in right now is a game, and Claude can't generate images, for example."
  - start: 171
    text: "That's why my agents.md says to create a subagent, call GPT and have it generate images."
  - start: 178
    text: "And that's a huge advantage."
  - start: 180
    text: 'We can take a look at a thread here, for example.'
  - start: 184
    text: 'Here we have other agents that were called as subagents, and images were generated here for this thread.'
  - start: 194
    text: "Simply because Claude couldn't do it, so it called GPT, and that's a huge advantage because you don't have to switch from one environment to another just to generate images."
  - start: 207
    text: "And it doesn't stop there."
  - start: 208
    text: 'We can take a look.'
  - start: 210
    text: "I have various providers here, not all enabled at the moment, but they include Cursor, OpenCode and Antigravity, and of course they're all available in this selection and for subagents too."
  - start: 222
    text: "I just waited a moment, but here you can see that the subagents were called, and I've run out of Fable usage now, but basically they're all accessible."
  - start: 233
    text: "And I've disabled a few of the providers too, for example."
  - start: 238
    text: "Let's take a look."
  - start: 239
    text: 'Here in Antigravity, I can unfortunately only enable Gemini right now, version 3.8.'
  - start: 245
    text: "Here I have all the old providers that would otherwise show up, but since I don't use them anyway, I've simply hidden them, which is very cool."
  - start: 253
    text: 'And here you get the overviews I wanted to show of your usage, how much allowance you have left and when the limits reset.'
  - start: 261
    text: "I've got five hours left until my Claude resets."
  - start: 264
    text: "I've got two resets left that I can use."
  - start: 267
    text: "One for a Fable reset, and it's really cool to have an overview here."
  - start: 271
    text: 'You can also look at your tokens, your costs, et cetera, et cetera.'
  - start: 275
    text: 'So the interface is really great, and honestly, it won me over straight away.'
  - start: 281
    text: "I think it's so much better than Codex or Claude, especially the sidebar."
  - start: 287
    text: 'There are one or two other competitors doing something similar, and we can touch on those at the end.'
  - start: 292
    text: 'Another cool thing I absolutely have to mention is environments. If you have an old Linux box or Linux laptop sitting around at home like I do, you can add and connect it too, and control threads from here.'
  - start: 306
    text: 'That means I can select this Linux laptop here, for example, and if I open a thread here now, it ends up on that laptop.'
  - start: 313
    text: "And that's cool because, for example, if you want to run something 24/7 and you don't want it running on your PC, it's really convenient to have an isolated environment."
  - start: 326
    text: "That's all handled through T3 Connect, their own solution."
  - start: 330
    text: 'You can already see, this is what it looks like when a thread is finished.'
  - start: 333
    text: 'But you can also set up environments with Tailscale and other things.'
  - start: 340
    text: "So it's all very, very flexible."
  - start: 342
    text: "I didn't go to that trouble myself, though."
  - start: 344
    text: 'There are also a few other cool things I can mention.'
  - start: 348
    text: 'Of course, you can customize the appearance, but what''s especially cool about worktrees is that you can say, "Hey, when worktrees are merged, delete them automatically," or delete the worktree when you settle a thread.'
  - start: 366
    text: "Simply so your PC doesn't fill up with clutter over time."
  - start: 369
    text: "That's how I've set it up for myself."
  - start: 371
    text: "And when you settle a thread, it disappears from down here too, and then it's gone."
  - start: 376
    text: "It's all just done really, really nicely and cleanly, and you can tell that the people using this software are power users who work with it every day. You notice when a bit of love goes into these products."
  - start: 389
    text: "As for source control, there are various providers, all sorts of things are supported, and there's also a cool feature for viewing pull requests directly in the editor."
  - start: 399
    text: 'That means you no longer have to switch environments to look at and review pull requests.'
  - start: 405
    text: "I'll put up a screenshot from Theo's video because I don't have a good example right now."
  - start: 410
    text: 'There are also scheduled tasks, which you might know from other environments like Codex, where I can say, "Hey, add a scheduled task in this thread every half hour to check whether Unreal Engine is still running and everything is working," things like that.'
  - start: 426
    text: 'So, lots of really, really cool things.'
  - start: 428
    text: 'Perhaps the last cool things to mention are that you can simply drag threads around, including between projects, which is pretty cool, and reference them.'
  - start: 438
    text: 'The agent can then look at the thread.'
  - start: 440
    text: "Otherwise, there's the familiar sidebar where you can open a browser too."
  - start: 446
    text: 'Terminals, files.'
  - start: 447
    text: "Nothing special, or nothing too special, but it's all still very, very clean."
  - start: 452
    text: "Of course, there's also the familiar Git diff view where you can look at changes and so on."
  - start: 458
    text: "So it's all there as in other editors, but a little nicer in my opinion."
  - start: 464
    text: "Another thing that's much better than in other apps, though I think Claude has now caught up, is that I already have an Android simulation open here that this agent launched."
  - start: 476
    text: "There'll be a video about this game too, by the way."
  - start: 478
    text: "That will hopefully be published sometime soon, the one I've been working on a bit."
  - start: 482
    text: "So it's also very cool to see that support for mobile development is very, very good."
  - start: 490
    text: "So, let's take a look at one competitor."
  - start: 492
    text: "This isn't going to be a comparison video, simply because I don't have much experience with Orca, which I have open right now, so I can't compare it or really give an opinion on it."
  - start: 504
    text: 'But you can already see on the website that you can call different agents from different providers there too, and it also makes a very good impression.'
  - start: 513
    text: 'I tried it after T3 Code.'
  - start: 515
    text: "So I started with T3 Code, and then I said I'd take a look at Orca too."
  - start: 520
    text: "Unfortunately, it didn't win me over enough to give it a proper, fair chance, but it could certainly be better in many respects, or worse."
  - start: 530
    text: "I simply can't give an opinion on it, but I still wanted to show you that there are a few other alternatives doing something similar."
  - start: 540
    text: "They also use AI subscriptions in the background and basically aren't harnesses themselves, just a UI for those subscriptions."
  - start: 549
    text: "If T3 Code doesn't appeal to you, I'd perhaps give that a chance."
  - start: 553
    text: "I'd say those are the two best known alternatives."
  - start: 556
    text: "Maybe there are a few others too, but I think I'll wrap up the video here."
  - start: 560
    text: "If you have any questions, I'd be happy to make a follow up video or answer them in the comments."
  - start: 566
    text: 'Feel free to join me for the next video, and bye.'
lang: en
translationOf: t3-code-agenten-im-alltag
generatedBy: gpt-6.1-sol
---

When I'm thinking about where to take my game next, having different suggestions helps. And when a new model comes out, I want to start the test and prepare my video while it runs. I now use T3 Code for both. The app brings Claude Code and Codex together in a way that I enjoy working with every day.

## Why I stuck with T3 Code

T3 Code is an open source project started by Theo. I tried the app back in alpha, and it didn't win me over at the time. My impression of the beta in November 2026 is much better. I feel like I've been doing a lot more vibe coding since then too, though that's obviously just my personal impression.

One reason is how easy it is to see what's going on. In the sidebar, I recognize my projects by their colors and abbreviations and can see which thread belongs where. Active threads go under “Working” and move back up once they're finished. When I have several tasks open, that lets me quickly see where work is still happening.

When I create a thread, I choose the provider. That gives me one place for my work with different agents, and I can still tell later whether a thread is running with Claude or a GPT model, for example.

## How I find ideas with Decision Maker

I use my Decision Maker skill for ideas and decisions. It calls agents from different providers through my existing subscriptions and gathers their suggestions. That lets me bring several perspectives into my thinking without starting each request separately in different apps.

In the video, I use it to ask where to take my game next. The agents often come up with quite different ideas, and that range is exactly what helps me decide. I look at which approaches fit the project and what I want to pursue. The skill handles part of the search, and I make the decision myself.

## When Claude brings in Codex

Image generation is another example from my game project. Claude couldn't generate images in the workflow I demonstrated. So I added instructions to my AGENTS.md to call another agent for that and hand the task over to Codex.

In the video, I show a thread where images were created this way. I can see which additional agents were called and what they contributed. Being able to follow that handoff directly in the app makes working with them comfortable for me.

The subscription overview fits nicely with this. In the settings shown, I can see my remaining allowances and the time until the next reset. I've hidden models I don't need to keep the selection manageable. In the video, one of my subscriptions had already run out of allowance, and that was immediately visible too.

## My old Linux laptop handles the model tests

When a new model comes out, I now run my model tests through T3 Code on an old Linux laptop. I select the computer as the environment, start the thread there and prepare the video on my main computer while the test runs. My setup uses T3 Connect for the connection.

The laptop also has very little other code that the agents could use as a reference. That's another reason I keep this test environment separate. You can also see the kinds of tasks I try in model tests in my [comparison of GPT 6.2 Astra and Claude Opus 5.5](/en/blog/testing-gpt-astra-against-claude-opus).

Tailscale is also offered as a way to connect. I haven't set that up myself. For the workflow I show, I use T3 Connect and can control threads on the other computer from the same app.

## Less cleanup after work

When you're working on several tasks, working copies can quickly pile up. That's why I like the settings for worktrees, which are separate working directories for changes to a project. I've enabled automatic cleanup for merged worktrees and when finishing a thread. That means I have to clean up those directories myself less often afterward.

I also mention the pull request view in the video. The example shown comes from Theo's video because I didn't have a suitable example open myself at the time. I show scheduled tasks as another option. Regularly checking whether Unreal Engine is still running is one example of such a task.

## What I still miss in everyday use

I briefly tried Orca after T3 Code. I haven't worked with it enough to make a solid comparison, so I'm just mentioning it here as an alternative. For my work with agents, I currently prefer T3 Code.

There are still two things I miss. I'd like an easier way to set up global skills across different AI harnesses. Especially for a skill like Decision Maker, I want to keep setup as straightforward as possible. I'd also like a Markdown preview so I can comfortably read and check written text directly.
