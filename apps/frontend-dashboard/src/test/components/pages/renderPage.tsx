import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';

export function renderPage(
  ui: ReactElement,
  { initialPath = '/', extraRoutes = [] as { path: string; element: ReactElement }[] } = {},
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={initialPath} element={ui} />
        {extraRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </MemoryRouter>,
  );
}
