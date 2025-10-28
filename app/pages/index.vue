<script setup lang="ts">
import iconGenshin from "~/assets/img/icon_genshin.png"
import iconHsr from "~/assets/img/icon_hsr.png"

const i18n = useI18n()

const games = [
  {
    name: i18n.t("games.genshin"),
    id: "genshin",
    img: iconGenshin,
    color: "#ec723c",
  },
  {
    name: i18n.t("games.hsr"),
    id: "hsr",
    img: iconHsr,
    color: "#85f38c",
  },
]

const selectedGame = ref(games[0]!.id)
const url = ref("")
</script>

<template>
  <div class="doc-container d-flex flex-column ga-4">
    <v-btn-toggle
      v-model="selectedGame"
      style="height: 70px"
    >
      <v-btn
        v-for="entry in games"
        :key="entry.id"
        :value="entry.id"
        :text="entry.name"
        :color="entry.color"
      >
        <template #prepend>
          <v-img
            :src="entry.img"
            width="50px"
          />
        </template>
      </v-btn>
    </v-btn-toggle>

    <Description :game="selectedGame" />
  </div>
</template>

<style scoped lang="sass">

</style>
