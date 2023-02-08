import React from 'react'
import {
  Button,
  Select,
  InputLabel,
  ListSubheader,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  FormControl,
} from '@mui/material'
import { convertToScript, Event, Scene } from '@/models'
import { ScriptViewer } from './scriptViewer'

import { type ActivityQueryResult, fetchActivity } from '@/sparql/fetchActivities'
import { type EventQueryResult, fetchEvents } from '@/sparql/fetchEvents'
import { getLastPart } from '@/utils/getLastPart'
import { guessObjectProps } from '@/utils/guessObjectProps'

type Activity = {
  scene: string
  name: string
  uri: string
}

type ActivityGroup = {
  className: string
  activities: Activity[]
}
const getLabel = ({ scene, name }: Activity) => `${name} - ${scene}`

const convertActivity = ({ scene, label, activity }: Pick<ActivityQueryResult, 'scene' | 'label' | 'activity'>) => {
  return {
    scene: getLastPart(scene.value),
    name: label.value,
    events: [],
    uri: activity.value,
  }
}
const groupActivities = (result: ActivityQueryResult[]): ActivityGroup[] => {
  return Object.entries(
    result.reduce((g, { type, ...rest }) => {
      const key = getLastPart(type.value)
      if (!g[key]) g[key] = []
      g[key].push(convertActivity(rest))
      return g
    }, {} as Record<string, Activity[]>)
  ).map(([key, item]) => ({ className: key, activities: item }))
}
const convertEvent = ({
  action,
  mainObject,
  mainObjectId,
  mainObjectLabel,
  targetObject,
  targetObjectId,
  targetObjectLabel,
}: EventQueryResult): Event => {
  const m =
    mainObject &&
    (mainObjectId ? { id: mainObjectId.value, className: mainObjectLabel.value } : guessObjectProps(mainObject.value))
  const t =
    targetObject &&
    (targetObjectId
      ? { id: targetObjectId.value, className: targetObjectLabel.value }
      : guessObjectProps(targetObject.value))

  return {
    agent: 'char0',
    action: { name: getLastPart(action.value).toUpperCase() },
    mainObject: m,
    targetObject: t,
  }
}

type ReturnValue = { scene: Scene; events: readonly Event[] }

type _DialogProps = {
  open: boolean
  onClose: (events: ReturnValue | null) => void
}

let cache: ActivityGroup[] | undefined = undefined
const _Dialog: React.FC<_DialogProps> = ({ open, onClose }) => {
  const [data, setData] = React.useState<ActivityGroup[]>([])
  const [state, setState] = React.useState<{
    activity: Activity
    events: Event[]
  }>()
  const handleAccepct = React.useCallback(() => {
    if (!state) return

    onClose({ scene: state.activity.scene as Scene, events: state.events })
  }, [state, onClose])
  const handleCancel = React.useCallback(() => {
    onClose(null)
  }, [onClose])
  const handleSelectActivity = React.useCallback(async (activity: Activity) => {
    const result = await fetchEvents(activity.uri)
    const events = result.map(convertEvent)
    setState({ activity, events })
  }, [])

  React.useEffect(() => {
    const f = async () => {
      const data = cache ? cache : (cache = groupActivities(await fetchActivity()))

      setData(data)
    }
    f()
  }, [])

  const script = React.useMemo(() => state?.events.map(convertToScript).join('\n'), [state])

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xl">
      <DialogTitle>既存データのインポート</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '500px' }}>
          <Stack direction="column" gap="20px" paddingY="10px">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">スクリプトを選択</InputLabel>
              <Select
                label="スクリプトを選択"
                labelId="demo-simple-select-label"
                value={(state && getLabel(state.activity)) ?? ''}
              >
                {data.flatMap(({ className, activities }, i) => [
                  <ListSubheader key={className}>{className}</ListSubheader>,
                  ...activities.map((ac, j) => (
                    <MenuItem key={`${i},${j}`} value={getLabel(ac)} onClick={() => handleSelectActivity(ac)}>
                      {getLabel(ac)}
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>
            <ScriptViewer script={script ?? ''} />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleAccepct} disabled={!state}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  )
}

type _DialogState = Pick<_DialogProps, 'onClose'>
export const useDialog = () => {
  const [state, setState] = React.useState<_DialogState | undefined>()
  const handleClose = React.useCallback<_DialogProps['onClose']>(
    (events) => {
      state?.onClose(events)
      setState(undefined)
    },
    [state]
  )

  const showDialog = React.useCallback(() => {
    return new Promise<ReturnValue | null>((resolve) => {
      setState({ onClose: resolve })
    })
  }, [])

  const renderDialog = React.useCallback(() => <_Dialog open={!!state} onClose={handleClose} />, [state, handleClose])

  return {
    selectImportScript: showDialog,
    render: renderDialog,
  }
}
