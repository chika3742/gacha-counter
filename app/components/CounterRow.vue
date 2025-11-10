<template>
  <div>
    <v-row
      class="cards"
      no-gutters
      style="gap: 16px"
    >
      <v-card>
        <div class="card">
          <h4>{{ i18n.t("pityCountWithStar", { star: "5" }) }}</h4>
          <div class="card__content">
            <span
              :class="pityInfo[5].count > gachaType.star5PseudoPityBorder
                ? 'text-red' : pityInfo[5].count > gachaType.star5PseudoPityBorder - 10
                  ? 'text-orange-darken-2' : ''"
            >{{ pityInfo[5].count }}</span> / {{ gachaType.star5Pity }}
          </div>
        </div>
        <div class="card__bar card__bar--rank5" />
      </v-card>

      <v-card>
        <div class="card">
          <h4>{{ i18n.t("lastPulled", { star: "5" }) }}</h4>
          <div class="card__content">
            {{ pityInfo[5].lastPulled }}
          </div>
        </div>
        <div class="card__bar card__bar--rank5" />
      </v-card>

      <v-card>
        <div class="card">
          <h4>{{ i18n.t("pityCountWithStar", { star: "4" }) }}</h4>
          <div class="card__content">
            <span>{{ pityInfo[4].count }}</span> / {{ star4Pity }}
          </div>
        </div>
        <div class="card__bar card__bar--rank4" />
      </v-card>

      <v-card>
        <div class="card">
          <h4>{{ i18n.t("lastPulled", { star: "4" }) }}</h4>
          <div class="card__content">
            {{ pityInfo[4].lastPulled }}
          </div>
        </div>
        <div class="card__bar card__bar--rank4" />
      </v-card>

      <v-card>
        <div class="card">
          <h4>{{ i18n.t("prob") }}</h4>
          <div class="card__content">
            <span>{{ (rank5Prob * 100).toFixed(2) }}</span>%
          </div>
        </div>
        <div class="card__bar card__bar--rank5" />
      </v-card>
    </v-row>

    <v-expansion-panels
      v-if="showPityHistory"
      class="mt-4"
      style="max-width: 800px"
    >
      <v-expansion-panel>
        <v-expansion-panel-title>{{ $t("pityHistory") }}</v-expansion-panel-title>
        <v-expansion-panel-text class="pity-history-container">
          <v-chip-group
            v-model="filter"
            class="mx-2"
            column
            multiple
            filter
            mandatory
            color="primary"
          >
            <v-chip
              text="☆3"
              value="3"
            />
            <v-chip
              text="☆4"
              value="4"
            />
            <v-chip
              text="☆5"
              value="5"
            />
          </v-chip-group>
          <p class="my-0 opacity-70 text-caption text-center d-md-none">
            左右にスクロールできます
          </p>
          <v-data-table-virtual
            :headers="tableHeaders"
            :items="filteredPityCountList"
            height="500px"
            disable-sort
            fixed-header
            :no-data-text="$t('noData')"
          >
            <template #header.rank>
              <v-icon>mdi-star</v-icon>
            </template>
            <template #header.count>
              <v-icon>mdi-counter</v-icon>
            </template>
            <template #item.rank="{ value }">
              <div
                :class="`text-rarity-${value}`"
                class="d-flex align-center"
              >
                <v-icon size="18">
                  mdi-star
                </v-icon>
                <span style="font-size: 1.3em">{{ value }}</span>
              </div>
            </template>

            <template #item.name="{ item, value }">
              <div class="d-flex align-center ga-3">
                <AsyncImg
                  :key="item.importImageUrl"
                  :src="item.importImageUrl"
                  size="35px"
                />
                <span>{{ value }}</span>
              </div>
            </template>

            <template #item.count="{ item, value }">
              <span
                :class="item.countColorClass"
                class="font-cairo font-weight-bold text-end"
                style="font-size: 1.3em"
              >
                {{ value ?? "-" }}
              </span>
            </template>

            <template #item.dateTime="{ value }">
              <span class="text-no-wrap">
                {{ value.toFormat("yyyy/MM/dd HH:mm") }}<br>
                ({{ value.toRelative({ locale: $i18n.locale }) }})
              </span>
            </template>
          </v-data-table-virtual>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts" setup>
import { DateTime } from "luxon"
import type { GachaLogEntry } from "~/types/db.js"
import type { GachaType } from "~/types/gacha-type.js"
import type { DataTableHeader } from "vuetify/framework"
import AsyncImg from "~/components/AsyncImg.vue"

const props = defineProps<{
  entries: GachaLogEntry[]
  gachaType: GachaType
  showPityHistory: boolean
}>()

export interface PityCountListItem {
  entryId: string
  rank: string
  type: string
  name: string
  count: number | null
  countColorClass?: string
  offBanner: boolean
  dateTime: DateTime
  importImageUrl: string | undefined
}

const i18n = useI18n()

const filter = ref<string[]>(["4", "5"])

const star4Pity = 10
const tableHeaders = computed<DataTableHeader[]>(() => [
  { key: "rank", width: "10%", nowrap: true },
  { title: i18n.t("itemName"), key: "name", width: "30%", minWidth: "150px" },
  { key: "count", width: "10%", align: "end", nowrap: true },
  { title: i18n.t("dateTime"), key: "dateTime" },
])

const pityCounts = computed(() => {
  const result: PityCountListItem[] = []

  const pityCount: Record<string, number> = {
    4: 0,
    5: 0,
  }

  for (const entry of props.entries) {
    for (const key of Object.keys(pityCount)) {
      pityCount[key]!++
    }

    const name = getItemName(entry)?.[i18n.locale.value] ?? i18n.t("unknown")
    result.push({
      entryId: entry.remoteId,
      name,
      type: entry.itemType,
      count: pityCount[entry.rankType] ?? null,
      countColorClass: getNumberColorClass(pityCount[entry.rankType], entry.rankType, props.gachaType.star5PseudoPityBorder),
      offBanner: props.gachaType.offBannerItems.includes(getItemId(entry) ?? ""),
      dateTime: DateTime.fromFormat(entry.time, "yyyy-MM-dd HH:mm:ss"),
      rank: entry.rankType,
      importImageUrl: getItemImage(entry),
    })
    if (entry.rankType !== "3") {
      pityCount[entry.rankType] = 0
    }
  }

  return { list: result.reverse(), counts: pityCount }
})

const filteredPityCountList = computed(() => {
  return pityCounts.value.list.filter(e => filter.value.includes(e.rank))
})

const pityInfo = computed(() => {
  const r4Item = pityCounts.value.list.find(e => e.rank === "4")
  const r5Item = pityCounts.value.list.find(e => e.rank === "5")
  const counts = pityCounts.value.counts

  return {
    4: {
      count: counts["4"] ?? 0,
      lastPulled: r4Item?.name ?? "-",
    },
    5: {
      count: counts["5"] ?? 0,
      lastPulled: r5Item?.name ?? "-",
    },
  }
})

const rank5Prob = computed(() => {
  const trial = pityInfo.value[5].count + 10

  const pseudoPityBorder = props.gachaType.star5PseudoPityBorder
  if (trial <= pseudoPityBorder) {
    return 1 - Math.pow(1 - props.gachaType.singleProb, trial)
  } else {
    let prob = Math.pow(1 - props.gachaType.singleProb, pseudoPityBorder)
    for (let i = 1; i <= trial - pseudoPityBorder; i++) {
      prob *= 1 - (0.06 * i)
    }
    return 1 - prob
  }
})

const getNumberColorClass = (count: number | undefined, rank: string, pseudoPityBorder: number) => {
  if (!count) {
    return ""
  }

  if (rank === "4") {
    if (count >= 10) {
      return "text-pity"
    } else {
      return "text-lucky"
    }
  } else if (rank === "5") {
    if (count > pseudoPityBorder) {
      return "text-pity"
    } else {
      return "text-lucky"
    }
  } else {
    return ""
  }
}
</script>

<style lang="sass" scoped>
.cards
  .card
    padding: 8px 16px

    h4
      font-weight: normal
      font-size: 0.9rem

    &__content
      text-align: center
      font-size: 1.1rem
      font-weight: bold
      margin-top: 4px

      span
        font-size: 1.8rem
        margin-right: 4px
        font-family: "Cairo", "M PLUS 2", sans-serif

    &__bar
      height: 4px
      width: 100%
      position: absolute
      bottom: 0

      &--rank5
        background-color: rgb(var(--v-theme-rarity-5))

      &--rank4
        background-color: rgb(var(--v-theme-rarity-4))
</style>

<style lang="sass">
.pity-history-container .v-expansion-panel-text__wrapper
  padding-left: 0
  padding-right: 0
</style>
