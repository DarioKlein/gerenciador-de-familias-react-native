import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { createCepsRepository } from './ceps-repository';

export function useCepsRepository() {
  const db = useSQLiteContext();
  return useMemo(() => createCepsRepository(db), [db]);
}
