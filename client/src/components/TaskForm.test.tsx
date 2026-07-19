import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskForm } from './TaskForm'

describe('TaskForm', () => {
  it('renders accessible fields and submits trimmed values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TaskForm submitLabel="Create task" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Task title'), '  Ship API  ')
    await user.type(screen.getByLabelText('Description'), '  Connect the frontend.  ')
    await user.selectOptions(screen.getByLabelText('Priority'), 'urgent')
    await user.click(screen.getByRole('button', { name: 'Create task' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Ship API',
      description: 'Connect the frontend.',
      tag: 'urgent',
    })
  })

  it('shows validation errors and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    render(<TaskForm submitLabel="Create task" onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Create task' }))

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByLabelText('Task title')).toHaveFocus()
  })
})
