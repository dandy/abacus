import { createStyles, makeStyles, Theme } from '@material-ui/core'
import clsx from 'clsx'
import React from 'react'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: theme.palette.grey[500],
      fontWeight: 'normal',
    },
  }),
)

export default function Attribute({ name, className }: { name: string; className?: string }): JSX.Element {
  const classes = useStyles()

  return <span className={clsx(classes.root, className)}>{name}</span>
}
