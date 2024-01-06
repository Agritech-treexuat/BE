'use strict'
const PlantService = require('../services/plant.service')
const { SuccessResponse } = require('../core/success.response')
const { restart } = require('nodemon')
class PlantController {
  // add Plant
  addPlant = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Plant success!',
      metadata: await PlantService.addPlant({ plantData: req.body, farmId: req.user.userId })
    }).send(res)
  }

  // update Plant
  updatePlant = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Plant success!',
      metadata: await PlantService.updatePlant({
        plantId: req.params.plantId,
        plantData: req.body,
        farmId: req.user.userId
      })
    }).send(res)
  }

  // delete Plant
  deletePlant = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete Plant success!',
      metadata: await PlantService.deletePlant({ plantId: req.params.plantId, farmId: req.user.userId })
    }).send(res)
  }

  // QUERY //

  searchPlantByUser = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getListSearchPlant success!',
      metadata: await PlantService.searchPlantByUser(req.params)
    }).send(res)
  }

  findAllPlants = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list findAllPlants success!',
      metadata: await PlantService.findAllPlants({ farmId: req.params.farmId, ...req.query })
    }).send(res)
  }

  findPlantByPlantId = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get plant success!',
      metadata: await PlantService.findPlantByPlantId({ plantId: req.params.plantId })
    }).send(res)
  }
  // END QUERY //
}

module.exports = new PlantController()
