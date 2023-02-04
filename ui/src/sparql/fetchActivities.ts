import type { NamedNode, Literal } from 'rdf-js'
import { makeClient } from './makeClient'

const activityQuery = `
PREFIX : <http://example.org/virtualhome2kg/ontology/>
PREFIX ho: <http://www.owl-ontologies.com/VirtualHome.owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?scene ?type ?label ?activity
WHERE { 
	?type rdfs:subClassOf* ho:Activity .
  ?activity a ?type .
  ?activity rdfs:label ?label .
  ?activity :virtualHome ?scene .
}
ORDER BY ?activity ?scene
LIMIT 1000`

export type ActivityQueryResult = {
  type: NamedNode
  label: Literal
  scene: NamedNode
  activity: NamedNode
}

export const fetchActivity = async () => {
  const result = (await makeClient().query.select(activityQuery)) as ActivityQueryResult[]
  return result
}
