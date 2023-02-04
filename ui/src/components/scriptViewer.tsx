import React from 'react'
import { type Event, convertToScript } from '@/models/event'
import styles from '@/styles/Home.module.css'

type Props = {
  events: readonly Event[]
}

const selectAll = (e: React.FocusEvent<HTMLTextAreaElement>) => e.target.select()
export const ScriptViewer: React.FC<Props> = ({ events }) => {
  const script = React.useMemo(() => events.map(convertToScript).join('\n'), [events])

  return <textarea className={styles.script} readOnly wrap="off" value={script} onFocus={selectAll} />
}
