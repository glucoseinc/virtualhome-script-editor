import React from 'react'
import { IconButton, Select, MenuItem, Stack, FormControl } from '@mui/material'
import { Delete, ArrowUpward } from '@mui/icons-material'
import { Event, VirtualHomeAction, stringifyObject, getObjects } from '@/models'
import { areSameObject } from '@/models/object'
import { Scene } from '@/models/scene'

type EventRowProps = {
  index: number
  scene: Scene
  event: Event
  agents: readonly string[]
  actions: readonly VirtualHomeAction[]
  onSelect?: <K extends keyof Event>(i: number, key: K, value: Event[K]) => void
  onDelete?: (index: number) => void
  onUp?: (index: number) => void
}

export const EventRow: React.FC<EventRowProps> = ({
  index,
  scene,
  agents,
  actions,
  event,
  onSelect,
  onDelete,
  onUp,
}) => {
  const { agent, action, mainObject, targetObject } = event
  const { mainObjects, targetObjects } = React.useMemo(() => getObjects(action, scene), [action, scene])
  const mainObjectError = React.useMemo(() => {
    if (!mainObject) return false

    return !mainObjects.some((x) => areSameObject(mainObject, x))
  }, [mainObject, mainObjects])
  const targetObjectError = React.useMemo(() => {
    if (!targetObject) return false

    return !targetObjects.some((x) => areSameObject(targetObject, x))
  }, [targetObject, targetObjects])

  return (
    <>
      <Stack direction="row" gap="10px" height="32px" width="800px">
        <Select variant="standard" sx={{ minWidth: '100px' }} value={agent}>
          {agents.map((agent, i) => (
            <MenuItem key={`${agent}-${i}`} value={agent} onClick={() => onSelect?.(index, 'agent', agent)}>
              {agent}
            </MenuItem>
          ))}
        </Select>
        <Select variant="standard" sx={{ minWidth: '100px' }} value={action.name}>
          {actions.map((action, i) => (
            <MenuItem
              key={`${action.name}-${i}`}
              value={action.name}
              onClick={() => onSelect?.(index, 'action', action)}
            >
              {action.name}
            </MenuItem>
          ))}
        </Select>
        {mainObject && (
          <FormControl error={mainObjectError}>
            <Select
              variant="standard"
              sx={{ minWidth: '100px', color: mainObjectError ? 'red' : undefined }}
              value={stringifyObject(mainObject)}
            >
              {[
                mainObjectError ? (
                  <MenuItem key="-1" value={stringifyObject(mainObject)} disabled>
                    {stringifyObject(mainObject)}
                  </MenuItem>
                ) : null,
                ...mainObjects.map((obj, i) => (
                  <MenuItem
                    key={`${stringifyObject(obj)}-${i}`}
                    value={stringifyObject(obj)}
                    onClick={() => onSelect?.(index, 'mainObject', obj)}
                  >
                    {stringifyObject(obj)}
                  </MenuItem>
                )),
              ]}
            </Select>
          </FormControl>
        )}
        {targetObject && (
          <FormControl error={targetObjectError}>
            <Select
              variant="standard"
              sx={{ minWidth: '100px', color: targetObjectError ? 'red' : undefined }}
              value={stringifyObject(targetObject)}
            >
              {[
                targetObjectError ? (
                  <MenuItem key="-1" value={stringifyObject(targetObject)} disabled>
                    {stringifyObject(targetObject)}
                  </MenuItem>
                ) : null,
                ...targetObjects.map((obj, i) => (
                  <MenuItem
                    key={`${stringifyObject(obj)}-${i}`}
                    value={stringifyObject(obj)}
                    onClick={() => onSelect?.(index, 'targetObject', obj)}
                  >
                    {stringifyObject(obj)}
                  </MenuItem>
                )),
              ]}
            </Select>
          </FormControl>
        )}

        <IconButton aria-label="delete" sx={{ marginLeft: 'auto' }} onClick={() => onDelete?.(index)}>
          <Delete />
        </IconButton>
        <IconButton aria-label="up" onClick={() => onUp?.(index)}>
          <ArrowUpward />
        </IconButton>
      </Stack>
    </>
  )
}
