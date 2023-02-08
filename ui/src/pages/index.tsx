import React from 'react'
import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { Box, Button, IconButton, Stack, Grid, CircularProgress, Select, MenuItem } from '@mui/material'
import { ControlPoint, Forward } from '@mui/icons-material'
import { ScriptViewer, EventRow, useDialog } from '@/components'
import { type Event, type VirtualHomeAction, getObjects, convertToScript } from '@/models'
import { actions as actionData } from '@/data/actions'
import { Scene, scenes } from '@/models/scene'
import { useConfirmDialog } from '@/components/confirmDialog'
import { API_ENDPOINT, generateVideo } from '@/utils/generateVideo'

const newData = (scene: Scene, action_?: VirtualHomeAction | undefined): Event => {
  const action = action_ ?? actionData[0]
  const { mainObjects, targetObjects } = getObjects(action, scene)
  return {
    agent: 'char0',
    action,
    mainObject: mainObjects[0],
    targetObject: targetObjects[0],
  }
}

export default function Home() {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [movieUrl, setMovieUrl] = React.useState<string | undefined>(undefined)
  const [scene, setScene] = React.useState<Scene>('scene1')
  const [events, setEvents] = React.useState<readonly Event[]>([newData('scene1')])
  const [fetchingMovie, setFetchingMovie] = React.useState(false)

  const { render: ConfirmDialog, confirm } = useConfirmDialog()

  const updateScene = React.useCallback(
    async (s: Scene) => {
      if (s === scene) return
      if (!(await confirm('シーンを切り替えると編集中のスクリプトは破棄されます'))) return

      setScene(s)
      setEvents([newData(s)])
    },
    [scene, confirm]
  )

  const updateEvent = React.useCallback(
    <K extends keyof Event>(i: number, key: K, value: Event[K]) => {
      setEvents((cur) =>
        cur.map((ev, n) => {
          if (n !== i) return ev

          if (key === 'action') {
            return newData(scene, value as Event['action'])
          } else {
            const next = { ...ev }
            next[key] = value
            return next
          }
        })
      )
    },
    [scene]
  )
  const deleteEvent = React.useCallback((n: number) => {
    setEvents((cur) => cur.filter((_, i) => n !== i))
  }, [])
  const upEvent = React.useCallback((n: number) => {
    if (n === 0) return

    setEvents((cur) => cur.map((v, i) => (i === n - 1 ? cur[n] : i === n ? cur[n - 1] : v)))
  }, [])
  const addEvent = React.useCallback(() => {
    setEvents((arr) => [...arr, newData(scene)])
  }, [scene])
  const script = React.useMemo(() => events.map(convertToScript).join('\n'), [events])

  const onClickConvertButton = React.useCallback(async () => {
    if (videoRef.current) {
      setFetchingMovie(true)
      try {
        const result = await generateVideo(scene, script.split('\n'))
        if (result.data.ok) {
          setMovieUrl(`${API_ENDPOINT}${result.data.video_path}`)
        } else {
          alert(result.data.message)
        }
      } catch (e) {
        console.log(e)
      }
      setFetchingMovie(false)
    }
  }, [scene, script])

  const onClickDownloadButton = React.useCallback(() => {
    if (movieUrl === undefined) return alert('生成された動画がありません。')

    const a = document.createElement('a')
    a.download = 'output.mp4'
    a.href = movieUrl
    a.click()
  }, [movieUrl])

  const { selectImportScript, render: MyDialog } = useDialog()
  const handleImportScript = React.useCallback(async () => {
    const result = await selectImportScript()
    if (!result) return

    const { scene, events } = result
    setScene(scene)
    setEvents(events)
  }, [selectImportScript])

  return (
    <>
      <Head>
        <title>KGRC-Script Editor</title>
        <meta name="description" content="ナレッジグラフ推論チャレンジの動画作成スクリプト作成支援ツール" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Stack width="100%" justifyContent="start" marginBottom="20px">
          <Select value={scene} sx={{ width: '160px', background: 'white' }}>
            {scenes.map((s, i) => (
              <MenuItem key={i} value={s} onClick={() => updateScene(s)}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <Grid container>
          <Grid item xs={5.5}>
            <Button onClick={handleImportScript}>Import</Button>
            <ScriptViewer script={script} />
          </Grid>
          <Grid item xs={1}>
            <Grid container justifyContent="center" height="100%">
              <Box marginTop="150px">
                {fetchingMovie ? (
                  <CircularProgress />
                ) : (
                  <IconButton onClick={onClickConvertButton}>
                    <Forward fontSize="large" />
                  </IconButton>
                )}
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={5.5}>
            <Box>
              <Button onClick={onClickDownloadButton}>Download</Button>
              <Box>
                <video ref={videoRef} src={movieUrl} className={styles.video} controls></video>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Stack
          padding="10px"
          gap="10px"
          marginTop="30px"
          alignItems="center"
          minHeight="300px"
          height="300px"
          width="835px"
          overflow="scroll"
          bgcolor="white"
          sx={{
            resize: 'vertical',
          }}
        >
          {events.map((d, i) => (
            <EventRow
              key={i}
              scene={scene}
              agents={['char0']}
              actions={actionData}
              index={i}
              event={d}
              onUp={upEvent}
              onSelect={updateEvent}
              onDelete={deleteEvent}
            />
          ))}
          <Box>
            <IconButton onClick={addEvent}>
              <ControlPoint fontSize="large" />
            </IconButton>
          </Box>
        </Stack>
      </main>
      <MyDialog />
      <ConfirmDialog />
    </>
  )
}
