'use strict'
const ProjectService = require('../services/project.service')
const { SuccessResponse } = require('../core/success.response')
const { restart } = require('nodemon')
const { admin_id } = require('../constant')
class ProjectController {
  // init Project
  initProject = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Project success!',
      metadata: await ProjectService.initProject({ project: req.body, farmId: req.user.userId })
    }).send(res)
  }

  // update Project
  updateProjectInfo = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Project success!',
      metadata: await ProjectService.updateProjectInfo({
        projectId: req.params.projectId,
        updatedFields: req.body
      })
    }).send(res)
  }

  // delete Project
  deleteProject = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete Project success!',
      metadata: await ProjectService.deleteProject({
        projectId: req.params.projectId
      })
    }).send(res)
  }

  // add PlantFarming
  addPlantFarmingToProject = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add PlantFarming success!',
      metadata: await ProjectService.addPlantFarmingToProject({
        projectId: req.params.projectId,
        plantFarming: req.body,
        farmId: req.user.userId
      })
    }).send(res)
  }

  // add Process
  addProcess = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add Process success!',
      metadata: await ProjectService.addProcess({
        projectId: req.params.projectId,
        process: req.body
      })
    }).send(res)
  }

  // update Process
  updateProcess = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Process success!',
      metadata: await ProjectService.updateProcess({
        projectId: req.params.projectId,
        processId: req.params.processId,
        process: req.body
      })
    }).send(res)
  }

  // delete Process
  deleteProcess = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete Process success!',
      metadata: await ProjectService.deleteProcess({
        projectId: req.params.projectId,
        processId: req.params.processId
      })
    }).send(res)
  }

  // add Expect
  addExpect = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add Expect success!',
      metadata: await ProjectService.addExpect({
        projectId: req.params.projectId,
        expect: req.body
      })
    }).send(res)
  }

  // update Expect
  updateExpect = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Expect success!',
      metadata: await ProjectService.updateExpect({
        projectId: req.params.projectId,
        expectId: req.params.expectId,
        expect: req.body
      })
    }).send(res)
  }

  // delete Expect
  deleteExpect = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete Expect success!',
      metadata: await ProjectService.deleteExpect({
        projectId: req.params.projectId,
        expectId: req.params.expectId
      })
    }).send(res)
  }

  // add Output
  addOutput = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add Output success!',
      metadata: await ProjectService.addOutput({
        projectId: req.params.projectId,
        output: req.body
      })
    }).send(res)
  }

  // update Output
  updateOutput = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Output success!',
      metadata: await ProjectService.updateOutput({
        projectId: req.params.projectId,
        outputId: req.params.outputId,
        output: req.body
      })
    }).send(res)
  }

  // delete Output
  deleteOutput = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete Output success!',
      metadata: await ProjectService.deleteOutput({
        projectId: req.params.projectId,
        outputId: req.params.outputId
      })
    }).send(res)
  }
  // QUERY //
  getAllProjectsByFarm = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getAllProjectsByFarm success!',
      metadata: await ProjectService.getAllProjectsByFarm({ farmId: req.params.farmId, ...req.query })
    }).send(res)
  }

  getProjectInfo = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get project success!',
      metadata: await ProjectService.getProjectInfo({ projectId: req.params.projectId })
    }).send(res)
  }

  getAllProcess = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getAllProcess success!',
      metadata: await ProjectService.getAllProcess({ projectId: req.params.projectId })
    }).send(res)
  }

  getExpect = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getExpect success!',
      metadata: await ProjectService.getExpect({ projectId: req.params.projectId })
    }).send(res)
  }

  getOutput = async (req, res, next) => {
    return new SuccessResponse({
      message: 'Get list getOutput success!',
      metadata: await ProjectService.getOutput({ projectId: req.params.projectId })
    }).send(res)
  }
  // END QUERY //
}

module.exports = new ProjectController()
