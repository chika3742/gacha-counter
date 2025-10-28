<script setup lang="ts">
interface Props {
  copyText: string
}
const props = defineProps<Props>()

const snackbar = useSnackbar()
const i18n = useI18n()

const copy = async () => {
  await navigator.clipboard.writeText(props.copyText)
  snackbar.show(i18n.t("ui.copied"))
}
</script>

<template>
  <v-btn
    icon="mdi-content-copy"
    variant="text"
    @click="copy"
  />
</template>
