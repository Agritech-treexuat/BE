'use strict'

const { event } = require('../models/event.model')
const { Types } = require('mongoose')

const getAllEvents = async ({ limit, sort, page, filter } = {}) => {
  let query = event.find(filter || {})

  if (sort) {
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    query = query.sort(sortBy)
  }

  if (page && limit) {
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)
  }

  const events = await query.lean().exec()
  return events
}

const getEventById = async ({ eventId }) => {
  const foundEvent = await event
    .findOne({
      _id: new Types.ObjectId(eventId)
    })
    .exec()

  return foundEvent
}

module.exports = {
  getAllEvents,
  getEventById
}
