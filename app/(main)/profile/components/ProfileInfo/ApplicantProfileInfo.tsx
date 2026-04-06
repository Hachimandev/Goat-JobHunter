'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApplicantResponse } from '@/types/dto';
import { formatDate } from '@/utils/formatDate';
import { getRevertGenderKeyValue } from '@/utils/getRevertEnumKeyValue';
import { capitalize } from 'lodash';

interface ApplicantProfileInfoProps {
  applicant: ApplicantResponse;
}

export default function ApplicantProfileInfo({ applicant }: Readonly<ApplicantProfileInfoProps>) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-fullName">
            Họ Tên
          </Label>
          <Input
            id="applicant-fullName"
            value={applicant.fullName || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>

        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-username">
            Tên hiển thị
          </Label>
          <Input
            id="applicant-username"
            value={applicant.username || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-email">
            Email
          </Label>
          <Input
            id="applicant-email"
            type="email"
            value={applicant.email || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>

        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-phone">
            Số Điện Thoại
          </Label>
          <Input
            id="applicant-phone"
            value={applicant.phone || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-gender">
            Giới tính
          </Label>
          <Input
            id="applicant-gender"
            type="text"
            value={applicant.gender ? capitalize(getRevertGenderKeyValue(applicant.gender)) : 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>

        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-dob">
            Ngày sinh
          </Label>
          <Input
            id="applicant-dob"
            value={applicant.dob ? formatDate(applicant.dob) : 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-role-name">
            Vai trò
          </Label>
          <Input
            id="applicant-role-name"
            value={applicant.role?.name || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-available-status">
            Trạng thái hồ sơ
          </Label>
          <Input
            id="applicant-available-status"
            value={applicant.availableStatus ? 'Công khai' : 'Đang ẩn'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-education">
            Học vấn
          </Label>
          <Input
            id="applicant-education"
            value={applicant.education ? capitalize(applicant.education) : 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="applicant-level">
            Trình độ
          </Label>
          <Input
            id="applicant-level"
            value={applicant.level ? capitalize(applicant.level) : 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="capitalize">Địa chỉ</Label>
        {applicant.addresses && applicant.addresses.length > 0 ? (
          <div className="space-y-2">
            {applicant.addresses.map((addr, index) => (
              <Input
                key={addr.addressId || index}
                value={`${addr.province} - ${addr.fullAddress}`}
                disabled
                className="rounded-xl text-gray-800"
              />
            ))}
          </div>
        ) : (
          <Input value="Chưa cập nhật" disabled className="rounded-xl text-gray-800" />
        )}
      </div>

      <div className="space-y-2">
        <Label className="capitalize">Headline</Label>
        <Textarea
          value={applicant.headline || 'Chưa cập nhật'}
          disabled
          rows={3}
          className="w-full p-3 border border-input rounded-xl bg-white text-gray-800 disabled:bg-muted disabled:text-gray-600 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="capitalize">Bio</Label>
        <Textarea
          value={applicant.bio || 'Chưa cập nhật'}
          disabled
          rows={5}
          className="w-full p-3 border border-input rounded-xl bg-white text-gray-800 disabled:bg-muted disabled:text-gray-600 resize-none"
        />
      </div>
    </div>
  );
}
