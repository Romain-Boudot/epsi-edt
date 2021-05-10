const moment = require('moment-timezone')
const { dayParser } = require('./dayParser')
const uuid = require('uuid')

let seq = 0;

const utcOffset = moment().tz("Europe/Paris").utcOffset() / 60

function parseTimeAndRemoveUtcOffset(time) {
  return time.replace(
    /^(\d{2})(:)(\d{2})/,
    (...m) => (parseInt(m[1]) - utcOffset).toString().padStart(2, '0').concat(m[3])
  )
}

module.exports.icalWriter = function (user, write) {
  const startDate = moment().startOf('isoWeek').add(-1, 'week')
  const endDate = startDate.clone().add(6, 'week')

  return dayParser(user, startDate, endDate).then(allDays => {
    seq = seq % 99999;

    write('BEGIN:VCALENDAR\n\r')
    write('VERSION:2.0\n\r')
    write('PRODID:-// ROMAINBDT //FR\n\r')

    allDays.forEach(day => {
      const date = day.date.replace(/-/g, '')
      day.classes.forEach(cours => {
        const begin = parseTimeAndRemoveUtcOffset(cours.debut)
        const end = parseTimeAndRemoveUtcOffset(cours.fin)
        write('BEGIN:VEVENT\n\r')
        write(`UID:${uuid.v4()}\n\r`)
        write(`DTSTAMP:${date}T${begin}00Z\n\r`)
        write(`DTSTART:${date}T${begin}00Z\n\r`)
        write(`DTEND:${date}T${end}00Z\n\r`)
        write(`SUMMARY:${cours.matiere}\n\r`)
        write(`LOCATION:${cours.salle}\n\r`)
        write('STATUS:CONFIRMED\n\r')
        write(`DESCRIPTION:${cours.prof}\n\r`)
        write(`SEQUENCE:${seq++}\n\r`)
        write('END:VEVENT\n\r')
      })
    })

    write('END:VCALENDAR')
  })
}
