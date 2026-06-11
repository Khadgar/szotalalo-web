/**
 * App header.
 *
 * Contains:
 *   - Brand title (links to /, which redirects to /solver)
 *   - Solver / Game mode switch (preserves the current query string so the
 *     dictionary selection stays sticky when flipping modes)
 *   - EN/HU language switch (drives i18next)
 *   - Theme toggle cycling auto → light → dark → auto
 */
import {
  ActionIcon,
  Button,
  Group,
  SegmentedControl,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/** Cycles auto → light → dark → auto and shows an emoji glyph for the current scheme. */
const ThemeToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const next = colorScheme === 'auto' ? 'light' : colorScheme === 'light' ? 'dark' : 'auto';
  const icon = colorScheme === 'auto' ? '🖥️' : colorScheme === 'light' ? '☀️' : '🌙';
  const { t } = useTranslation();
  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label={t('common.theme.toggle')}
      onClick={() => setColorScheme(next)}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
    </ActionIcon>
  );
};

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const inGame = location.pathname.startsWith('/game');

  const navMode = (mode: 'solver' | 'game') => {
    // Preserve query string (so ?dict stays sticky across modes)
    const search = location.search;
    navigate(mode === 'solver' ? `/solver${search}` : `/game${search}`);
  };

  return (
    <Group h="100%" px={{ base: 'sm', sm: 'md' }} justify="space-between" wrap="nowrap" gap="xs">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Title order={4} style={{ whiteSpace: 'nowrap' }}>
          {t('common.appTitle')}
        </Title>
      </Link>
      <Group gap="xs" wrap="nowrap">
        <Button.Group>
          <Button
            size="xs"
            variant={!inGame ? 'filled' : 'default'}
            onClick={() => navMode('solver')}
          >
            {t('common.solver')}
          </Button>
          <Button
            size="xs"
            variant={inGame ? 'filled' : 'default'}
            onClick={() => navMode('game')}
          >
            {t('common.game')}
          </Button>
        </Button.Group>
        <SegmentedControl
          size="xs"
          value={i18n.resolvedLanguage === 'hu' ? 'hu' : 'en'}
          onChange={(v) => i18n.changeLanguage(v)}
          data={[
            { label: 'EN', value: 'en' },
            { label: 'HU', value: 'hu' },
          ]}
        />
        <ThemeToggle />
      </Group>
    </Group>
  );
}
