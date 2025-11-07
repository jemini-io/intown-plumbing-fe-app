"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

// Lista de países más comunes, especialmente US
const COUNTRIES: CountryCode[] = [
  { code: "US", dialCode: "1", name: "United States", flag: "🇺🇸" },
  { code: "CA", dialCode: "1", name: "Canada", flag: "🇨🇦" },
  { code: "MX", dialCode: "52", name: "Mexico", flag: "🇲🇽" },
  { code: "GB", dialCode: "44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", dialCode: "61", name: "Australia", flag: "🇦🇺" },
  { code: "DE", dialCode: "49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dialCode: "33", name: "France", flag: "🇫🇷" },
  { code: "ES", dialCode: "34", name: "Spain", flag: "🇪🇸" },
  { code: "IT", dialCode: "39", name: "Italy", flag: "🇮🇹" },
  { code: "BR", dialCode: "55", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", dialCode: "54", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", dialCode: "57", name: "Colombia", flag: "🇨🇴" },
  { code: "CL", dialCode: "56", name: "Chile", flag: "🇨🇱" },
  { code: "PE", dialCode: "51", name: "Peru", flag: "🇵🇪" },
  { code: "VE", dialCode: "58", name: "Venezuela", flag: "🇻🇪" },
  { code: "EC", dialCode: "593", name: "Ecuador", flag: "🇪🇨" },
  { code: "GT", dialCode: "502", name: "Guatemala", flag: "🇬🇹" },
  { code: "CU", dialCode: "53", name: "Cuba", flag: "🇨🇺" },
  { code: "BO", dialCode: "591", name: "Bolivia", flag: "🇧🇴" },
  { code: "DO", dialCode: "1", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "HN", dialCode: "504", name: "Honduras", flag: "🇭🇳" },
  { code: "PY", dialCode: "595", name: "Paraguay", flag: "🇵🇾" },
  { code: "NI", dialCode: "505", name: "Nicaragua", flag: "🇳🇮" },
  { code: "SV", dialCode: "503", name: "El Salvador", flag: "🇸🇻" },
  { code: "CR", dialCode: "506", name: "Costa Rica", flag: "🇨🇷" },
  { code: "PA", dialCode: "507", name: "Panama", flag: "🇵🇦" },
  { code: "UY", dialCode: "598", name: "Uruguay", flag: "🇺🇾" },
  { code: "PR", dialCode: "1", name: "Puerto Rico", flag: "🇵🇷" },
];

interface CountryCodeSelectorProps {
  value?: string;
  onChange?: (dialCode: string) => void;
  name?: string;
  className?: string;
}

export function CountryCodeSelector({
  value = "1",
  onChange,
  name = "phoneCountryCode",
  className = "",
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    COUNTRIES.find(c => c.dialCode === value) || COUNTRIES[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const country = COUNTRIES.find(c => c.dialCode === value);
    if (country) {
      setSelectedCountry(country);
    }
  }, [value]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter countries based on search query (by dial code or country name)
  const filteredCountries = COUNTRIES.filter(country => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      country.dialCode.includes(query) ||
      country.name.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function handleSelect(country: CountryCode) {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");
    if (onChange) {
      onChange(country.dialCode);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    setSearchQuery(query);
    
    // If user types a valid dial code, try to find and select it
    if (query && /^\d+$/.test(query)) {
      const foundCountry = COUNTRIES.find(c => c.dialCode === query);
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        if (onChange) {
          onChange(foundCountry.dialCode);
        }
      }
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && filteredCountries.length > 0) {
      handleSelect(filteredCountries[0]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selectedCountry.dialCode} />
      
      {/* Selector button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border rounded p-2 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedCountry.flag}</span>
          <span className="text-sm font-medium">+{selectedCountry.dialCode}</span>
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by code or country..."
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Countries list */}
          <div className="max-h-60 overflow-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                    selectedCountry.code === country.code ? "bg-blue-100" : ""
                  }`}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-sm font-medium">+{country.dialCode}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

