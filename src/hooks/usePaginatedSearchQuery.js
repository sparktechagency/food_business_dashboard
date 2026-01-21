import { useState, useEffect } from "react";
import useDebounce from "./usedebounce";

export default function usePaginatedSearchQuery(queryHook, { limit = 10, resultsKey = "results" }, filters = {}) {
  const searchKey = "searchTerm";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm);
  const debouncedFilters = useDebounce(filters);

  const stringifiedDebouncedFilters = JSON.stringify(debouncedFilters);
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, stringifiedDebouncedFilters]);

  const { data, isLoading, isError } = queryHook({
    page: currentPage,
    limit,
    [searchKey]: debouncedSearch,
    ...debouncedFilters,
  });

  const rawResults = data?.data?.[resultsKey];
  const items = Array.isArray(rawResults) ? rawResults : [];
  const totalPages = data?.data?.pagination?.totalPage || 1;
  const meta = data?.data?.pagination || {};
  const page = data?.data?.pagination?.page || 1;

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    page,
    meta,
    items,
    isLoading,
    isError,
  };
}