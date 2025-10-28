<script setup lang="ts">
import { CustomMarked } from "~/libs/custom-marked.js"
import CopyBtn from "~/components/CopyBtn.vue"

interface Props {
  game: string
}
const props = defineProps<Props>()

const i18n = useI18n()

const marked = new CustomMarked({ gfm: false })

const phKeys = ["game", "gacha", "historyOperation"]
const phContents = computed(() => {
  return phKeys.reduce((acc, key) => {
    acc[key] = i18n.t(`placeholders.${props.game}.${key}`)
    return acc
  }, {} as Record<string, string>)
})

const streamUrl = "https://apps.apple.com/app/stream/id1312141691"
const cmdlineWin = i18n.t("howToGetUrl.windows.cmdline")
const cmdlineMacos1 = "curl \"https://gist.githubusercontent.com/chika3742/3a65b7530c021b9ac631408b033edc4f/raw/install-ca.sh\" | bash"
const cmdlineMacos2 = "curl \"https://gist.githubusercontent.com/chika3742/3a65b7530c021b9ac631408b033edc4f/raw/run.sh\" | bash"
const cmdlineIos = "public-operation-hkrpg-sg.hoyoverse.com"
</script>

<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title>{{ $t("about.title") }}</v-expansion-panel-title>
      <v-expansion-panel-text>
        <div v-html="marked.parse($t('about.content', phContents))" />
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title>{{ $t("howToGetUrl.windows.title") }}</v-expansion-panel-title>
      <v-expansion-panel-text eager>
        <client-only>
          <div v-html="marked.parse($t('howToGetUrl.windows.contents', { cmdline: cmdlineWin, ...phContents }))" />
          <teleport
            :key="game + '-win'"
            to="#cmd-win"
          >
            <CopyBtn :copy-text="cmdlineWin" />
          </teleport>
        </client-only>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title>{{ $t("howToGetUrl.ios.title") }}</v-expansion-panel-title>
      <v-expansion-panel-text eager>
        <client-only>
          <div v-html="marked.parse(i18n.t('howToGetUrl.ios.contents', { streamUrl, cmdline: cmdlineIos, ...phContents }))" />
          <teleport
            :key="game + '-ios'"
            to="#cmd-ios"
          >
            <CopyBtn :copy-text="cmdlineIos" />
          </teleport>
        </client-only>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title>{{ $t("howToGetUrl.macos.title") }}</v-expansion-panel-title>
      <v-expansion-panel-text eager>
        <client-only>
          <div
            v-html="marked.parse($t('howToGetUrl.macos.contents', { cmdline1: cmdlineMacos1, cmdline2: cmdlineMacos2, ...phContents }))"
          />
          <teleport
            :key="game + '-macos-1'"
            to="#cmd-macos-1"
          >
            <CopyBtn :copy-text="cmdlineMacos1" />
          </teleport>
          <teleport
            :key="game + '-macos-2'"
            to="#cmd-macos-2"
          >
            <CopyBtn :copy-text="cmdlineMacos2" />
          </teleport>
        </client-only>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<style lang="sass">
#windows-script
  height: 48px
</style>
