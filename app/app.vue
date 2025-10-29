<script setup lang="ts">
const snackbar = useSnackbar()
const dialog = useDialog()
</script>

<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>{{ $t("appName") }}</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <div class="h-100 d-flex flex-column">
        <v-container>
          <NuxtPage />
        </v-container>
        <v-spacer />
        <AppFooter class="flex-0-0" />
      </div>
    </v-main>

    <!-- global snackbar -->
    <v-snackbar
      v-model="snackbar.ref.value.displayed"
      :color="snackbar.ref.value.color ?? undefined"
    >
      <span>{{ snackbar.ref.value.message }}</span>

      <template #actions>
        <v-btn
          v-for="(action, i) in snackbar.ref.value.actions"
          :key="i"
          :text="action.text"
          color="primary"
          style="filter: invert(1)"
          variant="text"
          @click="action.onClick(); snackbar.ref.value.displayed = false"
        />
      </template>
    </v-snackbar>

    <!-- global dialog -->
    <v-dialog
      v-model="dialog.ref.value.displayed"
      :persistent="dialog.ref.value.persistent"
      max-width="500px"
      @close="dialog.ref.value.onCancel"
    >
      <v-card :title="dialog.ref.value.title">
        <template #text>
          <p class="text-pre-wrap">
            {{ dialog.ref.value.content }}
          </p>
        </template>
        <template #actions>
          <v-spacer />
          <v-btn @click="dialog.ref.value.onCancel">
            {{ $t("ui.cancel") }}
          </v-btn>
          <v-btn @click="dialog.ref.value.onOk">
            {{ $t("ui.ok") }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <Loader />
  </v-app>
</template>
