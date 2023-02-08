import React from 'react'
import styles from '@/styles/Home.module.css'

type Props = {
  script: string
}

const selectAll = (e: React.FocusEvent<HTMLTextAreaElement>) => e.target.select()
export const ScriptViewer: React.FC<Props> = ({ script }) => {
  return <textarea className={styles.script} readOnly wrap="off" value={script} onFocus={selectAll} />
}
