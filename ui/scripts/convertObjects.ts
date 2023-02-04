import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import type { VirtualHomeObject } from '@/models/object'

const targetDir = path.resolve(__dirname, './objects')
const outDir = path.resolve(__dirname, '../src/data')

const headers = {
  id: 'nodes/id',
  className: 'nodes/class_name',
  properties: 'nodes/properties',
  states: 'nodes/states',
} as const

const parseCSV = (raw: string): VirtualHomeObject[] => {
  const table = raw
    .trim()
    .split(/\r\n|\n/)
    .map((row) => row.split(','))
  const [header, ...body] = table

  const idColumnIndex = header.findIndex((h) => h === headers.id)
  const classNameColumnIndex = header.findIndex((h) => h === headers.className)
  const propertiesColumnIndexes = header.flatMap((h, i) => (h.startsWith(headers.properties) ? i : []))
  const statesColumnIndexes = header.flatMap((h, i) => (h.startsWith(headers.states) ? i : []))

  return body.flatMap((row, i) => {
    const id = row[idColumnIndex]
    const className = row[classNameColumnIndex]
    const properties = propertiesColumnIndexes.map((i) => row[i]).filter((v) => v)
    const states = statesColumnIndexes.map((i) => row[i]).filter((v) => v)

    if (!className) {
      console.log(`${i + 1}行目でエラーが発生しました -- nodes/class_name欄の値が空白になっています`)
      return []
    }

    return {
      id,
      className,
      properties,
      states,
    }
  })
}

const main = () => {
  const filenames = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5', 'scene6', 'scene7']

  const result = Object.fromEntries(
    filenames.map((filename) => {
      const p = path.resolve(targetDir, `./${filename}.csv`)
      const raw = readFileSync(p, 'utf-8')
      console.log(filename)
      return [filename, parseCSV(raw)]
    })
  )

  writeFileSync(path.resolve(outDir, `./objectsData.json`), JSON.stringify(result, null, '  '))
  console.log('convert completed✨')
}

main()
