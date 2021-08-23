import { createStyles, makeStyles } from '@material-ui/core/styles'
import debugFactory from 'debug'
import React from 'react'

import AudiencePanel from 'src/components/experiments/single-view/overview/AudiencePanel'
import ConclusionsPanel from 'src/components/experiments/single-view/overview/ConclusionsPanel'
import GeneralPanel from 'src/components/experiments/single-view/overview/GeneralPanel'
import MetricAssignmentsPanel from 'src/components/experiments/single-view/overview/MetricAssignmentsPanel'
import { ExperimentFull, Metric, Segment, Status, TagBare } from 'src/lib/schemas'

const debug = debugFactory('abacus:components/ExperimentDetails.tsx')

const useStyles = makeStyles((theme) =>
  createStyles({
    panel: {
      marginBottom: theme.spacing(2),
    },
  }),
)

/**
 * Renders the main details of an experiment.
 */
function ExperimentDetails({
  experiment,
  metrics,
  segments,
  tags,
  experimentReloadRef,
}: {
  experiment: ExperimentFull
  metrics: Metric[]
  segments: Segment[]
  tags: TagBare[]
  experimentReloadRef: React.MutableRefObject<() => void>
}): JSX.Element {
  debug('ExperimentDetails#render')
  const classes = useStyles()

  return (
    <>
      <GeneralPanel className={classes.panel} {...{ experiment, experimentReloadRef }} />
      {(experiment.status === Status.Completed || experiment.status === Status.Disabled) && (
        <ConclusionsPanel className={classes.panel} {...{ experiment, experimentReloadRef }} />
      )}
      <AudiencePanel className={classes.panel} {...{ experiment, segments, tags }} />
      <MetricAssignmentsPanel {...{ experiment, metrics, experimentReloadRef }} />
    </>
  )
}

export default ExperimentDetails
