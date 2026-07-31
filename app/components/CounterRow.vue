<!-- eslint-disable-next-line vue/html-comment-content-spacing -->
<!--suppress VueUnrecognizedSlot -->
<template>
  <div>
    <v-row
      class="cards"
      no-gutters
      style="gap: 16px"
    >
      <v-card>
        <div class="card">
          <h4>
            {{ i18n.t("pityCountWithRank", { rank: rankTypeToText(rarityMeta, rarityMeta.upperRankType) }) }}
          </h4>
          <div class="card__content">
            <span
              :class="pityInfo.upper.count > gachaType.star5PseudoPityBorder
                ? 'text-red' : pityInfo.upper.count > gachaType.star5PseudoPityBorder - 10
                  ? 'text-orange-darken-2' : ''"
            >{{ pityInfo.upper.count }}</span> / {{ gachaType.star5Pity }}
          </div>
        </div>
        <div class="card__bar card__bar--rank5" />
      </v-card>

      <v-card>
        <div class="card">
          <h4>{{ i18n.t("lastPulled", { rank: rankTypeToText(rarityMeta, rarityMeta.upperRankType) }) }}</h4>
          <div class="card__content">
            {{ pityInfo.upper.lastPulled }}
          </div>
        </div>
        <div class="card__bar card__bar--rank5" />
      </v-card>

      <v-card>
        <div class="card">
          <h4>{{ i18n.t("pityCountWithRank", { rank: rankTypeToText(rarityMeta, rarityMeta.lowerRankType) }) }}</h4>
          <div class="card__content">
            <span>{{ pityInfo.lower.count }}</span> / {{ star4Pity }}
          </div>
        </div>
        <div class="card__bar card__bar--rank4" />
      </v-card>

      <v-card>
        <div class="card">
          <h4>{{ i18n.t("lastPulled", { rank: rankTypeToText(rarityMeta, rarityMeta.lowerRankType) }) }}</h4>
          <div class="card__content">
            {{ pityInfo.lower.lastPulled }}
          </div>
        </div>
        <div class="card__bar card__bar--rank4" />
      </v-card>

      <v-card>
        <div class="card">
          <h4>{{ i18n.t("prob", { rank: rankTypeToText(rarityMeta, rarityMeta.upperRankType) }) }}</h4>
          <div class="card__content">
            <span>{{ (rank5Prob * 100).toFixed(2) }}</span>%
          </div>
        </div>
        <div class="card__bar card__bar--rank5" />
      </v-card>

      <v-card v-if="showPityHistory && gachaType.offBannerItems.length > 0">
        <div class="card">
          <h4>{{ i18n.t("offBannerRate", { rank: rankTypeToText(rarityMeta, rarityMeta.upperRankType) }) }}</h4>
          <div
            v-if="rank5OffBannerRate !== null"
            class="card__content"
          >
            <span>{{ (rank5OffBannerRate * 100).toFixed(2) }}</span>%
          </div>
          <div
            v-else
            class="card__content"
          >
            {{ $t("notEnoughData") }}
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
              v-for="rank in rarityMeta.rankTypes"
              :key="rank.rankType"
              :text="rank.text"
              :value="rank.rankType"
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
                :class="rankTypeToColorClass(rarityMeta, value)"
                class="d-flex align-center"
              >
                <span style="font-size: 1.3em">{{ rankTypeToText(rarityMeta, value) }}</span>
              </div>
            </template>

            <template #item.name="{ item, value }">
              <div class="d-flex align-center ga-2">
                <AsyncImg
                  v-if="item.importImageUrl"
                  :key="item.importImageUrl"
                  :src="item.importImageUrl"
                  size="35px"
                />
                <span>{{ value }}</span>
                <v-tooltip
                  v-if="item.offBanner"
                  location="top"
                  :text="$t('pity.offBanner')"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-icon
                      v-bind="tooltipProps"
                      icon="mdi-emoticon-sad"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip
                  v-if="item.isStreakGuarantee && gachaType.consecutiveOffBannerGuarantee"
                  location="top"
                  :text="$t(gachaType.consecutiveOffBannerGuarantee.markerLabelKey)"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-icon
                      v-bind="tooltipProps"
                      icon="mdi-shimmer"
                    />
                  </template>
                </v-tooltip>
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
import type { GachaLogEntry } from "~/types/db.js"
import type { GachaType } from "~/types/gacha-type.js"
import type { DataTableHeader } from "vuetify/framework"
import AsyncImg from "~/components/AsyncImg.vue"
import { rankTypeToColorClass, rankTypeToText, type RarityMeta } from "~/constants.js"
import { computePityHistory } from "~/utils/pity-calculator.js"

const props = defineProps<{
  entries: GachaLogEntry[]
  gachaType: GachaType
  rarityMeta: RarityMeta
  showPityHistory: boolean
}>()

const i18n = useI18n()

const filter = ref<string[]>([])
const initFilter = () => {
  filter.value = props.rarityMeta.rareRankTypes
}
watch(toRefs(props).rarityMeta, () => {
  initFilter()
}, { immediate: true })

const star4Pity = 10
const tableHeaders = computed<DataTableHeader[]>(() => [
  { key: "rank", width: "10%", nowrap: true },
  { title: i18n.t("itemName"), key: "name", width: "30%", minWidth: "150px" },
  { key: "count", width: "10%", align: "end", nowrap: true },
  { title: i18n.t("dateTime"), key: "dateTime" },
])

const pityCounts = computed(() => {
  return computePityHistory(props.entries, props.gachaType, props.rarityMeta, {
    getName: entry => getItemName(entry)?.[i18n.locale.value] ?? entry.name,
    getItemId,
    getImage: getItemImage,
  })
})

const filteredPityCountList = computed(() => {
  return pityCounts.value.list.filter(e => filter.value.includes(e.rank))
})

const pityInfo = computed(() => {
  const lowerItem = pityCounts.value.list.find(e => e.rank === props.rarityMeta.lowerRankType)
  const upperItem = pityCounts.value.list.find(e => e.rank === props.rarityMeta.upperRankType)
  const counts = pityCounts.value.counts

  return {
    lower: {
      count: counts[props.rarityMeta.lowerRankType] ?? 0,
      lastPulled: lowerItem?.name ?? "-",
    },
    upper: {
      count: counts[props.rarityMeta.upperRankType] ?? 0,
      lastPulled: upperItem?.name ?? "-",
    },
  }
})

const rank5Prob = computed(() => {
  const trial = pityInfo.value.upper.count + 10

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

const rank5OffBannerRate = computed(() => {
  const consideredRank5 = pityCounts.value.list.filter(e =>
    e.rank === props.rarityMeta.upperRankType
    && e.isDefinitive === false
    && !e.isStreakGuarantee,
  )
  if (consideredRank5.length < 2) {
    return null
  }
  // The oldest entry's isDefinitive defaults to false because we don't know
  // the outcome of the 5★ pulled before the history window. If it's a
  // pickup, we can't tell whether it was a 50/50 win or a guaranteed pull
  // following an out-of-window loss, so exclude it. Off-banner entries are
  // safe to keep because off-banner can only occur during 50/50.
  if (!consideredRank5.slice(-1)[0]!.offBanner) {
    consideredRank5.pop()
  }
  const offBannerRank5 = consideredRank5.filter(e => e.offBanner).length
  return offBannerRank5 / consideredRank5.length
})
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
