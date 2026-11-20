export const ticketTypes = [
  {
    id: 'standard',
    name: 'Standard Entry',
    detail: 'Colosseum, Forum, and Palatine',
    price: 22,
  },
  {
    id: 'guided',
    name: 'Guided Tour',
    detail: '90-minute historian-led visit',
    price: 38,
  },
  {
    id: 'arena',
    name: 'Arena Floor Access',
    detail: 'Timed entry via the gladiator gate',
    price: 32,
  },
] as const

export type TicketId = (typeof ticketTypes)[number]['id']

export interface BookingDraft {
  ticketId: TicketId | null
  quantity: number
  date: string
  time: string
}

export interface BookingErrors {
  ticketId?: string
  quantity?: string
  date?: string
  time?: string
}

export function validateBooking(draft: BookingDraft): BookingErrors {
  const errors: BookingErrors = {}

  if (!draft.ticketId) {
    errors.ticketId = 'Choose a ticket type.'
  }

  if (!Number.isInteger(draft.quantity) || draft.quantity < 1) {
    errors.quantity = 'Quantity must be at least 1.'
  }

  if (!draft.date) {
    errors.date = 'Choose a visit date.'
  }

  if (!draft.time) {
    errors.time = 'Choose an entry time.'
  }

  return errors
}

export function getTicketTotal(draft: BookingDraft): number {
  const ticket = ticketTypes.find((item) => item.id === draft.ticketId)
  return ticket ? ticket.price * Math.max(0, draft.quantity) : 0
}

export function createBookingReference(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '')
  const entropy = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `FLV-${date}-${entropy}`
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}
