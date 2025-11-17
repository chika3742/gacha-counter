import type { GachaLogEntry } from "~/types/db.js"
import gCharacters from "~/assets/remote/genshin/data/characters.json"
import gWeapons from "~/assets/remote/genshin/data/weapons.json"
import hCharacters from "~/assets/remote/hsr/data/characters.json"
import hLightCones from "~/assets/remote/hsr/data/light-cones.json"

const findItem = (entry: GachaLogEntry) => {
  switch (entry.game) {
    case "genshin":
      switch (entry.itemType) {
        case "Character":
          return gCharacters[entry.name]
        case "Weapon":
          return gWeapons[entry.name]
      }
      break
    case "hsr":
      switch (entry.itemType) {
        case "Character":
          return hCharacters[entry.name]
        case "Light Cone":
          return hLightCones[entry.name]
      }
      break
  }
}

export const getItemId = (entry: GachaLogEntry) => {
  return findItem(entry)?.id
}

export const getItemName = (entry: GachaLogEntry) => {
  return findItem(entry)?.name.locales
}

export const getItemImage = (entry: GachaLogEntry) => {
  const createUrl = (path: string | undefined) => {
    if (!path) return undefined
    return `/assets/remote/${entry.game}/${path}`
  }

  switch (entry.game) {
    case "genshin":
      switch (entry.itemType) {
        case "Character":
          return createUrl(gCharacters[entry.name]?.smallImageUrl)
        case "Weapon":
          return createUrl(gWeapons[entry.name]?.imageUrl)
      }
      break
    case "hsr":
      switch (entry.itemType) {
        case "Character":
          return createUrl("img/characters/" + hCharacters[entry.name]?.id + "_small.webp")
        case "Light Cone":
          return createUrl("img/light-cones/" + hLightCones[entry.name]?.id + ".webp")
      }
      break
  }
}
