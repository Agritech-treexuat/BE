const { Types } = require('mongoose')
const {
  searchSeedByUser,
  getAllSeedsByFarm,
  getSeedBySeedId,
  addSeed,
  updateSeed,
  deleteSeed,
  getSeedByPlantInFarm,
  getSeedDefaultFromPlantId,
  getSeedFromSeedNameAndPlantId
} = require('../repositories/seed.repo')
const { BadRequestError, NotFoundError, MethodFailureError } = require('../core/error.response')
const { updateNestedObjectParser, removeUndefinedObject, isValidObjectId } = require('../utils')
const { default: slugify } = require('slugify')
const { getAllPlantsByFarm, getPlantByPlantNameAndFarmId, getPlantByPlantId } = require('../services/plant.service')

class SeedService {
  static async searchSeedByUser({ keySearch }) {
    return await searchSeedByUser({ keySearch })
  }

  static async getAllSeedsByFarm({ farmId, limit, sort, page }) {
    if (!farmId) {
      throw new BadRequestError('Farm id is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm id')
    }
    const plantItem = await getAllPlantsByFarm({ farm: new Types.ObjectId(farmId) })
    const plantIds = plantItem.map((item) => item._id)

    const filter = { plant: { $in: plantIds } }
    const seeds = await getAllSeedsByFarm({ limit, sort, page, filter })

    return seeds
  }

  static async getSeedBySeedId({ seedId }) {
    if (!seedId) {
      throw new BadRequestError('Seed id is required')
    }
    if (!isValidObjectId(seedId)) {
      throw new BadRequestError('Invalid seed id')
    }

    const seedItem = await getSeedBySeedId({ seedId })
    if (!seedItem) {
      throw new NotFoundError('Seed not found')
    }
    return seedItem
  }

  static async getSeedByPlantInFarm({ plantName, plantId, farmId }) {
    if (plantName && farmId) {
      if (!isValidObjectId(farmId)) {
        throw new BadRequestError('Invalid farm id')
      }
      const plantItem = await getPlantByPlantNameAndFarmId({ plantName, farmId })
      if (!plantItem) {
        throw new BadRequestError('Plant not found')
      }
      return await getSeedByPlantInFarm({ plantId: plantItem._id.toString() })
    }
    if (!plantId) {
      throw new BadRequestError('Plant id is required')
    }
    if (!isValidObjectId(plantId)) {
      throw new BadRequestError('Invalid plant id')
    }
    return await getSeedByPlantInFarm({ plantId })
  }

  static async getSeedDefaultFromPlantId({ plantId }) {
    if (!plantId) {
      throw new BadRequestError('Plant id is required')
    }
    if (!isValidObjectId(plantId)) {
      throw new BadRequestError('Invalid plant id')
    }
    const seedDefault = await getSeedDefaultFromPlantId({ plantId })
    if (!seedDefault) {
      throw new NotFoundError('Recommend not worked with this plant, cause Seed default not found')
    }
    return seedDefault
  }

  static async getSeedFromSeedNameAndPlantId({ seedName, plantId }) {
    if (!seedName) {
      throw new BadRequestError('Seed name is required')
    }
    if (!plantId) {
      throw new BadRequestError('Plant id is required')
    }
    if (!isValidObjectId(plantId)) {
      throw new BadRequestError('Invalid plant id')
    }

    const seedItem = await getSeedFromSeedNameAndPlantId({ seedName, plantId })
    if (!seedItem) {
      throw new NotFoundError('Seed not found')
    }
    return seedItem
  }

  static async checkSeedValidFromSeedNameAndPlant({ seedName, plantId }) {
    if (!seedName) {
      throw new BadRequestError('Seed name is required')
    }
    if (!plantId) {
      throw new BadRequestError('Plant id is required')
    }
    if (!isValidObjectId(plantId)) {
      throw new BadRequestError('Invalid plant id')
    }

    const seedItem = await getSeedFromSeedNameAndPlantId({ seedName, plantId })
    if (seedItem) {
      return true
    }
    return false
  }

  static async addSeed({ seedData, farmId, plantId }) {
    if (!seedData) {
      throw new BadRequestError('Seed data is required')
    }

    if (!plantId) {
      throw new BadRequestError('Plant id is required')
    }

    if (!isValidObjectId(plantId)) {
      throw new BadRequestError('Invalid plant id')
    }

    if (!farmId) {
      throw new BadRequestError('Farm id is required')
    }

    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm id')
    }

    const plantItem = await getPlantByPlantId({ plantId })
    if (plantItem.farm._id.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to create seeds with this plant')
    }

    delete seedData.plant
    delete seedData._id

    const seeds = await getSeedByPlantInFarm({ plantId })
    if (!seeds || seeds.length === 0) {
      seedData.isSeedDefault = true
    } else {
      seedData.isSeedDefault = false
    }

    const createdSeed = addSeed({ seedData, farmId, plantId })
    if (!createdSeed) {
      throw new MethodFailureError('Create seed failed')
    }
    return createdSeed
  }

  static async addSeedByRecommentSeedId({ recommentSeedId, farmId }) {
    if (!recommentSeedId) {
      throw new BadRequestError('Recomment seed id is required')
    }
    if (!isValidObjectId(recommentSeedId)) {
      throw new BadRequestError('Invalid recomment seed id')
    }
    if (!farmId) {
      throw new BadRequestError('Farm id is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm id')
    }
    const recommentSeed = await getSeedBySeedId({ seedId: recommentSeedId })
    if (!recommentSeed) {
      throw new NotFoundError('Recomment seed not found')
    }

    const { _id, farm, plant, ...seedData } = recommentSeed
    const plantInFarm = await getPlantByPlantNameAndFarmId({ plantName: plant.plant_name, farmId })
    if (!plantInFarm) {
      throw new NotFoundError('Plant of this seed not found in farm')
    }
    const existingSeed = await getSeedFromSeedNameAndPlantId({
      seedName: seedData.seed_name,
      plantId: plantInFarm._id.toString()
    })

    console.log('existingSeed', existingSeed)

    if (existingSeed) {
      throw new MethodFailureError('Seed already exists')
    }

    const seeds = await getSeedByPlantInFarm({ plantId: plantInFarm._id.toString() })
    let isSeedDefault = false
    if (!seeds || seeds.length === 0) {
      isSeedDefault = true
    }

    const createdSeed = addSeed({ seedData: { ...seedData, isSeedDefault }, plantId: plantInFarm._id.toString() })
    if (!createdSeed) {
      throw new MethodFailureError('Create seed failed')
    }
    return createdSeed
  }

  static async updateSeed({ seedId, seedData, farmId }) {
    if (!seedData) {
      throw new BadRequestError('Seed data is required')
    }
    if (!seedId) {
      throw new BadRequestError('Seed id is required')
    }

    if (!isValidObjectId(seedId)) {
      throw new BadRequestError('Invalid seed id')
    }

    if (!farmId) {
      throw new BadRequestError('Farm id is required')
    }

    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm id')
    }
    const seedItem = await getSeedBySeedId({ seedId })
    if (!seedItem) {
      throw new BadRequestError('Seed not found')
    }

    if (!seedItem.plant || !seedItem.plant.farm) {
      throw new BadRequestError('Seed does not in farm')
    }
    if (seedItem.plant.farm.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to update seeds')
    }

    const objectParams = removeUndefinedObject(seedData)
    if (Object.keys(objectParams).length === 0) {
      throw new BadRequestError('Seed data is empty')
    }
    const bodyUpdate = updateNestedObjectParser(objectParams)
    if (Object.keys(bodyUpdate).length === 0) {
      throw new BadRequestError('Seed data is empty')
    }
    delete bodyUpdate._id
    delete bodyUpdate.plant

    if (bodyUpdate.seed_name) {
      bodyUpdate.seed_slug = slugify(bodyUpdate.seed_name)
    }

    const updateSeedItem = await updateSeed({ seedId, bodyUpdate })
    if (!updateSeedItem) {
      throw new MethodFailureError('Update seed failed')
    }
    return updateSeedItem
  }

  static async updateSeedDefault({ seedId, farmId }) {
    if (!seedId) {
      throw new BadRequestError('Seed id is required')
    }
    if (!isValidObjectId(seedId)) {
      throw new BadRequestError('Invalid seed id')
    }
    if (!farmId) {
      throw new BadRequestError('Farm id is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm id')
    }
    const seed = await getSeedBySeedId({ seedId })
    if (!seed) {
      throw new BadRequestError('Seed not found')
    }
    if (seed.plant.farm.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to update seeds')
    }

    const seeds = await getSeedByPlantInFarm({ plantId: seed.plant._id.toString() })
    if (!seeds || seeds.length === 0) {
      throw new MethodFailureError('Seed not found')
    }

    for (const seedItem of seeds) {
      if (seedItem._id.toString() === seedId) {
        continue
      }
      const updateSeedItem = await updateSeed({ seedId: seedItem._id, bodyUpdate: { isSeedDefault: false } })
      if (!updateSeedItem) {
        throw new MethodFailureError('Update seed default failed')
      }
    }
    const updateDefaultSeedItem = await updateSeed({ seedId, bodyUpdate: { isSeedDefault: true } })
    if (!updateDefaultSeedItem) {
      throw new MethodFailureError('Update seed default failed')
    }
    return updateDefaultSeedItem
  }

  static async deleteSeed({ seedId, farmId }) {
    if (!seedId) {
      throw new BadRequestError('Seed id is required')
    }
    if (!isValidObjectId(seedId)) {
      throw new BadRequestError('Invalid seed id')
    }
    if (!farmId) {
      throw new BadRequestError('Farm id is required')
    }
    if (!isValidObjectId(farmId)) {
      throw new BadRequestError('Invalid farm id')
    }
    const seed = await getSeedBySeedId({ seedId })
    if (!seed) {
      throw new BadRequestError('Seed not found')
    }
    if (seed.plant.farm.toString() !== farmId) {
      throw new BadRequestError('Farm does not have permission to update seeds')
    }

    const deletedSeed = await deleteSeed(seedId)
    if (!deletedSeed) {
      throw new MethodFailureError('Delete seed failed')
    }
    return deletedSeed
  }
}

module.exports = SeedService
