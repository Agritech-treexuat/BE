'use strict'

const { plant } = require('../../models/plant.model')
const { Types } = require('mongoose')
const { getSelectData, unGetSelectData } = require('../../utils/index')
const { NotFoundError, MethodFailureError } = require('../../core/error.response')

const searchPlantByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch)
  const result = await plant
    .find(
      {
        $text: { $search: regexSearch }
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean()
    .exec()

  return result
}

const findAllPlants = async ({ limit, sort, page, filter } = {}) => {
  let query = plant.find(filter || {})

  if (sort) {
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    query = query.sort(sortBy)
  }

  if (page && limit) {
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)
  }

  const plants = await query.lean().exec()
  return plants
}

const findPlantByPlantId = async ({ plantId }, unSelect = ['__v']) => {
  return await plant.findById(plantId).select(unGetSelectData(unSelect)).lean().exec()
}

const addPlant = async ({ plantData, farmId }) => {
  return await plant.create({
    ...plantData,
    farm: new Types.ObjectId(farmId)
  })
}

const updatePlant = async ({ plantId, bodyUpdate }) => {
  return await plant.findByIdAndUpdate(plantId, bodyUpdate, { new: true }).exec()
}

const deletePlant = async (plantId) => {
  return await plant.findByIdAndDelete(plantId).exec()
}

module.exports = {
  searchPlantByUser,
  findAllPlants,
  findPlantByPlantId,
  updatePlant,
  addPlant,
  deletePlant
}
