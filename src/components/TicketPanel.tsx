import { useMemo, useState, type FormEvent } from 'react'
import {
  createBookingReference,
  formatEuro,
  getTicketTotal,
  ticketTypes,
  validateBooking,
  type BookingDraft,
  type BookingErrors,
  type TicketId,
} from '../lib/tickets'

interface TicketPanelProps {
  visible: boolean
}

function getToday(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

function getNextAvailableDate(): string {
  const nextAvailable = new Date()
  nextAvailable.setDate(nextAvailable.getDate() + 1)
  nextAvailable.setMinutes(
    nextAvailable.getMinutes() - nextAvailable.getTimezoneOffset(),
  )
  return nextAvailable.toISOString().slice(0, 10)
}

export function TicketPanel({ visible }: TicketPanelProps) {
  const [draft, setDraft] = useState<BookingDraft>({
    ticketId: null,
    quantity: 1,
    date: '',
    time: '',
  })
  const [errors, setErrors] = useState<BookingErrors>({})
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const today = useMemo(() => getToday(), [])
  const nextAvailableDate = useMemo(() => getNextAvailableDate(), [])
  const total = getTicketTotal(draft)
  const selectedTicket = ticketTypes.find(
    (ticket) => ticket.id === draft.ticketId,
  )

  const updateDraft = <Key extends keyof BookingDraft>(
    key: Key,
    value: BookingDraft[Key],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateBooking(draft)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      setBookingReference(createBookingReference())
    }
  }

  const resetBooking = () => {
    setDraft({ ticketId: null, quantity: 1, date: '', time: '' })
    setErrors({})
    setBookingReference(null)
  }

  return (
    <aside
      className={`ticket-panel ${visible ? 'ticket-panel--visible' : ''}`}
      aria-hidden={!visible}
      data-testid="buy-ticket-panel"
    >
      {bookingReference ? (
        <div
          className="confirmation"
          data-testid="booking-confirmation"
          role="status"
        >
          <div className="confirmation__seal" aria-hidden="true">
            ✓
          </div>
          <p className="eyebrow">Reservation held</p>
          <h2>See you at the arena.</h2>
          <p>
            {draft.quantity} × {selectedTicket?.name} on{' '}
            <strong>{draft.date}</strong> at <strong>{draft.time}</strong>.
          </p>
          <div className="booking-reference">
            <span>Booking reference</span>
            <strong data-testid="booking-reference">{bookingReference}</strong>
          </div>
          <p className="confirmation__note">
            This is a demonstration booking. No payment was collected.
          </p>
          <button
            className="secondary-button"
            type="button"
            onClick={resetBooking}
          >
            Start another booking
          </button>
        </div>
      ) : (
        <form onSubmit={submitBooking} noValidate>
          <header className="ticket-panel__header">
            <div>
              <p className="eyebrow">Official visit station</p>
              <h2>Book the Colosseum</h2>
            </div>
            <div className="ticket-panel__mark" aria-hidden="true">
              SPQR
            </div>
          </header>

          <fieldset
            className="ticket-types"
            aria-describedby={errors.ticketId ? 'ticket-error' : undefined}
          >
            <legend>Choose your access</legend>
            {ticketTypes.map((ticket) => (
              <button
                key={ticket.id}
                className={`ticket-type ${
                  draft.ticketId === ticket.id
                    ? 'ticket-type--selected'
                    : ''
                }`}
                type="button"
                role="radio"
                aria-checked={draft.ticketId === ticket.id}
                data-testid={`ticket-${ticket.id}`}
                onClick={() => updateDraft('ticketId', ticket.id as TicketId)}
              >
                <span>
                  <strong>{ticket.name}</strong>
                  <small>{ticket.detail}</small>
                </span>
                <b>{formatEuro(ticket.price)}</b>
              </button>
            ))}
            {errors.ticketId && (
              <p className="field-error" id="ticket-error">
                {errors.ticketId}
              </p>
            )}
          </fieldset>

          <div className="booking-fields">
            <div className="quantity-field">
              <span id="quantity-label">Visitors</span>
              <div
                className="stepper"
                role="group"
                aria-labelledby="quantity-label"
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  data-testid="quantity-decrease"
                  disabled={draft.quantity <= 1}
                  onClick={() =>
                    updateDraft('quantity', Math.max(1, draft.quantity - 1))
                  }
                >
                  −
                </button>
                <output data-testid="quantity">{draft.quantity}</output>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  data-testid="quantity-increase"
                  disabled={draft.quantity >= 8}
                  onClick={() =>
                    updateDraft('quantity', Math.min(8, draft.quantity + 1))
                  }
                >
                  +
                </button>
              </div>
              {errors.quantity && (
                <p className="field-error">{errors.quantity}</p>
              )}
            </div>

            <div className="field-label date-field">
              <label htmlFor="visit-date">Visit date</label>
              <input
                id="visit-date"
                type="date"
                min={today}
                value={draft.date}
                data-testid="visit-date"
                aria-invalid={Boolean(errors.date)}
                onChange={(event) => updateDraft('date', event.target.value)}
              />
              <button
                className="date-shortcut"
                type="button"
                data-testid="next-available-date"
                onClick={() => updateDraft('date', nextAvailableDate)}
              >
                Use next available
              </button>
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>

            <label className="field-label" htmlFor="visit-time">
              Entry time
              <select
                id="visit-time"
                value={draft.time}
                data-testid="visit-time"
                aria-invalid={Boolean(errors.time)}
                onChange={(event) => updateDraft('time', event.target.value)}
              >
                <option value="">Select</option>
                <option value="09:00">09:00</option>
                <option value="10:30">10:30</option>
                <option value="12:00">12:00</option>
                <option value="14:30">14:30</option>
                <option value="16:00">16:00</option>
              </select>
              {errors.time && <span className="field-error">{errors.time}</span>}
            </label>
          </div>

          <div className="price-summary" aria-live="polite">
            <span>
              {selectedTicket
                ? `${draft.quantity} × ${selectedTicket.name}`
                : 'Select an access type'}
            </span>
            <strong data-testid="price-total">{formatEuro(total)}</strong>
          </div>

          <button className="buy-button" type="submit" data-testid="buy-ticket">
            <span>Buy ticket</span>
            <span aria-hidden="true">→</span>
          </button>
          <p className="payment-note">
            Demonstration checkout · No payment details requested
          </p>
        </form>
      )}
    </aside>
  )
}
