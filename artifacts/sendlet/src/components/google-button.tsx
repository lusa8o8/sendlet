import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoogleButtonProps = ButtonProps & {
  label: string;
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-[18px] w-[18px]">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.56 2.68-3.86 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.69 9c0-.59.1-1.16.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.43 1.33l2.57-2.57C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function GoogleButton({ className, label, ...props }: GoogleButtonProps) {
  return (
    <Button
      type="button"
      className={cn(
        "h-11 w-full justify-center gap-3 rounded-lg border border-[#DADCE0] bg-white px-4 text-sm font-medium text-[#3C4043] shadow-none hover:bg-[#F8FAFF] hover:text-[#3C4043] active:bg-[#F1F3F4]",
        className,
      )}
      {...props}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <GoogleMark />
      </span>
      <span>{label}</span>
    </Button>
  );
}
