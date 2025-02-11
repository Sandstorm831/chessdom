import { StockfishEngine } from "./dashboard/chessboard/page";
import { parentPGN } from "./dashboard/reviewgame/page";

export type engineX = {
  stockfishEngine: StockfishEngine | null;
};

export const EngineX: engineX = { stockfishEngine: null };
export const TheParentPGN: parentPGN = { PGN: "" };
