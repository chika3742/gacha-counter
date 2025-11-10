import * as path from "node:path"
import * as fs from "node:fs/promises"

const run = async () => {
  // @ts-ignore
  const tempDir = path.resolve(import.meta.dirname, "../remote-assets")
  // @ts-ignore
  const assetsDir = path.resolve(import.meta.dirname, "../app/assets/remote")
  // clean up
  await fs.rm(tempDir, { recursive: true })
  await fs.rm(assetsDir, { recursive: true })

  // clone hsr-material repo
  await Bun.$`git clone --depth 1 https://github.com/chika3742/hsr-material.git ${tempDir}/hsr-material`

  // download genshin material assets
  const assetUrl = await Bun.$`curl "https://matnote-releases.chikach.net/releases/genshin?channel=prod" | jq -r ".[-1].distUrl"`
  await Bun.$`curl ${assetUrl.text().trim()} -o ${tempDir}/gm-assets.zip`
  await Bun.$`unzip ${tempDir}/gm-assets.zip -d ${tempDir}/gm-assets > /dev/null`
  await fs.rm(`${tempDir}/gm-assets.zip`)

  await fs.cp(`${tempDir}/gm-assets/img/characters`, `${assetsDir}/genshin/img/characters`, { recursive: true })
  await fs.cp(`${tempDir}/gm-assets/img/weapons`, `${assetsDir}/genshin/img/weapons`, { recursive: true })
  await fs.cp(`${tempDir}/gm-assets/data/characters.json`, `${assetsDir}/genshin/data/characters.json`)
  await fs.cp(`${tempDir}/gm-assets/data/weapons.json`, `${assetsDir}/genshin/data/weapons.json`)

  await fs.cp(`${tempDir}/hsr-material/packages/nuxt/assets/img/characters`, `${assetsDir}/hsr/img/characters`, { recursive: true })
  await fs.cp(`${tempDir}/hsr-material/packages/nuxt/assets/img/light-cones`, `${assetsDir}/hsr/img/light-cones`, { recursive: true })
  await fs.mkdir(`${assetsDir}/hsr/data`, { recursive: true })
  await Bun.$`yq -o json ${tempDir}/hsr-material/packages/nuxt/assets/data/characters.yaml > ${assetsDir}/hsr/data/characters.json`
  await Bun.$`yq -o json ${tempDir}/hsr-material/packages/nuxt/assets/data/light-cones.yaml > ${assetsDir}/hsr/data/light-cones.json`
}

void run()
