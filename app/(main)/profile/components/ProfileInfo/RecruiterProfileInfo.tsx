'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RecruiterResponse } from '@/types/dto';
import { formatDate } from '@/utils/formatDate';
import { getRevertGenderKeyValue } from '@/utils/getRevertEnumKeyValue';
import { capitalize } from 'lodash';

interface RecruiterProfileInfoProps {
  recruiter: RecruiterResponse;
}

export default function RecruiterProfileInfo({ recruiter }: Readonly<RecruiterProfileInfoProps>) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="recruiter-fullName">
            Họ Tên
          </Label>
          <Input
            id="recruiter-fullName"
            value={recruiter.fullName || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>

        <div className="space-y-2">
          <Label className="capitalize" htmlFor="recruiter-username">
            Tên hiển thị
          </Label>
          <Input
            id="recruiter-username"
            value={recruiter.username || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="recruiter-email">
            Email
          </Label>
          <Input
            id="recruiter-email"
            type="email"
            value={recruiter.email || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>

        <div className="space-y-2">
          <Label className="capitalize" htmlFor="recruiter-phone">
            Số Điện Thoại
          </Label>
          <Input
            id="recruiter-phone"
            value={recruiter.phone || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="recruiter-gender">
            Giới tính
          </Label>
          <Input
            id="recruiter-gender"
            type="text"
            value={recruiter.gender ? capitalize(getRevertGenderKeyValue(recruiter.gender)) : 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>

        <div className="space-y-2">
          <Label className="capitalize" htmlFor="recruiter-dob">
            Ngày sinh
          </Label>
          <Input
            id="recruiter-dob"
            value={recruiter.dob ? formatDate(recruiter.dob) : 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="capitalize" htmlFor="recruiter-company-name">
          Công ty
        </Label>
        <Input
          id="recruiter-company-name"
          value={recruiter.company?.name || 'Chưa cập nhật'}
          disabled
          className="rounded-xl text-gray-800"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="recruiter-role-name">
            Vai trò
          </Label>
          <Input
            id="recruiter-role-name"
            value={recruiter.role?.name || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="recruiter-position">
            Vị trí
          </Label>
          <Input
            id="recruiter-position"
            value={recruiter.position || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="capitalize">Địa chỉ</Label>
        {recruiter.addresses && recruiter.addresses.length > 0 ? (
          <div className="space-y-2">
            {recruiter.addresses.map((addr, index) => (
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
        <textarea
          value={recruiter.headline || 'Chưa cập nhật'}
          disabled
          rows={3}
          className="w-full p-3 border border-input rounded-xl bg-white text-gray-800 disabled:bg-muted disabled:text-gray-600 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="capitalize">Bio</Label>
        <textarea
          value={recruiter.bio || 'Chưa cập nhật'}
          disabled
          rows={5}
          className="w-full p-3 border border-input rounded-xl bg-white text-gray-800 disabled:bg-muted disabled:text-gray-600 resize-none"
        />
      </div>
    </div>
  );
}
