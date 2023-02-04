import React from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material'

type _DialogProps = {
  message: string
  open: boolean
  onClose: (confirm: boolean | null) => void
}
const _Dialog: React.FC<_DialogProps> = ({ message, open, onClose }) => {
  const handleAccepct = React.useCallback(() => {
    onClose(true)
  }, [onClose])
  const handleCancel = React.useCallback(() => {
    onClose(null)
  }, [onClose])

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xl">
      <DialogTitle>確認</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '500px' }}>{message}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>キャンセル</Button>
        <Button onClick={handleAccepct}>OK</Button>
      </DialogActions>
    </Dialog>
  )
}

type _DialogState = Pick<_DialogProps, 'onClose'> & {
  message: string
}
export const useConfirmDialog = () => {
  const [state, setState] = React.useState<_DialogState | undefined>()
  const handleClose = React.useCallback<_DialogProps['onClose']>(
    (events) => {
      state?.onClose(events)
      setState(undefined)
    },
    [state]
  )

  const showDialog = React.useCallback((message: string) => {
    return new Promise<boolean | null>((resolve) => {
      setState({ message, onClose: resolve })
    })
  }, [])

  const renderDialog = React.useCallback(
    () => <_Dialog open={!!state} onClose={handleClose} message={state?.message ?? ''} />,
    [state, handleClose]
  )

  return {
    confirm: showDialog,
    render: renderDialog,
  }
}
