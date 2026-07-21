> [!CAUTION]
> **HARD RULES — READ BEFORE EDITING**
>
> 1. `apps/games/lobby/` is owner-controlled and **must not be changed**.
> 2. Contributors may edit only their assigned game: `game-one` at `/learner/games/game-one` or `game-two` at `/learner/games/game-two`.
> 3. The assigned game's menu must keep its **Back to Lobby** control and the navigation target `/learner/games`. Do not remove, rename, bypass, or change that routing logic.
> 4. Every game is portrait-only and touch-first. Use a 9:16 reference stage on mobile, tablet, and desktop. A desktop display must keep the game centered vertically in a portrait stage; the surrounding page is background only.
> 5. Use only the approved stack. Phaser is prohibited. Do not add another engine, backend, database, deployment target, or package without written project-owner approval.
> 6. Game menus and interface chrome use the shared Jersey 20 pixel typography.
>    Use Lexend only for authored reading content and sustained instructions;
>    do not add another decorative pixel font.

# RD-game contributor starter

This repository is the standalone development and integration skeleton for the
ReaDirect Game Lobby and its maximum of two game modules. It provides a small
local Vite host so contributors can test the real route contract before their
module is merged into ReaDirect.

The production-compatible layout is intentionally preserved:

```text
apps/games/
|-- lobby/       # locked; owner-controlled
|-- game-one/    # contributor slot one
\-- game-two/    # contributor slot two
```

## Create your own game repository

1. Clone this starter:

   ```powershell
   git clone https://github.com/mendezjerick/RD-game.git
   ```

2. Rename the cloned root folder to the name of your game. Use the exact same
   name when creating your new empty GitHub repository.

3. Enter the renamed folder and confirm the location before removing the
   starter repository's Git metadata:

   ```powershell
   Get-Location
   git remote -v
   Remove-Item -LiteralPath .git -Recurse -Force
   ```

   Run the removal only when `Get-Location` shows the renamed game folder. This
   produces an independent repository and prevents contributors from pushing
   to the owner-controlled starter.

4. Initialize and connect the new repository:

   ```powershell
   git init -b main
   git add -A
   git commit -m "Initialize ReaDirect game module"
   git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-ROOT-FOLDER.git
   git push -u origin main
   ```

5. Keep only your assigned game slot under active development. Do not modify
   the lobby or the other contributor's game.

The repository root may have any project name. The internal
`apps/games/<assigned-slot>` path and production route must remain unchanged so
the module can be merged without relocation.

## Install and run locally

Required local tools:

- Git.
- Node.js LTS x64, version 22 or newer.
- Corepack with pnpm `10.34.5`.
- A modern browser with touch emulation for desktop testing.
- PHP `8.3+` and Composer only when implementing the Laravel integration
  module.
- PostgreSQL knowledge for schema design; contributors must not create a
  separate database server for this starter.

From the repository root:

```powershell
corepack enable
corepack pnpm install
corepack pnpm dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The host opens
the locked lobby at `/learner/games`. A game route opened directly will return
to the lobby until a valid local game username has been entered.

Other commands:

```powershell
corepack pnpm typecheck
corepack pnpm build
corepack pnpm preview
```

Copy `.env.example` to `.env.local` only when local API configuration is
needed. `.venv.example` records the expected development toolchain. It is not a
Python virtual environment: Python is not an approved game runtime or backend.

## Approved game technology

Every game uses React and exactly one of these combinations:

```text
React + KAPLAY
React + PixiJS
```

PixiJS is currently pinned by ReaDirect at `8.19.0`. KAPLAY must use the exact
version supplied by the maintainer; never install `latest`, a range, or a
preview version. Phaser must never be installed or used.

The starter intentionally includes no game engine because each contributor
must choose exactly one. After choosing the assigned slot, install only the
approved engine in that package. Example for PixiJS in game one:

```powershell
corepack pnpm --filter @readirect/game-one add --save-exact pixi.js@8.19.0
```

For KAPLAY, replace `<APPROVED_VERSION>` only after the maintainer provides the
pinned version:

```powershell
corepack pnpm --filter @readirect/game-one add --save-exact kaplay@<APPROVED_VERSION>
```

React owns the route, menu, accessible controls, API boundary, and teardown.
The chosen engine owns the main gameplay canvas. Do not use both engines in one
game.

## Where development happens

For game one, begin in:

- `apps/games/game-one/GAME_DESIGN.md`
- `apps/games/game-one/src/GameOneRoutePage.tsx`
- `apps/games/game-one/src/game/`
- `apps/games/game-one/backend/`

For game two, use the corresponding files under `apps/games/game-two/`.

The placeholder route page already contains the mandatory React menu and
portrait host. Replace the placeholder gameplay area, but preserve the menu
entry behavior and Back to Lobby logic. Selecting a game must always open its
menu before gameplay begins. Keep menu, dialog, navigation, loading, error, and
touch-control chrome on the shared `learner-flow-page` design language: Jersey
20 at the enlarged learner scale, semantic design tokens, solid vector shapes,
and hard-edged fake depth. Use Lexend for authored reading targets and sustained
instructions without shrinking the corresponding type token.

Complete `GAME_DESIGN.md` before developing gameplay. It must define the
educational objective, game loop, controls, scoring, achievements, selected
engine, save behavior, interface typography, assets, and database needs.

## Required reading

Read these documents in order before implementation:

1. [Game Module Standard](READIRECT_REVAMP_GAME_MODULE_STANDARD.md) — routes,
   ownership, menu, manifests, saves, achievements, and acceptance checklist.
2. [Game Technology Stack](READIRECT_REVAMP_GAME_TECH_STACK.md) — the complete
   allowed and prohibited game stack.
3. [Game Database and API Standard](READIRECT_REVAMP_GAME_DATABASE_AND_API_STANDARD.md)
   — mandatory identity, PostgreSQL, Laravel, score, checkpoint, leaderboard,
   and migration rules.
4. [Frontend Design System](READIRECT_REVAMP_FRONTEND_DESIGN_SYSTEM.md) —
   buttons, containers, tokens, accessibility, and the main ReaDirect design
   language.
5. [Viewport Standard](READIRECT_REVAMP_VIEWPORT_STANDARD.md) — required mobile,
   tablet, desktop, and portrait validation sizes.
6. [Global Technology Stack](READIRECT_REVAMP_TECH_STACK.md) — the parent
   system's approved technologies and dependency policy.

The database standard is mandatory even if the game has only scores and no
meaningful save. Browser code must never connect directly to PostgreSQL. Game
backend code is a Laravel module that will later run inside the main ReaDirect
API and resolve the authenticated player there.

## Before handing the module back

- The lobby and other game slot have no contributor changes.
- The assigned game opens at its fixed route and starts on its menu.
- Back to Lobby still navigates to `/learner/games`.
- The game remains 9:16 portrait on desktop as well as mobile.
- Touch controls provide every required action.
- Game chrome uses Jersey 20 through the shared semantic font variables, with
  at least `30px` primary-button text on the supported mobile viewport.
- Authored reading content uses Lexend; no replacement decorative pixel font or
  synthetic Jersey 20 weight is bundled.
- `GAME_DESIGN.md` is complete.
- Only React plus one approved game engine is present.
- Assets and their licenses are committed in the required locations.
- Save, score, session, leaderboard, and achievement data follow the database
  standard and never trust a client-supplied identity.
- Type checking, unit/component tests, portrait Playwright tests, and relevant
  Laravel tests pass.
- No secrets, `.env.local`, generated build output, or dependency directories
  are committed.
