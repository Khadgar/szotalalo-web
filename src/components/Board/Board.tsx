/**
 * Interactive SVG board for both modes.
 *
 * Two operating modes:
 *   1. Input mode (default) — user swipes; on release the entered word and its
 *      path are reported via `onWordEntered`.
 *   2. External highlight mode — when `highlightPath` is supplied, swipe input
 *      is disabled and the board renders that path step-by-step using
 *      `highlightVisibleCount` (used by SolverPage to animate solutions).
 *
 * UX notes for diagonals:
 *   - The hit zone of each cell is the inner ~38% circle, not the full square.
 *     Corners are dead zones so diagonal swipes don't accidentally pick up
 *     horizontal/vertical neighbours.
 *   - Between pointer-move events we interpolate intermediate points so a fast
 *     diagonal swipe still passes through every cell along the way.
 *
 * The board auto-sizes to its container (clamped to `maxSize`, default 480px)
 * via ResizeObserver, so it scales smoothly between desktop and mobile.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Coord, Grid } from '../../game/solver';

const isAdjacent = (a: Coord, b: Coord) =>
  Math.max(Math.abs(a.i - b.i), Math.abs(a.j - b.j)) === 1;

const sameCoord = (a: Coord, b: Coord) => a.i === b.i && a.j === b.j;

const includesCoord = (path: Coord[], c: Coord) => path.some((p) => sameCoord(p, c));

export interface BoardProps {
  grid: Grid;
  /** Cells highlighted from outside (e.g. solver word click). When set, swipe is disabled. */
  highlightPath?: Coord[] | null;
  /** Number of arrows to actually draw in highlightPath (for animation). */
  highlightVisibleCount?: number;
  /** Called when the user releases after swiping a path of >=2 cells. */
  onWordEntered?: (word: string, path: Coord[]) => void;
  /** Maximum rendered size in px. Defaults to 480. Board shrinks below this on narrow screens. */
  maxSize?: number;
}

export default function Board({
  grid,
  highlightPath = null,
  highlightVisibleCount,
  onWordEntered,
  maxSize = 480,
}: BoardProps) {
  const N = grid.length;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<number>(() =>
    typeof window === 'undefined' ? maxSize : Math.min(maxSize, window.innerWidth - 32),
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setSize(Math.min(maxSize, w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxSize]);

  const cellSize = useMemo(() => (N > 0 ? size / N : 0), [size, N]);
  const padding = cellSize * 0.1;
  const inner = cellSize - padding * 2;

  const [path, setPath] = useState<Coord[]>([]);
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  // Hit radius: only the inner ~38% of each cell counts as "entered".
  // This is the key UX fix for diagonals — corners are ignored so you
  // don't accidentally pick up a horizontal/vertical neighbour while
  // sweeping diagonally.
  const hitRadius = cellSize * 0.38;
  const hitRadiusSq = hitRadius * hitRadius;

  const externalMode = !!highlightPath;
  const renderPath: Coord[] = externalMode
    ? (highlightPath ?? []).slice(0, highlightVisibleCount ?? (highlightPath?.length ?? 0))
    : path;

  const localPos = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [],
  );

  /** Which cell's inner hit-circle contains (x, y), if any. */
  const cellAtPoint = useCallback(
    (x: number, y: number): Coord | null => {
      const j = Math.floor(x / cellSize);
      const i = Math.floor(y / cellSize);
      if (i < 0 || j < 0 || i >= N || j >= N) return null;
      const cx = j * cellSize + cellSize / 2;
      const cy = i * cellSize + cellSize / 2;
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > hitRadiusSq) return null;
      return { i, j };
    },
    [cellSize, N, hitRadiusSq],
  );

  /** Try to append `c` to the current path, respecting adjacency and backtracking. */
  const tryAppend = (prev: Coord[], c: Coord): Coord[] => {
    if (prev.length === 0) return [c];
    const last = prev[prev.length - 1];
    if (sameCoord(last, c)) return prev;
    if (prev.length >= 2 && sameCoord(prev[prev.length - 2], c)) {
      // backtrack
      return prev.slice(0, -1);
    }
    if (!isAdjacent(last, c) || includesCoord(prev, c)) return prev;
    return [...prev, c];
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (externalMode || !onWordEntered) return;
    const p = localPos(e.clientX, e.clientY);
    if (!p) return;
    // On initial tap, accept the cell containing the pointer even if outside the
    // inner hit-circle — users tap-and-drag from anywhere in a cell.
    const j = Math.floor(p.x / cellSize);
    const i = Math.floor(p.y / cellSize);
    if (i < 0 || j < 0 || i >= N || j >= N) return;
    dragging.current = true;
    lastPos.current = p;
    setPath([{ i, j }]);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || externalMode) return;
    const p = localPos(e.clientX, e.clientY);
    if (!p) return;
    const prevPos = lastPos.current ?? p;
    lastPos.current = p;

    // Interpolate between the previous pointer position and the current one
    // so fast diagonal swipes don't skip cells. Step size is small enough to
    // hit every cell's inner circle along the way.
    const dx = p.x - prevPos.x;
    const dy = p.y - prevPos.y;
    const dist = Math.hypot(dx, dy);
    const step = Math.max(1, Math.floor(dist / (cellSize * 0.25)));

    setPath((prev) => {
      let next = prev;
      for (let s = 1; s <= step; s++) {
        const t = s / step;
        const x = prevPos.x + dx * t;
        const y = prevPos.y + dy * t;
        const c = cellAtPoint(x, y);
        if (c) next = tryAppend(next, c);
      }
      return next;
    });
  };

  const onPointerUp = () => {
    if (!dragging.current || externalMode) return;
    dragging.current = false;
    lastPos.current = null;
    if (path.length >= 2 && onWordEntered) {
      const word = path.map((p) => grid[p.i][p.j]).join('');
      onWordEntered(word, path);
    }
    setPath([]);
  };

  // Reset internal path if mode flips
  useEffect(() => {
    if (externalMode) setPath([]);
  }, [externalMode]);

  const currentWord = path.map((p) => grid[p.i][p.j]).join('');

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: maxSize, userSelect: 'none', margin: '0 auto' }}>
      <div style={{ height: 32, textAlign: 'center', fontSize: 22, letterSpacing: 2 }}>
        {currentWord}
      </div>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ touchAction: 'none', display: 'block', maxWidth: '100%' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#228be6" />
          </marker>
        </defs>

        {grid.map((row, i) =>
          row.map((ch, j) => {
            const selected = renderPath.some((p) => p.i === i && p.j === j);
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={j * cellSize + padding}
                  y={i * cellSize + padding}
                  width={inner}
                  height={inner}
                  rx={cellSize * 0.12}
                  fill={selected ? '#d0ebff' : '#f8f9fa'}
                  stroke={selected ? '#228be6' : '#dee2e6'}
                  strokeWidth={selected ? 2 : 1}
                />
                <text
                  x={j * cellSize + cellSize / 2}
                  y={i * cellSize + cellSize / 2}
                  dominantBaseline="central"
                  textAnchor="middle"
                  fontSize={cellSize * 0.45}
                  fontWeight={600}
                  fill="#212529"
                  style={{ pointerEvents: 'none' }}
                >
                  {(ch ?? '').toUpperCase()}
                </text>
              </g>
            );
          }),
        )}

        {renderPath.slice(1).map((c, idx) => {
          const prev = renderPath[idx];
          const x1 = prev.j * cellSize + cellSize / 2;
          const y1 = prev.i * cellSize + cellSize / 2;
          const x2 = c.j * cellSize + cellSize / 2;
          const y2 = c.i * cellSize + cellSize / 2;
          // shorten so marker doesn't overlap text
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.hypot(dx, dy);
          const shrink = cellSize * 0.25;
          const sx1 = x1 + (dx / len) * shrink;
          const sy1 = y1 + (dy / len) * shrink;
          const sx2 = x2 - (dx / len) * shrink;
          const sy2 = y2 - (dy / len) * shrink;
          return (
            <line
              key={idx}
              x1={sx1}
              y1={sy1}
              x2={sx2}
              y2={sy2}
              stroke="#228be6"
              strokeWidth={3}
              strokeLinecap="round"
              markerEnd="url(#arrow)"
            />
          );
        })}
      </svg>
    </div>
  );
}
