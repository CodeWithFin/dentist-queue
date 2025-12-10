import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  contentChildren?: React.ReactNode;
}

const SelectContext = React.createContext<SelectContextValue>({});

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [contentChildren, setContentChildren] = React.useState<React.ReactNode>(null);

  // Collect children from SelectContent
  React.useEffect(() => {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectContent) {
        setContentChildren(child.props.children);
      }
    });
  }, [children]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, contentChildren }}>
      {children}
    </SelectContext.Provider>
  );
};

export interface SelectTriggerProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);

    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={context.value || ""}
        onChange={(e) => context.onValueChange?.(e.target.value)}
        {...props}
      >
        {children}
        {context.contentChildren}
      </select>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <option value="" disabled>{placeholder || "Select..."}</option>;
};

const SelectContent = ({ children: _children }: { children?: React.ReactNode }) => {
  // Return null to prevent rendering outside the select element
  // Children are collected by the parent Select component via context
  return null;
};

export interface SelectItemProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> { }

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <option ref={ref} className={cn(className)} {...props}>
        {children}
      </option>
    );
  }
);
SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};

