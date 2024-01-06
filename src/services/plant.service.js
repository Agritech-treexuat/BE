const { Types } = require('mongoose')
const {
  searchPlantByUser,
  findAllPlants,
  findPlantByPlantId,
  addPlant,
  updatePlant,
  deletePlant
} = require('../models/repositories/plant.repo')
const { updateNestedObjectParser, removeUndefinedObject } = require('../utils')

class PlantService {
  static async searchPlantByUser({ keySearch }) {
    return await searchPlantByUser({ keySearch })
  }

  static async findAllPlants({ farmId, limit, sort, page }) {
    const filter = { farm: new Types.ObjectId(farmId) }
    const plants = await findAllPlants({ limit, sort, page, filter })

    return plants
  }

  static async findPlantByPlantId({ plantId }) {
    return findPlantByPlantId({ plantId })
  }

  static async addPlant({ plantData, farmId }) {
    return addPlant({ plantData, farmId })
  }

  static async updatePlant({ plantId, plantData, farmId }) {
    const plant = await findPlantByPlantId(plantId)
    if (plant.farm.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to update plants')
    }

    const objectParams = removeUndefinedObject(plantData)
    return updatePlant({ plantId, bodyUpdate: updateNestedObjectParser(objectParams) })
  }

  static async deletePlant({ plantId, farmId }) {
    const plant = await findPlantByPlantId(plantId)
    if (plant.farm.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to update plants')
    }

    return deletePlant(plantId)
  }
}

module.exports = PlantService
