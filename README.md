# Bespoke Games — deployment README

This folder is a standalone static website, not the private development repository.
Open this folder in VS Code and use Live Server on the root `index.html`. Keep the
whole folder together. All application links and asset paths are relative, including
the bundled Phaser 3.80.1 engine. No package installation or API key is needed.

## Exact public-repository contents

Include only these 23 website files, preserving their names and folders:

```text
README.md
index.html
Bespoke-Platformer/index.html
fail safe/index.html
fail safe/assets/calm-ocean.svg
fail safe/assets/coral-reef.svg
fail safe/assets/current-route.svg
fail safe/assets/hidden-lagoon.svg
fail safe/assets/ruins-route.svg
fail safe/assets/submersible.svg
fail safe/assets/surface-route.svg
fail safe/assets/trench-route.svg
fail safe/assets/whale.svg
fail safe/assets/whale-water.svg
fail safe/assets/whirlpool.svg
shared/bespoke-game-request.js
shared/bespoke-story-format.js
shared/bespoke-story-sample.js
shared/bespoke-story-state.js
shared/bespoke-touch-controls.js
stories/song-beneath-glass-reef.story.json
vendor/phaser-3.80.1.min.js
vendor/PHASER-LICENSE.md
```

Do not add secrets, environment files, uploaded images, browser saves, backups,
archives, private notes, test tooling, editor settings, source maps, or a copy of
another repository's Git metadata/history. If publishing later, use a NEW repository;
never make the private development repository public to deploy this copy.
Keep the bundled Phaser copyright notice and license.

## Deployment boundary

Use this folder as the root of a separate public repository and static website.
Upload its contents, not its enclosing folder, so `index.html` stays at the root.
There is no build step. Do not copy the private development repository or change
its visibility. Preparing this folder does not publish or deploy anything.

## Quick verification

- From the root launcher, create `ocean` as an interactive story; use a choice and
  **Back to Bespoke Games**. Import the listed story JSON to play Glass Reef.
- Create `ice castle`, `a challenging space adventure`, and an unsupported theme
  (the default platformer). Review How to Play, move, jump, and retry.
- Check image selection and refresh on the same local address. Images and saves
  stay in that browser; a different address starts with separate browser storage.

The site uses predefined, validated content, not a paid AI-generation service.
No account, telemetry, remote image upload, or backend is included. Uploaded files
and prompts can be retained in local browser storage; do not enter secrets.
Public hosting would reveal the included client-side game code and story content.
A clean-file/secret scan is not a guarantee of security or a full dependency audit.
