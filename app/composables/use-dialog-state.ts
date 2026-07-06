export const useDialogState = () => {
  const isRevealed = ref(false)

  const reveal = () => isRevealed.value = true
  const cancel = () => isRevealed.value = false

  return {
    isRevealed,
    reveal,
    cancel,
  }
}
