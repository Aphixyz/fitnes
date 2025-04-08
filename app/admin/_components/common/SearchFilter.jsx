"use client";

import { useState } from "react";

const SearchFilter = ({ trainers, setFilteredTrainers }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);

    const lowercasedSearchTerm = e.target.value.toLowerCase();
    const filtered = trainers.filter((trainer) => {
      return (
        trainer.trainer_firstname.toLowerCase().includes(lowercasedSearchTerm) ||
        trainer.trainer_lastname.toLowerCase().includes(lowercasedSearchTerm) ||
        trainer.trainer_id.toString().includes(lowercasedSearchTerm)
      );
    });

    setFilteredTrainers(filtered); // Update filtered trainers when search term changes
  };

  return (
    <div className="flex justify-start mb-4">
      <input
        type="text"
        placeholder="ค้นหาผู้ฝึกสอน"
        value={searchTerm}
        onChange={handleInputChange}
        className="px-4 py-2 border border-gray-300 rounded-md w-64 text-center"
      />
    </div>
  );
};

export default SearchFilter;
