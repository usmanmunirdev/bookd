"use client";
import React from "react";
import { DebounceInput } from "react-debounce-input";

interface SearchInputProps {
  searchKey: string;
  handleSearch: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchKey, handleSearch }) => {
  return (
    <div className="">
      {/* <label className="block mb-2 text-lg font-semibold">Search</label> */}
      <DebounceInput
        minLength={2}
        debounceTimeout={300}
        className="border p-2 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400"
        placeholder="Search"
        value={searchKey}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          '--tw-ring-color': !document.documentElement.classList.contains('dark') ? 'rgba(70, 127, 247, 0.1)' : undefined,
          '--tw-border-opacity': !document.documentElement.classList.contains('dark') ? '1' : undefined,
          '--tw-border-color': !document.documentElement.classList.contains('dark') ? 'rgb(70, 127, 247)' : undefined
        } as React.CSSProperties}
      />
    </div>
  );
};

export default SearchInput;
