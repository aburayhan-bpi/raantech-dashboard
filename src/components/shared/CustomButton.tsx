// import { cn } from "@/lib/utils";
// import Link from "next/link";

// interface CustomButtonProps {
//   btnText: string;
//   bgColor?: string;
//   btnLink?: string;
//   className?: string;
//   onClick?: () => void;
//   disabled?: boolean;
//   loading?: boolean;
//   variant?: "primary" | "secondary" | "outline" | "ghost";
//   size?: "sm" | "md" | "lg";
// }

// const CustomButton = ({
//   btnText,
//   bgColor,
//   btnLink,
//   className,
//   onClick,
//   disabled = false,
//   loading = false,
//   variant = "primary",
//   size = "md",
// }: CustomButtonProps) => {
//   // Base styles
//   const baseStyles =
//     "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none";

//   // Size styles
//   const sizeStyles = {
//     sm: "px-3 py-1.5 text-sm",
//     md: "px-4 py-2 text-sm",
//     lg: "px-6 py-3 text-base",
//   };

//   // Variant styles
//   const variantStyles = {
//     primary: "bg-[#1B22E5] text-white hover:bg-[#1B22E5]/90 ",
//     secondary: "bg-gray-600 text-white hover:bg-gray-700 ",
//     outline:
//       "border-2 border-[#1B22E5] text-[#1B22E5] hover:bg-[#1B22E5] hover:text-white ",
//     ghost: "text-[#1B22E5] hover:bg-[#1B22E5]/10 ",
//   };

//   // Disabled/loading styles
//   const disabledStyles = "opacity-50 cursor-not-allowed";
//   const loadingStyles = "cursor-wait";

//   // Check if className contains hover classes
//   const hasCustomHover = className && className.includes("hover:bg-");

//   // Add custom hover class when bgColor is used and no custom hover provided
//   const customHoverClass =
//     bgColor && !hasCustomHover ? "hover:brightness-90" : "";

//   // Create background color class for bgColor prop
//   const bgColorClass = bgColor ? `bg-[${bgColor}]` : "";

//   // No inline styles needed - use CSS classes only
//   const customStyle = {};

//   // Combine all styles
//   const buttonStyles = cn(
//     baseStyles,
//     sizeStyles[size],
//     !bgColor && variantStyles[variant],
//     bgColor && bgColorClass, // Apply bgColor as CSS class
//     bgColor && !hasCustomHover && customHoverClass, // Only apply default hover if no custom hover
//     (disabled || loading) && disabledStyles,
//     loading && loadingStyles,
//     className
//   );

//   // Button content with loading state
//   const content = (
//     <>
//       {loading && (
//         <svg
//           className="animate-spin -ml-1 mr-2 h-4 w-4"
//           fill="none"
//           viewBox="0 0 24 24"
//         >
//           <circle
//             className="opacity-25"
//             cx="12"
//             cy="12"
//             r="10"
//             stroke="currentColor"
//             strokeWidth="4"
//           ></circle>
//           <path
//             className="opacity-75"
//             fill="currentColor"
//             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//           ></path>
//         </svg>
//       )}
//       {btnText}
//     </>
//   );

//   // If it's a link
//   if (btnLink) {
//     return (
//       <Link
//         href={btnLink ?? "/"}
//         className={buttonStyles}
//         style={customStyle}
//         onClick={onClick}
//       >
//         {content}
//       </Link>
//     );
//   }

//   // Regular button
//   return (
//     <button
//       className={buttonStyles}
//       style={customStyle}
//       onClick={onClick}
//       disabled={disabled || loading}
//     >
//       {content}
//     </button>
//   );
// };

// export default CustomButton;

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import * as React from "react";

/* 🔥 EXACT shadcn buttonVariants */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface CustomButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  btnText: string | React.ReactNode;
  btnLink?: string;
  loading?: boolean;
  loadingText?: string | React.ReactNode;
  icon?: React.ReactNode;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      btnText,
      btnLink,
      loading = false,
      loadingText,
      variant,
      size,
      className,
      disabled,
      icon,
      ...props
    },
    ref,
  ) => {
    const content = (
      <>
        {loading && (
          <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {loading && loadingText ? (
          loadingText
        ) : (
          <>
            {icon}
            {btnText}
          </>
        )}
      </>
    );

    /* 👉 Link version (same shadcn style) */
    if (btnLink) {
      return (
        // <Link
        //   href={btnLink}
        //   onClick={props.onClick}
        //   className={cn(
        //     buttonVariants({ variant, size }),
        //     loading && "pointer-events-none",
        //     className
        //   )}
        // >
        //   {content}
        // </Link>
        <Link
          href={btnLink}
          className={cn(
            buttonVariants({ variant, size }),
            loading && "pointer-events-none",
            className,
          )}
        />
      );
    }

    /* 👉 Button version */
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  },
);

CustomButton.displayName = "CustomButton";

export default CustomButton;
