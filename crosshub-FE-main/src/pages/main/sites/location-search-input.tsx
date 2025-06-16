import React, { useState } from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
  Suggestion,
} from "react-places-autocomplete";

const LocationSearchInput: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleSelect = async (selected: string) => {
    setAddress(selected);
    try {
      const results = await geocodeByAddress(selected);
      const latLng = await getLatLng(results[0]);
      setCoordinates(latLng);
      console.log("위도/경도:", latLng);
    } catch (error) {
      console.error("주소 처리 중 오류 발생:", error);
    }
  };

  return (
    <div>
      <PlacesAutocomplete
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
        debounce={300}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input
              {...getInputProps({
                placeholder: "주소를 입력하세요",
                className: "location-search-input",
              })}
            />
            <div className="autocomplete-dropdown-container">
              {loading && <div>검색 중...</div>}
              {suggestions.map((suggestion: Suggestion) => {
                const className = suggestion.active
                  ? "suggestion-item--active"
                  : "suggestion-item";
                const style = {
                  backgroundColor: suggestion.active ? "#fafafa" : "#ffffff",
                  cursor: "pointer",
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                };

                return (
                  <div
                    key={suggestion.placeId ?? suggestion.description}
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>

      {coordinates && (
        <div style={{ marginTop: "16px" }}>
          <strong>선택한 위치의 좌표:</strong>
          <br />
          위도: {coordinates.lat}
          <br />
          경도: {coordinates.lng}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
