<script setup lang="ts">
type NodeKind = "miss" | "guaranteed" | "fiftyFifty" | "unknown" | "capturingRadiance"

interface DiagramNode {
  kind: NodeKind
  labelKey: string
}

interface DiagramCase {
  titleKey: string
  descriptionKey: string
  nodes: DiagramNode[]
  formulaKey: string
}

const missIcon = "mdi-emoticon-sad"
const puIcon = "mdi-check"

const nodeStyle: Record<NodeKind, { icon: string, type: "excluded" | "normal-pickup" | "miss" }> = {
  miss: { icon: missIcon, type: "miss" },
  fiftyFifty: { icon: puIcon, type: "normal-pickup" },
  guaranteed: { icon: puIcon, type: "excluded" },
  unknown: { icon: puIcon, type: "excluded" },
  capturingRadiance: { icon: puIcon, type: "excluded" },
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
        <span class="node node--legend node--normal-pickup">
          <v-icon
            class="node__icon"
            size="16"
          >
            {{ puIcon }}
          </v-icon>
        </span>

        <span class="node node--legend node--miss">
          <v-icon
            class="node__icon"
            size="16"
          >
            {{ missIcon }}
          </v-icon>
        </span>
        <span>{{ $t("about.missRateDiagram.legend.included") }}</span>
      </div>
      <div class="legend__item">
        <span class="node node--legend node--excluded">
          <v-icon
            class="node__icon"
            size="16"
          >
            {{ puIcon }}
          </v-icon>
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
      </div>

      <div class="timeline mt-2">
        <template
          v-for="(node, ni) in c.nodes"
          :key="ni"
        >
          <div
            class="node"
            :class="`node--${nodeStyle[node.kind].type}`"
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
    gap: 8px

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
  min-width: 92px
  padding: 10px 8px
  border-radius: 8px
  position: relative
  gap: 4px

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

  &--legend
    min-width: 0
    padding: 4px 6px
    gap: 0

  &--excluded
    opacity: 0.6
    border: 1px solid rgba(var(--v-theme-on-surface), 0.2)
    background-color: rgba(var(--v-theme-on-surface), 0.1)

  &--normal-pickup
    border: 1px solid rgba(var(--v-theme-success), 0.4)
    background-color: rgba(var(--v-theme-success), 0.2)

  &--miss
    border: 1px solid rgba(var(--v-theme-warning), 0.4)
    background-color: rgba(var(--v-theme-warning), 0.2)

.arrow
  display: flex
  align-items: center
  color: rgba(var(--v-theme-on-surface), 0.4)
</style>
