import data from './actionsData.json'
import type { VirtualHomeActionData } from '@/models/action'

export const actions = (data as readonly VirtualHomeActionData[]).map(({ name, ...rest }) => ({
  name: name.toUpperCase(),
  ...rest,
}))
export const actionStore = new Map(actions.map((a) => [a.name.toUpperCase(), a]))
