'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRevertGenderKeyValue } from '@/utils/getRevertEnumKeyValue';
import { capitalize } from 'lodash';
import { Edit2 } from 'lucide-react';
import { useState } from 'react';
import UserForm from '@/app/(main)/profile/components/ProfileInfo/UserForm';
import CompanyUserForm from '@/app/(main)/profile/components/ProfileInfo/CompanyUserForm';
import CompanyProfileInfo from '@/app/(main)/profile/components/ProfileInfo/CompanyProfileInfo';
import ErrorMessage from '@/components/common/ErrorMessage';
import { formatDate } from '@/utils/formatDate';
import { useUser } from '@/hooks/useUser';
import { ApplicantResponse, RecruiterResponse, CompanyResponse, MeResponse } from '@/types/dto';
import { isApplicantResponse, isRecruiterResponse, isCompanyResponse } from '@/utils/slug';

export default function ProfileInfo() {
  const [showModal, setShowModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const { user } = useUser();

  if (!user) {
    return <ErrorMessage message={'Không tìm thấy thông tin người dùng.'} />;
  }

  const me = user as MeResponse;
  const isApplicant = isApplicantResponse(me);
  const isRecruiter = isRecruiterResponse(me);
  const isCompany = isCompanyResponse(me);

  const userPersonal = !isCompany ? (me as ApplicantResponse | RecruiterResponse) : null;

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Thông Tin Tài Khoản</h2>
          <Button
            onClick={() => {
              if (isCompany) {
                setShowCompanyModal(true);
              } else {
                setShowModal(true);
              }
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            <Edit2 className="h-4 w-4" />
            Cập Nhật
          </Button>
        </div>

        <div className="space-y-4">
          {!isCompany && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="capitalize" htmlFor="fullName">
                    Họ Tên
                  </Label>
                  <Input
                    id="fullName"
                    value={userPersonal?.fullName || 'Chưa cập nhật'}
                    disabled
                    className="rounded-xl text-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="capitalize" htmlFor="username">
                    Tên hiển thị
                  </Label>
                  <Input
                    id="username"
                    value={userPersonal?.username || 'Chưa cập nhật'}
                    disabled
                    className="rounded-xl text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="capitalize" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userPersonal?.email || 'Chưa cập nhật'}
                    disabled
                    className="rounded-xl text-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="capitalize" htmlFor="phone">
                    Số Điện Thoại
                  </Label>
                  <Input
                    id="phone"
                    value={userPersonal?.phone || 'Chưa cập nhật'}
                    disabled
                    className="rounded-xl text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="capitalize" htmlFor="gender">
                    Giới tính
                  </Label>
                  <Input
                    id="gender"
                    type="text"
                    value={
                      userPersonal?.gender ? capitalize(getRevertGenderKeyValue(userPersonal.gender)) : 'Chưa cập nhật'
                    }
                    disabled
                    className="rounded-xl text-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="capitalize" htmlFor="dob">
                    Ngày sinh
                  </Label>
                  <Input
                    id="dob"
                    value={userPersonal?.dob ? formatDate(userPersonal.dob) : 'Chưa cập nhật'}
                    disabled
                    className="rounded-xl text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="capitalize">Địa chỉ</Label>
                {userPersonal?.addresses && userPersonal.addresses.length > 0 ? (
                  <div className="space-y-2">
                    {userPersonal.addresses.map((addr, index) => (
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
            </>
          )}

          {isCompany && <CompanyProfileInfo company={me as CompanyResponse} />}

          {isApplicant && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="capitalize" htmlFor="level">
                  Trình độ
                </Label>
                <Input
                  id="level"
                  value={capitalize(me.level) || 'Chưa cập nhật'}
                  disabled
                  className="rounded-xl text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="capitalize" htmlFor="education">
                  Học Vấn
                </Label>
                <Input
                  id="education"
                  type="text"
                  value={capitalize(me.education) || 'Chưa cập nhật'}
                  disabled
                  className="rounded-xl text-gray-800"
                />
              </div>
            </div>
          )}

          {isRecruiter && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="capitalize" htmlFor="position">
                  Vị trí
                </Label>
                <Input
                  id="position"
                  value={me.position || 'Chưa cập nhật'}
                  disabled
                  className="rounded-xl text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="capitalize" htmlFor="company">
                  Công ty
                </Label>
                <Input
                  id="company"
                  value={me.company?.name || 'Chưa cập nhật'}
                  disabled
                  className="rounded-xl text-gray-800"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
      {isCompany ? (
        <CompanyUserForm open={showCompanyModal} onOpenChange={setShowCompanyModal} profile={me as CompanyResponse} />
      ) : (
        <UserForm
          open={showModal}
          onOpenChange={setShowModal}
          profile={userPersonal as ApplicantResponse | RecruiterResponse}
        />
      )}
    </>
  );
}
