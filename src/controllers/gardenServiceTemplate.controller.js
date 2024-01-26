'use strict'

const GardenServiceTemplateService = require('../services/gardenServiceTemplate.service')
const { SuccessResponse } = require('../core/success.response')

class GardenServiceTemplateController {
  // add GardenServiceTemplate
  addGardenServiceTemplate = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new GardenServiceTemplate success!',
      metadata: await GardenServiceTemplateService.addGardenServiceTemplate({
        gardenServiceTemplateData: req.body,
        farmId: req.user.userId
      })
    }).send(res)
  }

  // update GardenServiceTemplate
  updateGardenServiceTemplate = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update GardenServiceTemplate success!',
      metadata: await GardenServiceTemplateService.updatedGardenServiceTemplate({
        gardenServiceTemplateId: req.params.gardenServiceTemplateId,
        gardenServiceTemplateData: req.body,
        farmId: req.user.userId
      })
    }).send(res)
  }

  // delete GardenServiceTemplate
  deleteGardenServiceTemplate = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete GardenServiceTemplate success!',
      metadata: await GardenServiceTemplateService.deleteGardenServiceTemplate({
        gardenServiceTemplateId: req.params.gardenServiceTemplateId,
        farmId: req.user.userId
      })
    }).send(res)
  }

  // QUERY //

  getAllGardenServiceTemplatesByFarm = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getAllGardenServiceTemplatesByFarm success!',
      metadata: await GardenServiceTemplateService.getAllGardenServiceTemplatesByFarm({
        farmId: req.params.farmId,
        ...req.query
      })
    }).send(res)
  }

  getGardenServiceTemplateByGardenServiceTemplateId = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get GardenServiceTemplate success!',
      metadata: await GardenServiceTemplateService.getGardenServiceTemplateByGardenServiceTemplateId({
        gardenServiceTemplateId: req.params.gardenServiceTemplateId
      })
    }).send(res)
  }
}

module.exports = new GardenServiceTemplateController()
