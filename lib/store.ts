import { configureStore } from "@reduxjs/toolkit";
import EngineReducer from "./features/engine/engineSlice";
import outputArrayReducer  from "./features/engine/outputArraySlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      engine: EngineReducer,
      outputArray: outputArrayReducer,
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
