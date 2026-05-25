// Goat-JobHunter-Mobile-FE/lib/features/callDevicePreferencesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

export type CallDevicePreferencesState = {
  speakerEnabled: boolean;
  cameraFacing: "front" | "back";
};

const initialState: CallDevicePreferencesState = {
  speakerEnabled: true,
  cameraFacing: "front",
};

const callDevicePreferencesSlice = createSlice({
  name: "callDevicePreferences",
  initialState,
  reducers: {
    setSpeakerEnabled: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.speakerEnabled = action.payload;
    },
    setCameraFacing: (
      state,
      action: PayloadAction<"front" | "back">,
    ) => {
      state.cameraFacing = action.payload;
    },
    resetCallDevicePreferences: () => initialState,
  },
});

export const {
  setSpeakerEnabled,
  setCameraFacing,
  resetCallDevicePreferences,
} = callDevicePreferencesSlice.actions;

export const selectSpeakerEnabled = (state: RootState) =>
  (state as any).callDevicePreferences.speakerEnabled;
export const selectCameraFacing = (state: RootState) =>
  (state as any).callDevicePreferences.cameraFacing;

export default callDevicePreferencesSlice.reducer;
