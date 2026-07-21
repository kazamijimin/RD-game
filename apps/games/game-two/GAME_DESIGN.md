# Game Two Design Specification

Status: Draft

## Identity

- Permanent game key:
- Display title:
- Intended engine: KAPLAY or PixiJS

## Educational Objective

Describe the skill the game teaches or reinforces and the intended learners.

## Game Loop

Describe the repeated player actions, success condition, failure condition, and
expected session length.

## Controls

Define required touch controls and equivalent mouse behavior. Keyboard controls
may only be optional enhancements.

## Scoring

Define the score formula, valid range, leaderboard modes, difficulty scopes,
ruleset version, and the server evidence used to verify a result.

## Achievements

For every proposed achievement, provide its name and exact unlock criteria.
Permanent keys and fixed display ordering are assigned during integration.

## Save Behavior

State whether progression is meaningful. If it is, define automatic checkpoints,
the one-slot save payload, restart behavior, and save schema version. Otherwise,
state that refresh abandons the current run.

## Assets

List original and third-party assets, licenses, runtime formats, and whether the
game uses the ReaDirect no-original-assets visual starter.

## Interface Typography

Confirm that game menus and chrome inherit Jersey 20 and the shared enlarged
learner type scale, while authored reading content and sustained instructions
use Lexend. Document any gameplay-world text treatment and verify that it does
not introduce a second decorative pixel font or synthesize Jersey 20 weights.

## Database Needs

List the shared game records used and every proposed game-specific table, field,
index, relationship, retention rule, and migration dependency.
