import { Icons } from "@/utils/icons";

interface PassViewToggleBtnProps<T extends Record<string, boolean>> {
  field: keyof T;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<T>>;
}

const PassViewToggleBtn = <T extends Record<string, boolean>>({
  field,
  showPassword,
  setShowPassword,
}: PassViewToggleBtnProps<T>) => {
  return (
    <button
      type="button"
      onClick={() =>
        setShowPassword((prev: T) => ({
          ...prev,
          [field]: !prev[field],
        }))
      }
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <Icons.Eye className="h-5 w-5 text-foreground" />
      ) : (
        <Icons.EyeOff className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
};

export default PassViewToggleBtn;

// how to use this button

/* <PassViewToggleBtn
  showPassword={showPassword}
  setShowPassword={setShowPassword}
/>; */
