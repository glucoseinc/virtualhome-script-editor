export const scenes = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5', 'scene6', 'scene7'] as const
export type Scene = (typeof scenes)[number]
