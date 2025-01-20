import { RootState } from "@/lib/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type engine = {
  ready: "waiting" | "loading" | "failed" | "ready";
  engine: object;
};

const initialState: engine = {
  ready: "waiting",
  engine: Object,
};

export const engineSlice = createSlice({
  name: "engine",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.ready = "loading";
    },
    setFailed: (state, action: PayloadAction<Error>) => {
      (state.ready = "failed"), (state.engine = action.payload);
    },
    setReady: (state, action: PayloadAction<object>) => {
      (state.ready = "ready"), (state.engine = action.payload);
    },
  },
});

export const { setLoading, setFailed, setReady } = engineSlice.actions;
export const getEngineState = (state: RootState) => state.engine.ready;
export default engineSlice.reducer;
