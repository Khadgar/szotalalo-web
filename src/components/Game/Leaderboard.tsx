/**
 * End-of-game leaderboard.
 *
 * Ranks players by total score (sum of per-word Boggle points), shown in a
 * table plus a per-player accordion that lists every word + its points.
 * "Play again" resets the game state and returns to /game setup.
 */
import {
  Accordion,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  Container,
} from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { scoreWord, totalScore } from '../../game/scoring';
import { useDict } from '../../dict/loadDict';
import { findWords } from '../../game/solver';

export default function Leaderboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const grid = useStore((s) => s.game.grid);
  const config = useStore((s) => s.game.config);
  const players = useStore((s) => s.game.players);
  const resetGame = useStore((s) => s.resetGame);

  const { trie, loading } = useDict(config?.dictionary ?? 'en');

  const ranked = [...players]
    .map((p) => ({ ...p, score: totalScore(p.words) }))
    .sort((a, b) => b.score - a.score);

  const foundByAny = useMemo(() => {
    const set = new Set<string>();
    for (const p of players) for (const w of p.words) set.add(w);
    return set;
  }, [players]);

  const allWords = useMemo(() => {
    if (!trie || grid.length === 0) return [] as string[];
    const minLen = config?.minWordLength ?? 3;
    return findWords(grid, trie)
      .filter((w) => [...w].length >= minLen)
      .sort((a, b) => {
        if (b.length !== a.length) return b.length - a.length;
        return a.localeCompare(b, 'hu-HU');
      });
  }, [trie, grid, config]);

  const totalPossiblePoints = useMemo(
    () => allWords.reduce((sum, w) => sum + scoreWord(w), 0),
    [allWords],
  );

  return (
    <Container maw={720}>
      <Stack>
        <Title order={3}>{t('leaderboard.title')}</Title>
        <Paper withBorder p="sm">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('leaderboard.rank')}</Table.Th>
                <Table.Th>{t('leaderboard.player')}</Table.Th>
                <Table.Th>{t('leaderboard.words')}</Table.Th>
                <Table.Th>{t('leaderboard.score')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ranked.map((p, idx) => (
                <Table.Tr key={p.name}>
                  <Table.Td>{idx + 1}</Table.Td>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td>{p.words.length}</Table.Td>
                  <Table.Td>
                    <Badge>{p.score}</Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <Accordion variant="separated">
          {ranked.map((p) => (
            <Accordion.Item key={p.name} value={p.name}>
              <Accordion.Control>
                {t('leaderboard.playerScore', { name: p.name, score: p.score })}
              </Accordion.Control>
              <Accordion.Panel>
                <Group gap={6}>
                  {p.words.length === 0 && <span>{t('leaderboard.noWords')}</span>}
                  {p.words.map((w) => (
                    <Badge key={w} variant="light">
                      {w} (+{scoreWord(w)})
                    </Badge>
                  ))}
                </Group>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>

        <Paper withBorder p="sm">
          <Stack gap="xs">
            <Group justify="space-between" align="baseline">
              <Title order={5}>{t('leaderboard.allWordsTitle')}</Title>
              {!loading && trie && allWords.length > 0 && (
                <Text size="sm" c="dimmed">
                  {t('leaderboard.allWordsSummary', {
                    found: allWords.filter((w) => foundByAny.has(w)).length,
                    total: allWords.length,
                    points: totalPossiblePoints,
                  })}
                </Text>
              )}
            </Group>
            {loading || !trie ? (
              <Group gap="xs">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  {t('leaderboard.allWordsLoading')}
                </Text>
              </Group>
            ) : allWords.length === 0 ? (
              <Text size="sm" c="dimmed">
                {t('leaderboard.allWordsEmpty')}
              </Text>
            ) : (
              <ScrollArea h="min(440px, 40vh)">
                <Group gap={6}>
                  {allWords.map((w) => {
                    const found = foundByAny.has(w);
                    return (
                      <Badge
                        key={w}
                        variant={found ? 'filled' : 'light'}
                        color={found ? 'teal' : 'gray'}
                      >
                        {w} (+{scoreWord(w)})
                      </Badge>
                    );
                  })}
                </Group>
              </ScrollArea>
            )}
          </Stack>
        </Paper>

        <Button
          onClick={() => {
            resetGame();
            navigate('/game');
          }}
        >
          {t('leaderboard.playAgain')}
        </Button>
      </Stack>
    </Container>
  );
}
