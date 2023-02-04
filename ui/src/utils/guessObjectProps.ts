import { getLastPart } from '@/utils/getLastPart'

export const guessObjectProps = (uri: string) => {
  // オブジェクトのURIは ex:{className}{id}_{scene} という構造になっている
  // classNameとidはセパレータなしに結合されているので、末尾にある最長の連続する数字を切り出してidとする
  const rawName = getLastPart(uri).split('_')[0]
  const i = rawName
    .split('')
    .reverse()
    .findIndex((x) => !'0123456789'.includes(x))
  if (i < 0) {
    return !isNaN(+rawName)
      ? {
          id: rawName,
          className: '',
        }
      : {
          id: '',
          className: rawName,
        }
  }

  return {
    id: rawName.slice(rawName.length - i),
    className: rawName.slice(0, rawName.length - i),
  }
}
