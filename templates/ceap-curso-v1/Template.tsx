import React from 'react';
import type { CeapViewModel } from '../../src/schemas/ceap-view-model.js';
import { LayoutSingleProf } from './layouts/LayoutSingleProf.js';
import { LayoutMultiProf } from './layouts/LayoutMultiProf.js';

type Props = {
  data: CeapViewModel;
};

export function Template({ data }: Props) {
  return (
    <div className="template-root">
      {data.layoutVariant === 'single-prof' ? (
        <LayoutSingleProf data={data} />
      ) : (
        <LayoutMultiProf data={data} />
      )}
    </div>
  );
}
