import React from 'react';
import type { ViewModel } from '../../src/schemas/view-model.js';
import { LayoutSingleSpeaker } from './layouts/LayoutSingleSpeaker.js';
import { LayoutMultiSpeaker } from './layouts/LayoutMultiSpeaker.js';

type Props = {
  data: ViewModel;
};

export function Template({ data }: Props) {
  return (
    <div className="template-root">
      {data.layoutVariant === 'single-speaker' ? (
        <LayoutSingleSpeaker data={data} />
      ) : (
        <LayoutMultiSpeaker data={data} />
      )}
    </div>
  );
}
