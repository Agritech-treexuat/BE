'use strict'

const { plant } = require('../../models/plant.model')
const { Types } = require('mongoose')
const { getSelectData, unGetSelectData } = require('../../utils/index')

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

const findAllPlants = async ({ limit, sort, page, filter }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const plants = await plant.find(filter).sort(sortBy).skip(skip).limit(limit).lean().exec()
  return plants
}

const findPlantByPlantId = async ({ plantId }, unSelect = ['__v']) => {
  return await plant.findById(plantId).select(unGetSelectData(unSelect)).exec()
}

const addPlant = async ({ plantData, farmId }) => {
  const createdPlant = await plant.create({
    ...plantData,
    farm: new Types.ObjectId(farmId)
  })
  return createdPlant
}

const updatePlant = async ({ plantId, bodyUpdate }) => {
  return await plant.findByIdAndUpdate(plantId, bodyUpdate, { new: true }).exec()
}

const deletePlant = async (plantId) => {
  const deletedPlant = await plant.findByIdAndDelete(plantId).exec()
  return deletedPlant
}

module.exports = {
  searchPlantByUser,
  findAllPlants,
  findPlantByPlantId,
  updatePlant,
  addPlant,
  deletePlant
}
