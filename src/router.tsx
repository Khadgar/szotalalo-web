/**
 * App route map.
 *
 * HashRouter is used (over BrowserRouter) so the app can be hosted on
 * GitHub Pages without needing a server-side 404 → index redirect.
 *
 * Routes:
 *   /              → redirect to /solver
 *   /solver        → Solver mode
 *   /game          → Game setup (configure players / size / time / dict)
 *   /game/play     → Active game (guarded: only reachable while status='playing')
 *   /game/finished → Leaderboard (guarded: only after status='finished')
 *
 * The `?dict=hu|en` query param is preserved by useDictParam across navigations.
 */
import type { JSX } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import SolverPage from './components/Solver/SolverPage';
import GameSetup from './components/Game/GameSetup';
import GamePlay from './components/Game/GamePlay';
import Leaderboard from './components/Game/Leaderboard';
import { useStore } from './store';

/**
 * Renders `children` only when the current game.status matches `require`.
 * Otherwise:
 *   - if the game has finished, always send the user to /game/finished
 *     (so ending a match from /game/play lands on the leaderboard, not
 *     the setup screen);
 *   - otherwise fall back to `redirect`.
 * Prevents users from deep-linking to /game/play or /game/finished
 * without going through setup.
 */
function GameGuard({ require, redirect, children }: { require: 'playing' | 'finished'; redirect: string; children: JSX.Element }) {
  const status = useStore((s) => s.game.status);
  if (status !== require) {
    if (status === 'finished') return <Navigate to="/game/finished" replace />;
    return <Navigate to={redirect} replace />;
  }
  return children;
}

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Navigate to="/solver" replace />} />
          <Route path="/solver" element={<SolverPage />} />
          <Route path="/game" element={<GameSetup />} />
          <Route
            path="/game/play"
            element={
              <GameGuard require="playing" redirect="/game">
                <GamePlay />
              </GameGuard>
            }
          />
          <Route
            path="/game/finished"
            element={
              <GameGuard require="finished" redirect="/game">
                <Leaderboard />
              </GameGuard>
            }
          />
          <Route path="*" element={<Navigate to="/solver" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
