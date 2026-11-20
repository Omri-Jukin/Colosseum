import { describe, expect, it } from 'vitest'
import { journeyStops } from './journey'

describe('historical journey content', () => {
  it('keeps every historical stop attached to an authoritative source', () => {
    const historicalStops = journeyStops.filter(
      (stop) => stop.kind !== 'station',
    )

    expect(historicalStops).toHaveLength(8)
    for (const stop of historicalStops) {
      expect(stop.source).not.toBeNull()
      expect(stop.source?.url).toMatch(/^https:\/\/(www\.metmuseum\.org|colosseo\.it)\//)
    }
  })

  it('uses the documented completion date and a qualified present-day age', () => {
    expect(journeyStops[0].datum).toBe('80 CE')
    expect(journeyStops[1].datum).toBe('≈ 1,946 years')
    expect(journeyStops[1].copy).toContain('not the absence of it')
  })

  it('ends at the contemporary exterior pavilion', () => {
    const finalStop = journeyStops.at(-1)

    expect(finalStop?.id).toBe('tickets')
    expect(finalStop?.kicker).toContain('Exterior pavilion')
    expect(finalStop?.source).toBeNull()
  })
})
