import { act, fireEvent, render, screen } from '@testing-library/react'
import { Formik, FormikProps } from 'formik'
import React from 'react'

import { ExperimentFormData, experimentToFormData } from 'src/lib/form-data'
import { Segment, SegmentType } from 'src/lib/schemas'
import Fixtures from 'src/test-helpers/fixtures'
import { changeFieldByRole } from 'src/test-helpers/test-utils'
import * as UtilsGeneral from 'src/utils/general'

import Audience from './Audience'
import { ExperimentFormCompletionBag } from './ExperimentForm'

jest.mock('src/utils/general')
const mockedUtilsGeneral = UtilsGeneral as jest.Mocked<typeof UtilsGeneral>

const exclusionGroupCompletions = Fixtures.createTagBares(5).map((tag) => ({
  name: tag.name,
  value: tag.tagId,
}))
const completionBag: ExperimentFormCompletionBag = {
  userCompletionDataSource: {
    data: null,
    error: null,
    isLoading: false,
    reloadRef: { current: () => undefined },
  },
  eventCompletionDataSource: {
    data: null,
    error: null,
    isLoading: false,
    reloadRef: { current: () => undefined },
  },
  exclusionGroupCompletionDataSource: {
    data: exclusionGroupCompletions,
    error: null,
    isLoading: false,
    reloadRef: { current: () => undefined },
  },
}

// Needed for testing the MuiCombobox
document.createRange = () => ({
  setStart: () => undefined,
  setEnd: () => undefined,
  // @ts-ignore; This is just for mocking
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
})

test('renders as expected', async () => {
  const indexedSegments: Record<number, Segment> = {
    1: { segmentId: 1, name: 'us', type: SegmentType.Country },
    2: { segmentId: 2, name: 'au', type: SegmentType.Country },
    3: { segmentId: 3, name: 'en-US', type: SegmentType.Locale },
    4: { segmentId: 4, name: 'en-AU', type: SegmentType.Locale },
  }

  // Turning on debug mode for the exclusion group tags
  mockedUtilsGeneral.isDebugMode.mockImplementation(() => true)

  const { container } = render(
    <Formik
      initialValues={{ experiment: experimentToFormData({}) }}
      onSubmit={
        /* istanbul ignore next; This is unused */
        () => undefined
      }
    >
      {(formikProps: FormikProps<{ experiment: ExperimentFormData }>) => (
        <Audience {...{ formikProps, indexedSegments, completionBag }} />
      )}
    </Formik>,
  )
  expect(container).toMatchSnapshot()

  const addVariationButton = screen.getByRole('button', { name: /Add variation/i })
  fireEvent.click(addVariationButton)
  const removeVariationButton = screen.getAllByRole('button', { name: /Remove variation/i })
  fireEvent.click(removeVariationButton[0])

  const segmentComboboxInput = screen.getByPlaceholderText(/Search and select to customize/)

  await act(async () => {
    fireEvent.change(segmentComboboxInput, { target: { value: 'AU' } })
  })

  const segmentOption = await screen.findByRole('option', { name: /Locale: en-AU/i })
  await act(async () => {
    fireEvent.click(segmentOption)
  })

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    fireEvent.click(screen.getByLabelText(/Exclude/))
  })

  await changeFieldByRole('textbox', /Exclusion Groups/, 'tag_1')
  await act(async () => {
    fireEvent.click(screen.getByRole('option', { name: /tag_1/ }))
  })

  expect(container).toMatchSnapshot()
})
