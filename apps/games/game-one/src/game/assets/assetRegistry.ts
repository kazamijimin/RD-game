export type SpriteSheetMetadata = {
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
};

export type SpriteRegionMetadata = {
  x: number;
  y: number;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
};

export type GameAsset = {
  key: string;
  path: string;
  sourcePath: string;
  kind: "tileset" | "character" | "prop" | "item" | "license";
  metadata?: SpriteSheetMetadata;
  region?: SpriteRegionMetadata;
};

export const GAME_ASSETS = {
  tilesetFloor: {
    key: "tileset-floor",
    path: "/assets/game/tiles/tileset-floor.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetFloor.png",
    kind: "tileset",
    metadata: {
      width: 352,
      height: 417,
      frameWidth: 16,
      frameHeight: 16,
      columns: 22,
      rows: 26
    }
  },
  tilesetNature: {
    key: "tileset-nature",
    path: "/assets/game/tiles/tileset-nature.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetNature.png",
    kind: "tileset",
    metadata: {
      width: 384,
      height: 336,
      frameWidth: 16,
      frameHeight: 16,
      columns: 24,
      rows: 21
    }
  },
  tilesetWater: {
    key: "tileset-water",
    path: "/assets/game/tiles/tileset-water.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetWater.png",
    kind: "tileset",
    metadata: {
      width: 448,
      height: 272,
      frameWidth: 16,
      frameHeight: 16,
      columns: 28,
      rows: 17
    }
  },
  tilesetVillageAbandoned: {
    key: "tileset-village-abandoned",
    path: "/assets/game/tiles/tileset-village-abandoned.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetVillageAbandoned.png",
    kind: "tileset",
    metadata: {
      width: 320,
      height: 192,
      frameWidth: 16,
      frameHeight: 16,
      columns: 20,
      rows: 12
    }
  },
  learnerIdle: {
    key: "learner-idle",
    path: "/assets/game/characters/learner/villager-idle.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Actor/Character/Villager/SeparateAnim/Idle.png",
    kind: "character",
    metadata: {
      width: 64,
      height: 16,
      frameWidth: 16,
      frameHeight: 16,
      columns: 4,
      rows: 1
    }
  },
  learnerWalk: {
    key: "learner-walk",
    path: "/assets/game/characters/learner/villager-walk.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Actor/Character/Villager/SeparateAnim/Walk.png",
    kind: "character",
    metadata: {
      width: 64,
      height: 64,
      frameWidth: 16,
      frameHeight: 16,
      columns: 4,
      rows: 4
    }
  },
  npcMissEstelle: {
    key: "npc-miss-estelle",
    path: "/assets/game/characters/npcs/miss-estelle-idle.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Actor/Character/Woman/SeparateAnim/Idle.png",
    kind: "character",
    metadata: idleSheetMetadata()
  },
  npcLoloAmbo: {
    key: "npc-lolo-ambo",
    path: "/assets/game/characters/npcs/lolo-ambo-idle.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Actor/Character/OldMan/SeparateAnim/Idle.png",
    kind: "character",
    metadata: idleSheetMetadata()
  },
  npcMarketVendor: {
    key: "npc-market-vendor",
    path: "/assets/game/characters/npcs/market-vendor-idle.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Actor/Character/OldMan2/SeparateAnim/Idle.png",
    kind: "character",
    metadata: idleSheetMetadata()
  },
  npcBridgeKeeper: {
    key: "npc-bridge-keeper",
    path: "/assets/game/characters/npcs/bridge-keeper-idle.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Actor/Character/Master/SeparateAnim/Idle.png",
    kind: "character",
    metadata: idleSheetMetadata()
  },
  mapFragment: {
    key: "map-fragment",
    path: "/assets/game/items/map-fragment.png",
    sourcePath: "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Items/Scroll/Scroll.png",
    kind: "item"
  },
  villageRedHouse: {
    key: "village-red-house",
    path: "/assets/game/tiles/tileset-house.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetHouse.png crop 0,0 64x48",
    kind: "prop",
    region: houseRegion(0, 0)
  },
  villageLearningHall: {
    key: "village-learning-hall",
    path: "/assets/game/tiles/tileset-house.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetHouse.png crop 192,0 64x48",
    kind: "prop",
    region: houseRegion(192, 0)
  },
  villageEastHouse: {
    key: "village-east-house",
    path: "/assets/game/tiles/tileset-house.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetHouse.png crop 128,0 64x48",
    kind: "prop",
    region: houseRegion(128, 0)
  },
  villageMarketCounter: {
    key: "village-market-counter",
    path: "/assets/game/tiles/tileset-house.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetHouse.png crop 256,0 64x48",
    kind: "prop",
    region: houseRegion(256, 0)
  },
  treeRound: {
    key: "tree-round",
    path: "/assets/game/props/tree-round.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetNature.png crop 0,0 32x32",
    kind: "prop"
  },
  treeWide: {
    key: "tree-wide",
    path: "/assets/game/props/tree-wide.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetNature.png crop 0,48 64x32",
    kind: "prop"
  },
  stumpOrange: {
    key: "stump-orange",
    path: "/assets/game/props/stump-orange.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetNature.png crop 32,144 32x16",
    kind: "prop"
  },
  rockSmall: {
    key: "rock-small",
    path: "/assets/game/props/rock-small.png",
    sourcePath:
      "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/Backgrounds/Tilesets/TilesetNature.png crop 160,192 32x16",
    kind: "prop"
  },
  ninjaAdventureLicense: {
    key: "ninja-adventure-cc0-license",
    path: "/assets/game/licenses/ninja-adventure-cc0-license.txt",
    sourcePath: "Ninja Adventure - Asset Pack/Ninja Adventure - Asset Pack/LICENSE.txt",
    kind: "license"
  }
} as const satisfies Record<string, GameAsset>;

export type GameAssetKey = keyof typeof GAME_ASSETS;

export const REQUIRED_ASSET_KEYS = [
  "tilesetFloor",
  "tilesetNature",
  "tilesetWater",
  "tilesetVillageAbandoned",
  "learnerIdle",
  "learnerWalk",
  "npcMissEstelle",
  "npcLoloAmbo",
  "npcMarketVendor",
  "npcBridgeKeeper",
  "mapFragment",
  "villageRedHouse",
  "villageLearningHall",
  "villageEastHouse",
  "villageMarketCounter",
  "treeRound",
  "treeWide",
  "stumpOrange",
  "rockSmall",
  "ninjaAdventureLicense"
] as const satisfies readonly GameAssetKey[];

export function validateRequiredAssets(
  registry: Record<string, GameAsset> = GAME_ASSETS,
  requiredKeys: readonly string[] = REQUIRED_ASSET_KEYS
) {
  const missing = requiredKeys.filter((key) => !registry[key]);
  const incomplete = requiredKeys.filter((key) => {
    const asset = registry[key];
    return asset ? !asset.key || !asset.path || !asset.sourcePath || !asset.kind : false;
  });

  return {
    valid: missing.length === 0 && incomplete.length === 0,
    missing,
    incomplete
  };
}

function idleSheetMetadata(): SpriteSheetMetadata {
  return {
    width: 64,
    height: 16,
    frameWidth: 16,
    frameHeight: 16,
    columns: 4,
    rows: 1
  };
}

function houseRegion(x: number, y: number): SpriteRegionMetadata {
  return { x, y, width: 64, height: 48, sourceWidth: 528, sourceHeight: 368 };
}
