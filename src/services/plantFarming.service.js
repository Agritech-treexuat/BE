const { Types } = require('mongoose')
const {
  addPlantFarming,
  updatePlantFarming,
  deletePlantFarming,
  getAllPlantFarmingByPlant,
  getAllPlantFarmingByFarm,
  getAllPlantFarmingBySeed,
  getPlantFarmingByPlantFarmingId,
  getPlantFarmingByPlantIdAndSeedId,
  getPlantFarmingBySeedId
} = require('../repositories/plantFarming.repo')
const { MethodFailureError, BadRequestError, NotFoundError } = require('../core/error.response')
const { getPlantByPlantId, getPlantByPlantNameAndFarmId, getAllPlantsByFarm } = require('./plant.service')
const { isValidObjectId, removeUndefinedObject, updateNestedObjectParser } = require('../utils')
const {
  getSeedDefaultFromPlantId,
  getSeedFromSeedNameAndPlantId,
  checkSeedValidFromSeedNameAndPlant,
  getSeedBySeedId
} = require('./seed.service')
class PlantFarmingService {
  static async addPlantFarming({ plantFarmingData, farmId, plantId, seedId }) {
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    if (!plantId) throw new BadRequestError('PlantId is required')
    if (!isValidObjectId(plantId)) throw new BadRequestError('PlantId is not valid')
    if (!seedId) throw new BadRequestError('SeedId is required')
    if (!isValidObjectId(seedId)) throw new BadRequestError('SeedId is not valid')
    if (plantFarmingData._id) delete plantFarmingData._id
    if (plantFarmingData.plant) delete plantFarmingData.plant
    if (plantFarmingData.seed) delete plantFarmingData.seed

    const plantItem = await getPlantByPlantId({ plantId })
    if (!plantItem) {
      throw new BadRequestError('Plant does not exist with this plant id')
    }

    if (plantItem.farm.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to create plantFarming with this plant id')
    }

    const addedPlantFarming = await addPlantFarming({ plantFarmingData, plantId, seedId })
    if (!addedPlantFarming) {
      throw new MethodFailureError('Create plant farming failed')
    }
    return addedPlantFarming
  }

  static async addPlantFarmingWithRecommendPlantIdAndSeedId({ plantFarmingData, farmId, plantId, seedId }) {
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    if (!plantId) throw new BadRequestError('PlantId is required')
    if (!isValidObjectId(plantId)) throw new BadRequestError('PlantId is not valid')
    if (!seedId) throw new BadRequestError('SeedId is required')
    if (!isValidObjectId(seedId)) throw new BadRequestError('SeedId is not valid')
    if (plantFarmingData._id) delete plantFarmingData._id
    if (plantFarmingData.plant) delete plantFarmingData.plant
    if (plantFarmingData.seed) delete plantFarmingData.seed

    const plantItem = await getPlantByPlantId({ plantId })
    if (!plantItem) {
      throw new BadRequestError('Plant does not exist with this plant id')
    }

    const seedItem = await getSeedBySeedId({ seedId })

    const plantInFarm = await getPlantByPlantNameAndFarmId({ plantName: plantItem.plant_name, farmId })
    if (!plantInFarm) {
      throw new BadRequestError('Plant does not exist in farm')
    }

    const seedInFarm = await getSeedFromSeedNameAndPlantId({
      seedName: seedItem.seed_name,
      plantId: plantInFarm._id.toString()
    })
    if (!seedInFarm) {
      throw new BadRequestError('Seed does not exist in farm')
    }

    const addedPlantFarming = await addPlantFarming({
      plantFarmingData,
      plantId: plantInFarm._id.toString(),
      seedId: seedInFarm._id.toString()
    })
    if (!addedPlantFarming) {
      throw new MethodFailureError('Create plant farming failed')
    }
    return addedPlantFarming
  }

  static async addPlantFarmingWithPlantIdAndSeedName({ plantFarmingData, farmId, plantId, seedName }) {
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    if (!plantId) throw new BadRequestError('PlantId is required')
    if (!isValidObjectId(plantId)) throw new BadRequestError('PlantId is not valid')
    if (!seedName) throw new BadRequestError('SeedName is required')
    if (plantFarmingData._id) delete plantFarmingData._id
    if (plantFarmingData.plant) delete plantFarmingData.plant
    if (plantFarmingData.seed) delete plantFarmingData.seed

    const plantInFarm = await getPlantByPlantId({ plantId })
    if (!plantInFarm) {
      throw new BadRequestError('Plant does not exist with this plant id')
    }

    const seedInFarm = await getSeedFromSeedNameAndPlantId({
      seedName: seedName,
      plantId: plantInFarm._id.toString()
    })
    if (!seedInFarm) {
      throw new BadRequestError('Seed does not exist in farm')
    }

    const addedPlantFarming = await addPlantFarming({
      plantFarmingData,
      plantId: plantInFarm._id.toString(),
      seedId: seedInFarm._id.toString()
    })
    if (!addedPlantFarming) {
      throw new MethodFailureError('Create plant farming failed')
    }
    return addedPlantFarming
  }

  static async updatePlantFarming({ plantFarmingId, updatedData, farmId }) {
    if (!plantFarmingId) throw new BadRequestError('Plant farming id is required')
    if (!isValidObjectId(plantFarmingId)) throw new BadRequestError('Plant farming id is not valid')
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    if (!updatedData) throw new BadRequestError('Updated data is required')
    const objectParams = removeUndefinedObject(updatedData)
    if (Object.keys(objectParams).length === 0) {
      throw new BadRequestError('PlantFarming data is empty')
    }
    const bodyUpdate = updateNestedObjectParser(objectParams)
    if (Object.keys(bodyUpdate).length === 0) {
      throw new BadRequestError('PlantFarming data is empty')
    }

    const plantFarmingItem = await getPlantFarmingByPlantFarmingId({ plantFarmingId })
    if (!plantFarmingItem) {
      throw new NotFoundError('Plant farming not found')
    }
    if (!plantFarmingItem.plant._id) {
      throw new NotFoundError('Founded plantFarming is not valid')
    }
    const plantItem = await getPlantByPlantId({ plantId: plantFarmingItem.plant._id.toString() })
    if (!plantItem) {
      throw new NotFoundError('Plant id of Plant farming is not valid')
    }
    if (plantItem.farm.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to create plantFarming with this plant id')
    }

    let historyPlantFarmingEdit = null
    if (!plantFarmingItem.isPlantFarmingDefault) {
      historyPlantFarmingEdit = {
        timeCultivates: plantFarmingItem.timeCultivates,
        cultivationActivities: plantFarmingItem.cultivationActivities,
        plantingActivity: plantFarmingItem.plantingActivity,
        fertilizationActivities: plantFarmingItem.fertilizationActivities,
        pestAndDiseaseControlActivities: plantFarmingItem.pestAndDiseaseControlActivities,
        bestTimeCultivate: plantFarmingItem.bestTimeCultivate,
        farmingTime: plantFarmingItem.farmingTime,
        harvestTime: plantFarmingItem.harvestTime,
        isPlantFarmingDefault: plantFarmingItem.isPlantFarmingDefault,
        modifiedAt: new Date(),
        createdAtTime: plantFarmingItem.createdAtTime || plantFarmingItem.createdAt
      }
    }

    delete bodyUpdate._id
    delete bodyUpdate.plant
    delete bodyUpdate.seed
    const updatedPlantFarming = await updatePlantFarming({
      plantFarmingId,
      updatedData: {
        ...bodyUpdate,
        createdAtTime: new Date()
      },
      historyPlantFarmingEdit: historyPlantFarmingEdit
    })
    if (!updatedPlantFarming) {
      throw new MethodFailureError('Update plant farming failed')
    }
    return updatedPlantFarming
  }

  static async deletePlantFarming({ plantFarmingId, farmId }) {
    if (!plantFarmingId) throw new BadRequestError('Plant farming id is required')
    if (!isValidObjectId(plantFarmingId)) throw new BadRequestError('Plant farming id is not valid')
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')

    const plantFarmingItem = await getPlantFarmingByPlantFarmingId({ plantFarmingId })
    if (!plantFarmingItem) {
      throw new NotFoundError('Plant farming not found')
    }

    if (plantFarmingItem.plant) {
      if (!plantFarmingItem.plant._id) {
        throw new NotFoundError('Founded plantFarming is not valid')
      }
      const plantItem = await getPlantByPlantId({ plantId: plantFarmingItem.plant._id.toString() })
      if (!plantItem) {
        throw new NotFoundError('Plant id of Plant farming is not valid')
      }
      if (plantItem.farm.toString() !== farmId) {
        throw new BadRequestError('Farm does not have permission to create plantFarming with this plant id')
      }
    }

    const deletedPlantFarming = await deletePlantFarming({ plantFarmingId })
    if (!deletedPlantFarming) {
      throw new MethodFailureError('Delete plant farming failed')
    }
    return deletedPlantFarming
  }

  static async getAllPlantFarmingByPlant({ plantId, limit, sort, page }) {
    if (!plantId) throw new BadRequestError('Plant id is required')
    if (!isValidObjectId(plantId)) throw new BadRequestError('Plant id is not valid')
    const filter = {
      plant: new Types.ObjectId(plantId),
      isPlantFarmingDefault: true,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
    }
    return getAllPlantFarmingByPlant({ limit, sort, page, filter })
  }

  static async getPlantFarmingByPlantFarmingId({ plantFarmingId }) {
    if (!plantFarmingId) throw new BadRequestError('Plant farming id is required')
    if (!isValidObjectId(plantFarmingId)) throw new BadRequestError('Plant farming id is not valid')

    const plantFarmingItem = await getPlantFarmingByPlantFarmingId({ plantFarmingId })
    if (!plantFarmingItem) {
      throw new NotFoundError('Plant farming not found')
    }
    return plantFarmingItem
  }

  static async checkPlantFarmingExist({ plantFarmingId }) {
    if (!plantFarmingId) throw new BadRequestError('Plant farming id is required')
    if (!isValidObjectId(plantFarmingId)) throw new BadRequestError('Plant farming id is not valid')
    const plantFarmingItem = await getPlantFarmingByPlantFarmingId({ plantFarmingId })
    if (!plantFarmingItem) {
      return false
    }
    return true
  }

  static async getPlantFarmingRecommend({ plantName, seedName, farmId }) {
    if (!plantName) throw new BadRequestError('Plant name is required')
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')

    const plantItem = await getPlantByPlantNameAndFarmId({ plantName, farmId })
    if (!plantItem) {
      throw new NotFoundError('Plant not found')
    }
    let seedItem = null
    if (!seedName) {
      seedItem = await getSeedDefaultFromPlantId({ plantId: plantItem._id.toString() })
    } else {
      seedItem = await getSeedFromSeedNameAndPlantId({ seedName, plantId: plantItem._id.toString() })
    }
    if (!seedItem) {
      throw new NotFoundError('Seed not found')
    }
    const plantFarmingItem = await getPlantFarmingByPlantIdAndSeedId({
      plantId: plantItem._id.toString(),
      seedId: seedItem._id.toString()
    })
    if (!plantFarmingItem) {
      throw new NotFoundError('Plant farming not found')
    }
    return plantFarmingItem
  }

  static async getPlantFarmingBySeedId({ seedId }) {
    if (!seedId) throw new BadRequestError('Seed id is required')
    if (!isValidObjectId(seedId)) throw new BadRequestError('Seed id is not valid')
    return getPlantFarmingBySeedId({ seedId })
  }

  static async getPlantFarmingBySeedNameAndFarmId({ seedName, farmId }) {
    if (!seedName) throw new BadRequestError('Seed name is required')
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    const plantList = await getAllPlantsByFarm({ farmId })

    const plantBoolean = await Promise.all(
      plantList.map(async (plant) => {
        const seedItem = await checkSeedValidFromSeedNameAndPlant({ seedName, plantId: plant._id.toString() })
        return seedItem === true
      })
    )

    const plant = plantList.find((item, index) => plantBoolean[index] === true)

    if (!plant) {
      throw new NotFoundError("Seed doesn't exist in farm")
    }

    if (!plant.plant_name) {
      throw new NotFoundError("Plant doesn't valid in farm")
    }
    const plantName = plant.plant_name

    const plantFarmingItem = await this.getPlantFarmingRecommend({ plantName, seedName, farmId })
    if (!plantFarmingItem) {
      throw new NotFoundError('Plant farming not found')
    }
    return plantFarmingItem
  }
}

module.exports = PlantFarmingService
