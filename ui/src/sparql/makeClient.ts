import ParsingClient from 'sparql-http-client/ParsingClient'

const endpoint = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT ?? 'https://kgrc4si.ml/graph/repositories/KGRC4SIv01'

export const makeClient = () => new ParsingClient({ endpointUrl: `${endpoint}?infer=false` })
