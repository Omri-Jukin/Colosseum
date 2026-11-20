import { describe, expect, it, vi } from 'vitest'
import {
  createBookingReference,
  getTicketTotal,
  validateBooking,
  type BookingDraft,
} from './tickets'

const validDraft: BookingDraft = {
  ticketId: 'guided',
  quantity: 2,
  date: '2026-08-12',
  time: '10:30',
}

describe('ticket booking rules', () => {
  it('requires a ticket, positive quantity, date, and time', () => {
    expect(
      validateBooking({
        ticketId: null,
        quantity: 0,
        date: '',
        time: '',
      }),
    ).toEqual({
      ticketId: 'Choose a ticket type.',
      quantity: 'Quantity must be at least 1.',
      date: 'Choose a visit date.',
      time: 'Choose an entry time.',
    })
  })

  it('accepts a complete booking', () => {
    expect(validateBooking(validDraft)).toEqual({})
  })

  it('calculates the total from ticket price and quantity', () => {
    expect(getTicketTotal(validDraft)).toBe(76)
  })

  it('creates a dated, non-payment booking reference', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.123456)
    expect(createBookingReference(new Date('2026-07-26T09:00:00.000Z'))).toMatch(
      /^FLV-20260726-[A-Z0-9]{5}$/,
    )
    vi.restoreAllMocks()
  })
})
