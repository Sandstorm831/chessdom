import { RootState } from "@/lib/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type outputArray = string[];

const initialState: outputArray = [];

export const outputArraySlice = createSlice({
  name: "stockfishOutput",
  initialState,
  reducers: {
    clearArray: (state) => {
      state.length = 0;
    },
    pushResponse: (state, action: PayloadAction<string>) => {
        state.push(action.payload)
    },
    concatResponseArray: (state, action: PayloadAction<string[]>) => {
        state = state.concat(action.payload);
    },
  },
});

export const { clearArray, pushResponse, concatResponseArray } = outputArraySlice.actions;
export const getResponseArray = (state: RootState) => state.outputArray;
export const getLatestResponse = (state: RootState) => state.outputArray[state.outputArray.length - 1]
export default outputArraySlice.reducer;
