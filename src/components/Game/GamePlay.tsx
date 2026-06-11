/**
 * Active game screen, one player at a time.
 *
 * Drives a 1Hz timer (skipped when timeLimit=0 / unlimited) that ticks the
 * store and auto-advances to the next player when it hits zero. When the
 * last player finishes, game.status flips to 'finished' and the effect below
 * navigates to /game/finished.
 *
 * Word entry is validated in 4 steps: length ≥ 3 → not a duplicate → in the
 * dictionary → traceable on this grid. Failures flash a transient message
 * via the imperative `flash()` helper instead of going through React state,
 * so rapid invalid attempts don't thrash re-renders.
 */
import { useEffect, useMemo, useRef } from 'react';
import {
  Badge,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  Progress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import Board from '../Board/Board';
import { findPathForWord, findWords } from '../../game/solver';
import { scoreWord, totalScore } from '../../game/scoring';
import { useDict } from '../../dict/loadDict';

const codepointLen = (w: string) => [...w].length;

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export default function GamePlay() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const grid = useStore((s) => s.game.grid);
  const config = useStore((s) => s.game.config);
  const players = useStore((s) => s.game.players);
  const currentPlayer = useStore((s) => s.game.currentPlayer);
  const timeLeft = useStore((s) => s.game.timeLeft);
  const status = useStore((s) => s.game.status);
  const tickTimer = useStore((s) => s.tickTimer);
  const advancePlayer = useStore((s) => s.advancePlayer);
  const finishGame = useStore((s) => s.finishGame);
  const addFoundWord = useStore((s) => s.addFoundWord);

  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const { trie: dict, loading } = useDict(config?.dictionary ?? 'en');

  const flashRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (status === 'finished') navigate('/game/finished');
  }, [status, navigate]);

  useEffect(() => {
    if (!config || config.timeLimit === 0) return;
    const id = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(id);
  }, [config, tickTimer, currentPlayer]);

  const me = players[currentPlayer];
  const myWords = me?.words ?? [];
  const score = useMemo(() => totalScore(myWords), [myWords]);

  const totalsByLength = useMemo(() => {
    if (!dict || grid.length === 0 || !config) return null;
    const minLen = config.minWordLength;
    const counts = new Map<number, number>();
    for (const w of findWords(grid, dict)) {
      const len = codepointLen(w);
      if (len < minLen) continue;
      counts.set(len, (counts.get(len) ?? 0) + 1);
    }
    return counts;
  }, [dict, grid, config]);

  const foundByLength = useMemo(() => {
    const counts = new Map<number, number>();
    for (const w of myWords) {
      const len = codepointLen(w);
      counts.set(len, (counts.get(len) ?? 0) + 1);
    }
    return counts;
  }, [myWords]);

  const progressRows = useMemo(() => {
    if (!totalsByLength) return [];
    return [...totalsByLength.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([len, total]) => ({
        len,
        total,
        found: Math.min(foundByLength.get(len) ?? 0, total),
      }));
  }, [totalsByLength, foundByLength]);

  const totalFound = progressRows.reduce((s, r) => s + r.found, 0);
  const totalPossible = progressRows.reduce((s, r) => s + r.total, 0);

  if (!config) return null;

  const onWordEntered = (word: string, _path: { i: number; j: number }[]) => {
    if (!dict) return;
    const w = word.toLocaleLowerCase('hu-HU');
    const minLen = config.minWordLength;
    if ([...w].length < minLen) return flash(t('play.tooShort', { min: minLen }));
    if (myWords.includes(w)) return flash(t('play.alreadyFound'));
    if (!dict.search(w)) return flash(t('play.notAWord'));
    if (!findPathForWord(grid, w)) return flash(t('play.notOnBoard'));
    addFoundWord(w);
    flash(t('play.scored', { points: scoreWord(w), word: w }), 'green');
  };

  const flash = (msg: string, color = 'red') => {
    if (!flashRef.current) return;
    flashRef.current.textContent = msg;
    flashRef.current.style.color = color;
    flashRef.current.style.opacity = '1';
    setTimeout(() => {
      if (flashRef.current) flashRef.current.style.opacity = '0';
    }, 1200);
  };

  const progress =
    config.timeLimit === 0 ? 100 : Math.max(0, (timeLeft / config.timeLimit) * 100);

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Stack>
          <Group justify="space-between">
            <Title order={4}>
              {t('play.playerOf', {
                name: me?.name,
                current: currentPlayer + 1,
                total: players.length,
              })}
            </Title>
            <Badge size="lg">{t('play.score', { value: score })}</Badge>
          </Group>
          {config.timeLimit > 0 ? (
            <Stack gap={4}>
              <Progress value={progress} />
              <Text size="sm" ta="center">
                {fmt(timeLeft)}
              </Text>
            </Stack>
          ) : (
            <Text size="sm" ta="center" c="dimmed">
              {t('play.unlimitedTime')}
            </Text>
          )}
          <Board grid={grid} onWordEntered={onWordEntered} />
          <div
            ref={flashRef}
            style={{ height: 24, textAlign: 'center', transition: 'opacity .3s', opacity: 0 }}
          />
          <Group grow>
            <Button color="red" variant="light" onClick={advancePlayer}>
              {currentPlayer + 1 === players.length ? t('play.finish') : t('play.giveUp')}
            </Button>
            {currentPlayer + 1 < players.length && (
              <Button color="red" onClick={openConfirm}>
                {t('play.finishGame')}
              </Button>
            )}
          </Group>
        </Stack>
        <Stack>
          <Title order={5}>{t('play.wordsFound')}</Title>
          <Paper p="sm" withBorder>
            <ScrollArea h="min(440px, 40vh)">
              <Group gap={6}>
                {myWords.length === 0 && (
                  <Text c="dimmed" size="sm">
                    {t('play.wordsHint')}
                  </Text>
                )}
                {myWords.map((w) => (
                  <Badge key={w} variant="light">
                    {w} (+{scoreWord(w)})
                  </Badge>
                ))}
              </Group>
            </ScrollArea>
          </Paper>
          <Title order={5}>{t('play.progressTitle')}</Title>
          <Paper p="sm" withBorder>
            {progressRows.length === 0 ? (
              <Text c="dimmed" size="sm">
                {t('play.progressEmpty')}
              </Text>
            ) : (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {t('play.progressOverall')}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t('play.progressCount', { found: totalFound, total: totalPossible })}
                  </Text>
                </Group>
                <Progress
                  value={totalPossible === 0 ? 0 : (totalFound / totalPossible) * 100}
                />
                {progressRows.map(({ len, found, total }) => (
                  <Stack key={len} gap={2}>
                    <Group justify="space-between">
                      <Text size="sm">{t('play.progressLength', { len })}</Text>
                      <Text size="sm" c="dimmed">
                        {t('play.progressCount', { found, total })}
                      </Text>
                    </Group>
                    <Progress size="sm" value={total === 0 ? 0 : (found / total) * 100} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </SimpleGrid>
      <Modal
        opened={confirmOpen}
        onClose={closeConfirm}
        title={t('play.finishConfirmTitle')}
        centered
      >
        <Stack>
          <Text>{t('play.finishConfirmBody')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeConfirm}>
              {t('play.finishConfirmNo')}
            </Button>
            <Button
              color="red"
              onClick={() => {
                closeConfirm();
                finishGame();
              }}
            >
              {t('play.finishConfirmYes')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
