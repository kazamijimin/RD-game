import { describe, expect, it, vi } from "vitest";
import { loadGameAssets } from "./loadGameAssets";

describe("loadGameAssets", () => {
  it("registers required sprites with KAPLAY", () => {
    const runtime = {
      loadSprite: vi.fn()
    };

    loadGameAssets(runtime);

    expect(runtime.loadSprite).toHaveBeenCalledWith(
      "learner-walk",
      "/assets/game/characters/learner/villager-walk.png",
      expect.objectContaining({
        sliceX: 4,
        sliceY: 4,
        anims: expect.objectContaining({
          walkDown: expect.objectContaining({ frames: [0, 4, 8, 12] }),
          walkUp: expect.objectContaining({ frames: [1, 5, 9, 13] }),
          walkLeft: expect.objectContaining({ frames: [2, 6, 10, 14] }),
          walkRight: expect.objectContaining({ frames: [3, 7, 11, 15] })
        })
      })
    );
    expect(runtime.loadSprite).toHaveBeenCalledWith(
      "tileset-water",
      "/assets/game/tiles/tileset-water.png",
      expect.objectContaining({ sliceX: 28, sliceY: 17 })
    );
    expect(runtime.loadSprite).toHaveBeenCalledWith(
      "npc-lolo-ambo",
      "/assets/game/characters/npcs/lolo-ambo-idle.png",
      expect.objectContaining({ sliceX: 4, sliceY: 1 })
    );
    expect(runtime.loadSprite).toHaveBeenCalledWith(
      "map-fragment",
      "/assets/game/items/map-fragment.png"
    );
    expect(runtime.loadSprite).toHaveBeenCalledWith(
      "village-learning-hall",
      "/assets/game/tiles/tileset-house.png"
    );
  });

  it("throws a friendly error when sprite loading is unavailable", () => {
    expect(() => loadGameAssets({})).toThrow(/sprite loading is unavailable/i);
  });
});
