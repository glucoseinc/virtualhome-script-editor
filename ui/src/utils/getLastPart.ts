export const getLastPart = (uri: string) => uri.split(/\/|#/).at(-1) ?? uri
