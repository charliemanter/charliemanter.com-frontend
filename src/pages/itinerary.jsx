// pages/chicago/itinerary.jsx
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { useState, useEffect } from 'react'
import { parse as parseDate, format as fmt, addDays } from 'date-fns'

const START_DATE = '2025-06-22'

export async function getStaticProps() {
  const csv = fs.readFileSync(path.join(process.cwd(), 'data', 'Chicago_Trip_Itinerary.csv'), 'utf8')
  const { data } = Papa.parse(csv, { header: true })
  // group into an array of days 1–6
  const days = Array.from({ length: 6 }, (_, i) => {
    const dayLabel = `Day ${i + 1}`
    const date = fmt(addDays(parseDate(START_DATE, 'yyyy-MM-dd', new Date()), i), 'MMMM d, yyyy')
    const events = data.filter(r => Number(r.Day.replace('Day ', '')) === i + 1)
    return { dayLabel, date, events }
  })
  return { props: { days } }
}

export default function Itinerary({ days }) {
  const [doneMap, setDoneMap] = useState({})
  useEffect(() => {
    setDoneMap(JSON.parse(localStorage.getItem('itineraryDone') || '{}'))
  }, [])

  function toggleDone(key) {
    const next = { ...doneMap, [key]: !doneMap[key] }
    localStorage.setItem('itineraryDone', JSON.stringify(next))
    setDoneMap(next)
  }

  return (
    <div className="h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-center p-4">Chicago Trip Itinerary</h1>
      <div className="flex-1 overflow-x-auto snap-x snap-mandatory flex">
        {days.map(({ dayLabel, date, events }) => (
          <section
            key={dayLabel}
            className="min-w-full snap-start flex-shrink-0 p-6 space-y-4"
          >
            <h2 className="text-2xl font-semibold">{dayLabel}: {date}</h2>
            <div className="space-y-3">
              {events.map((e,i) => {
                const key = `${dayLabel}-${i}`
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.Activity + ' Chicago')}`
                const [startStr, endStr] = (() => {
                  const base = addDays(parseDate(START_DATE, 'yyyy-MM-dd', new Date()), Number(dayLabel.replace('Day ', '')) - 1)
                  const [startT, endT] = e.Time.split('–').map(s=>s.trim())
                  const dtStart = new Date(`${fmt(base,'yyyy-MM-dd')} ${startT}`)
                  const dtEnd   = endT
                    ? new Date(`${fmt(base,'yyyy-MM-dd')} ${endT}`)
                    : new Date(dtStart.getTime() + 60*60*1000)
                  const f = d => fmt(d, "yyyyMMdd'T'HHmmss'Z'")
                  return [f(dtStart), f(dtEnd)]
                })()
                const calendarUrl = [
                  'https://calendar.google.com/calendar/render?action=TEMPLATE',
                  `&text=${encodeURIComponent(e.Activity)}`,
                  `&dates=${startStr}/${endStr}`,
                  `&details=${encodeURIComponent(e.Time)}`,
                  `&location=Chicago`
                ].join('')

                return (
                  <div
                    key={key}
                    className="border rounded-lg p-4 shadow flex flex-col justify-between h-40"
                  >
                    <div>
                      <p className="font-medium">{e.Time}</p>
                      <p className="text-lg">{e.Activity}</p>
                    </div>
                    <div className="mt-2 flex items-center space-x-3">
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="underline text-sm">🗺️ Map</a>
                      <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="underline text-sm">➕ Calendar</a>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={!!doneMap[key]}
                          onChange={() => toggleDone(key)}
                        />
                        <span className="ml-1">Done</span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
