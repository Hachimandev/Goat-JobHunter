import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import { api } from "../services/api";
import authReducer from "./authSlice";
import callReducer from "./features/callSlice";
import callDevicePreferencesReducer from "./features/callDevicePreferencesSlice";
import chatNotificationReducer from "./chatNotificationSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
  whitelist: ["auth", "chatNotification", "callDevicePreferences"],
};

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  chatNotification: chatNotificationReducer,
  call: callReducer,
  callDevicePreferences: callDevicePreferencesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
