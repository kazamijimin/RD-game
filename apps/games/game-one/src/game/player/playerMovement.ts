import type { Point } from "../physics/collision";
import { canOccupy, clampPointToWorld, type CollisionMap } from "../physics/collision";

export const PLAYER_CONFIG = {
  radius: 12,
  speedPixelsPerSecond: 160
} as const;

export function movePlayer({
  position,
  input,
  deltaSeconds,
  map,
  radius = PLAYER_CONFIG.radius,
  speed = PLAYER_CONFIG.speedPixelsPerSecond,
  isPositionAllowed
}: {
  position: Point;
  input: Point;
  deltaSeconds: number;
  map: CollisionMap;
  radius?: number;
  speed?: number;
  isPositionAllowed?: (position: Point) => boolean;
}) {
  const canMoveTo = (point: Point) => canOccupy(point, radius, map) && (isPositionAllowed?.(point) ?? true);
  const step = {
    x: input.x * speed * deltaSeconds,
    y: input.y * speed * deltaSeconds
  };
  let next = clampPointToWorld({ x: position.x + step.x, y: position.y }, radius, map);

  if (!canMoveTo(next)) {
    next = position;
  }

  const yAttempt = clampPointToWorld({ x: next.x, y: position.y + step.y }, radius, map);
  if (canMoveTo(yAttempt)) {
    next = yAttempt;
  }

  return next;
}

export function getFacingFromInput(input: Point, previousFacing: Facing): Facing {
  if (input.y < 0) {
    return "up";
  }
  if (input.y > 0) {
    return "down";
  }
  if (input.x < 0) {
    return "left";
  }
  if (input.x > 0) {
    return "right";
  }

  return previousFacing;
}

export type Facing = "up" | "down" | "left" | "right";
export type SpriteFacingLayout = "standard" | "yato" | "row-walk" | "row-walk-four-way";

export function getBaseFrameForFacing(facing: Facing, layout: SpriteFacingLayout = "standard") {
  const frames = layout === "yato"
    ? { down: 0, up: 1, left: 3, right: 2 }
    : layout === "row-walk"
      ? { down: 0, up: 8, left: 4, right: 4 }
      : layout === "row-walk-four-way"
        ? { down: 0, up: 8, left: 12, right: 4 }
      : { down: 0, up: 1, left: 2, right: 3 };

  return frames[facing];
}

export function getWalkFrameForFacing(
  facing: Facing,
  animationStep: number,
  layout: SpriteFacingLayout = "standard"
) {
  const clampedStep = Math.max(0, Math.floor(animationStep)) % 4;
  if (layout === "row-walk" || layout === "row-walk-four-way") {
    return getBaseFrameForFacing(facing, layout) + clampedStep;
  }
  return getBaseFrameForFacing(facing, layout) + clampedStep * 4;
}

export function getSwimmingFrameForFacing(
  facing: Facing,
  animationSeconds: number,
  layout: SpriteFacingLayout = "standard",
  moving = true
) {
  if (!moving) return getBaseFrameForFacing(facing, layout);
  return getWalkFrameForFacing(facing, Math.floor(animationSeconds * 5), layout);
}

export function getSwimmingBobOffset(animationSeconds: number, reducedMotion = false) {
  return reducedMotion ? 0 : Math.sin(animationSeconds * 6) * 2;
}

export function getSwimmingStrokeAngle(
  facing: Facing,
  animationSeconds: number,
  moving: boolean,
  reducedMotion = false
) {
  if (reducedMotion) return 0;
  const amplitude = moving
    ? (facing === "left" || facing === "right" ? 4 : 2.5)
    : 0.8;
  return Math.sin(animationSeconds * (moving ? 10 : 4)) * amplitude;
}

export function getSpriteFlipXForFacing(facing: Facing, layout: SpriteFacingLayout = "standard") {
  return layout === "row-walk" && facing === "left";
}

export function getBoatRidingFrame(
  facing: Facing,
  animationSeconds: number,
  moving: boolean,
  layout: SpriteFacingLayout = "standard"
) {
  if (!moving) return getBaseFrameForFacing(facing, layout);

  // The learner's walk cycle becomes a slower rowing rhythm while aboard.
  return getWalkFrameForFacing(facing, Math.floor(animationSeconds * 6), layout);
}
