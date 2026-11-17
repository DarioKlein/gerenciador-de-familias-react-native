import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useFamiliasRepository } from '@/database/use-familias-repository';
import { FamiliaForm } from '@/features/familias/components/familia-form';

export default function NovaFamiliaScreen() {
  const repository = useFamiliasRepository();
  const [bairros, setBairros] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void repository.listarBairros().then((items) => {
        if (active) setBairros(items);
      });
      return () => {
        active = false;
      };
    }, [repository])
  );

  return (
    <FamiliaForm
      bairros={bairros}
      submitLabel="Salvar família"
      onCancel={() => router.back()}
      onSubmit={async (input) => {
        const familia = await repository.criar(input);
        router.replace({ pathname: '/familias/[id]', params: { id: familia.id } });
      }}
    />
  );
}
