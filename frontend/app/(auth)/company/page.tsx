import { CompanySignupForm } from '@/components/common/company-signup-form';

const CompanySignUp = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-6 lg:p-8 w-full my-8">
      <div className="w-full">
        <CompanySignupForm />
      </div>
    </div>
  );
};

export default CompanySignUp;
