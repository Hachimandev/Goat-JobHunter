'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalizeWebsiteUrl } from '@/utils/slug';
import { CompanyResponse } from '@/types/dto';

interface CompanyProfileInfoProps {
  company: CompanyResponse;
}

export default function CompanyProfileInfo({ company }: Readonly<CompanyProfileInfoProps>) {
  console.log('Company data in CompanyProfileInfo:', company);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="name">
            Tên Công Ty
          </Label>
          <Input id="name" value={company.name || 'Chưa cập nhật'} disabled className="rounded-xl text-gray-800" />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="email-company">
            Email
          </Label>
          <Input
            id="email-company"
            type="email"
            value={company.email || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="phone-company">
            Số Điện Thoại
          </Label>
          <Input
            id="phone-company"
            value={company.phone || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="industry">
            Lĩnh vực
          </Label>
          <Input
            id="industry"
            value={company.industry || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="size">
            Quy mô
          </Label>
          <Input id="size" value={company.size || 'Chưa cập nhật'} disabled className="rounded-xl text-gray-800" />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="country">
            Quốc gia
          </Label>
          <Input
            id="country"
            value={company.country || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="workingDays">
            Ngày làm việc
          </Label>
          <Input
            id="workingDays"
            value={company.workingDays || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="overtimePolicy">
            Chính sách tăng ca
          </Label>
          <Input
            id="overtimePolicy"
            value={company.overtimePolicy || 'Chưa cập nhật'}
            disabled
            className="rounded-xl text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="capitalize" htmlFor="website">
            Website
          </Label>
          {company.website ? (
            <a
              href={normalizeWebsiteUrl(company.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              {company.website}
            </a>
          ) : (
            <Input id="website" value="Chưa cập nhật" disabled className="rounded-xl text-gray-800" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="capitalize">Địa chỉ</Label>
        {company.addresses && company.addresses.length > 0 ? (
          <div className="space-y-2">
            {company.addresses.map((addr, index) => (
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
        <Label className="capitalize">Mô tả</Label>
        <textarea
          value={company.description || 'Chưa cập nhật'}
          disabled
          rows={6}
          className="w-full p-3 border border-input rounded-xl bg-white text-gray-800 disabled:bg-muted disabled:text-gray-600 resize-none"
        />
      </div>

      {company.awards && company.awards.length > 0 && (
        <div className="space-y-2">
          <Label className="capitalize">Giải thưởng</Label>
          <div className="space-y-2">
            {company.awards.map((award, index) => (
              <Input
                key={index}
                value={`${award.type} - ${award.year}`}
                disabled
                className="rounded-xl text-gray-800"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
