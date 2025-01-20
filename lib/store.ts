import { configureStore } from "@reduxjs/toolkit";
import EngineReducer from "./features/engine/engineSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      engine: EngineReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
