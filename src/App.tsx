/**
 * Top-level layout.
 *
 * A Mantine AppShell with a fixed header and a content area whose body is
 * rendered by react-router via <Outlet />. Padding scales down on phones.
 */
import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';

export default function App() {
  return (
    <AppShell header={{ height: 56 }} padding={{ base: 'xs', sm: 'md' }}>
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
