/**
 * Solver page.
 *
 * Left column: dictionary + grid-size controls, an editable N×N grid of single
 * letters, a Solve button, and a (read-only) Board that animates the path of
 * whichever solution the user picks.
 *
 * Right column: solutions grouped by word length, sorted longest-first. Clicking
 * a word selects it and computes its cell path on demand via findPathForWord.
 *
 * The grid + last solution live in the Zustand store so they survive
 * navigation away to /game and back.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Paper,
  ScrollArea,
  Badge,
  SimpleGrid,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store';
import { findPathForWord, findWords } from '../../game/solver';
import Board from '../Board/Board';
import { useDict } from '../../dict/loadDict';
import { useDictParam } from '../../hooks/useDictParam';

const SIZES = ['3', '4', '5', '6', '7', '8'];

export default function SolverPage() {
  const { t } = useTranslation();
  const [dictLang, setDictLang] = useDictParam();
  const setSolverDict = useStore((s) => s.setSolverDict);
  // Keep the store's notion of the active dictionary in sync with the URL.
  useEffect(() => {
    setSolverDict(dictLang);
  }, [dictLang, setSolverDict]);
  const { trie: dict, loading, error } = useDict(dictLang);

  const { size, grid, words, selectedWord, selectedPath } = useStore((s) => s.solver);
  const setSize = useStore((s) => s.setSolverSize);
  const setCell = useStore((s) => s.setSolverCell);
  const setWords = useStore((s) => s.setSolverWords);
  const selectWord = useStore((s) => s.selectWord);

  // Drives the board's step-by-step path animation (one cell every 200ms).
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!selectedPath) {
      setVisibleCount(0);
      return;
    }
    setVisibleCount(1);
    let i = 1;
    const id = setInterval(() => {
      i += 1;
      if (i > selectedPath.length) {
        clearInterval(id);
        return;
      }
      setVisibleCount(i);
    }, 200);
    return () => clearInterval(id);
  }, [selectedPath]);

  const handleSolve = () => {
    if (!dict) return;
    const found = findWords(grid, dict);
    found.sort((a, b) => b.length - a.length || a.localeCompare(b));
    setWords(found);
  };

  const handleClick = (w: string) => {
    const path = findPathForWord(grid, w);
    selectWord(w, path);
  };

  const groupedByLen = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const w of words) {
      const len = [...w].length;
      if (!m.has(len)) m.set(len, []);
      m.get(len)!.push(w);
    }
    return Array.from(m.entries()).sort((a, b) => b[0] - a[0]);
  }, [words]);

  const canSolve = !!dict && grid.every((row) => row.every((c) => c && c.trim().length > 0));

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      {error && (
        <Alert color="red" title={t('errors.dictLoadFailed')} mb="md">
          {error}
        </Alert>
      )}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Stack>
          <Group wrap="wrap" gap="xs">
            <Text>{t('solver.size')}:</Text>
            <SegmentedControl
              size="xs"
              value={String(size)}
              onChange={(v) => setSize(Number(v))}
              data={SIZES}
            />
            <Text>{t('common.dictionary')}:</Text>
            <SegmentedControl
              size="xs"
              value={dictLang}
              onChange={(v) => setDictLang(v as 'hu' | 'en')}
              data={[
                { label: t('common.dict.en'), value: 'en' },
                { label: t('common.dict.hu'), value: 'hu' },
              ]}
            />
          </Group>
          <Paper p="sm" withBorder>
            <Stack gap={4} align="center">
              {grid.map((row, i) => (
                <Group key={i} gap={4} wrap="nowrap">
                  {row.map((ch, j) => {
                    const inputSize = size >= 7 ? 34 : 40;
                    return (
                      <TextInput
                        key={j}
                        value={ch ?? ''}
                        onChange={(e) =>
                          setCell(
                            i,
                            j,
                            e.currentTarget.value.slice(-1).toLocaleLowerCase('hu-HU'),
                          )
                        }
                        maxLength={1}
                        autoCapitalize="off"
                        autoComplete="off"
                        styles={{
                          input: {
                            width: inputSize,
                            height: inputSize,
                            textAlign: 'center',
                            fontSize: inputSize * 0.5,
                            textTransform: 'uppercase',
                            padding: 0,
                          },
                        }}
                      />
                    );
                  })}
                </Group>
              ))}
            </Stack>
          </Paper>
          <Group>
            <Button onClick={handleSolve} disabled={!canSolve}>
              {t('solver.solve')}
            </Button>
            {words.length > 0 && (
              <Badge size="lg">{t('solver.foundCount', { count: words.length })}</Badge>
            )}
          </Group>
          <Board
            grid={grid}
            highlightPath={selectedPath}
            highlightVisibleCount={visibleCount}
          />
        </Stack>

        <Stack>
          <Text fw={600}>{t('solver.foundWords')}</Text>
          <ScrollArea h="min(520px, 50vh)" type="auto">
            <Stack gap="xs">
              {groupedByLen.map(([len, ws]) => (
                <Paper key={len} p="xs" withBorder>
                  <Text size="sm" c="dimmed" mb={4}>
                    {t('solver.letters', { count: len })}
                  </Text>
                  <Group gap={6}>
                    {ws.map((w) => (
                      <Badge
                        key={w}
                        variant={selectedWord === w ? 'filled' : 'light'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleClick(w)}
                      >
                        {w}
                      </Badge>
                    ))}
                  </Group>
                </Paper>
              ))}
              {words.length === 0 && (
                <Text c="dimmed" size="sm">
                  {t('solver.fillHint')}
                </Text>
              )}
            </Stack>
          </ScrollArea>
        </Stack>
      </SimpleGrid>
    </div>
  );
}
