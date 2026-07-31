<script setup lang="ts">
type NodeKind = "miss" | "guaranteed" | "fiftyFifty" | "unknown" | "capturingRadiance"

interface DiagramNode {
  kind: NodeKind
  labelKey: string
  subLabelKey?: string
}

interface DiagramCase {
  titleKey: string
  descriptionKey: string
  nodes: DiagramNode[]
  formulaKey: string
  genshinOnly?: boolean
}

const missIcon = "mdi-emoticon-sad"
const puIcon = "mdi-check"

const nodeStyle: Record<NodeKind, { icon: string, color: string, excluded: boolean, miss: boolean }> = {
  miss: { icon: missIcon, color: "warning", excluded: false, miss: true },
  fiftyFifty: { icon: puIcon, color: "success", excluded: false, miss: false },
  guaranteed: { icon: puIcon, color: "grey", excluded: true, miss: false },
  unknown: { icon: puIcon, color: "grey", excluded: true, miss: false },
  capturingRadiance: { icon: puIcon, color: "grey", excluded: true, miss: false },
}

const cases: DiagramCase[] = [
  {
    titleKey: "about.missRateDiagram.cases.case1.title",
    descriptionKey: "about.missRateDiagram.cases.case1.description",
    formulaKey: "about.missRateDiagram.cases.case1.formula",
    nodes: [
      { kind: "miss", labelKey: "about.missRateDiagram.labels.miss" },
      { kind: "guaranteed", labelKey: "about.missRateDiagram.labels.guaranteed" },
      { kind: "fiftyFifty", labelKey: "about.missRateDiagram.labels.fiftyFifty" },
      { kind: "miss", labelKey: "about.missRateDiagram.labels.miss" },
      { kind: "guaranteed", labelKey: "about.missRateDiagram.labels.guaranteed" },
    ],
  },
  {
    titleKey: "about.missRateDiagram.cases.case2.title",
    descriptionKey: "about.missRateDiagram.cases.case2.description",
    formulaKey: "about.missRateDiagram.cases.case2.formula",
    nodes: [
      { kind: "unknown", labelKey: "about.missRateDiagram.labels.unknown" },
      { kind: "miss", labelKey: "about.missRateDiagram.labels.miss" },
      { kind: "guaranteed", labelKey: "about.missRateDiagram.labels.guaranteed" },
      { kind: "fiftyFifty", labelKey: "about.missRateDiagram.labels.fiftyFifty" },
    ],
  },
  {
    titleKey: "about.missRateDiagram.cases.case3.title",
    descriptionKey: "about.missRateDiagram.cases.case3.description",
    formulaKey: "about.missRateDiagram.cases.case3.formula",
    genshinOnly: true,
    nodes: [
      { kind: "miss", labelKey: "about.missRateDiagram.labels.miss" },
      { kind: "guaranteed", labelKey: "about.missRateDiagram.labels.guaranteed" },
      { kind: "miss", labelKey: "about.missRateDiagram.labels.miss" },
      { kind: "guaranteed", labelKey: "about.missRateDiagram.labels.guaranteed" },
      { kind: "miss", labelKey: "about.missRateDiagram.labels.miss" },
      { kind: "guaranteed", labelKey: "about.missRateDiagram.labels.guaranteed" },
      { kind: "capturingRadiance", labelKey: "about.missRateDiagram.labels.capturingRadiance" },
    ],
  },
]
</script>

<template>
  <div class="miss-rate-diagram">
    <div class="legend">
      <div class="legend__item">
        <span class="chip chip--miss">
          <v-icon size="16">{{ missIcon }}</v-icon>
        </span>
        <span>{{ $t("about.missRateDiagram.legend.miss") }}</span>
      </div>
      <div class="legend__item">
        <span class="chip chip--fiftyFifty">
          <v-icon size="16">{{ puIcon }}</v-icon>
        </span>
        <span>{{ $t("about.missRateDiagram.legend.win") }}</span>
      </div>
      <div class="legend__item">
        <span class="chip chip--excluded">
          <v-icon size="16">{{ puIcon }}</v-icon>
        </span>
        <span>{{ $t("about.missRateDiagram.legend.excluded") }}</span>
      </div>
    </div>

    <div
      v-for="(c, ci) in cases"
      :key="ci"
      class="case"
    >
      <div class="case__header">
        <span class="case__title">{{ $t(c.titleKey) }}</span>
        <v-chip
          v-if="c.genshinOnly"
          size="x-small"
          color="primary"
          variant="tonal"
        >
          {{ $t("games.genshin") }}
        </v-chip>
      </div>
      <p class="case__desc">
        {{ $t(c.descriptionKey) }}
      </p>

      <div class="timeline">
        <template
          v-for="(node, ni) in c.nodes"
          :key="ni"
        >
          <div
            class="node"
            :class="[
              `node--${nodeStyle[node.kind].color}`,
              nodeStyle[node.kind].excluded ? 'node--excluded' : 'node--included',
              nodeStyle[node.kind].miss ? 'node--miss' : '',
            ]"
          >
            <div class="node__index">
              {{ ni + 1 }}
            </div>
            <v-icon
              class="node__icon"
              size="22"
            >
              {{ nodeStyle[node.kind].icon }}
            </v-icon>
            <span class="node__label">{{ $t(node.labelKey) }}</span>
          </div>
          <div
            v-if="ni < c.nodes.length - 1"
            class="arrow"
          >
            <v-icon size="16">
              mdi-arrow-right
            </v-icon>
          </div>
        </template>
      </div>

      <div class="case__formula">
        {{ $t(c.formulaKey) }}
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.miss-rate-diagram
  margin: 12px 0

.legend
  display: flex
  flex-wrap: wrap
  gap: 8px 20px
  padding: 12px 16px
  margin-bottom: 16px
  border-radius: 8px
  background-color: rgba(var(--v-theme-on-surface), 0.04)
  font-size: 0.85rem

  &__item
    display: flex
    align-items: center
    gap: 6px

.case
  margin-bottom: 20px
  padding: 16px
  border-radius: 8px
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12)

  &__header
    display: flex
    align-items: center
    gap: 8px
    margin-bottom: 4px

  &__title
    font-weight: bold
    font-size: 0.95rem

  &__desc
    font-size: 0.85rem
    opacity: 0.75
    margin: 0 0 12px 0

  &__formula
    margin-top: 12px
    padding: 8px 12px
    border-radius: 6px
    background-color: rgba(var(--v-theme-primary), 0.08)
    color: rgb(var(--v-theme-primary))
    font-weight: bold
    font-family: "Cairo", "M PLUS 2", sans-serif

.timeline
  display: flex
  flex-wrap: wrap
  align-items: stretch
  gap: 6px

.node
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  min-width: 88px
  padding: 8px 6px
  border-radius: 8px
  border: 2px solid
  position: relative
  gap: 2px

  &__index
    position: absolute
    top: 2px
    left: 6px
    font-size: 0.7rem
    opacity: 0.6
    font-family: "Cairo", "M PLUS 2", sans-serif

  &__label
    font-size: 0.75rem
    text-align: center
    line-height: 1.2
    white-space: pre-line

  &--warning
    border-color: rgb(var(--v-theme-warning))
    background-color: rgba(var(--v-theme-warning), 0.1)
    color: rgb(var(--v-theme-warning))

  &--success
    border-color: rgb(var(--v-theme-success))
    background-color: rgba(var(--v-theme-success), 0.1)
    color: rgb(var(--v-theme-success))

  &--grey
    border-style: dashed
    border-color: rgba(var(--v-theme-on-surface), 0.3)
    background-color: rgba(var(--v-theme-on-surface), 0.03)
    color: rgba(var(--v-theme-on-surface), 0.6)

.arrow
  display: flex
  align-items: center
  color: rgba(var(--v-theme-on-surface), 0.4)

.chip
  display: inline-flex
  align-items: center
  justify-content: center
  width: 22px
  height: 22px
  border-radius: 4px
  border: 2px solid

  &--miss
    border-color: rgb(var(--v-theme-warning))
    background-color: rgba(var(--v-theme-warning), 0.15)
    color: rgb(var(--v-theme-warning))

  &--fiftyFifty
    border-color: rgb(var(--v-theme-success))
    background-color: rgba(var(--v-theme-success), 0.15)
    color: rgb(var(--v-theme-success))

  &--excluded
    border-style: dashed
    border-color: rgba(var(--v-theme-on-surface), 0.3)
    color: rgba(var(--v-theme-on-surface), 0.6)
</style>
