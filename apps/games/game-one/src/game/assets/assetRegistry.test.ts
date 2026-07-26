import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { GAME_ASSETS, REQUIRED_ASSET_KEYS, validateRequiredAssets } from "./assetRegistry";

describe("asset registry", () => {
  it("contains all required Phase 2 and Phase 3 asset entries", () => {
    const validation = validateRequiredAssets();

    expect(validation.valid).toBe(true);
    expect(REQUIRED_ASSET_KEYS).toContain("learnerWalk");
    expect(REQUIRED_ASSET_KEYS).toContain("tilesetWater");
    expect(REQUIRED_ASSET_KEYS).toEqual(
      expect.arrayContaining([
        "npcMissEstelle",
        "npcLoloAmbo",
        "npcMarketVendor",
        "npcBridgeKeeper",
        "mapFragment"
      ])
    );
    expect(GAME_ASSETS.ninjaAdventureLicense.path).toBe(
      "/assets/game/licenses/ninja-adventure-cc0-license.txt"
    );
  });

  it("records verified sprite-sheet dimensions", () => {
    expect(GAME_ASSETS.learnerWalk.metadata).toMatchObject({
      width: 64,
      height: 64,
      frameWidth: 16,
      frameHeight: 16,
      columns: 4,
      rows: 4
    });
    expect(GAME_ASSETS.tilesetNature.metadata).toMatchObject({
      width: 384,
      height: 336,
      frameWidth: 16,
      frameHeight: 16
    });
    expect(GAME_ASSETS.npcMissEstelle.metadata).toMatchObject({
      width: 64,
      height: 16,
      frameWidth: 16,
      frameHeight: 16,
      columns: 4,
      rows: 1
    });
  });

  it("uses isolated atlas regions for village structures", () => {
    const structures = [
      GAME_ASSETS.villageRedHouse,
      GAME_ASSETS.villageLearningHall,
      GAME_ASSETS.villageEastHouse,
      GAME_ASSETS.villageMarketCounter
    ];

    expect(structures.every((asset) => asset.path === "/assets/game/tiles/tileset-house.png")).toBe(true);
    expect(GAME_ASSETS.villageRedHouse.region).toMatchObject({ width: 64, height: 48 });
    expect(GAME_ASSETS.villageLearningHall.region).toMatchObject({ width: 64, height: 48 });
    expect(GAME_ASSETS.villageEastHouse.region).toMatchObject({ width: 64, height: 48 });
    expect(GAME_ASSETS.villageMarketCounter.region).toMatchObject({ width: 64, height: 48 });
  });

  it("points to imported public asset files", () => {
    for (const asset of Object.values(GAME_ASSETS)) {
      expect(existsSync(join(process.cwd(), "public", asset.path.replace(/^\//, "")))).toBe(true);
    }
  });
});
