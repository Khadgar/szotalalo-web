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
  Paper,
  Stack,
  Table,
  Title,
  Container,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { scoreWord, totalScore } from '../../game/scoring';

export default function Leaderboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const players = useStore((s) => s.game.players);
  const resetGame = useStore((s) => s.resetGame);

  const ranked = [...players]
    .map((p) => ({ ...p, score: totalScore(p.words) }))
    .sort((a, b) => b.score - a.score);

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
