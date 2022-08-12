// A, Á, B, C, D, E, É, F, G, H, I, Í, J, K, L, M, N, O, Ó, Ö, Ő, P, Q, R, S,T, U, Ú, Ü, Ű, V, W, X, Y, Z = 35
// Cs, Dz, Dzs, Gy, Ly, Ny, Sz, Ty, Zs = 9
class Node {
  public value: string | null = null;
  public isEndOfWord = false;
  public children: Record<string, Node> = {};
  constructor(value: string | null) {
    this.value = value;
  }
}

export class Trie {
  public root: Node;
  constructor() {
    this.root = new Node(null);
  }

  insert(word: string) {
    let current = this.root;
    for (const character of word) {
      if (current.children[character] === undefined) {
        current.children[character] = new Node(character);
      }
      current = current.children[character];
    }
    current.isEndOfWord = true;
  }

  search(word: string) {
    let current = this.root;
    for (const character of word) {
      if (current.children[character] === undefined) {
        return false;
      }
      current = current.children[character];
    }
    return current.isEndOfWord;
  }

  isValidPrefix(prefix: string) {
    let currentNode = this.root;
    return prefix.split("").every((letter) => {
      if (!currentNode.children[letter]) {
        return false;
      }
      currentNode = currentNode.children[letter];
      return true;
    });
  }

  from(dict: string[]) {
    dict.forEach((word) => {
      this.insert(word);
    });
  }
}
