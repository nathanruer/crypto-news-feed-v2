import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatRelativeTime } from '../../../../app/utils/format-relative-time'

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return "just now" for less than 10 seconds ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:10Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:05Z'))).toBe('just now')
  })

  it('should return seconds ago for less than 60 seconds', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:45Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('45s ago')
  })

  it('should return minutes ago for less than 60 minutes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:05:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('5m ago')
  })

  it('should return hours ago for less than 24 hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T15:00:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('3h ago')
  })

  it('should return days ago for less than 7 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-17T12:00:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('2d ago')
  })

  it('should return formatted date for more than 7 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-30T12:00:00Z'))
    const result = formatRelativeTime(new Date('2025-06-15T12:00:00Z'))
    expect(result).toContain('Jun')
    expect(result).toContain('15')
  })
})
