import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const useCheckPasswordStrength = () => {
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  return { checkPasswordStrength };
};

type CheckItem = {
  key: keyof ReturnType<
    ReturnType<typeof useCheckPasswordStrength>["checkPasswordStrength"]
  >["checks"];
  label: string;
  colSpan?: number;
};

const CHECK_ITEMS: CheckItem[] = [
  { key: "length", label: "Phải có ít nhất 8 kí tự" },
  { key: "lowercase", label: "Chứa kí tự thường" },
  { key: "uppercase", label: "Chưa kí tự in hoa" },
  { key: "number", label: "Chứa số" },
  { key: "special", label: "Chứa kí tự đặc biệt", colSpan: 2 },
];

interface CheckPasswordStrengthItemProps {
  item: CheckItem;
  checks: Record<string, boolean>;
}

const CheckPasswordStrengthItem = ({
  item,
  checks,
}: CheckPasswordStrengthItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        checks[item.key] ? "text-green-500" : "text-muted-foreground",
        item.colSpan && `col-span-${item.colSpan}`
      )}
    >
      {checks[item.key] ? (
        <Check className="w-4 h-4" />
      ) : (
        <X className="w-4 h-4" />
      )}
      {item.label}
    </div>
  );
};

interface CheckPasswordStrengthProps {
  password: string;
}

const CheckPasswordStrength = ({ password }: CheckPasswordStrengthProps) => {
  const { checkPasswordStrength } = useCheckPasswordStrength();
  const { checks, score } = checkPasswordStrength(password);
  const strengthPercentage = (score / Object.keys(checks).length) * 100;

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Password Strength</span>
      </div>
      <Progress value={strengthPercentage} className="h-2" />

      <div className="grid grid-cols-2 gap-2 text-sm">
        {CHECK_ITEMS.map((item) => (
          <CheckPasswordStrengthItem
            key={item.key}
            item={item}
            checks={checks}
          />
        ))}
      </div>
    </div>
  );
};
export default CheckPasswordStrength;
