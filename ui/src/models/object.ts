export type VirtualHomeObject = {
  id: string
  className: string
}

export type VirtualHomeObjectData = VirtualHomeObject & {
  properties: string[]
  states: string[]
}

export const stringifyObject = ({ id, className }: VirtualHomeObject) => `${className} (${id})`
export const areSameObject = (a: VirtualHomeObject, b: VirtualHomeObject) =>
  a.id === b.id && a.className === b.className
