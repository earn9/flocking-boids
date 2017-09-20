---
layout: post
title:  "Flocking Boids v4"
date:   2017-06-23 13:15:00 +0100
categories: update
---
> TL;DR: [checkout boids flocking v4]({{ "/game03/" | relative_url }})

Done in this version
---

* Loading has been reworked to take advantage of async / await instead of callbacks
* There is now a loading screen that animates while the resources for the main scene are downloading and being setup. 
* Fixed debug lines.
* Animation has been removed for now as it was slowing things down and not adding much value.
