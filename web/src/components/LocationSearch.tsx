import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_LOCATIONS } from '../graphql/queries';
import { Location } from '../types';

interface Props {
  onSelect: (location: Location) => void;
}

export function LocationSearch({ onSelect }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Location[]>([]);

  const [searchLocation, { loading }] = useLazyQuery(SEARCH_LOCATIONS, {
    onCompleted: (data) => {
      setOptions(data?.searchLocation || []);
    },
    fetchPolicy: 'no-cache',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.length > 2) {
      searchLocation({ variables: { name: value } });
    } else {
      setOptions([]);
    }
  };

  const handleSelect = (location: Location) => {
    onSelect(location);
    setInputValue('');
    setOptions([]);
  };

  return (
    <div className="relative w-full max-w-md mx-auto mt-6">
      <input
        type="text"
        placeholder="Search for a city..."
        className="w-full p-2 border border-gray-300 rounded"
        value={inputValue}
        onChange={handleChange}
      />

      {loading && <p className="mt-2 text-sm text-gray-500">Loading...</p>}

      {options.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded shadow-md">
          {options.map((loc, i) => (
            <li
              key={`${loc.name}-${loc.latitude}-${i}`}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(loc)}
            >
              {loc.name}, {loc.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationSearch;