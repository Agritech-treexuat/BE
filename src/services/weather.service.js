const { getWeatherDataByTime, getWeatherDataByTimeRange } = require('../repositories/weather.repo')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { isValidObjectId } = require('../utils/index')
const { getFarm } = require('./farm.service')

class WeatherService {
  static async getWeatherDataByTime({ time, farmId }) {
    if (!farmId) {
      throw new BadRequestError('Farm ID is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm ID')
    }
    if (!time) {
      throw new BadRequestError('Time are required')
    }

    const farm = await getFarm({ farmId })
    if (!farm) {
      throw new NotFoundError('Farm not found')
    }
    const district = farm.district
    if (!district) {
      throw new NotFoundError('District not found')
    }

    const weatherData = await getWeatherDataByTime({ time: new Date(time), district })
    return weatherData
  }

  static async getWeatherDataByTimeRange({ startTime, endTime, farmId }) {
    if (!farmId) {
      throw new BadRequestError('Farm ID is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm ID')
    }
    if (!startTime || !endTime) {
      throw new BadRequestError('Start time and end time are required')
    }

    const farm = await getFarm({ farmId })
    if (!farm) {
      throw new NotFoundError('Farm not found')
    }
    const district = farm.district
    if (!district) {
      throw new NotFoundError('District not found')
    }

    const weatherData = await getWeatherDataByTimeRange({ startTime: startTime, endTime: endTime, district })
    return weatherData
  }
}

module.exports = WeatherService
