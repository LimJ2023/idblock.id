import { useState } from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
  Suggestion,
} from "react-places-autocomplete";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

interface LocationSearchInputProps {
  selected: string;
  onChange?: (value: string) => void;
}

const LocationSearchInput = ({
  selected,
  onChange,
}: LocationSearchInputProps) => {
  const [address, setAddress] = useState<string>(selected);
  const [tempAddress, setTempAddress] = useState<string>(selected);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelect = async (selected: string) => {
    setTempAddress(selected);
    try {
      const results = await geocodeByAddress(selected);
      const latLng = await getLatLng(results[0]);
      console.log("위도/경도:", latLng);
    } catch (error) {
      console.error("주소 처리 중 오류 발생:", error);
    }
  };

  const handleSave = () => {
    setAddress(tempAddress);
    onChange?.(tempAddress); // 외부로 값 전달
    setDialogOpen(false); // Dialog 닫기
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Input
          readOnly
          value={address}
          placeholder="주소를 입력하세요"
          className={cn(
            "h-14 cursor-pointer rounded-xl border-[#CECECE] bg-white px-6 text-left font-pretendard text-sm font-normal",
          )}
        />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="flex-col gap-3">
          <DialogTitle className="text-center text-2xl">
            관광지 위치 조회
          </DialogTitle>
          <DialogDescription className="text-center font-normal">
            해당 관광지의 위치를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <PlacesAutocomplete
          value={tempAddress}
          onChange={setTempAddress}
          onSelect={handleSelect}
          debounce={300}
        >
          {({
            getInputProps,
            suggestions,
            getSuggestionItemProps,
            loading,
          }) => (
            <div>
              <Input
                {...getInputProps({
                  placeholder: "주소를 입력하세요",
                })}
                className={cn(
                  "mb-2 h-14 rounded-xl border-[#CECECE] bg-white px-6 font-pretendard text-sm font-normal",
                )}
              />
              <div className="autocomplete-dropdown-container max-h-60 overflow-y-auto rounded-md border border-gray-200">
                {loading && <div className="p-2">검색 중...</div>}
                {suggestions.map((suggestion: Suggestion) => {
                  const style = {
                    backgroundColor: suggestion.active ? "#f1f1f1" : "#fff",
                    cursor: "pointer",
                    padding: "10px",
                  };

                  return (
                    <div
                      key={suggestion.placeId ?? suggestion.description}
                      {...getSuggestionItemProps(suggestion, { style })}
                    >
                      {suggestion.description}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>

        <DialogFooter className="mt-4 flex justify-center gap-4">
          <DialogClose asChild>
            <Button
              variants="secondary"
              className={cn(
                "h-[2.5rem] w-[5rem] rounded-lg border border-[#D8D7DB] bg-[#F3F4F8] font-pretendard text-base text-black hover:bg-[#415776] hover:text-white",
              )}
            >
              <span>취소</span>
            </Button>
          </DialogClose>
          <Button
            className={cn(
              "h-[2.5rem] w-[5rem] rounded-lg font-pretendard text-base",
            )}
            onClick={handleSave}
            disabled={!tempAddress}
          >
            <span>저장</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSearchInput;
