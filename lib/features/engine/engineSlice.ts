import { RootState } from "@/lib/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type engine = {
  ready: "waiting" | "loading" | "failed" | "ready";
  error: Error | null;
};

const initialState: engine = {
  ready: "waiting",
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
    setReady: (state) => {
      state.ready = "ready";
    },
  },
});

export const { setLoading, setFailed, setReady } = engineSlice.actions;
export const getEngineState = (state: RootState) => state.engine.ready;
// export const getEngine = (state: RootState) => state.engine.engine;
export default engineSlice.reducer;
