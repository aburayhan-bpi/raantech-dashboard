import { cn } from "@/lib/utils";
import { Icons } from "@/utils/icons";
import { Skeleton } from "../ui/skeleton";

type StatsCardVariant = "filled" | "outlined";

interface StatsCardProps {
  title: string;
  icon: keyof typeof Icons;
  value?: string | number;
  valueText?: string;
  iconColor?: string;
  iconBgColor?: string;
  accentBorderColor?: string;
  cardClass?: string;
  contentClass?: string;
  headerClass?: string;
  valueClass?: string;
  valueTextClass?: string;
  titleClass?: string;
  iconWrapperClass?: string;
  iconClass?: string;
  skeletonClass?: string;
  variant?: StatsCardVariant;
  isLoading?: boolean;
  subText?: string;
  subTextNode?: React.ReactNode;
}

const variantStyles: Record<
  StatsCardVariant,
  {
    card: string;
    content: string;
    value: string;
    valueText: string;
    title: string;
    iconWrapper: string;
    icon: string;
    skeleton: string;
  }
> = {
  filled: {
    card: "bg-linear-to-br from-card to-brand text-white shadow-lg shadow-brand/20 border border-brand/15 rounded-lg",
    content: "",
    value: "text-white",
    valueText: "text-white/80",
    title: "text-white/75",
    iconWrapper: "rounded-lg bg-white/15 backdrop-blur-sm",
    icon: "text-white",
    skeleton: "bg-white/25",
  },
  outlined: {
    card: "bg-white text-foreground border-t border-r border-b border-solid border-l-2 shadow-[0px_0px_5px_rgba(0,0,0,0.1)] rounded-lg",
    content: "",
    value: "text-foreground",
    valueText: "text-foreground",
    title: "text-[#424242]",
    iconWrapper: "rounded-lg p-0",
    icon: "text-white",
    skeleton: "bg-soft-white",
  },
};

const StatsCard = ({
  title,
  icon,
  value,
  valueText,
  iconColor,
  iconBgColor,
  accentBorderColor,
  cardClass,
  contentClass,
  headerClass,
  valueClass,
  valueTextClass,
  titleClass,
  iconWrapperClass,
  iconClass,
  skeletonClass,
  variant = "outlined",
  isLoading,
  subText,
  subTextNode,
}: StatsCardProps) => {
  const DynamicIcon = Icons[icon];
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "flex flex-col justify-between p-4 transition-colors duration-200",
        styles.card,
        variant === "outlined" && accentBorderColor,
        cardClass,
      )}
    >
      <div
        className={cn(
          "flex items-start justify-between gap-4 py-2",
          styles.content,
          contentClass,
        )}
      >
        {isLoading ? (
          <div className="flex flex-col gap-1">
            <Skeleton
              className={cn("h-5 w-36", styles.skeleton, skeletonClass)}
            />
            <Skeleton
              className={cn("h-8 w-28", styles.skeleton, skeletonClass)}
            />
          </div>
        ) : (
          <div className={cn("flex flex-col gap-1", headerClass)}>
            <p
              className={cn(
                "text-[16px] font-normal leading-6.5",
                styles.title,
                titleClass,
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                "text-[24px] font-semibold leading-[1.2] tracking-tight",
                styles.value,
                valueClass,
              )}
            >
              {value}
              {valueText && (
                <span
                  className={cn(
                    "ml-1 text-base font-semibold",
                    styles.valueText,
                    valueTextClass,
                  )}
                >
                  {valueText}
                </span>
              )}
            </p>
            {(subText || subTextNode) && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                {subText && <span>{subText}</span>}
                {subTextNode}
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <Skeleton
            className={cn(
              "h-10 w-10 rounded-lg",
              styles.skeleton,
              skeletonClass,
            )}
          />
        ) : (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              styles.iconWrapper,
              iconBgColor,
              iconWrapperClass,
            )}
          >
            <DynamicIcon
              className={cn("h-6 w-6", styles.icon, iconColor, iconClass)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
