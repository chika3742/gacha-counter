<script setup lang="ts">
import xLogo from "~/assets/vec/X_logo.svg"

const repositoryUrl = "https://github.com/chika3742/gacha-counter"

const i18n = useI18n()
</script>

<template>
  <v-footer
    v-safe-area="{ left: true, bottom: 8, right: true }"
    class="d-flex justify-end"
  >
    <v-btn
      icon
      href="https://x.com/gms_material"
      target="_blank"
      variant="text"
      density="comfortable"
    >
      <v-img
        :src="xLogo"
        width="20px"
        style="filter: invert(1)"
      />
    </v-btn>

    <v-btn
      icon="mdi-github"
      :href="repositoryUrl"
      target="_blank"
      variant="text"
      density="comfortable"
    />

    <v-btn
      prepend-icon="mdi-earth"
      variant="text"
      density="comfortable"
    >
      LANG
      <v-menu activator="parent">
        <v-list>
          <v-list-item
            v-for="lang in $i18n.availableLocales"
            :key="lang"
            :active="$i18n.locale === lang"
            @click="$i18n.setLocale(lang)"
          >
            <v-list-item-title>{{ i18n.locales.value.find((e) => e.code === lang)?.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>
  </v-footer>
</template>

<style scoped lang="sass">

</style>
