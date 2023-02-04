import ParsingClient from 'sparql-http-client/ParsingClient'
import type { NamedNode, Literal } from 'rdf-js'

const activityQuery = `
PREFIX : <http://example.org/virtualhome2kg/ontology/>
PREFIX ho: <http://www.owl-ontologies.com/VirtualHome.owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?scene ?activity ?label
WHERE { 
	?type rdfs:subClassOf* ho:Activity .
  ?activity a ?type .
  ?activity rdfs:label ?label .
  ?activity :virtualHome ?scene .
}
ORDER BY ?scene ?label
LIMIT 1000`

type ActivityQueryResult = {
  activity: NamedNode
  label: Literal
  scene: NamedNode
  event: NamedNode
}

type OptionalBlock<O extends object> = O | { [K in keyof O]: undefined }

type EventQueryResult = {
  agent: NamedNode
  action: NamedNode
} & OptionalBlock<{
  mainObjectLabel: Literal
  mainObjectId: Literal
}> &
  OptionalBlock<{
    targetObjectLabel: Literal
    targetObjectId: Literal
  }>

const getEventQuery = (activityURI: string) => `
PREFIX : <http://example.org/virtualhome2kg/ontology/>
PREFIX ho: <http://www.owl-ontologies.com/VirtualHome.owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ns1: <http://purl.org/dc/terms/>

SELECT DISTINCT ?agent ?action ?mainObjectLabel ?mainObjectId ?targetObjectLabel ?targetObjectId
WHERE { 
  <${activityURI}> :hasEvent ?event .
  ?event :action ?action ;
    :agent ?agent ;
    :eventNumber ?num.
  OPTIONAL {
    ?event :mainObject ?mainObject .
    ?mainObject rdfs:label ?mainObjectLabel ;
      ns1:identifier ?mainObjectId .

  }
  OPTIONAL {
    ?event :targetObject ?targetObject .
    ?targetObject rdfs:label ?targetObjectLabel ;
      ns1:identifier ?targetObjectId .
  }
}
ORDER BY ?num
LIMIT 1000`

const getLastPart = (uri: string) => uri.split('/').at(-1) ?? uri
const makeClient = () => new ParsingClient({ endpointUrl: 'http://localhost:8080/sparql' })

export default function Hoge() {
  const handleClick = async () => {
    const a = (await makeClient().query.select(activityQuery)) as ActivityQueryResult[]
    console.log(a)

    const b = a.reduce((g, item) => {
      const key = getLastPart(item.scene.value)
      if (!g[key]) g[key] = []
      g[key].push(item.label.value)
      return g
    }, {} as Record<string, string[]>)

    console.log(b)
  }
  const handleClickFuga = async () => {
    const a = (await makeClient().query.select(
      getEventQuery('http://example.org/virtualhome2kg/instance/admire_art_scene1')
    )) as EventQueryResult[]
    const b = a.map(({ agent, action, mainObjectId, mainObjectLabel, targetObjectId, targetObjectLabel }) => ({
      agent: agent.value,
      action: action.value,
      mainObject: mainObjectId && { id: mainObjectId.value, label: mainObjectLabel.value },
      targetObject: targetObjectId && { id: targetObjectId.value, label: targetObjectLabel.value },
    }))
    console.log(b)
  }

  return (
    <>
      <button onClick={handleClick}>hoge</button>
      <button onClick={handleClickFuga}>fuga</button>
    </>
  )
}
