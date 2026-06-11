/**
 * Game setup form.
 *
 * Collects player count (1-8) + player names, grid size (3-8), time per
 * player (2-5 min or unlimited), and dictionary language. Pressing Start
 * pushes the configuration into the store (which generates a random grid
 * and resets all per-player word lists) and navigates to /game/play.
 */
import { useState } from 'react';
import {
  Button,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  TextInput,
  Title,
  Paper,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useStore, type TimeLimit } from '../../store';
import { useDictParam } from '../../hooks/useDictParam';

const SIZES = ['3', '4', '5', '6', '7', '8'];

export default function GameSetup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const startGame = useStore((s) => s.startGame);
  const [dictLang, setDictLang] = useDictParam();

  const [count, setCount] = useState<number>(2);
  const [names, setNames] = useState<string[]>([
    t('setup.playerLabel', { n: 1 }),
    t('setup.playerLabel', { n: 2 }),
  ]);
  const [size, setSize] = useState<number>(4);
  const [time, setTime] = useState<TimeLimit>(180);

  const TIMES: Array<{ label: string; value: TimeLimit }> = [
    { label: t('setup.min', { n: 2 }), value: 120 },
    { label: t('setup.min', { n: 3 }), value: 180 },
    { label: t('setup.min', { n: 4 }), value: 240 },
    { label: t('setup.min', { n: 5 }), value: 300 },
    { label: t('setup.unlimited'), value: 0 },
  ];

  const updateCount = (n: number) => {
    const clamped = Math.max(1, Math.min(8, n));
    setCount(clamped);
    setNames((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) next.push(t('setup.playerLabel', { n: next.length + 1 }));
      return next;
    });
  };

  const onStart = () => {
    startGame({ playerNames: names, size, timeLimit: time, dictionary: dictLang });
    navigate(`/game/play?dict=${dictLang}`);
  };

  return (
    <Paper p="md" maw={520} mx="auto" withBorder>
      <Stack>
        <Title order={3}>{t('setup.title')}</Title>
        <NumberInput
          label={t('setup.playerCount')}
          min={1}
          max={8}
          value={count}
          onChange={(v) => updateCount(typeof v === 'number' ? v : Number(v))}
        />
        <Stack gap="xs">
          {names.map((n, idx) => (
            <TextInput
              key={idx}
              label={t('setup.playerLabel', { n: idx + 1 })}
              value={n}
              onChange={(e) =>
                setNames((prev) => prev.map((p, i) => (i === idx ? e.currentTarget.value : p)))
              }
            />
          ))}
        </Stack>
        <Group wrap="wrap">
          <span>{t('setup.gridSize')}:</span>
          <SegmentedControl
            size="xs"
            value={String(size)}
            onChange={(v) => setSize(Number(v))}
            data={SIZES}
          />
        </Group>
        <Group wrap="wrap">
          <span>{t('setup.time')}:</span>
          <SegmentedControl
            size="xs"
            value={String(time)}
            onChange={(v) => setTime(Number(v) as TimeLimit)}
            data={TIMES.map((t2) => ({ label: t2.label, value: String(t2.value) }))}
          />
        </Group>
        <Group wrap="wrap">
          <span>{t('setup.dictionary')}:</span>
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
        <Button onClick={onStart} disabled={names.some((n) => !n.trim())}>
          {t('setup.start')}
        </Button>
      </Stack>
    </Paper>
  );
}
