import type { VirtualHomeObject } from './object'
import type { VirtualHomeAction } from './action'

export type Event = {
  agent: string
  action: VirtualHomeAction
  mainObject?: VirtualHomeObject
  targetObject?: VirtualHomeObject
}

export const convertToScript = ({ agent, action, mainObject, targetObject }: Event): string => {
  return [
    `<${agent}>`,
    `[${action.name.toUpperCase()}]`,
    mainObject && `<${mainObject.className}> (${mainObject.id})`,
    targetObject && `<${targetObject.className}> (${targetObject.id})`,
  ]
    .filter((x) => x)
    .join(' ')
}
