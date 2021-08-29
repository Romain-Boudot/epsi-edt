const wretch = require('wretch')
const { JSDOM } = require('jsdom')
const Moment = require('moment')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment);

function parse(user, date, depth = 0) {
  if (date.day() === 0 || date.day() === 6) {
    return {
      date: date.format('YYYY-MM-DD'),
      classes: []
    }
  }

  if (depth != 0) {
    console.warn(`timeout on ${user} at ${date} : depth -> ${depth}`)
    if (depth > 5) return Promise.reject()
  }

  return new Promise((resolve, reject) => {
    https://edtmobiliteng.wigorservices.net//WebPsDyn.aspx?Action=posETUD&serverid=C&tel=romain.boudot&date=08/30/2021%208:00
    wretch(`https://edtmobiliteng.wigorservices.net//WebPsDyn.aspx?Action=posETUD&serverid=C&tel=${user}&date=${date.format('MM/DD/YYYY')}%208:00`)
      .get()
      .text(text => {
        resolve({
          date: date.format('YYYY-MM-DD'),
          classes: Array.from(new JSDOM(text).window.document.querySelectorAll('.Ligne')).map(elem => ({
            debut: elem.querySelector('.Debut').innerHTML,
            salle: elem.querySelector('.Salle').innerHTML,
            fin: elem.querySelector('.Fin').innerHTML,
            matiere: elem.querySelector('.Matiere').innerHTML,
            prof: elem.querySelector('.Prof').innerHTML
          }))
        })
      }).catch(error => {
        if (error.code === 'ETIMEDOUT') setTimeout(() => parse(user, date, depth + 1).then(resolve).catch(reject), 1000)
        else reject()
      })
  })
}

module.exports.dayParser = function (user, sDate, eDate) {
  const startDate = moment(sDate)
  const endDate = moment(eDate)

  if (!startDate.isValid() || !endDate.isValid() || endDate.isBefore(startDate)) {
    return Promise.reject()
  }

  const range = moment.range(startDate, endDate)

  const arrayOfDay = Array.from(range.by('day'))
  const promises = arrayOfDay.map(day => parse(user, day))

  return Promise.all(promises)
}