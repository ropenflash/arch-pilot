export type RingNode = {
  id: string;
  position: number;
};

export function moduloShard(key: number, shardCount: number) {
  return ((key % shardCount) + shardCount) % shardCount;
}

export function hashPosition(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 360;
}

export function ringNodes(count: number): RingNode[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `Server ${String.fromCharCode(65 + index)}`,
    position: Math.round((index / count) * 360),
  }));
}

export function consistentHashOwner(key: string, nodes: RingNode[]) {
  if (!nodes.length) return undefined;
  const position = hashPosition(key);
  const ordered = [...nodes].sort((a, b) => a.position - b.position);
  return ordered.find((node) => node.position >= position) ?? ordered[0];
}

export function assignments(keys: string[], nodes: RingNode[]) {
  return Object.fromEntries(
    keys.map((key) => [key, consistentHashOwner(key, nodes)?.id ?? "unassigned"]),
  );
}

export function movedKeys(
  before: Record<string, string>,
  after: Record<string, string>,
) {
  return Object.keys(after).filter((key) => before[key] !== after[key]);
}
