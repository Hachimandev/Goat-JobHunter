'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CallDevicePreferencesState } from '@/lib/features/callDevicePreferencesSlice';
import type { CallDeviceInventory, CallDeviceKind, CallDeviceOption } from '@/services/callRtc/callDeviceUtils';
import { DEFAULT_CALL_DEVICE_VALUE, toCallDeviceSelectValue } from '@/services/callRtc/callDeviceUtils';
import { CallTypeEnum } from '@/types/enum';
import { Camera, Loader2, Mic, Volume2 } from 'lucide-react';

type CallDeviceSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callType: CallTypeEnum;
  devices: CallDeviceInventory;
  preferences: CallDevicePreferencesState;
  isLoading: boolean;
  updatingKind: CallDeviceKind | null;
  onSelectDevice: (kind: CallDeviceKind, deviceId: string | null) => Promise<void> | void;
};

type DeviceSection = {
  kind: CallDeviceKind;
  title: string;
  description: string;
  icon: typeof Mic;
  options: CallDeviceOption[];
  value: string;
  disabled: boolean;
  disabledDescription?: string;
};

export function CallDeviceSettingsDialog({
  open,
  onOpenChange,
  callType,
  devices,
  preferences,
  isLoading,
  updatingKind,
  onSelectDevice,
}: Readonly<CallDeviceSettingsDialogProps>) {
  const sections: DeviceSection[] = [
    {
      kind: 'microphone',
      title: 'Microphone',
      description: 'Nguồn âm thanh bạn gửi vào cuộc gọi.',
      icon: Mic,
      options: devices.microphones,
      value: toCallDeviceSelectValue(preferences.microphoneId),
      disabled: false,
    },
    {
      kind: 'speaker',
      title: 'Loa',
      description: 'Thiết bị phát âm thanh từ người tham gia khác.',
      icon: Volume2,
      options: devices.speakers,
      value: toCallDeviceSelectValue(preferences.speakerId),
      disabled: !devices.supportsSpeakerSelection,
      disabledDescription: 'Trình duyệt này không hỗ trợ đổi loa phát trong cuộc gọi.',
    },
    {
      kind: 'camera',
      title: 'Camera',
      description: 'Thiết bị ghi hình dùng cho cuộc gọi video.',
      icon: Camera,
      options: devices.cameras,
      value: toCallDeviceSelectValue(preferences.cameraId),
      disabled: callType !== CallTypeEnum.VIDEO,
      disabledDescription: 'Camera chỉ áp dụng khi bạn đang ở cuộc gọi video.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cài đặt thiết bị cuộc gọi</DialogTitle>
          <DialogDescription>Chọn microphone, loa và camera cho cuộc gọi hiện tại.</DialogDescription>
        </DialogHeader>

        <FieldGroup className="gap-4">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            const isUpdating = updatingKind === section.kind;
            const isDisabled = isLoading || isUpdating || section.disabled;

            return (
              <Card key={section.kind}>
                <CardHeader className="gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <SectionIcon />
                      </div>
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>

                    {section.disabled ? (
                      <Badge variant="secondary">Không khả dụng</Badge>
                    ) : isUpdating ? (
                      <Badge variant="secondary" className="gap-2">
                        <Loader2 className="animate-spin" />
                        Đang đổi
                      </Badge>
                    ) : (
                      <Badge variant="outline">Đang dùng trong cuộc gọi</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel htmlFor={`${section.kind}-device`}>{section.title}</FieldLabel>
                      <FieldContent>
                        <Select
                          value={section.value}
                          disabled={isDisabled}
                          onValueChange={(value) => {
                            void onSelectDevice(section.kind, value === DEFAULT_CALL_DEVICE_VALUE ? null : value);
                          }}
                        >
                          <SelectTrigger
                            id={`${section.kind}-device`}
                            className="w-full rounded-2xl"
                            aria-label={section.title}
                          >
                            <SelectValue placeholder="Mặc định hệ thống" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value={DEFAULT_CALL_DEVICE_VALUE}>Mặc định hệ thống</SelectItem>
                              {section.options.map((option) => (
                                <SelectItem key={option.deviceId} value={option.deviceId}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        <FieldDescription>
                          {section.disabledDescription ??
                            (section.options.length > 0
                              ? `${section.options.length} thiết bị khả dụng.`
                              : 'Không tìm thấy thiết bị khả dụng, sẽ dùng mặc định hệ thống nếu trình duyệt có thể cấp lại.')}
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            );
          })}
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
