<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
const { isRevealed, done, cancel, reveal } = useDialogState<void, string>()

defineExpose({ reveal })

const uid = ref("")
const error = ref(false)

watch(isRevealed, (value) => {
  if (value) {
    uid.value = ""
    error.value = false
  }
})

const validate = () => {
  return !!/^\d{9,}$/.exec(uid.value)
}

const proceed = () => {
  if (!validate()) {
    error.value = true
    return
  }
  done(uid.value)
}
</script>

<template>
  <v-dialog
    v-model="isRevealed"
    max-width="500px"
  >
    <v-card :title="$t('import.uidInput')">
      <template #text>
        <p class="mb-4">
          {{ $t('import.uidInputInstruction') }}
        </p>
        <v-text-field
          v-model="uid"
          :label="$t('import.uid')"
          :error-messages="error ? $t('import.uidValidation') : null"
        />
      </template>
      <template #actions>
        <v-spacer />
        <v-btn
          :text="$t('ui.cancel')"
          @click="cancel"
        />
        <v-btn
          :text="$t('ui.ok')"
          @click="proceed"
        />
      </template>
    </v-card>
  </v-dialog>
</template>
