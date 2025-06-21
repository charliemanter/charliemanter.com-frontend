import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { useState, useEffect } from 'react'
import { parse as parseDate, format as fmt, addDays } from 'date-fns'
import styles from '../../styles/Itinerary.module.css'

const START_DATE = '2025-06-22'

export async function getStaticProps() {
  const csv = fs.readFileSync(
    path.join(process.cwd(), 'data', 'Chicago_Trip_Itinerary.csv'),
    'utf8'
  )
  const { data } = Papa.parse(csv, { header: true })
  const days = Array.from({ length: 6 }, (_, i) => {
    const label = `Day ${i+1}`
    const date = fmt(addDays(parseDate(START_DATE, 'yyyy-MM-dd', new Date()), i), 'MMMM d, yyyy')
    return {
      label,
      date,
      events: data.filter(r => Number(r.Day.replace('Day ', '')) === i+1),
      // you could swap these out for real photos of each day’s main attraction:
      bg: `/images/day${i+1}.jpg`
    }
  })
  return { props: { days } }
}

export default function Itinerary({ days }) {
  const [done, setDone] = useState({})
  useEffect(() => {
    setDone(JSON.parse(localStorage.getItem('itDone')||'{}'))
  }, [])

  const toggle = key => {
    const next = { ...done, [key]: !done[key] }
    localStorage.setItem('itDone', JSON.stringify(next))
    setDone(next)
  }

  return (
    <div className={styles.carousel}>
      {days.map(({ label, date, events, bg }) => (
        <section
          key={label}
          className={styles.day}
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className={styles.overlay}/>
          <div className={styles.content}>
            <h2>{label}: {date}</h2>
            {events.map((e,i) => {
              const key = `${label}-${i}`
              const maps = `https://google.com/maps/search/?api=1&query=${encodeURIComponent(e.Activity+' Chicago')}`
              const [start, end] = (() => {
                const base = addDays(parseDate(START_DATE,'yyyy-MM-dd',new Date()), Number(label.replace('Day ','') )-1)
                const [s,t] = e.Time.split('–').map(s=>s.trim())
                const ds = new Date(`${fmt(base,'yyyy-MM-dd')} ${s}`)
                const de = t
                  ? new Date(`${fmt(base,'yyyy-MM-dd')} ${t}`)
                  : new Date(ds.getTime()+3600000)
                const f = d => fmt(d,"yyyyMMdd'T'HHmmss'Z'")
                return [f(ds), f(de)]
              })()
              const cal = [
                'https://calendar.google.com/calendar/render?action=TEMPLATE',
                `&text=${encodeURIComponent(e.Activity)}`,
                `&dates=${start}/${end}`,
                `&details=${encodeURIComponent(e.Time)}`,
                `&location=Chicago`
              ].join('')

              return (
                <div key={key} className={styles.card}>
                  <p><strong>{e.Time}</strong></p>
                  <p>{e.Activity}</p>
                  <div className={styles.actions}>
                    <a href={maps} target="_blank">🗺️ Map</a>
                    <a href={cal} target="_blank">➕ Calendar</a>
                    <label>
                      <input
                        type="checkbox"
                        checked={!!done[key]}
                        onChange={()=>toggle(key)}
                      />
                      Done
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
