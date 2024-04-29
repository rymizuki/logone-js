export const waitTimeout = async (timeout: number) => {
  return new Promise((resolve) => setTimeout(() => resolve(undefined), timeout))
}
