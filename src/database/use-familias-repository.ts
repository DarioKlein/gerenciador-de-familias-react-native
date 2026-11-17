import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { createFamiliasRepository } from './familias-repository';

export function useFamiliasRepository() {
  const db = useSQLiteContext();
  return useMemo(() => createFamiliasRepository(db), [db]);
}
