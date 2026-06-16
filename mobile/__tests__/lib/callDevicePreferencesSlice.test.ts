import callDevicePreferencesReducer, {
  setSpeakerEnabled,
  setCameraFacing,
  resetCallDevicePreferences,
  selectSpeakerEnabled,
  selectCameraFacing,
} from "@/lib/features/callDevicePreferencesSlice";
import type { CallDevicePreferencesState } from "@/lib/features/callDevicePreferencesSlice";

type TestRootState = {
  callDevicePreferences: CallDevicePreferencesState;
};

describe("callDevicePreferencesSlice", () => {
  const initialState: CallDevicePreferencesState = {
    speakerEnabled: true,
    cameraFacing: "front",
  };

  describe("initial state", () => {
    it("should have speakerEnabled default to true", () => {
      const state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      expect(state.speakerEnabled).toBe(true);
    });

    it("should have cameraFacing default to front", () => {
      const state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      expect(state.cameraFacing).toBe("front");
    });
  });

  describe("setSpeakerEnabled", () => {
    it("should set speakerEnabled to false", () => {
      const state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      const newState = callDevicePreferencesReducer(state, setSpeakerEnabled(false));
      expect(newState.speakerEnabled).toBe(false);
    });

    it("should set speakerEnabled to true", () => {
      let state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      state = callDevicePreferencesReducer(state, setSpeakerEnabled(false));
      const newState = callDevicePreferencesReducer(state, setSpeakerEnabled(true));
      expect(newState.speakerEnabled).toBe(true);
    });
  });

  describe("setCameraFacing", () => {
    it("should switch cameraFacing to back", () => {
      const state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      const newState = callDevicePreferencesReducer(state, setCameraFacing("back"));
      expect(newState.cameraFacing).toBe("back");
    });

    it("should switch cameraFacing to front", () => {
      let state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      state = callDevicePreferencesReducer(state, setCameraFacing("back"));
      const newState = callDevicePreferencesReducer(state, setCameraFacing("front"));
      expect(newState.cameraFacing).toBe("front");
    });
  });

  describe("resetCallDevicePreferences", () => {
    it("should reset to initial state", () => {
      let state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      state = callDevicePreferencesReducer(state, setSpeakerEnabled(false));
      state = callDevicePreferencesReducer(state, setCameraFacing("back"));

      const newState = callDevicePreferencesReducer(state, resetCallDevicePreferences());
      expect(newState).toEqual(initialState);
    });
  });

  describe("selectors", () => {
    const createMockRootState = (
      callDevicePreferences: ReturnType<typeof callDevicePreferencesReducer>,
    ): TestRootState => ({
      callDevicePreferences,
    });

    it("selectSpeakerEnabled returns correct value", () => {
      const state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      const rootState = createMockRootState(state);
      expect(selectSpeakerEnabled(rootState as any)).toBe(true);
    });

    it("selectCameraFacing returns correct value", () => {
      const state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      const rootState = createMockRootState(state);
      expect(selectCameraFacing(rootState as any)).toBe("front");
    });

    it("selectors reflect updated values", () => {
      let state = callDevicePreferencesReducer(undefined, { type: "unknown" });
      state = callDevicePreferencesReducer(state, setSpeakerEnabled(false));
      state = callDevicePreferencesReducer(state, setCameraFacing("back"));

      const rootState = createMockRootState(state);
      expect(selectSpeakerEnabled(rootState as any)).toBe(false);
      expect(selectCameraFacing(rootState as any)).toBe("back");
    });
  });
});
