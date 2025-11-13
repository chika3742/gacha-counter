<script setup lang="ts">
import type { GachaType } from "~/types/gacha-type.js"
import type { GameType } from "~~/functions/constants.js"
import type { GachaLogEntry } from "~/types/db.js"
import { rarityMetaRecord } from "~/constants.js"

interface Props {
  gachaTypes: GachaType[]
  game: GameType
  entries: GachaLogEntry[]
  showPityHistory: boolean
}
const props = defineProps<Props>()

const gachaTypeEntries = computed<Record<string, GachaLogEntry[]>>(() => {
  const result = Object.fromEntries<GachaLogEntry[]>(props.gachaTypes.map(e => [e.id, []]))
  for (const entry of props.entries) {
    result[entry.queryGachaType]?.push(entry)
  }
  return result
})
</script>

<template>
  <div class="d-flex flex-column ga-8">
    <div
      v-for="gachaType in gachaTypes"
      :key="gachaType.id"
    >
      <h2 class="mb-4">
        {{ $t(gachaType.title) }}
      </h2>
      <CounterRow
        :entries="gachaTypeEntries?.[gachaType.id] ?? []"
        :rarity-meta="rarityMetaRecord[game]"
        :gacha-type="gachaType"
        :show-pity-history="showPityHistory"
      />
    </div>
  </div>
</template>

<style scoped lang="sass">

</style>
