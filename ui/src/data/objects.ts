import data from './objectsData.json'
import type { VirtualHomeObjectData } from '@/models/object'
import type { Scene } from '@/models/scene'

export const sceneToObjectsMapping: Record<Scene, readonly VirtualHomeObjectData[]> = data
