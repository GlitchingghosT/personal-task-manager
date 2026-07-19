import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../context/auth-context'
import { ApiError, type ApiClient } from '../lib/api'
import MyTask from './MyTask'

describe('MyTask', () => {
  it('shows a load error without also showing the empty state', async () => {
    const api = {
      getTasks: vi.fn().mockRejectedValue(
        new ApiError('Unable to reach TaskDuty. Check your connection and try again.', 0, 'INTERNAL_ERROR'),
      ),
    } as unknown as ApiClient

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{
          user: { id: 'user-1', name: 'Ada', email: 'ada@example.com' },
          ready: true,
          api,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
        }}>
          <MyTask />
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach TaskDuty')
    expect(screen.queryByText('No tasks yet')).not.toBeInTheDocument()
  })
})
