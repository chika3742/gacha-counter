import * as path from "node:path"
import * as fs from "node:fs/promises"

const run = async () => {
  const tempDir = path.resolve(import.meta.dirname, "../remote-assets")
  const assetsDir = path.resolve(import.meta.dirname, "../app/assets/remote")
  // clean up
  try {
    await fs.rm(tempDir, { recursive: true })
  } catch { /* directory does not exist */ }
  try {
    await fs.rm(assetsDir, { recursive: true })
  } catch { /* directory does not exist */ }

  // clone hsr-material repo
  await Bun.$`git clone --depth 1 --branch live https://github.com/chika3742/hsr-material.git ${tempDir}/hsr-material`

  // download genshin material assets
  const assetInfoJson = await (await fetch("https://matnote-releases.chikach.net/releases/genshin?channel=prod")).text()
  const assetUrl = JSON.parse(assetInfoJson).slice(-1)[0].distUrl
  await Bun.$`curl ${assetUrl} -o ${tempDir}/gm-assets.zip`
  await Bun.$`unzip ${tempDir}/gm-assets.zip -d ${tempDir}/gm-assets > /dev/null`
  await fs.rm(`${tempDir}/gm-assets.zip`)

  await fs.cp(`${tempDir}/gm-assets/img/characters`, `${assetsDir}/genshin/img/characters`, { recursive: true })
  await fs.cp(`${tempDir}/gm-assets/img/weapons`, `${assetsDir}/genshin/img/weapons`, { recursive: true })
  await fs.cp(`${tempDir}/gm-assets/data/characters.json`, `${assetsDir}/genshin/data/characters.json`)
  await fs.cp(`${tempDir}/gm-assets/data/weapons.json`, `${assetsDir}/genshin/data/weapons.json`)

  await fs.cp(`${tempDir}/hsr-material/packages/nuxt/assets/img/characters`, `${assetsDir}/hsr/img/characters`, { recursive: true })
  await fs.cp(`${tempDir}/hsr-material/packages/nuxt/assets/img/light-cones`, `${assetsDir}/hsr/img/light-cones`, { recursive: true })
  await fs.mkdir(`${assetsDir}/hsr/data`, { recursive: true })
  await fileToJson(`${tempDir}/hsr-material/packages/nuxt/assets/data/characters.yaml`, `${assetsDir}/hsr/data/characters.json`)
  await fileToJson(`${tempDir}/hsr-material/packages/nuxt/assets/data/light-cones.yaml`, `${assetsDir}/hsr/data/light-cones.json`)
}

const fileToJson = async (input: string, output: string) => {
  const parsed = Bun.YAML.parse(await Bun.file(input).text())
  return await Bun.write(output, JSON.stringify(parsed))
}

void run()
