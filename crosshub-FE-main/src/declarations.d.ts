// src/types/react-places-autocomplete.d.ts

declare module "react-places-autocomplete" {
  import * as React from "react";

  export interface Suggestion {
    description: string;
    placeId: string;
    active: boolean;
  }

  export interface PlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (address: string) => void;
    debounce?: number;
    children: (args: {
      getInputProps: (options?: object) => object;
      suggestions: Suggestion[];
      getSuggestionItemProps: (
        suggestion: Suggestion,
        options?: object,
      ) => object;
      loading: boolean;
    }) => React.ReactNode;
  }

  const PlacesAutocomplete: React.FC<PlacesAutocompleteProps>;
  export default PlacesAutocomplete;

  export function geocodeByAddress(address: string): Promise<T[]>;
  export function getLatLng(result: T): Promise<{ lat: number; lng: number }>;
}
