import React from 'react';
import type { CeapViewModel } from '../../../src/schemas/ceap-view-model.js';
import { Cover } from '../sections/Cover.js';
import { Apresentacao } from '../sections/Apresentacao.js';
import { Professor } from '../sections/Professor.js';
import { Programacao } from '../sections/Programacao.js';
import { Encerramento } from '../sections/Encerramento.js';

type Props = { data: CeapViewModel };

export function LayoutSingleProf({ data }: Props) {
  return (
    <>
      <Cover data={data} />
      <Apresentacao data={data} />
      <Professor data={data} />
      <Programacao data={data} />
      <Encerramento data={data} />
    </>
  );
}
