import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Refetches when the screen comes back into view (e.g. after returning from another
 * screen), but not on the first focus, which the query already covers.
 */
export function useRefreshOnFocus(refetch: () => unknown) {
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
}
