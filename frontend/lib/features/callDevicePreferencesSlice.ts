import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store';

export type CallDevicePreferenceKey = 'microphoneId' | 'speakerId' | 'cameraId';

export type CallDevicePreferencesState = {
  microphoneId: string | null;
  speakerId: string | null;
  cameraId: string | null;
};

const initialState: CallDevicePreferencesState = {
  microphoneId: null,
  speakerId: null,
  cameraId: null,
};

const callDevicePreferencesSlice = createSlice({
  name: 'callDevicePreferences',
  initialState,
  reducers: {
    setCallDevicePreference: (
      state,
      action: PayloadAction<{
        key: CallDevicePreferenceKey;
        deviceId: string | null;
      }>,
    ) => {
      state[action.payload.key] = action.payload.deviceId;
    },
    setCallDevicePreferences: (state, action: PayloadAction<Partial<CallDevicePreferencesState>>) => {
      if (Object.prototype.hasOwnProperty.call(action.payload, 'microphoneId')) {
        state.microphoneId = action.payload.microphoneId ?? null;
      }

      if (Object.prototype.hasOwnProperty.call(action.payload, 'speakerId')) {
        state.speakerId = action.payload.speakerId ?? null;
      }

      if (Object.prototype.hasOwnProperty.call(action.payload, 'cameraId')) {
        state.cameraId = action.payload.cameraId ?? null;
      }
    },
    resetCallDevicePreferences: () => initialState,
  },
});

export const { setCallDevicePreference, setCallDevicePreferences, resetCallDevicePreferences } =
  callDevicePreferencesSlice.actions;

const selectCallDevicePreferencesState = (state: RootState) => state.callDevicePreferences;

export const selectCallDevicePreferences = createSelector(
  selectCallDevicePreferencesState,
  (state) => state,
);

export default callDevicePreferencesSlice.reducer;
