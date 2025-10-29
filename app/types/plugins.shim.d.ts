import type { SafeAreaOptions } from "~/plugins/safe-area-directive.js"

declare module "vue" {
  export interface GlobalDirectives {
    vSafeArea: Directive<HTMLElement, SafeAreaOptions>
  }
}

export {}
