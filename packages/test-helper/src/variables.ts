type Key = string | number | symbol
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Value = any

class Variables<
  T extends Record<Key, Value>,
  Prop extends keyof T = keyof T,
  Val extends T[Prop] = T[Prop]
> {
  private data: Map<Prop, Val>

  constructor() {
    this.data = new Map()
  }

  set<N extends Prop = Prop, V extends T[N] = T[N]>(name: N, value: V) {
    this.data.set(name, value)
  }

  get<N extends Prop = Prop, V extends T[N] = T[N]>(name: N): V | undefined {
    const value = this.data.get(name)
    if (!value) return
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value as V
  }

  clear() {
    this.data = new Map()
  }
}

function vars<T extends Record<Key, Value>>() {
  return new Variables<T>()
}

export { vars }
