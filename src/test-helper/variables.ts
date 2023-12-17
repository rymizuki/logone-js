class Variables<T extends object> {
  private data: T

  constructor(defaultValue: T) {
    this.data = defaultValue
  }

  set<Name extends keyof T = keyof T, Val extends T[Name] = T[Name]>(
    name: Name,
    value: Val
  ) {
    this.data[name] = value
  }

  get<Name extends keyof T = keyof T>(name: Name): T[Name] {
    const value = this.data[name]
    return value
  }
}

function createVars<T extends object>(defaultValue: T) {
  return new Variables<T>(defaultValue)
}

export { createVars }
