<script setup lang="ts">
interface Props {
  src: string | undefined
  size?: string
}
const props = defineProps<Props>()

const assets = import.meta.glob("~/assets/remote/**/*.webp", { import: "default" })

const { data: image } = useLazyAsyncData<string | undefined>(String(props.src), async () => {
  if (!props.src) {
    return undefined
  }
  return await assets[props.src]?.() as string
})
</script>

<template>
  <v-img
    :src="image"
    :max-width="size"
    :width="size"
    :height="size"
  />
</template>

<style scoped lang="sass">

</style>
