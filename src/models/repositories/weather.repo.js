'use strict'

const { weather } = require('../weather.model')

const getWeatherDataByTime = async ({ time, district }) => {
  try {
    // Extract the hour part from the provided time
    const hour = new Date(time).getUTCHours()

    // Calculate the start and end time of the hour
    const startHour = new Date(time)
    startHour.setUTCHours(hour, 0, 0, 0)

    const endHour = new Date(time)
    endHour.setUTCHours(hour + 1, 0, 0, 0)

    // Find weather data within the same hour
    const weatherData = await weather.findOne({
      time: {
        $gte: startHour,
        $lt: endHour
      },
      district: district
    })
    return weatherData
  } catch (error) {
    console.error('Error fetching weather data by time:', error)
    throw error
  }
}

module.exports = {
  getWeatherDataByTime
}
