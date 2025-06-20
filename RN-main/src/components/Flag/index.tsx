import { Image } from 'react-native';

export const Flag = ({ countryCode }: { countryCode: string }) => {
  return (
    <Image
      source={{
        uri: `https://flagcdn.com/w80/${countryCode}.png`,
      }}
      style={{ width: 48, height: 36 }}
      resizeMode="contain"
    />
  );
};
