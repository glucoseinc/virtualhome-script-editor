import { guessObjectProps } from './guessObjectProps'

it.each([
  ['http://example.org/virtualhome2kg/ontology/qwerty0123456789', { id: '0123456789', className: 'qwerty' }],
  ['http://example.org/virtualhome2kg/ontology/12to34', { id: '34', className: '12to' }],
  ['http://example.org/virtualhome2kg/ontology/aiueo', { id: '', className: 'aiueo' }],
  ['http://example.org/virtualhome2kg/ontology/11111', { id: '11111', className: '' }],
])('', (uri, expected) => {
  expect(guessObjectProps(uri)).toEqual(expected)
})
