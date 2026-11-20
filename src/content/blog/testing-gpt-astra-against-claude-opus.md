---
# Copy prompts and model outputs: docs/copy/blog/.
title: 'GPT 6.2 Astra and Claude Opus 5.5 Put to the Test'
slug: testing-gpt-astra-against-claude-opus
description: 'I test GPT 6.2 Astra and Claude Opus 5.5 with Blender, SVG, a racing game, Jam Room, and Remotion, with technical details and runtimes.'
summary: 'I compare GPT 6.2 Astra and Claude Opus 5.5 using the same prompts and a clean start. I prefer Astra''s design in Blender and Tokyo, and Opus''s Jam Room controls. Both SVGs run for 24 seconds, and the recorded times correct my impression of Astra''s speed. For everyday work, I would choose Opus first. For 3D and game development, I would try Astra.'
youtubeId: pwAYpa-v4KI
publishedAt: '2026-11-18'
updatedAt: '2026-11-20'
durationSeconds: 527
format: ai-test
chapters:
  - start: 0
    title: 'Intro'
  - start: 27
    title: 'What''s new in Astra'
  - start: 76
    title: 'Minas Tirith in Blender'
  - start: 147
    title: 'SVG animation'
  - start: 194
    title: 'Racing game in Tokyo'
  - start: 282
    title: 'Jam Room with SolidJS'
  - start: 376
    title: 'Video with Remotion'
  - start: 505
    title: 'Final thoughts'
takeaways:
  - 'I prefer Astra''s Minas Tirith design. Both models document checks and revisions to their scenes.'
  - 'Both SVGs run for 24 seconds. My impression in the video that Astra''s animation was longer was wrong.'
  - 'In Tokyo, I prefer Astra''s city and cars, but the controls respond comparatively slowly.'
  - 'I prefer Opus''s Jam Room because participants are easier to tell apart and the cursor looks smoother.'
  - 'Opus was faster at the racing game at around 34 minutes, Astra at Remotion at around 13 minutes. These are individual runs.'
tags:
  - 'GPT Astra'
  - 'Claude Opus'
  - 'Blender'
  - 'SVG'
  - 'SolidJS'
  - 'Remotion'
links:
  - url: https://www.youtube.com/@solostack_dev
    label: 'Solo Stack on YouTube'
transcript:
  - start: 0
    text: 'GPT 6.2 Astra is finally out, and I''ve tested it in game development, Blender, web development and so on, and compared it with Opus 5.5. Let''s take a look at the results.'
  - start: 13
    text: 'With that, welcome to a new video. Today we''re testing GPT Astra 6.2 and comparing it with Opus 5.5.'
  - start: 21
    text: 'I don''t have enough usage left for Fable, but Opus 5.5 is so good. I think this will still be a good test.'
  - start: 27
    text: 'Maybe a quick look at the main changes first. The price has been reduced. It''s now eight dollars for input and 40 dollars for output per million tokens, so the same price as Fable.'
  - start: 36
    text: 'The cache price has also been reduced by 60%, and on Artificial Analysis, the reasoning tokens per task are very, very low again, which is pretty good. I noticed in my own test that the model is very, very fast, simply because it uses fewer tokens while thinking, and the costs look very good too.'
  - start: 55
    text: 'But I don''t know, it''s always hard to say, because you get less usage with Codex than with Claude, but Claude is more expensive, so it roughly balances out. Sometimes it''s hard to say which actually gives you more usage, depending on the model. Otherwise, opinions online are very mixed, but let''s just look at our tests now. We''ll start with Minas Tirith, a castle from The Lord of the Rings.'
  - start: 82
    text: 'I''ll put up an image, and Opus 5.5 and Astra 6.2 have reconstructed it in Blender. I''ve already got the Opus 5.5 version open, and it''s really impressive, very detailed.'
  - start: 98
    text: 'You can see that the tree is correct, as are the buildings and the overall shape. I was very impressed when I saw it.'
  - start: 106
    text: 'I''m curious, because I''ve already seen some very, very good 3D modeling work from 6.2 Astra online. So I''ll quickly open it now.'
  - start: 116
    text: 'So this is Astra''s Blender model of Minas Tirith, and wow. Of course, the colors are better too, which immediately makes it look better, but I have to say, this is really impressive.'
  - start: 129
    text: 'The tree sticks out over the edge a little here, but it''s really impressive. It even put the Minas Tirith logo on the door, the white tree.'
  - start: 140
    text: 'I think we can clearly give this point to Astra, but I sort of expected that, because its 3D modeling looked extremely good. The next test is SVG generation, and as you can see, this is the output from Opus 5.5. This isn''t video or image generation, it''s purely mathematical SVG. It shows the extinction of the dinosaurs, as you can see, and what Opus has done here is really, really impressive.'
  - start: 165
    text: 'I haven''t looked at Astra''s version yet, but I''ve already got it open.'
  - start: 169
    text: 'Let''s take a look now. Oh, okay, we''re already at the end, but I can already see that it looks very, very good.'
  - start: 176
    text: 'Yeah, as for whether the dinosaurs are the best, I''d say they are. It''s definitely longer, you can already see that.'
  - start: 181
    text: 'Maybe not quite as smooth, but I think that''s actually a bit of a preference thing. I might even give the point to Astra.'
  - start: 190
    text: 'That''s hard to say. But let''s just look at the next test.'
  - start: 194
    text: 'Next up, we have a drifting game, or rather a car racing game set in Tokyo, and this is the output from Opus 5.5. Let''s take a look.'
  - start: 205
    text: 'Here''s what it looks like. Very cool in the rain. That''s what the prompt asked for too.'
  - start: 209
    text: 'We have a nitro feature here and can race against the cars. It works well. I couldn''t find any major bugs or anything that doesn''t work, and overall it''s a solid result.'
  - start: 223
    text: 'Let''s look at Astra. I''ve got it open in the next tab. The car models look significantly better.'
  - start: 230
    text: 'I actually think the UI is pretty cool too. I''m usually not a fan of Astra''s UI, but we even have a graphics setting and sound here.'
  - start: 242
    text: 'Actually, we had that with Opus too. Okay, okay, yes, you have to hold Shift to drift.'
  - start: 248
    text: 'The controls are very, well, they respond relatively slowly, but I have to say, I like this one better too. Purely in terms of graphics, it''s another good step up.'
  - start: 261
    text: 'And we even have the legendary parking garage here. Opus has it too, but it doesn''t look anywhere near as cool.'
  - start: 269
    text: 'Drifting around the parking garage like this is really cool. I like it a lot.'
  - start: 274
    text: 'The rain looked a little better with Opus. I''d give the city to Astra, but still, a very, very cool result.'
  - start: 282
    text: 'For another test, we''re looking at a website written in SolidJS with a real time connection, meaning WebSockets. I just wanted to see how the model handles a real time connection, whether it can get everything working, whether it can work with the new framework, or a relatively modern framework, and how it designs the UI.'
  - start: 300
    text: 'This is the output from Opus 5.5. As you can see on the left, I''m in the same session in another tab.'
  - start: 311
    text: 'Functionally, everything works pretty well, so there''s really not much to complain about. It lags a little here and there, but it definitely works.'
  - start: 320
    text: 'I think the UI is fine too, and I''ll open Astra''s version now. So here I have the GPT Astra version open as well. I''d say the UI is worse, or at least I personally don''t like it as much.'
  - start: 333
    text: 'You could create a room up here, and I''ve now joined it. As you can see, when I go to the drums now, the other player''s mouse movement is a little more laggy. It''s also harder to tell them apart because both are basically the same green.'
  - start: 352
    text: 'I personally don''t think that''s very nice, but it does work. The live connections work.'
  - start: 359
    text: 'Both chose Solid 1.9. Maybe I should specify that they should use 2.0, just to make it a bit more interesting and see whether they can actually handle the changes.'
  - start: 372
    text: 'But overall, I''d say both did a good job here. Our final test is video generation with Remotion, a video generation tool, or rather a project where you can generate videos with code. It''s also quite interesting to see how the models perform there.'
  - start: 392
    text: 'Here we have the output from Opus 5.5. The idea is to present the results we''ve seen in this test. Let''s just watch it.'
  - start: 403
    text: 'They also introduced themselves and what they had done throughout. Here''s the SVG we looked at.'
  - start: 410
    text: 'That was quite good. I also always asked them to show the time and how many tokens were used.'
  - start: 416
    text: 'I find that quite interesting to see, and we''ll take a look. There should also be an overview at the end.'
  - start: 421
    text: 'The Tokyo game generally took the longest. I didn''t show this one, but I think it''s a cool test too. They simply generated a tank game where they play against each other and against bots.'
  - start: 432
    text: 'Then we have the Jam Room here. And here''s the overview I wanted to see.'
  - start: 437
    text: 'You can see that Opus 5.5 on High Reasoning took about half an hour on average and used 27 million tokens. And this is Astra''s output.'
  - start: 452
    text: 'Let''s take a look. The beginning looks relatively similar, but I think it''ll end up being quite different.'
  - start: 458
    text: 'Of course, they''re both presenting their results, so in that sense it''s similar. But Astra felt very fast.'
  - start: 465
    text: 'So it says 27 minutes for, well, understandable, 41 minutes for this. Okay, then my estimate was completely wrong.'
  - start: 476
    text: 'Somehow it felt very fast. Right, on the other hand, the Medium model, meaning Medium Reasoning, which is the only one I ran there, took two minutes for the tank game.'
  - start: 485
    text: 'That really was fast. And here we''re looking at the overview again.'
  - start: 489
    text: 'It turns out to be relatively similar after all. I didn''t run Medium for Opus on this tank game.'
  - start: 498
    text: 'So we don''t have a comparison of how long it took. For some reason, we don''t have the tokens here now.'
  - start: 504
    text: 'I think that''s a real shame, but I think I''ll leave it at that now. It''s gotten very late, so I''m uploading the video.'
  - start: 511
    text: 'Thanks for watching. I found the results very interesting.'
  - start: 513
    text: 'If you have any ideas for cool tests, or just ways to improve the whole thing or these current tests, feel free to leave them in the comments and subscribe. See you next time.'
  - start: 525
    text: 'See you then, bye.'
lang: en
translationOf: gpt-6-2-astra-opus-vergleich
generatedBy: gpt-6.1-sol
---

When I try Astra's racing game, the controls feel comparatively sluggish, even though I immediately like its city and cars better. For my comparison, GPT 6.2 Astra and Claude Opus 5.5 both ran with High Reasoning. Both received the same prompts and started in fresh working folders with essentially the same clean environment. I made no manual adjustments to the finished results before trying them.

## Minas Tirith in Blender

Opus already delivers a version of Minas Tirith that I find very impressive. The overall shape, the buildings, and the tree work well together for me. I like Astra's use of color even better. There is also the white tree emblem on the gate, which particularly catches my eye in the video. The large tree extends a little beyond the edge, but overall I still prefer Astra's scene.

Both projects build the scene in Blender using a Python script. The task also includes checking the generated image and then revising the scene. According to Astra's notes, the model checked several camera views and then adjusted the mountain silhouettes and the framing of the main view, among other things. After its preview renders, Opus records adjustments to the rock and lighting.

Astra describes house types with slate roofs, dormers, chapels, and towers, using a small set of repeating floor plans. Opus lists a total of 558 houses and towers on the terraces with various roof types. According to their notes, both could recreate the scene with a script from a fresh Blender session. The practical benefit is that the scene's construction remains in the code.

## Extinction Day as SVG

Extinction Day called for a single animated SVG file, without JavaScript, raster images, or external resources. The dinosaurs, the impact, and the eventual new beginning had to be implemented entirely through the shapes and animations in that file.

In the video, I say that Astra's animation is longer. However, both SVGs have 24 seconds in `data-loop`. My initial impression was wrong. Both show the impact about eleven seconds after the start and later have a small mammal peek out of its burrow. According to their notes, both models checked rendered frames and the transition back to the first frame.

I slightly prefer Astra's design, although the movement may look a little less fluid to me. I also think Opus did a very good job. The longer duration I thought I noticed while watching no longer holds up as a reason for my preference.

## Through Rainy Tokyo

The racing game is called Neon Rain: Tokyo. The task specifies rain, nitro, and explicitly a parking garage whose ramps and roof should form part of the track. Its appearance in both results comes from that shared requirement. The task combines designing the city with creating an environment that actually has to be drivable.

Along with the parking garage, the task calls for a narrow shopping street full of illuminated signs, a large intersection with crosswalks and billboards, and a section beneath an elevated railway where a train should occasionally pass. It also includes three laps, three AI opponents, and slow city traffic. Drifting should fill the nitro meter. This connects vehicle handling with track construction. The narrow street limits room to maneuver, the intersection offers more space, and the curves need to work for drifting.

I particularly like Astra's city, cars, and parking garage. Its interface also appeals to me. When driving, however, the controls respond comparatively slowly, and I hold down Shift to drift. I find the rain more convincing in Opus. During my brief test, I also notice no major bugs or obviously broken features there. I prefer the look of Astra's environment, but the sluggish response bothers me when driving.

## What the Jam Room Should Synchronize

Behind the Jam Room's interface is a shared sequencer with four tracks. Multiple browsers should play the same beat, even if their clocks differ. Tempo changes should take effect at the next bar boundary, and changes need to be merged again after an interruption. Both use Solid 1.9 and WebSockets for this. Solid 2.0 was only an idea for a later test.

In the video, I try the controls in two tabs. In both versions, I can create a room and join a session. I prefer Opus here because I can tell the participants apart more easily and the other person's cursor looks smoother. In Astra, both participants appear in a similar green, and the other pointer's movement also seems more delayed. How much details like these shape my impression of an interface is something I also think about when [building my website with AI agents](/en/blog/building-my-website-with-ai-agents).

Transmitting a mouse pointer tests something different from two beats sounding at the same time. When you move the mouse, the other tab can display the pointer a little later and still schedule the next beat for the shared time. My test in two tabs therefore provides no measurement of audio synchronization and no complete test of conflicts. Both versions estimate the time offset from the server using ping times. In its README, Opus also documents a browser test with two windows that simulates clock offsets of plus five and minus nine seconds. No actual system clocks were changed for this.

## Remotion and the Actual Times

With Remotion, both models were supposed to present their own material from the previous tasks as a clip. The results and associated files were available to them in their respective projects. I also wanted runtimes and token usage displayed so I could compare the effort alongside the visible results.

According to the run log, Opus's racing game footage rendered black at the high graphics setting in Edge running without a visible window, so the model switched to the medium setting for the recording. This happened during production of the trailer. I did not observe this error while playing.

Iron Arena also appears briefly here. Test four called for a bot for a specified simulated tank game, where it competes against other bots. The models programmed their bot's game logic. I found the task less interesting for the video, so it did not get its own demonstration round.

My feeling that Astra had been particularly fast does not consistently match the recorded times. For the racing game, Astra took around 42 minutes and Opus around 34. For Remotion, Astra finished first at around 13 minutes, while Opus needed around 26. Even across these two tasks, which model finished first changes. These numbers are individual measurements from these exact runs with High Reasoning and do not support a general conclusion about which model is faster.

Astra's figures are missing, so I cannot compare token usage.

## What I Would Keep Working With

For almost all everyday tasks, I would choose Opus first. I find its responses more pleasant to read, and overall I also prefer the code it produced. I found Astra's responses harder to read and the collaboration less pleasant. That is my personal impression from working with them, without a systematic code review. For 3D modeling and game development, I would try Astra first based on the results shown.
