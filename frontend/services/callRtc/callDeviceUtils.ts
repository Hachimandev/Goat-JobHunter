'use client';

import AgoraRTC from 'agora-rtc-sdk-ng';
import type { CallDevicePreferencesState } from '@/lib/features/callDevicePreferencesSlice';

export const DEFAULT_CALL_DEVICE_VALUE = '__DEFAULT_CALL_DEVICE__';

export type CallDeviceKind = 'microphone' | 'speaker' | 'camera';

export type CallDeviceOption = {
  deviceId: string;
  label: string;
  kind: CallDeviceKind;
  isDefault: boolean;
};

export type CallDeviceInventory = {
  microphones: CallDeviceOption[];
  speakers: CallDeviceOption[];
  cameras: CallDeviceOption[];
  supportsSpeakerSelection: boolean;
};

export type ResolvedCallDevicePreferences = {
  persisted: CallDevicePreferencesState;
  applied: CallDevicePreferencesState;
  fallbackKinds: CallDeviceKind[];
};

const DEFAULT_DEVICE_LABEL: Record<CallDeviceKind, string> = {
  microphone: 'Microphone',
  speaker: 'Speaker',
  camera: 'Camera',
};

const mapDevices = (devices: MediaDeviceInfo[], kind: CallDeviceKind): CallDeviceOption[] => {
  return devices.map((device, index) => ({
    deviceId: device.deviceId,
    label: device.label?.trim() || `${DEFAULT_DEVICE_LABEL[kind]} ${index + 1}`,
    kind,
    isDefault: device.deviceId === 'default',
  }));
};

const sanitizePersistedPreference = (deviceId: string | null, devices: CallDeviceOption[]): string | null => {
  if (!deviceId) {
    return null;
  }

  return devices.some((device) => device.deviceId === deviceId) ? deviceId : null;
};

export const getExplicitDefaultDeviceId = (devices: CallDeviceOption[]): string | null => {
  return devices.find((device) => device.isDefault)?.deviceId ?? null;
};

export const toCallDeviceSelectValue = (deviceId: string | null): string => {
  return deviceId ?? DEFAULT_CALL_DEVICE_VALUE;
};

export const fromCallDeviceSelectValue = (value: string): string | null => {
  return value === DEFAULT_CALL_DEVICE_VALUE ? null : value;
};

export const createEmptyCallDeviceInventory = (): CallDeviceInventory => ({
  microphones: [],
  speakers: [],
  cameras: [],
  supportsSpeakerSelection: false,
});

export const listCallDevices = async (): Promise<CallDeviceInventory> => {
  const supportsSpeakerSelection =
    typeof window !== 'undefined' &&
    typeof HTMLMediaElement !== 'undefined' &&
    'setSinkId' in HTMLMediaElement.prototype;

  const [microphones, cameras, speakers] = await Promise.all([
    AgoraRTC.getMicrophones(true).catch(() => []),
    AgoraRTC.getCameras(true).catch(() => []),
    supportsSpeakerSelection ? AgoraRTC.getPlaybackDevices(true).catch(() => []) : Promise.resolve([]),
  ]);

  return {
    microphones: mapDevices(microphones, 'microphone'),
    speakers: mapDevices(speakers, 'speaker'),
    cameras: mapDevices(cameras, 'camera'),
    supportsSpeakerSelection,
  };
};

export const resolveCallDevicePreferences = (
  preferences: CallDevicePreferencesState,
  inventory: CallDeviceInventory,
): ResolvedCallDevicePreferences => {
  const persistedMicrophoneId = sanitizePersistedPreference(preferences.microphoneId, inventory.microphones);
  const persistedCameraId = sanitizePersistedPreference(preferences.cameraId, inventory.cameras);
  const persistedSpeakerId = inventory.supportsSpeakerSelection
    ? sanitizePersistedPreference(preferences.speakerId, inventory.speakers)
    : null;

  const persisted: CallDevicePreferencesState = {
    microphoneId: persistedMicrophoneId,
    cameraId: persistedCameraId,
    speakerId: persistedSpeakerId,
  };

  const applied: CallDevicePreferencesState = {
    microphoneId: persistedMicrophoneId ?? getExplicitDefaultDeviceId(inventory.microphones),
    cameraId: persistedCameraId ?? getExplicitDefaultDeviceId(inventory.cameras),
    speakerId: inventory.supportsSpeakerSelection
      ? persistedSpeakerId ?? getExplicitDefaultDeviceId(inventory.speakers)
      : null,
  };

  const fallbackKinds: CallDeviceKind[] = [];
  if (preferences.microphoneId && !persistedMicrophoneId) {
    fallbackKinds.push('microphone');
  }
  if (preferences.cameraId && !persistedCameraId) {
    fallbackKinds.push('camera');
  }
  if (preferences.speakerId && !persistedSpeakerId) {
    fallbackKinds.push('speaker');
  }

  return {
    persisted,
    applied,
    fallbackKinds,
  };
};
