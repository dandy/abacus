import { Link, Tooltip, Typography } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import React from 'react'

import Attribute from 'src/components/general/Attribute'
import { ExperimentFull, nameSchema } from 'src/lib/schemas'
import * as Variations from 'src/lib/variations'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& th, & td': {
        paddingLeft: 0,
      },
    },
    default: {
      color: theme.palette.grey[500],
    },
    defaultLabel: {},
    tooltipped: {
      borderBottomWidth: 1,
      borderBottomStyle: 'dashed',
      borderBottomColor: theme.palette.grey[500],
    },
    tooltip: {
      maxWidth: '500px',
      padding: theme.spacing(2),
      '& a:link': {
        color: '#cee6f8',
      },
    },
    monospace: {
      fontFamily: theme.custom.fonts.monospace,
    },
  }),
)

function assignmentHref(variationName: string, experimentName: string) {
  if (!experimentName) {
    return ''
  }
  nameSchema.validateSync(experimentName)
  nameSchema.validateSync(variationName)
  return `javascript:(async () => {
    const token = JSON.parse(localStorage.getItem('experiments_auth_info'));
    const anonId = decodeURIComponent(document.cookie.match('(^|;)\\\\s*tk_ai\\\\s*=\\\\s*([^;]+)')?.pop() || '');
    let usernameOverride = '';
    const headers = {'Content-Type': 'application/json'};
    if (token && token.accessToken) {
       headers.Authorization = 'Bearer ' + token['accessToken'];
       usernameOverride = prompt(
         'This will assign a logged-in user to the ${variationName} variation of ${experimentName}. ' +
         'You have two options:\\n' +
         '(1) Enter a username to assign (only works for staging experiments).\\n' +
         '(2) Leave blank to assign yourself (works for any status).'
       ); 
    }
    const response = await fetch(
      'https://public-api.wordpress.com/wpcom/v2/experiments/0.1.0/assignments', 
      {
        credentials: 'include', 
        method: 'PATCH', 
        headers, 
        body: JSON.stringify({
          variations: {${experimentName}: '${variationName}'},
          anon_id: anonId,
          username_override: usernameOverride
        })
      }
    );
    const responseBody = await response.json();
    switch (responseBody.code) {
      case 'variation_not_found':
        alert('The variation was not found. Please update your bookmark.');
        break;
      case 'experiment_not_found':
        alert('The experiment was not found or is disabled. Please update your bookmark.');
        break;
      case 'user_not_assignable':
        alert('You must be proxied or sandboxed to use this bookmark.');
        break;
      case 'invalid_ids':
        alert(
          'To assign yourself or another user, you must run this from Abacus and specify an existing user.\\n\\n' +
          'To assign the current anonymous user, verify that Tracks is not blocked and run in an environment where ' +
          'the tk_ai cookie is set.'
        );
        break;
      case 'invalid_experiment_status':
        alert('The current experiment status does not support manual assignment.');
        break;
      default:
        if (!responseBody.variations) {
          alert('An unknown error occurred: ' + responseBody.message);
          break;
        }
        const baseMessage = 'ExPlat: Successful Assignment\\n–––––––––––––––––––––––––––––\\n\\n' +
          'Experiment: ${experimentName}\\nVariation: ${variationName}\\n\\n';
        if (responseBody.storage_method === 'anon_sqooped_out_table') {
          alert(baseMessage + 'Method: Logged-out assignment\\nApplies to the current anon user (tk_ai cookie).');
        } else {
          const appliedUserDesc = usernameOverride || 'the current logged-in user';
          alert(baseMessage + 'Method: Logged-in assignment\\nApplies to ' + appliedUserDesc + '.');
        }
    }
})()`
}

/**
 * Renders the variations in tabular formation, in the order that they're given.
 *
 * @param variations - The variations to render.
 */
function VariationsTable({
  experiment: { variations, name: experimentName },
}: {
  experiment: ExperimentFull
}): JSX.Element {
  const classes = useStyles()
  return (
    <Table className={classes.root}>
      <TableHead>
        <TableRow>
          <TableCell component='th' variant='head'>
            Name
          </TableCell>
          <TableCell component='th' variant='head'>
            Percent
          </TableCell>
          <TableCell component='th' variant='head'>
            Manual&nbsp;Assignment
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Variations.sort(variations).map((variation) => {
          return (
            <TableRow key={variation.variationId}>
              <TableCell className={classes.monospace}>
                <span>{variation.name}</span>
                {variation.isDefault && (
                  <>
                    <br />
                    <Attribute name='default' />
                  </>
                )}
              </TableCell>
              <TableCell className={classes.monospace}>{variation.allocatedPercentage}%</TableCell>
              <TableCell className={classes.monospace}>
                <Tooltip
                  interactive
                  arrow
                  placement={'left'}
                  classes={{
                    tooltip: classes.tooltip,
                  }}
                  title={
                    <>
                      <Typography color='inherit' variant='body1' gutterBottom>
                        <strong> Bookmarklet: </strong>
                      </Typography>
                      <Typography color='inherit' variant='body1' gutterBottom>
                        <Link href={assignmentHref(variation.name, experimentName)}>
                          {variation.name} - {experimentName}
                        </Link>
                      </Typography>
                      <Typography color='inherit' variant='body1' gutterBottom>
                        <strong>To assign yourself or another WP.com user:</strong>
                        <ol>
                          <li>Drag the above link to your bookmarks or bookmark bar.</li>
                          <li>Click the bookmark when you are on any Abacus page.</li>
                          <li>Follow the prompt to choose a user to assign.</li>
                          <li>You will receive an alert on success.</li>
                        </ol>
                        <strong>To assign an anonymous user:</strong>
                        <ol>
                          <li>Drag the above link to your bookmarks or bookmark bar.</li>
                          <li>
                            Navigate to a page while logged-out with Tracks enabled (e.g., visit WordPress.com in
                            incognito mode without any ad blockers).
                          </li>
                          <li>Ensure you are proxied or sandboxing the API.</li>
                          <li>
                            Click the bookmark to assign the current anonymous user (i.e., the ID from the tk_ai
                            cookie).
                          </li>
                          <li>You will receive an alert on success.</li>
                        </ol>
                      </Typography>
                    </>
                  }
                >
                  <span className={classes.tooltipped}>Bookmarklet</span>
                </Tooltip>{' '}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default VariationsTable
