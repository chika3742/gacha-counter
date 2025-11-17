type LocalizedText = {
  locales: {
    ja: string
    en: string
  }
}

declare module "~/assets/remote/genshin/data/characters.json" {
  const gCharacters: Record<string, {
    id: string
    name: LocalizedText
    smallImageUrl: string
  }>
  export default gCharacters
}

declare module "~/assets/remote/genshin/data/weapons.json" {
  const gWeapons: Record<string, {
    id: string
    name: LocalizedText
    imageUrl: string
  }>
  export default gWeapons
}

declare module "~/assets/remote/hsr/data/characters.json" {
  const hCharacters: Record<string, {
    id: string
    name: LocalizedText
  }>
  export default hCharacters
}

declare module "~/assets/remote/hsr/data/light-cones.json" {
  const hLightCones: Record<string, {
    id: string
    name: LocalizedText
  }>
  export default hLightCones
}
