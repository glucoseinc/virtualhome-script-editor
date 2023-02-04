import type { NamedNode, Literal } from 'rdf-js'
import type { OptionalBlock } from '@/utils/utilityTypes'
import { makeClient } from './makeClient'

export type EventQueryResult = {
  agent: NamedNode
  action: NamedNode
} & OptionalBlock<
  {
    mainObject: NamedNode
    mainObjectLabel: Literal
    mainObjectId: Literal
  },
  'mainObject'
> &
  OptionalBlock<
    {
      targetObject: NamedNode
      targetObjectLabel: Literal
      targetObjectId: Literal
    },
    'targetObject'
  >

const getEventQuery = (activityURI: string) => `
PREFIX : <http://example.org/virtualhome2kg/ontology/>
PREFIX ho: <http://www.owl-ontologies.com/VirtualHome.owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ns1: <http://purl.org/dc/terms/>

SELECT DISTINCT ?num ?agent ?action ?mainObject ?mainObjectLabel ?mainObjectId ?targetObject ?targetObjectLabel ?targetObjectId
WHERE { 
  <${activityURI}> :hasEvent ?event .
  ?event :action ?action ;
    :agent ?agent ;
    :eventNumber ?num.
  OPTIONAL {
    ?event :mainObject ?mainObject .
    OPTIONAL {
      ?mainObject rdfs:label ?mainObjectLabel ;
        ns1:identifier ?mainObjectId .
    }
  }
  OPTIONAL {
    ?event :targetObject ?targetObject .
    OPTIONAL {
      ?targetObject rdfs:label ?targetObjectLabel ;
        ns1:identifier ?targetObjectId .
    }
  }
}
ORDER BY ?num
LIMIT 1000`

export const fetchEvents = async (activityURI: string) => {
  const result = (await makeClient().query.select(getEventQuery(activityURI))) as EventQueryResult[]
  return result
}
