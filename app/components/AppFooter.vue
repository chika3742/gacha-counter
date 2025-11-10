<script setup lang="ts">
import xLogo from "~/assets/vec/X_logo.svg"

const repositoryUrl = "https://github.com/chika3742/gacha-counter"
</script>

<template>
  <v-footer v-safe-area="{ left: true, bottom: 8, right: true }">
    <div class="d-flex flex-column w-100 ga-4">
      <div class="d-flex px-4 ga-4">
        <v-btn
          variant="tonal"
          href="https://onelink.to/n5xsnp"
          target="_blank"
        >
          <template #prepend>
            <v-img
              src="~/assets/img/icon_gmn.webp"
              width="30px"
              height="30px"
            />
          </template>
          原神素材ノート
        </v-btn>
        <v-btn
          variant="tonal"
          href="https://hsr.matnote.app?utm_source=gc_footer"
          target="_blank"
        >
          <template #prepend>
            <v-img
              src="~/assets/img/icon_hsrmn.webp"
              width="30px"
              height="30px"
            />
          </template>
          崩壊：スターレイル 素材ノート
        </v-btn>
      </div>
      <div class="d-flex align-center justify-end">
        <span
          class="ml-4"
          style="font-size: 0.8rem"
        >
          &copy;cq 2025 | built at {{ new Date($config.public.builtAt).toLocaleString() }}
        </span>
        <v-spacer />
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
                v-for="locale in $i18n.locales.value"
                :key="locale.code"
                :active="$i18n.locale === locale.code"
                @click="$i18n.setLocale(locale.code)"
              >
                <v-list-item-title>{{ locale.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
      </div>
    </div>
  </v-footer>
</template>

<style scoped lang="sass">

</style>
