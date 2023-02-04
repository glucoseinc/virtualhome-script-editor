import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import type { VirtualHomeActionData } from '@/models/action'

const targetDir = path.resolve(__dirname, './actions')
const outDir = path.resolve(__dirname, '../src/data')

// ヘッダーは nodes/ から始まる
// id class_name properties states
// properties と states にはさらに /{i} で番号が振られている

type Row = [
  ignore: string,
  actionName: string,
  numberOfObjects: '0' | '1' | '2',
  className: string,
  requiredProperties: string,
  requiredStates: string
]
type Success<T> = {
  tag: 'SUCCESS'
  content: T
}
type Failed = {
  tag: 'FAILED'
  reason: string
}

const parseRow = (row: string): Success<Row> | Failed => {
  const temp = row.split(',')
  if (temp.length !== 6) return { tag: 'FAILED', reason: `項目数が6になっていません; ${temp.length}` }
  if (!['0', '1', '2'].includes(temp[2]))
    return { tag: 'FAILED', reason: `『オブジェクトの数』の値が 0 1 2 のいずれにもなっていません; ${temp[2]}` }

  return { tag: 'SUCCESS', content: temp as Row }
}
const parseCSV = (raw: string): VirtualHomeActionData[] => {
  const table = raw.trim().split(/\r\n|\n/)
  const [_, ...body] = table

  return body.flatMap((r, i) => {
    const result = parseRow(r)
    if (result.tag === 'FAILED') {
      console.log(`${i + 1}行目でエラーが発生しました -- ${result.reason}`)
      return []
    }
    const [_, name, numberOfObjects, className, requiredProperties, requiredStates] = result.content

    return {
      name,
      objects: numberOfObjects,
      rdf: className,
      requiredProperties: requiredProperties
        .split('&')
        .map((s) => s.trim())
        .filter((s) => s),
      requiredStates: requiredStates
        .split('&')
        .map((s) => s.trim())
        .filter((s) => s),
    }
  })
}

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

const main = () => {
  const csv = readFileSync(path.resolve(targetDir, `./actions.csv`), 'utf-8')
  const data = parseCSV(csv)
  data.sort((a, b) => compare(a.name, b.name))

  writeFileSync(path.resolve(outDir, `./actionsData.json`), JSON.stringify(data, null, '  '))
  console.log('convert completed✨')
}

main()
