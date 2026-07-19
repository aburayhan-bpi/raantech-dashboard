// import { cn } from "@/lib/utils";

// interface HeaderTitleProps {
//   title: string;
//   subtitle?: string;
//   titleClassName?: string;
//   subtitleClassName?: string;
//   containerClassName?: string;
//   titleColor?: "primary" | "secondary" | "gray" | "white";
//   titleSize?: "sm" | "md" | "lg" | "xl";
//   alignment?: "left" | "center" | "right";
// }

// const HeaderTitle = ({
//   title,
//   subtitle,
//   titleClassName,
//   subtitleClassName,
//   containerClassName,
//   titleColor = "primary",
//   titleSize = "lg",
//   alignment = "center",
// }: HeaderTitleProps) => {
//   // Title color variants
//   const titleColorClasses = {
//     primary: "text-primary",
//     secondary: "text-subtle",
//     gray: "text-gray-900",
//     white: "text-white",
//   };

//   // Title size variants
//   const titleSizeClasses = {
//     sm: "text-2xl",
//     md: "text-3xl",
//     lg: "text-3xl md:text-4xl",
//     xl: "text-4xl md:text-5xl",
//   };

//   // Alignment classes
//   const alignmentClasses = {
//     left: "text-left",
//     center: "text-center",
//     right: "text-right",
//   };

//   return (
//     <div className={cn("", alignmentClasses[alignment], containerClassName)}>
//       <h2
//         className={cn(
//           "font-bold mb-2",
//           titleSizeClasses[titleSize],
//           titleColorClasses[titleColor],
//           titleClassName,
//         )}
//       >
//         {title}
//       </h2>
//       {subtitle && (
//         <p
//           className={cn(
//             "text-lg text-text-secondary max-w-2xl",
//             alignment === "center" && "mx-auto",
//             alignment === "right" && "ml-auto",
//             subtitleClassName,
//           )}
//         >
//           {subtitle}
//         </p>
//       )}
//     </div>
//   );
// };

// export default HeaderTitle;

// import { cn } from "@/lib/utils";

// interface HeaderTitleProps {
//   title: string;
//   subtitle?: string;
//   highlightedText?: string;
//   titleClassName?: string;
//   subtitleClassName?: string;
//   containerClassName?: string;
//   titleColor?: "primary" | "secondary" | "gray" | "black" | "white";
//   highlightColor?: string;
//   titleSize?: "sm" | "md" | "lg" | "xl";
//   alignment?: "left" | "center" | "right";
// }

// const HeaderTitle = ({
//   title,
//   subtitle,
//   highlightedText,
//   titleClassName,
//   subtitleClassName,
//   containerClassName,
//   titleColor = "black",
//   highlightColor = "text-blue-600",
//   titleSize = "lg",
//   alignment = "left",
// }: HeaderTitleProps) => {
//   const titleColorClasses = {
//     primary: "text-primary",
//     secondary: "text-subtle",
//     gray: "text-gray-600",
//     black: "text-gray-900",
//     white: "text-white",
//   };

//   const titleSizeClasses = {
//     sm: "text-2xl",
//     md: "text-3xl",
//     lg: "text-3xl md:text-4xl lg:text-[40px] leading-[1.2]",
//     xl: "text-4xl md:text-5xl lg:text-6xl",
//   };

//   // Main Alignment Logic
//   const alignmentClasses = {
//     left: "text-left items-start justify-start",
//     center: "text-center items-center justify-center",
//     right: "text-right items-end justify-end",
//   };

//   const renderTitle = () => {
//     if (!highlightedText) return title;

//     // Case-insensitive splitting jeno matching e vul na hoy
//     const parts = title.split(new RegExp(`(${highlightedText})`, "gi"));
//     return parts.map((part, index) =>
//       part.toLowerCase() === highlightedText.toLowerCase() ? (
//         <span key={index} className={cn(highlightColor)}>
//           {part}
//         </span>
//       ) : (
//         part
//       ),
//     );
//   };

//   return (
//     <div
//       className={cn(
//         "flex flex-col w-full",
//         alignmentClasses[alignment],
//         containerClassName,
//       )}
//     >
//       <h2
//         className={cn(
//           "font-bold tracking-tight",
//           titleSizeClasses[titleSize],
//           titleColorClasses[titleColor],
//           titleClassName,
//         )}
//       >
//         {renderTitle()}
//       </h2>

//       {subtitle && (
//         <p
//           className={cn(
//             "text-lg text-gray-500 mt-4 max-w-2xl",
//             // Center ba Right alignment e subtitle er width fix rakhar jonno margin auto
//             alignment === "center" && "mx-auto",
//             alignment === "right" && "ml-auto",
//             subtitleClassName,
//           )}
//         >
//           {subtitle}
//         </p>
//       )}
//     </div>
//   );
// };

// export default HeaderTitle;

import { cn } from "@/lib/utils";

interface HeaderTitleProps {
  title: string;
  subtitle?: string;
  highlightedText?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  containerClassName?: string;
  titleMaxWidth?: string;
  titleColor?: "primary" | "secondary" | "gray" | "black" | "white";
  highlightColor?: string;
  titleSize?: "sm" | "md" | "lg" | "xl";
  alignment?: "left" | "center" | "right";
}

const HeaderTitle = ({
  title,
  subtitle,
  highlightedText,
  titleClassName,
  subtitleClassName,
  containerClassName,
  titleMaxWidth = "max-w-full", // Default
  titleColor = "black",
  highlightColor = "text-brand",
  titleSize = "lg",
  alignment = "left",
}: HeaderTitleProps) => {
  const titleColorClasses = {
    primary: "text-primary",
    secondary: "text-subtle",
    gray: "text-gray-600",
    black: "text-gray-900",
    white: "text-white",
  };

  const titleSizeClasses = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-3xl md:text-4xl lg:text-[40px] leading-[1.1]",
    xl: "text-4xl md:text-5xl lg:text-6xl",
  };

  const alignmentClasses = {
    left: "text-left items-start justify-start",
    center: "text-center items-center justify-center",
    right: "text-right items-end justify-end",
  };

  const renderTitle = () => {
    if (!highlightedText) return title;

    const parts = title.split(new RegExp(`(${highlightedText})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlightedText.toLowerCase() ? (
        <span key={index} className={cn(highlightColor)}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full",
        alignmentClasses[alignment],
        containerClassName,
      )}
    >
      <h2
        className={cn(
          "font-semibold tracking-tight",
          titleSizeClasses[titleSize],
          titleColorClasses[titleColor],
          titleMaxWidth,
          titleClassName,
        )}
      >
        {renderTitle()}
      </h2>

      {subtitle && (
        <p
          className={cn(
            "text-lg text-gray-500 mt-1 max-w-2xl",
            alignment === "center" && "mx-auto",
            alignment === "right" && "ml-auto",
            subtitleClassName,
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HeaderTitle;
