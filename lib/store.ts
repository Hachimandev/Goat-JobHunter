import { api } from '@/services/api';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './features/authSlice';
import sendMailReducer from './features/sendMailSlice';
import blogDetailReducer from './features/blogDetailSlice';
import friendshipReducer from './features/friendshipSlice';
import callReducer from './features/callSlice';
import callDevicePreferencesReducer from './features/callDevicePreferencesSlice';

const persistConfig = {
  key: 'root',
  version: 2,
  storage,
  whitelist: ['auth', 'callDevicePreferences'],
};

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  sendMail: sendMailReducer,
  blogDetail: blogDetailReducer,
  friendship: friendshipReducer,
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
        ignoredActionPaths: ['meta.arg', 'payload', 'meta.baseQueryMeta'],
        ignoredPaths: ['api.mutations', 'api.queries'],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
