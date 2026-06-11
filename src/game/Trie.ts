/**
 * Trie (prefix tree) used to validate boggle words.
 *
 * Built once per dictionary in src/dict/loadDict.ts. Two operations matter:
 *   - `search(word)`     → exact match: is this a real word?
 *   - `isValidPrefix(p)` → is any word starting with `p` worth continuing?
 *
 * The latter is what lets the solver prune the DFS aggressively — without it
 * we'd brute-force every cell sequence on the board.
 */
class Node {
  public isEndOfWord = false;
  public children: Record<string, Node> = {};
}

export class Trie {
  public root: Node = new Node();

  insert(word: string): void {
    let current = this.root;
    for (const ch of word) {
      if (!current.children[ch]) current.children[ch] = new Node();
      current = current.children[ch];
    }
    current.isEndOfWord = true;
  }

  /** True if `word` was inserted (exact match). */
  search(word: string): boolean {
    const node = this.findNode(word);
    return !!node && node.isEndOfWord;
  }

  /** True if at least one inserted word starts with `prefix`. Used to prune DFS. */
  isValidPrefix(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }

  private findNode(s: string): Node | null {
    let current = this.root;
    for (const ch of s) {
      if (!current.children[ch]) return null;
      current = current.children[ch];
    }
    return current;
  }

  /** Build a Trie from any word iterable in one pass. */
  static from(words: Iterable<string>): Trie {
    const t = new Trie();
    for (const w of words) t.insert(w);
    return t;
  }
}
