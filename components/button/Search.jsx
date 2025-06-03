import { Search as SearchIcon } from "lucide-react";

const SearchInput = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative w-full max-w-xs">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <SearchIcon size={16} />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-center"
      />
    </div>
  );
};

export default SearchInput;
