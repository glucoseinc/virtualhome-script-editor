import { sceneToObjectsMapping } from '@/data/objects'
import { actionStore } from '@/data/actions'
import { VirtualHomeObjectData } from './object'
import { Scene } from './scene'

export type VirtualHomeAction = {
  name: string
}
export type VirtualHomeActionData = {
  name: string
  objects: '0' | '1' | '2'
  rdf: string
  requiredProperties: readonly string[]
  requiredStates: readonly string[]
}

export const getObjects = (
  { name }: VirtualHomeAction,
  scene: Scene
): { mainObjects: readonly VirtualHomeObjectData[]; targetObjects: readonly VirtualHomeObjectData[] } => {
  const data = actionStore.get(name.toUpperCase())
  if (!data) return { mainObjects: [], targetObjects: [] }
  const { objects, requiredProperties } = data

  if (objects === '0') {
    return {
      mainObjects: [],
      targetObjects: [],
    }
  }

  const required = requiredProperties.length ? new Set(requiredProperties) : null
  const obj = sceneToObjectsMapping[scene].filter(
    ({ properties }) => !required || properties.some((p) => required.has(p))
  )

  return {
    mainObjects: obj,
    targetObjects: objects === '2' ? obj : [],
  }
}
