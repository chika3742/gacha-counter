export const useDialogState = <T = void, R = void>() => {
  const isRevealed = ref(false)
  const _args = shallowRef<T | null>(null)

  let pendingResolve: ((value: R | null) => void) | null = null

  const reveal = (args?: T): Promise<R | null> => {
    _args.value = args
    isRevealed.value = true

    return new Promise<R | null>((resolve) => {
      pendingResolve = resolve
    })
  }
  const cancel = () => isRevealed.value = false
  const done = (value: R) => {
    pendingResolve?.(value)
    pendingResolve = null
    isRevealed.value = false
  }
  const clearArgs = () => _args.value = null

  watch(isRevealed, (next) => {
    if (!next) {
      pendingResolve?.(null)
      pendingResolve = null
    }
  })

  return {
    isRevealed,
    args: _args,
    reveal,
    cancel,
    clearArgs,
    done,
  }
}
