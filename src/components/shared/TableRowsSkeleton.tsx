import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RowLike = { id?: string | number };

export const TableRowsSkeleton: React.FC<{
  rows?: number;
  cols?: number;
  withAvatarCol?: boolean;
}> = ({ rows = 5, cols = 5, withAvatarCol = true }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={`sk-row-${r}`}>
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={`sk-cell-${r}-${c}`}>
              {withAvatarCol && c === 0 ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ) : (
                <Skeleton className="h-4 w-24" />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
