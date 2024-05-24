'use strict'
const EventService = require('../services/event.service')
const { SuccessResponse } = require('../core/success.response')

class EventController {
  getAllEvents = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all events success!',
      metadata: await EventService.getAllEvents({
        ...req.query
      })
    }).send(res)
  }

  getEventById = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get event by id success!',
      metadata: await EventService.getEventById({
        eventId: req.params.eventId
      })
    }).send(res)
  }

  getEventsByFarmId = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get events by farm id success!',
      metadata: await EventService.getEventsByFarmId({
        farmId: req.params.farmId
      })
    }).send(res)
  }
}

module.exports = new EventController()
