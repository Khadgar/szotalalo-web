import React, { useState } from 'react';
import { AppShell, createTheme, MantineProvider, Image, Group, Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Result from './components/Result/Result';
import AppContext, { Languages } from './contexts/AppContext';
import Configure from './components/Configure/Configure';
import { IDimensions } from './components/IDimensions';
import { Trie } from './utils/Trie';
import InteractiveBoard from './components/InteractiveBoard/InteractiveBoard';
import '@mantine/core/styles.css';

const theme = createTheme({
  /** Put your mantine theme override here */
});

const App = () => {
  const [dimensions, setDimensions] = useState<IDimensions>({ m: 3, n: 3 });
  const [opened, { open, close }] = useDisclosure(false);

  const [dict, setDict] = useState<Trie>(new Trie());

  const [grid, setGrid] = useState<string[][]>(
    Array(dimensions.m).fill(Array(dimensions.n).fill(null))
  );

  const [language, setLanguage] = useState<Languages>('HUN');

  const [results, setResults] = useState<string[]>([]);

  return (
    <MantineProvider theme={theme}>
      <AppContext.Provider
        value={{
          grid,
          setGrid,
          dict,
          setDict,
          dimensions,
          setDimensions,
          language,
          setLanguage,
          results,
          setResults,
        }}
      >
        <AppShell header={{ height: 60 }} padding="md">
          <AppShell.Header>
            <Group h="100%" px="md" justify="space-between">
              <Image src="./logo512.png" h={30} w="auto" />
              <Modal opened={opened} onClose={close} title="Configure" centered size="auto">
                <Modal.Body>
                  <Configure />
                </Modal.Body>
              </Modal>
              <Button variant="filled" onClick={open}>
                Configure
              </Button>
            </Group>
          </AppShell.Header>
          <AppShell.Main>
            <InteractiveBoard />
            <Result />
          </AppShell.Main>
        </AppShell>
      </AppContext.Provider>
    </MantineProvider>
  );
};

export default App;
