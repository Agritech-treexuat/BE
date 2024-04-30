'use strict'

const { distributer } = require('../models/distributer.model')
const { Types } = require('mongoose')

const getAllDistributers = async ({ limit, sort, page, filter } = {}) => {
  let query = distributer.find(filter || {})

  if (sort) {
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    query = query.sort(sortBy)
  }

  if (page && limit) {
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)
  }

  const distributers = await query.lean().exec()
  return distributers
}

const getDistributerById = async ({ distributerId }) => {
  const foundDistributer = await distributer
    .findOne({
      _id: new Types.ObjectId(distributerId)
    })
    .exec()

  return foundDistributer
}

const addDistributer = async ({ distributerData }) => {
  const newDistributer = new distributer(distributerData)
  const result = await newDistributer.save()
  return result
}

const updateDistributer = async ({ distributerId, distributerData }) => {
  const result = await distributer.findByIdAndUpdate(distributerId, distributerData, { new: true }).lean().exec()
  return result
}

const deleteDistributer = async ({ distributerId }) => {
  const bodyUpdate = {
    isDeleted: true,
    deletedAt: new Date()
  }
  return await distributer.findByIdAndUpdate(distributerId, bodyUpdate, { new: true }).exec()
}

module.exports = {
  getAllDistributers,
  getDistributerById,
  addDistributer,
  updateDistributer,
  deleteDistributer
}
