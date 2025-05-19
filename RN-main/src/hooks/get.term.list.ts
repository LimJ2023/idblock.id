import { useCallback } from 'react';

import { useApiGetTermPolicy } from './api.get.term.policy';

import { CheckItem } from '~/types/check.item';
import { TERM_TYPE } from '~/types/enum';

export function useGetTermList() {
  const { apiGetTermPolicy } = useApiGetTermPolicy();

  const getTermList = useCallback(async (): Promise<CheckItem[]> => {
    const service = await apiGetTermPolicy({
      termType: TERM_TYPE.SERVICE,
    });

    const privacy = await apiGetTermPolicy({
      termType: TERM_TYPE.PRIVACY,
    });

    const list: CheckItem[] = [];

    if (service) {
      list.push({
        isMandatory: true,
        isChecked: false,
        text: 'Agree to the Terms of Service',
        html: service,
      });
    }

    if (privacy) {
      list.push({
        isMandatory: true,
        isChecked: false,
        text: 'Agree to Collection and Use of Personal Information',
        html: privacy,
      });
    }

    return list;
  }, []);

  return {
    getTermList,
  };
}
