import * as React from "react";

import { cn } from "@/lib/utils";

type TableProps = React.ComponentPropsWithoutRef<"table"> & {
  captionSide?: "top" | "bottom";
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, captionSide = "top", ...props }, ref) => (
    <div className="relative w-full font-pretendard">
      <table
        ref={ref}
        className={cn(
          "h-full w-full",
          captionSide === "top" ? "caption-top" : "caption-bottom",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

type TableCaptionProps = React.ComponentPropsWithoutRef<"caption"> & {};

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

type TableHeaderProps = React.ComponentPropsWithoutRef<"thead"> & {};

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
  ),
);
TableHeader.displayName = "TableHeader";

type TableBodyProps = React.ComponentPropsWithoutRef<"tbody"> & {};

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("border-t [&>tr]:last:border-b-0", className)}
      {...props}
    />
  ),
);
TableBody.displayName = "TableBody";

type TableFooterProps = React.ComponentPropsWithoutRef<"tfoot"> & {};

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("border-t [&>tr]:last:border-b-0", className)}
      {...props}
    />
  ),
);
TableFooter.displayName = "TableFooter";

type TableRowProps = React.ComponentPropsWithoutRef<"tr"> & {};

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors",
        "hover:bg-gray-600/20",
        "data-[state=selected]:bg-gray-600/50",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

type TableHeadProps = React.ComponentPropsWithoutRef<"th"> & {};

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "px-1 py-4 text-left align-middle text-sm font-medium leading-[1.05rem] text-[#8B8B8B]",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

type TableCellProps = React.ComponentPropsWithoutRef<"td"> & {};

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("px-1 py-4 align-middle text-sm", className)}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
