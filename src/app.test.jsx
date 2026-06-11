import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './app.jsx';

// Render smoke test: catches broken imports/undefined components across the
// whole view tree, which the build alone cannot detect. Effects (worker,
// timers, layout) don't run in renderToString, so no DOM shims are needed.
describe('App', () => {
  it('renders the initial screen without crashing', () => {
    const html = renderToString(React.createElement(App));
    expect(html).toContain('WATER SORT');   // home screen title
    expect(html).toContain('PLAY');         // level 1 play button
  });
});
