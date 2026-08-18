import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { CheckIcon, ChevronDown } from "lucide-react";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onSelectChange: (selectedValues: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onSelectChange,
  placeholder,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onSelectChange(newSelected);
  };

  // 🔹 Filter options based on search or show top 5 by default
  const filteredOptions = search
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="opacity-100 bg-[#1F1A0D] flex justify-between items-center cursor-pointer xl:py-[12px] lg:py-[10px] md:py-[9px] py-[8px] px-[20px] border border-[#3A3219] rounded-[7px]">
          <span className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-[#D4AF379C] flex whitespace-nowrap overflow-hidden text-ellipsis">
            {selected.length > 0
              ? selected
                  .map(
                    (value) => options.find((opt) => opt.value === value)?.label
                  )
                  .filter(Boolean)
                  .map((label, index, arr) => (
                    <React.Fragment key={label}>
                      {`${label},`}
                      {index < arr.length - 1 && (
                        <span className="inline-block ml-3"></span>
                      )}
                    </React.Fragment>
                  ))
              : placeholder || "Select items..."}
          </span>
          <ChevronDown className="ml-2 h-6 w-6 shrink-0 opacity-50 text-[#D4AF37]" />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#D9D9D908] border border-[#4B4C46] text-white rounded-md">
        <Command className="bg-black text-white">
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search options..."
            className="text-white placeholder:text-white/50 bg-transparent border-none focus:ring-0"
          />
          <CommandEmpty className="px-2 py-2 text-white/70">
            No options found.
          </CommandEmpty>
          <CommandGroup className="bg-[#D9D9D908]">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => handleToggle(option.value)}
                className="flex items-center justify-between text-white hover:bg-white/10 font-gowun"
              >
                {option.label}
                {selected.includes(option.value) && (
                  <CheckIcon className="ml-auto h-4 w-4 text-white" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
