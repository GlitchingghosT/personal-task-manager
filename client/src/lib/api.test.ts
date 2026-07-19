import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createApiClient } from './api'

const testToken = ['test', 'token'].join('-')
const testPassword = ['password', '123'].join('')

describe('API client', () => {
  afterEach(() => vi.restoreAllMocks())

  it('adds JSON and bearer authorization headers to protected requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ tasks: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const client = createApiClient('https://example.test/api', () => testToken)

    await client.getTasks()

    const [, options] = fetchMock.mock.calls[0]
    expect(new Headers(options?.headers).get('Authorization')).toBe(`Bearer ${testToken}`)
    expect(new Headers(options?.headers).get('Content-Type')).toBe('application/json')
  })

  it('does not add an authorization header to login requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ user: { id: '1', name: 'Ada', email: 'ada@example.com' }, token: 'jwt' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const client = createApiClient('https://example.test/api', () => testToken)

    await client.login({ email: 'ada@example.com', password: testPassword })

    const [, options] = fetchMock.mock.calls[0]
    expect(new Headers(options?.headers).has('Authorization')).toBe(false)
  })

  it('parses the documented error envelope including field errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Check the submitted fields.',
          fields: { email: 'Enter a valid email address.' },
        },
      }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const client = createApiClient('https://example.test/api', () => null)

    await expect(client.register({ name: 'Ada', email: 'bad', password: testPassword })).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Check the submitted fields.',
      fields: { email: 'Enter a valid email address.' },
    } satisfies Partial<ApiError>)
  })

  it('handles a 204 response without attempting to parse a body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
    const client = createApiClient('https://example.test/api', () => testToken)

    await expect(client.deleteTask('task id')).resolves.toBeUndefined()
  })

  it('falls back to a safe message when an error body is malformed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>failure</html>', { status: 500 }))
    const client = createApiClient('https://example.test/api', () => null)

    await expect(client.login({ email: 'ada@example.com', password: testPassword })).rejects.toMatchObject({
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Please try again.',
    })
  })
})
