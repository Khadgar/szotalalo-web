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
  Paper,
  Progress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import Board from '../Board/Board';
import { findPathForWord } from '../../game/solver';
import { scoreWord, totalScore } from '../../game/scoring';
import { useDict } from '../../dict/loadDict';

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
  const addFoundWord = useStore((s) => s.addFoundWord);

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

  if (!config) return null;

  const onWordEntered = (word: string, _path: { i: number; j: number }[]) => {
    if (!dict) return;
    const w = word.toLocaleLowerCase('hu-HU');
    if (w.length < 3) return flash(t('play.tooShort'));
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
          <Button color="red" variant="light" onClick={advancePlayer}>
            {currentPlayer + 1 === players.length ? t('play.finish') : t('play.giveUp')}
          </Button>
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
        </Stack>
      </SimpleGrid>
    </div>
  );
}
