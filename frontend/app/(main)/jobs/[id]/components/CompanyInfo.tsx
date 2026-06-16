import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { Company } from '@/types/model';
import Link from 'next/link';
import { slugify } from '@/utils/slug';

interface CompanyInfoProps {
    company: Company;
}

const CompanyInfo = ({ company }: CompanyInfoProps) => {
    const [imageError, setImageError] = useState(false);

    const hasAvatar = useMemo(() => company.logo && !imageError, [company, imageError]);

    return (
        <Link
            href={`/companies/${slugify(company.name)}`}
            title={'Xem thông tin coong ty'}
            className="flex items-center gap-3 px-6"
        >
            {hasAvatar ? (
                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    <Image
                        src={company.logo || '/placeholder.svg'}
                        alt={company.name || 'Công ty'}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <div className="h-12 w-12 rounded-full bg-muted shrink-0 flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                </div>
            )}

            <div className="flex flex-col space-y-1 min-w-0">
                <p className="text-sm font-semibold leading-none truncate">{company.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{company.email}</p>
            </div>
        </Link>
    );
};
export default CompanyInfo;
