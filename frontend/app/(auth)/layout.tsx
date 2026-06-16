const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen items-center justify-center p-4 bg-primary/5">
      <div className="w-full">{children}</div>
    </div>
  );
};

export default AuthLayout;
