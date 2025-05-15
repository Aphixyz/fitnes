"use client";

import { useState } from "react";
import SearchInput from "@/components/button/Search";

const SearchFilter = ({
  data,
  onFilter,
  placeholder,
  searchFields,
  onSearchTermChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchTermChange?.(value);

    const lowercasedSearchTerm = value.toLowerCase();

    const filtered = data.filter((item) =>
      searchFields.some((field) => {
        const fieldValue = item[field];
        if (!fieldValue) return false;

        const stringValue =
          typeof fieldValue === "number" ? fieldValue.toString() : fieldValue;

        return stringValue.toLowerCase().includes(lowercasedSearchTerm);
      })
    );

    onFilter(filtered);
  };

  return (
    <SearchInput
      value={searchTerm}
      onChange={handleInputChange}
      placeholder={placeholder || "ค้นหา..."}
    />
  );
};

export default SearchFilter;
