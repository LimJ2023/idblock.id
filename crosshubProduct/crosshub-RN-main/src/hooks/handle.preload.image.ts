import { useEffect } from 'react';

import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';

import { STATIC_IMAGE } from '~/utils/constant';

export function useHandlePreloadImage() {
  /*
   * 앱에 필요한 이미지 프리로딩
   */
  useEffect(() => {
    const images = Object.values(STATIC_IMAGE);

    const uris = images.map((image) => ({
      uri: Image.resolveAssetSource(image).uri,
    }));

    FastImage.preload(uris);
  }, []);
}
