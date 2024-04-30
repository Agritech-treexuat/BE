const { Types } = require('mongoose')
const {
  searchPlantByUser,
  getAllPlantsByFarm,
  getPlantByPlantId,
  addPlant,
  getPlantByPlantNameAndFarmId,
  updatePlant,
  deletePlant
} = require('../repositories/plant.repo')
const { updateNestedObjectParser, removeUndefinedObject, isValidObjectId } = require('../utils')
const { BadRequestError, MethodFailureError, NotFoundError } = require('../core/error.response')

class PlantService {
  static async searchPlantByUser({ keySearch }) {
    return await searchPlantByUser({ keySearch })
  }

  static async getAllPlantsByFarm({ farmId, limit, sort, page }) {
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    const filter = { farm: new Types.ObjectId(farmId), $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] }
    const plants = await getAllPlantsByFarm({ limit, sort, page, filter })

    return plants
  }

  static async getPlantByPlantId({ plantId }) {
    if (!plantId) throw new BadRequestError('PlantId is required')
    if (!isValidObjectId(plantId)) throw new BadRequestError('PlantId is not valid')
    const plantItem = await getPlantByPlantId({ plantId })
    if (!plantItem) {
      throw new NotFoundError('Plant not found')
    }
    return plantItem
  }

  static async checkPlantExist({ plantId }) {
    if (!plantId) throw new BadRequestError('PlantId is required')
    if (!isValidObjectId(plantId)) throw new BadRequestError('PlantId is not valid')
    const plantItem = await getPlantByPlantId({ plantId })
    if (!plantItem) {
      return false
    }
    return true
  }

  static async getPlantByPlantNameAndFarmId({ plantName, farmId }) {
    if (!plantName) throw new BadRequestError('PlantName is required')
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    const plantItem = await getPlantByPlantNameAndFarmId({ plantName, farmId })
    if (!plantItem) {
      throw new NotFoundError('Plant not found')
    }
    return plantItem
  }

  static async getDefaultPlantByPlantId({ plantId, farmId }) {
    if (!plantId) throw new BadRequestError('PlantId is required')
    if (!isValidObjectId(plantId)) throw new BadRequestError('PlantId is not valid')
    const plantItem = await getPlantByPlantId({ plantId })
    if (!plantItem) {
      throw new NotFoundError('Plant not found')
    }
    const plantDefaultItem = await getPlantByPlantNameAndFarmId({ plantName: plantItem.plant_name, farmId })
    if (!plantDefaultItem) {
      throw new NotFoundError('Default Plant not found')
    }

    return plantDefaultItem
  }
  static async addPlant({ plantData, farmId }) {
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    if (!plantData) throw new BadRequestError('Plant data is required')

    const existingPlant = await getPlantByPlantNameAndFarmId({ plantName: plantData.plant_name, farmId })
    if (existingPlant && !existingPlant.isDeleted) {
      throw new MethodFailureError('Plant already exists')
    }

    if (existingPlant && existingPlant.isDeleted) {
      const bodyUpdate = {
        isDeleted: false,
        deletedAt: null
      }
      const updatePlantItem = await updatePlant({ plantId: existingPlant._id, bodyUpdate })
      if (!updatePlantItem) {
        throw new MethodFailureError('Update plant failed')
      }
      return updatePlantItem
    }

    const createdPlant = await addPlant({
      plantData: {
        ...plantData,
        isActive: false
      },
      farmId
    })
    if (!createdPlant) {
      throw new MethodFailureError('Create plant failed')
    }
    return createdPlant
  }

  static async addPlantByRecommentPlantId({ recommentPlantId, farmId }) {
    if (!recommentPlantId) throw new BadRequestError('RecommentPlantId is required')
    if (!isValidObjectId(recommentPlantId)) throw new BadRequestError('RecommentPlantId is not valid')
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    const recommentPlant = await getPlantByPlantId({ plantId: recommentPlantId })
    if (!recommentPlant) {
      throw new NotFoundError('Recomment plant not found')
    }

    const { _id, farm, ...plantData } = recommentPlant

    const existingPlant = await getPlantByPlantNameAndFarmId({ plantName: plantData.plant_name, farmId })
    if (existingPlant && !existingPlant.isDeleted) {
      throw new MethodFailureError('Plant already exists')
    }

    if (existingPlant && existingPlant.isDeleted) {
      const bodyUpdate = {
        isDeleted: false,
        deletedAt: null
      }
      const updatePlantItem = await updatePlant({ plantId: existingPlant._id, bodyUpdate })
      if (!updatePlantItem) {
        throw new MethodFailureError('Update plant failed')
      }
      return updatePlantItem
    }

    const createdPlant = await addPlant({
      plantData: {
        ...plantData,
        isActive: true
      },
      farmId
    })
    if (!createdPlant) {
      throw new MethodFailureError('Create plant failed')
    }
    return createdPlant
  }

  static async updatePlant({ plantId, plantData, farmId }) {
    if (!plantId) throw new BadRequestError('PlantId is required')
    if (!isValidObjectId(plantId)) throw new BadRequestError('PlantId is not valid')
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    if (!plantData) throw new BadRequestError('Plant data is required')
    const plant = await getPlantByPlantId({ plantId })
    if (!plant) {
      throw new NotFoundError('Plant not found')
    }
    if (!plant.farm) {
      throw new BadRequestError('Plant does not has farm')
    }
    if (plant.farm.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to update plants')
    }

    const objectParams = removeUndefinedObject(plantData)
    if (Object.keys(objectParams).length === 0) {
      throw new BadRequestError('Plant data is empty')
    }
    const bodyUpdate = updateNestedObjectParser(objectParams)
    if (Object.keys(bodyUpdate).length === 0) {
      throw new BadRequestError('Plant data is empty')
    }

    delete bodyUpdate._id
    delete bodyUpdate.farm
    const updatePlantItem = await updatePlant({ plantId, bodyUpdate })
    if (!updatePlantItem) {
      throw new MethodFailureError('Update plant failed')
    }

    return updatePlantItem
  }

  static async deletePlant({ plantId, farmId }) {
    if (!plantId) throw new BadRequestError('PlantId is required')
    if (!isValidObjectId(plantId)) throw new BadRequestError('PlantId is not valid')
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    const plant = await getPlantByPlantId({ plantId })
    if (!plant) {
      throw new NotFoundError('Plant not found')
    }
    if (!plant.farm) {
      throw new BadRequestError('Plant does not has farm')
    }
    if (plant.farm.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to update plants')
    }

    const deletedPlant = await deletePlant(plantId)
    if (!deletedPlant) {
      throw new MethodFailureError('Delete plant failed')
    }
    return deletedPlant
  }
}

module.exports = PlantService
