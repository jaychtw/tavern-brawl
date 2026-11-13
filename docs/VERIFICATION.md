Run node tests/rules.cjs from the repository root. A deterministic simulation uses movement and fire inputs, with time stepped at 60 Hz. It clears 20 targets, dodges the incoming throws, wins the three-hit showdown and enters round two with three stars. Additional checks cover movement boundaries, game over and restart.

The artwork decoded successfully in the production environment. Browser integration, physical touch devices, audio playback and final gameplay appearance require a playtest. Local Chromium's socket creation was denied in the build environment.

A separate Node canvas harness executed the production renderer with decoded WebP assets and simulated UI events. Its checks passed for movement, firing, pause/resume, language and sound settings, high-score storage, game over and replay. The rendered playfield was visually inspected. This check used a simulated DOM.
