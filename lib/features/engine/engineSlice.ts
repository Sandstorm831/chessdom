import { RootState } from "@/lib/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { StockfishEngine } from "@/app/dashboard/chessboard/page";

type engine = {
  ready: "waiting" | "loading" | "failed" | "ready";
  engine: StockfishEngine;
  error: Error | null;
};

const initialState: engine = {
  ready: "waiting",
  engine: {onmessage: () => {}, postMessage: () => {}},
  error: null,
};

export const engineSlice = createSlice({
  name: "engine",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.ready = "loading";
    },
    setFailed: (state, action: PayloadAction<Error>) => {
      state.ready = "failed";
      state.error = action.payload;
    },
    setReady: (state, action: PayloadAction<StockfishEngine>) => {
      state.ready = "ready";
      state.engine = action.payload;
    },
  },
});

export const { setLoading, setFailed, setReady } = engineSlice.actions;
export const getEngineState = (state: RootState) => state.engine.ready;
export const getEngine = (state: RootState) => state.engine.engine;
export default engineSlice.reducer;
