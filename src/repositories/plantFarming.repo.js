const { Types } = require('mongoose')
const { plantFarming } = require('../models/plantFarming.model')
const { unGetSelectData } = require('../utils')

// Add a new plant farming
const addPlantFarming = async ({ plantFarmingData, plantId, seedId }) => {
  return await plantFarming.create({
    plant: new Types.ObjectId(plantId),
    seed: new Types.ObjectId(seedId),
    ...plantFarmingData
  })
}

// Update a plant farming
const updatePlantFarming = async ({ plantFarmingId, updatedData, historyPlantFarmingEdit }) => {
  const plantFarmingItem = await plantFarming.findById(plantFarmingId).exec()
  if (!plantFarmingItem) {
    return null
  }
  plantFarmingItem.isEdited = true
  if (historyPlantFarmingEdit) {
    plantFarmingItem.historyPlantFarmingEdit.push(historyPlantFarmingEdit)
  }
  await plantFarmingItem.save()
  return await plantFarming.findByIdAndUpdate(plantFarmingId, updatedData, { new: true }).exec()
}

// Delete a plant farming
const deletePlantFarming = async ({ plantFarmingId }) => {
  const bodyUpdate = {
    isDeleted: true,
    deletedAt: new Date()
  }
  return await plantFarming.findByIdAndUpdate(plantFarmingId, bodyUpdate, { new: true }).exec()
}

// Get all plant farming by plant
const getAllPlantFarmingByPlant = async ({ limit, sort, page, filter } = {}) => {
  return await queryAllPlantFarming({ limit, sort, page, filter })
}

// Get all plant farming by farm
const getAllPlantFarmingByFarm = async ({ limit, sort, page, filter } = {}) => {
  return await queryAllPlantFarming({ limit, sort, page, filter })
}

// Get all plant farming by seed
const getAllPlantFarmingBySeed = async ({ limit, sort, page, filter } = {}) => {
  return await queryAllPlantFarming({ limit, sort, page, filter })
}

// Get plant farming by ID
const getPlantFarmingByPlantFarmingId = async ({ plantFarmingId }, unSelect = ['__v']) => {
  return await plantFarming
    .findById(plantFarmingId)
    .populate('plant')
    .populate('seed')
    .select(unGetSelectData(unSelect))
    .lean()
    .exec()
}

const getPlantFarmingByPlantIdAndSeedId = async ({ plantId, seedId }, unSelect = ['__v']) => {
  return await plantFarming
    .findOne({ plant: new Types.ObjectId(plantId), seed: new Types.ObjectId(seedId) })
    .populate('plant')
    .populate('seed')
    .select(unGetSelectData(unSelect))
    .lean()
    .exec()
}

const getPlantFarmingBySeedId = async ({ seedId }, unSelect = ['__v']) => {
  return await plantFarming
    .find({ seed: new Types.ObjectId(seedId) })
    .populate('plant')
    .populate('seed')
    .select(unGetSelectData(unSelect))
    .lean()
    .exec()
}

const queryAllPlantFarming = async ({ limit, sort, page, filter } = {}) => {
  let query = plantFarming
    .find(filter || {})
    .populate('plant')
    .populate('seed')

  if (sort) {
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    query = query.sort(sortBy)
  }

  if (page && limit) {
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)
  }

  const plantFarmings = await query.lean().exec()
  return plantFarmings
}

module.exports = {
  addPlantFarming,
  updatePlantFarming,
  deletePlantFarming,
  getAllPlantFarmingByPlant,
  getAllPlantFarmingByFarm,
  getAllPlantFarmingBySeed,
  getPlantFarmingByPlantFarmingId,
  getPlantFarmingByPlantIdAndSeedId,
  getPlantFarmingBySeedId
}
