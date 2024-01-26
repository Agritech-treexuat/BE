const { Types } = require('mongoose')
const {
  getAllGardenServiceTemplatesByFarm,
  getGardenServiceTemplateByGardenServiceTemplateId,
  addGardenServiceTemplate,
  updateGardenServiceTemplate,
  deleteGardenServiceTemplate
} = require('../models/repositories/gardenServiceTemplate.repo')
const { MethodFailureError, BadRequestError, NotFoundError } = require('../core/error.response')
const { isValidObjectId } = require('../utils')

class GardenServiceTemplateService {
  static async getAllGardenServiceTemplatesByFarm({ farmId, limit, sort, page }) {
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    const filter = { farm: new Types.ObjectId(farmId) }
    const gardenServiceTemplates = await getAllGardenServiceTemplatesByFarm({ limit, sort, page, filter })

    return gardenServiceTemplates
  }

  static async getGardenServiceTemplateByGardenServiceTemplateId({ gardenServiceTemplateId }) {
    if (!gardenServiceTemplateId) throw new BadRequestError('GardenServiceTemplateId is required')
    if (!isValidObjectId(gardenServiceTemplateId)) throw new BadRequestError('GardenServiceTemplateId is not valid')
    const gardenServiceTemplateItem = await getGardenServiceTemplateByGardenServiceTemplateId({
      gardenServiceTemplateId
    })
    if (!gardenServiceTemplateItem) {
      throw new NotFoundError('GardenServiceTemplate not found')
    }
    return gardenServiceTemplateItem
  }

  static async addGardenServiceTemplate({ gardenServiceTemplateData, farmId }) {
    if (!farmId) throw new BadRequestError('FarmId is required')
    if (!isValidObjectId(farmId)) throw new BadRequestError('FarmId is not valid')
    if (!gardenServiceTemplateData) throw new BadRequestError('GardenServiceTemplate data is required')
    const createdGardenServiceTemplate = await addGardenServiceTemplate({ gardenServiceTemplateData, farmId })
    if (!createdGardenServiceTemplate) {
      throw new MethodFailureError('Create gardenServiceTemplate failed')
    }
    return createdGardenServiceTemplate
  }

  static async updatedGardenServiceTemplate({ gardenServiceTemplateId, gardenServiceTemplateData, farmId }) {
    if (!gardenServiceTemplateId) throw new BadRequestError('GardenServiceTemplateId is required')
    if (!isValidObjectId(gardenServiceTemplateId)) throw new BadRequestError('GardenServiceTemplateId is not valid')
    if (!gardenServiceTemplateData) throw new BadRequestError('GardenServiceTemplate data is required')

    const gardenServiceTemplateItem = await getGardenServiceTemplateByGardenServiceTemplateId({
      gardenServiceTemplateId
    })
    if (!gardenServiceTemplateItem) {
      throw new NotFoundError('GardenServiceTemplate not found')
    }

    if (gardenServiceTemplateItem.farm.toString() !== farmId) {
      throw new MethodFailureError('Not authorized to update this GardenServiceTemplate')
    }

    const updatedGardenServiceTemplate = await updateGardenServiceTemplate({
      gardenServiceTemplateId,
      bodyUpdate: gardenServiceTemplateData
    })
    if (!updatedGardenServiceTemplate) {
      throw new MethodFailureError('Update gardenServiceTemplate failed')
    }
    return updatedGardenServiceTemplate
  }

  static async deleteGardenServiceTemplate({ gardenServiceTemplateId, farmId }) {
    if (!gardenServiceTemplateId) throw new BadRequestError('GardenServiceTemplateId is required')
    if (!isValidObjectId(gardenServiceTemplateId)) throw new BadRequestError('GardenServiceTemplateId is not valid')

    const gardenServiceTemplateItem = await getGardenServiceTemplateByGardenServiceTemplateId({
      gardenServiceTemplateId
    })
    if (!gardenServiceTemplateItem) {
      throw new NotFoundError('GardenServiceTemplate not found')
    }

    if (gardenServiceTemplateItem.farm.toString() !== farmId) {
      throw new MethodFailureError('Not authorized to delete this GardenServiceTemplate')
    }

    const deletedGardenServiceTemplate = await deleteGardenServiceTemplate({ gardenServiceTemplateId })
    if (!deletedGardenServiceTemplate) {
      throw new MethodFailureError('Delete gardenServiceTemplate failed')
    }
    return deletedGardenServiceTemplate
  }
}

module.exports = GardenServiceTemplateService
