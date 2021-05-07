// istanbul ignore file; demo
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import { createStyles, Link, makeStyles, Theme, useTheme } from '@material-ui/core'
import { ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import clsx from 'clsx'
import React, { useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import DatetimeText from 'src/components/general/DatetimeText'
import { ExperimentBare, Status } from 'src/lib/schemas'
import { createIdSlug } from 'src/utils/general'

import ExperimentStatus from '../ExperimentStatus'

const statusOrder = {
  [Status.Completed]: 0,
  [Status.Running]: 1,
  [Status.Staging]: 2,
  [Status.Disabled]: 3,
}
const statusComparator = (statusA: Status, statusB: Status) => {
  return statusOrder[statusA] - statusOrder[statusB]
}

const useStyles = makeStyles((_theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flex: 1,
    },
  }),
)

/**
 * Renders a table of "bare" experiment information.
 */
const ExperimentsTable = ({ experiments }: { experiments: ExperimentBare[] }): JSX.Element => {
  const theme = useTheme()
  const classes = useStyles()

  const gridApiRef = useRef<GridApi | null>(null)
  const gridColumnApiRef = useRef<ColumnApi | null>(null)

  const onGridReady = (event: GridReadyEvent) => {
    gridApiRef.current = event.api
    gridColumnApiRef.current = gridColumnApiRef.current = event.columnApi

    event.api.sizeColumnsToFit()
    window.addEventListener('resize', function () {
      setTimeout(function () {
        event.api.sizeColumnsToFit()
      })
    })
  }

  return (
    <div className={clsx('ag-theme-alpine', classes.root)}>
      <AgGridReact
        columnDefs={[
          {
            headerName: 'Name',
            field: 'name',
            cellStyle: {
              fontFamily: theme.custom.fonts.monospace,
              fontWeight: 600,
            },
            cellRendererFramework: ({ value: name, data }: { value: Status; data: ExperimentBare }) => (
              <Link component={RouterLink} to={`/experiments/${createIdSlug(data.experimentId, data.name)}`}>
                {name}
              </Link>
            ),
            sortable: true,
            filter: true,
            resizable: true,
            flex: 0,
          },
          {
            headerName: 'Status',
            field: 'status',
            cellRendererFramework: ({ value: status }: { value: Status }) => <ExperimentStatus status={status} />,
            comparator: statusComparator,
            sortable: true,
            filter: true,
            resizable: true,
          },
          {
            headerName: 'Platform',
            field: 'platform',
            cellStyle: {
              fontFamily: theme.custom.fonts.monospace,
            },
            sortable: true,
            filter: true,
            resizable: true,
          },
          {
            headerName: 'Owner',
            field: 'ownerLogin',
            cellStyle: {
              fontFamily: theme.custom.fonts.monospace,
            },
            sortable: true,
            filter: true,
            resizable: true,
          },
          {
            headerName: 'Start',
            field: 'startDatetime',
            cellRendererFramework: ({ value: startDatetime }: { value: Date }) => {
              return <DatetimeText datetime={startDatetime} excludeTime />
            },
            sortable: true,
            filter: 'agDateColumnFilter',
            resizable: true,
          },
          {
            headerName: 'End',
            field: 'endDatetime',
            cellRendererFramework: ({ value: endDatetime }: { value: Date }) => {
              return <DatetimeText datetime={endDatetime} excludeTime />
            },
            sortable: true,
            filter: 'agDateColumnFilter',
            resizable: true,
          },
        ]}
        rowData={experiments}
        containerStyle={{ flex: 1, height: 'auto' }}
        onFirstDataRendered={(event) => {
          event.columnApi.autoSizeAllColumns()
          event.columnApi.applyColumnState({
            state: [
              {
                colId: 'status',
                sort: 'asc',
                sortIndex: 0,
              },
              {
                colId: 'startDatetime',
                sort: 'desc',
                sortIndex: 1,
              },
            ],
            defaultState: { sort: null },
          })
        }}
        onGridReady={onGridReady}
      />
    </div>
  )
}

export default ExperimentsTable
