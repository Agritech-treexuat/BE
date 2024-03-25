const { Types } = require('mongoose')
const { getAllEvents, getEventById } = require('../models/repositories/event.repo')
const { MethodFailureError, BadRequestError, NotFoundError } = require('../core/error.response')
const { isValidObjectId } = require('../utils')
const FarmService = require('./farm.service')

class EventService {
  static async getAllEvents({ limit, sort, page } = {}) {
    const filter = { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] }
    const events = await getAllEvents({ limit, sort, page, filter })
    if (!events || events.length === 0) {
      return []
    }
    // Find farms matching the wallet addresses
    const farms = await FarmService.getAllFarms()

    // Map each event to its corresponding farm based on wallet address
    const eventsWithFarms = events.map((event) => {
      const farm = farms.find((farm) => farm.walletAddress === event.walletAddress)
      return { ...event, farm }
    })

    return eventsWithFarms
  }

  static async getEventById({ eventId }) {
    if (!eventId) throw new BadRequestError('Event id is required')
    if (!isValidObjectId(eventId)) {
      throw new BadRequestError('Invalid event id')
    }

    const foundEvent = await getEventById({ eventId })
    if (!foundEvent) {
      throw new NotFoundError('Event not found')
    }

    return foundEvent
  }
}

module.exports = EventService
