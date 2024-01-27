'use strict'

const { gardenServiceRequest } = require('../models/gardenServiceRequest.model')
const { Types } = require('mongoose')
const { getSelectData, unGetSelectData } = require('../../utils/index')

const getAllGardenServiceRequestsByFarm = async ({ limit, sort, page, filter } = {}) => {
  let query = gardenServiceRequest
    .find(filter || {})
    .populate('client')
    .populate('farm')
    .populate('gardenServiceTemplate')
    .populate('herbList')
    .populate('leafyList')
    .populate('rootList')
    .populate('fruitList')

  if (sort) {
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    query = query.sort(sortBy)
  }

  if (page && limit) {
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)
  }

  const gardenServiceRequests = await query.lean().exec()
  return gardenServiceRequests
}

const getGardenServiceRequestByGardenServiceRequestId = async ({ gardenServiceRequestId }, unSelect = ['__v']) => {
  return await gardenServiceRequest
    .findById(gardenServiceRequestId)
    .select(unGetSelectData(unSelect))
    .populate('client')
    .populate('farm')
    .populate('gardenServiceTemplate')
    .populate('herbList')
    .populate('leafyList')
    .populate('rootList')
    .populate('fruitList')
    .lean()
    .exec()
}

const addGardenServiceRequest = async ({
  time,
  clientId,
  farmId,
  gardenServiceTemplateId,
  herbListId,
  leafyListId,
  rootListId,
  fruitListId,
  note,
  status
}) => {
  return await gardenServiceRequest.create({
    time,
    client: new Types.ObjectId(clientId),
    farm: new Types.ObjectId(farmId),
    gardenServiceTemplate: new Types.ObjectId(gardenServiceTemplateId),
    herbList: herbListId.map((id) => new Types.ObjectId(id)),
    leafyList: leafyListId.map((id) => new Types.ObjectId(id)),
    rootList: rootListId.map((id) => new Types.ObjectId(id)),
    fruitList: fruitListId.map((id) => new Types.ObjectId(id)),
    note,
    status
  })
}

const updateGardenServiceRequest = async ({
  gardenServiceRequestId,
  herbListId,
  leafyListId,
  rootListId,
  fruitListId,
  note,
  status
}) => {
  const bodyUpdate = {}

  if (herbListId) {
    bodyUpdate.herbList = herbListId.map((id) => new Types.ObjectId(id))
  }

  if (leafyListId) {
    bodyUpdate.leafyList = leafyListId.map((id) => new Types.ObjectId(id))
  }

  if (rootListId) {
    bodyUpdate.rootList = rootListId.map((id) => new Types.ObjectId(id))
  }

  if (fruitListId) {
    bodyUpdate.fruitList = fruitListId.map((id) => new Types.ObjectId(id))
  }

  if (note) {
    bodyUpdate.note = note
  }

  if (status) {
    bodyUpdate.status = status
  }

  return await gardenServiceRequest.findByIdAndUpdate(gardenServiceRequestId, bodyUpdate, { new: true }).exec()
}

const deleteGardenServiceRequest = async ({ gardenServiceRequestId }) => {
  return await gardenServiceRequest.findByIdAndDelete(gardenServiceRequestId).exec()
}

module.exports = {
  getAllGardenServiceRequestsByFarm,
  getGardenServiceRequestByGardenServiceRequestId,
  addGardenServiceRequest,
  updateGardenServiceRequest,
  deleteGardenServiceRequest
}
