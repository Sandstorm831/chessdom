import { configureStore } from "@reduxjs/toolkit";
import EngineReducer, { setFailed } from "./features/engine/engineSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      engine: EngineReducer,
    },
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        serializableCheck: false,
      })
    }
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
