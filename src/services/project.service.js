const { Types } = require('mongoose')
const {
  getAllProjectsByFarm,
  initProject,
  getProjectInfo,
  updateProjectInfo,
  deleteProject,
  addPlantFarmingToProject,
  getAllProcess,
  addProcess,
  updateProcess,
  deleteProcess,
  getExpect,
  addExpect,
  updateExpect,
  deleteExpect,
  getOutput,
  getAllProjectOutputByFarmId,
  addOutput,
  updateOutput,
  deleteOutput,
  getPlantFarmingId,
  updateCertificateImages,
  getCertificateImages,
  updateCameraToProject,
  getProjectByProjectIndex,
  getDeletedProcess,
  getDeletedExpect,
  getDeletedOutput
} = require('../repositories/project.repo')
const {
  addPlantFarming,
  getPlantFarmingByPlantFarmingId,
  deletePlantFarming,
  checkPlantFarmingExist
} = require('../services/plantFarming.service')
const { updateNestedObjectParser, removeUndefinedObject, isValidObjectId } = require('../utils')
const { BadRequestError, MethodFailureError, NotFoundError } = require('../core/error.response')
const { getObjectDetectionByCameraIdAndTime } = require('./objectDetection.service')
const { getConnectionLossByCameraIdAndTime } = require('./connectionLoss.service')
const { getImageByCameraIdAndTime } = require('./image.service')
const { getWeatherDataByTimeRange } = require('./weather.service')
const { isNull } = require('lodash')

class ProjectService {
  static async getAllProjectsByFarm({ farmId, limit, sort, page }) {
    if (!farmId) throw new BadRequestError('Missing farm id')
    if (!isValidObjectId(farmId)) throw new BadRequestError('Invalid farm id')
    const filter = { farm: new Types.ObjectId(farmId) }
    const projects = await getAllProjectsByFarm({ limit, sort, page, filter })
    return projects
  }

  static async initProject({ farmId, project, status, startDate }) {
    if (!farmId) throw new BadRequestError('Missing farm id')
    if (!isValidObjectId(farmId)) throw new BadRequestError('Invalid farm id')
    if (!project) throw new BadRequestError('Missing project')

    const { plant, seed, farm, ...newProject } = project
    const { plantId, seedId } = newProject
    if (!plantId) throw new BadRequestError('Missing plant id')
    if (!seedId) throw new BadRequestError('Missing seed id')

    const updatedProject = await initProject({
      farmId,
      plantId,
      seedId,
      projectData: {
        ...newProject,
        createdAtTime: new Date(),
        startDate
      },
      status
    })
    if (!updatedProject) throw new MethodFailureError('Cannot init project')
    return updatedProject
  }

  static async getProjectInfo({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    const project = await getProjectInfo({
      projectId,
      select: [
        'plant',
        'seed',
        'farm',
        'startDate',
        'endDate',
        'square',
        'expectedEndDate',
        'expectedOutput',
        'status',
        'description',
        'projectIndex',
        'txHash',
        'createdAtTime',
        'plantFarming',
        'cameraId',
        'historyInfo',
        'isInfoEdited',
        'createdAt',
        'updatedAt',
        'video_urls'
      ]
    })
    if (!project) throw new NotFoundError('Project not found')
    return project
  }

  static async updateProjectInfo({ projectId, updatedFields }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!updatedFields) throw new BadRequestError('Missing updated fields')

    const { seed, startDate, square, status, description, txHash, expectedOutput, expectedEndDate } = updatedFields
    if (seed && !isValidObjectId(seed)) throw new BadRequestError('Invalid seed id')
    let endDate = null
    if(status === 'cancel' || status === 'finished') {
      endDate = new Date()
    }
    const projectUpdate = removeUndefinedObject({
      seed,
      startDate,
      endDate,
      square,
      status,
      description,
      createdAtTime: new Date(),
      txHash,
      expectedOutput,
      expectedEndDate
    })
    const projectInfo = await getProjectInfo({ projectId })
    const historyInfoItem = {
      txHash: projectInfo.txHash,
      createdAtTime: projectInfo.createdAtTime ? projectInfo.createdAtTime : projectInfo.createdAt,
      seed: projectInfo.seed,
      startDate: projectInfo.startDate,
      endDate: projectInfo.endDate,
      description: projectInfo.description,
      modifiedAt: new Date(),
      square: projectInfo.square,
      expectedEndDate: projectInfo.expectedEndDate,
      expectedOutput: projectInfo.expectedOutput
    }
    const updatedProject = await updateProjectInfo({
      projectId,
      projectData: projectUpdate,
      historyInfoItem: historyInfoItem
    })
    if (!updatedProject) throw new MethodFailureError('Cannot update project')
    return updatedProject
  }

  static async deleteProject({ projectId, farmId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    // find farm of project and check if it is the same farm
    const projectInfo = await getProjectInfo({ projectId })
    if (!projectInfo)
      return {
        message: 'Project not found'
      }
    if (projectInfo.farm._id.toString() !== farmId)
      throw new BadRequestError('Do not have permission to delete this project')
    const plantFarmingId = await getPlantFarmingId({ projectId })
    const isPlantFarmingExist = await checkPlantFarmingExist({ plantFarmingId })

    if (plantFarmingId && isPlantFarmingExist) {
      const deletedPlantFarming = await deletePlantFarming({ plantFarmingId, farmId })
      if (!deletedPlantFarming) throw new MethodFailureError('Cannot delete plant farming of this project')
    }
    const updatedProject = await deleteProject({ projectId })
    if (!updatedProject) throw new MethodFailureError('Cannot delete project')
    return updatedProject
  }

  static async addPlantFarmingToProject({ projectId, plantFarming, farmId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!plantFarming) throw new BadRequestError('Missing plant farming')

    const projectInfo = await getProjectInfo({ projectId })

    const plantId = projectInfo.plant._id.toString()
    const seedId = projectInfo.seed._id.toString()
    const addedPlantFarming = await addPlantFarming({
      plantFarmingData: {
        ...plantFarming,
        isPlantFarmingDefault: false
      },
      farmId: farmId,
      plantId,
      seedId
    })
    if (!addedPlantFarming) throw new MethodFailureError('Cannot add plant farming')
    const updatedProject = await addPlantFarmingToProject({
      projectId,
      plantFarmingId: addedPlantFarming._id.toString()
    })
    if (!updatedProject) throw new MethodFailureError('Cannot add plant farming')
    return updatedProject
  }

  static async getAllProcess({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    const processes = await getAllProcess({ projectId })
    return processes
  }

  static async addProcess({ projectId, process }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!process) throw new BadRequestError('Missing process')

    const { tx, time, type, ...activity } = process

    if (!tx || !time || !type) throw new BadRequestError('Missing required fields')

    let activityField
    switch (type) {
      case 'cultivation':
        activityField = 'cultivationActivity'
        break
      case 'planting':
        activityField = 'plantingActivity'
        break
      case 'fertilize':
        activityField = 'fertilizationActivity'
        break
      case 'pesticide':
        activityField = 'pestAndDiseaseControlActivity'
        break
      case 'other':
        activityField = 'other'
        break
      default:
        throw new BadRequestError('Invalid process type')
    }

    if (!activity[activityField]) throw new BadRequestError(`Missing ${activityField} field for process type ${type}`)

    const updatedProject = await addProcess({
      projectId,
      process: { tx, time, type, [activityField]: activity[activityField], createdAtTime: new Date() }
    })
    if (!updatedProject) throw new MethodFailureError('Cannot add process')
    return updatedProject
  }

  static async updateProcess({ projectId, processId, process }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!processId) throw new BadRequestError('Missing process id')
    if (!isValidObjectId(processId)) throw new BadRequestError('Invalid process id')
    if (!process) throw new BadRequestError('Missing process')

    const { isEdited, historyProcess, ...updatedProcess } = process
    const updatedProject = await updateProcess({
      projectId,
      processId,
      newProcessData: removeUndefinedObject({
        ...updatedProcess,
        createdAtTime: new Date()
      })
    })
    if (!updatedProject) throw new MethodFailureError('Cannot update process')
    return updatedProject
  }

  static async deleteProcess({ projectId, processId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!processId) throw new BadRequestError('Missing process id')
    if (!isValidObjectId(processId)) throw new BadRequestError('Invalid process id')

    const updatedProject = await deleteProcess({ projectId, processId })
    if (!updatedProject) throw new MethodFailureError('Cannot delete process')
    return updatedProject
  }

  static async getExpect({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    const expects = await getExpect({ projectId })
    return expects
  }

  static async addExpect({ projectId, expect }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!expect) throw new BadRequestError('Missing expect')

    const updatedProject = await addExpect({
      projectId,
      expect: { ...expect, isEdited: false, createdAtTime: new Date() }
    })
    if (!updatedProject) throw new MethodFailureError('Cannot add expect')
    return updatedProject
  }

  static async updateExpect({ projectId, expectId, expect }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!expectId) throw new BadRequestError('Missing expect id')
    if (!isValidObjectId(expectId)) throw new BadRequestError('Invalid expect id')
    if (!expect) throw new BadRequestError('Missing expect')

    const { isEdited, historyExpect, ...updatedExpect } = expect

    const updatedProject = await updateExpect({
      projectId,
      expectId,
      newExpectData: {
        ...updatedExpect,
        createdAtTime: new Date()
      }
    })
    if (!updatedProject) throw new MethodFailureError('Cannot update expect')
    return updatedProject
  }

  static async deleteExpect({ projectId, expectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!expectId) throw new BadRequestError('Missing expect id')
    if (!isValidObjectId(expectId)) throw new BadRequestError('Invalid expect id')

    const updatedProject = await deleteExpect({ projectId, expectId })
    if (!updatedProject) throw new MethodFailureError('Cannot delete expect')
    return updatedProject
  }

  static async getOutput({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    const outputs = await getOutput({ projectId })
    return outputs
  }

  static async getAllProjectOutputByFarmId({ farmId }) {
    if (!farmId) throw new BadRequestError('Missing farm id')
    if (!isValidObjectId(farmId)) throw new BadRequestError('Invalid farm id')

    const projects = await getAllProjectOutputByFarmId({ farmId })
    return projects
  }

  // ...

  static async addOutput({ projectId, output, farmId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!output) throw new BadRequestError('Missing output')

    delete output.exportQR
    delete output.isEdited
    delete output.historyOutput

    // check if project is belong to farm
    const projectInfo = await getProjectInfo({ projectId })
    if (!projectInfo)
      return {
        message: 'Project not found'
      }
    if (projectInfo.farm._id.toString() !== farmId)
      throw new BadRequestError('Do not have permission to add output to this project')
    // Validate and convert distributer to ObjectId
    if (output.distributerWithAmount && Array.isArray(output.distributerWithAmount)) {
      output.distributerWithAmount.forEach((item) => {
        if (item.distributer && !isValidObjectId(item.distributer)) {
          throw new BadRequestError('Invalid distributer id')
        }
        item.distributer = isValidObjectId(item.distributer) ? new Types.ObjectId(item.distributer) : null
      })
    }

    const updatedProject = await addOutput({
      projectId,
      output: {
        ...output,
        createdAtTime: new Date()
      }
    })
    if (!updatedProject) throw new MethodFailureError('Cannot add output')
    return updatedProject
  }

  static async updateOutput({ projectId, outputId, output }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!outputId) throw new BadRequestError('Missing output id')
    if (!isValidObjectId(outputId)) throw new BadRequestError('Invalid output id')
    if (!output) throw new BadRequestError('Missing output')

    // Validate and convert distributer to ObjectId
    if (output.distributerWithAmount && Array.isArray(output.distributerWithAmount)) {
      output.distributerWithAmount.forEach((item) => {
        if (item.distributer && !isValidObjectId(item.distributer)) {
          throw new BadRequestError('Invalid distributer id')
        }
        item.distributer = isValidObjectId(item.distributer) ? new Types.ObjectId(item.distributer) : null
      })
    }

    const { isEdited, historyOutput, exportQR, ...updatedOutput } = output

    const updatedProject = await updateOutput({
      projectId,
      outputId,
      newOutputData: {
        ...updatedOutput,
        createdAtTime: new Date()
      }
    })
    if (!updatedProject) throw new MethodFailureError('Cannot update output')
    return updatedProject
  }

  static async updateExportQR({ projectId, outputId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!outputId) throw new BadRequestError('Missing output id')
    if (!isValidObjectId(outputId)) throw new BadRequestError('Invalid output id')
    const updatedProject = await updateOutput({
      projectId,
      outputId,
      newOutputData: {
        exportQR: true
      }
    })
    if (!updatedProject) throw new MethodFailureError('Cannot update output')
    return updatedProject
  }

  static async deleteOutput({ projectId, outputId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!outputId) throw new BadRequestError('Missing output id')
    if (!isValidObjectId(outputId)) throw new BadRequestError('Invalid output id')

    const updatedProject = await deleteOutput({ projectId, outputId })
    if (!updatedProject) throw new MethodFailureError('Cannot delete output')
    return updatedProject
  }

  static async getPlantFarming({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    const plantFarmingId = await getPlantFarmingId({ projectId })
    if (!plantFarmingId) return null
    const plantFarming = await getPlantFarmingByPlantFarmingId({ plantFarmingId })
    if (!plantFarming) return null
    return plantFarming
  }

  static async getCertificateImages({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    const certificateImages = await getCertificateImages({ projectId })
    return certificateImages
  }

  static async updateCertificateImages({ projectId, certificateImages }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!certificateImages && certificateImages != []) throw new BadRequestError('Missing certificate images')

    const updatedProject = await updateCertificateImages({ projectId, images: certificateImages })
    if (!updatedProject) throw new MethodFailureError('Cannot update certificate images')
    return updatedProject
  }

  static async getProcessWithObjectDetection({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')

    const projectItem = await getProjectInfo({ projectId })
    const outputs = await getOutput({ projectId })
    let endTime = new Date()
    if (outputs.length > 0 && projectItem.status === 'finished' && projectItem.status == 'cancel') {
      // get the time of output has the time field is latest
      endTime = outputs.reduce((acc, cur) => (acc.time > cur.time ? acc : cur)).time
    }

    const startTime = projectItem.startDate
    const cameraIds = projectItem.cameraId
    let objectDetections = []
    for (const cameraId of cameraIds) {
      const objectDetection = await getObjectDetectionByCameraIdAndTime({
        cameraId: cameraId._id.toString(),
        startTime,
        endTime
      })
      if (objectDetection) objectDetections.push(...objectDetection)
    }

    let processes = await getAllProcess({ projectId })

    let nonProcessObjectDetection = []
    for (let process of processes) {
      if (!process.objectDetections) {
        process.objectDetections = []
      }
    }

    if (!objectDetections || objectDetections.length === 0) {
      return { processes, nonProcessObjectDetection }
    }

    for (const detection of objectDetections) {
      let isAdded = false
      for (let process of processes) {
        if (
          process.time.getDate() === detection.start_time.getDate() &&
          process.time.getMonth() === detection.start_time.getMonth() &&
          process.time.getFullYear() === detection.start_time.getFullYear()
        ) {
          if (!process.objectDetections) {
            process.objectDetections = []
          }
          process.objectDetections.push(detection)
          isAdded = true
        }
      }
      if (!isAdded) {
        nonProcessObjectDetection.push(detection)
      }
    }

    // scan processes, if process has not objectDetections, then list objectDetecions of that process set to []

    return { processes, nonProcessObjectDetection }
  }

  static async getConnectionLossbyProject({ projectId }) {
    console.log('projectId', projectId)
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')

    const projectItem = await getProjectInfo({ projectId })
    console.log('projectItem', projectItem)
    if (!projectItem) throw new NotFoundError('Project not found')
    const outputs = await getOutput({ projectId })
    let endTime = new Date()

    if (outputs.length > 0 && projectItem.status === 'finished' && projectItem.status == 'cancel') {
      // get the time of output has the time field is latest
      endTime = outputs.reduce((acc, cur) => (acc.time > cur.time ? acc : cur)).time
    }

    if (projectItem.endDate) {
      endTime = projectItem.endDate
    }

    const startTime = projectItem.startDate
    const cameraIds = projectItem.cameraId
    let connectionLosses = []
    for (const cameraId of cameraIds) {
      const connectionLoss = await getConnectionLossByCameraIdAndTime({
        cameraId: cameraId._id.toString(),
        startTime,
        endTime
      })
      if (connectionLoss) connectionLosses.push(...connectionLoss)
    }

    return connectionLosses
  }

  static async getImageByProject({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')

    const projectItem = await getProjectInfo({ projectId })
    const outputs = await getOutput({ projectId })
    let endTime = new Date()
    if (outputs.length > 0 && projectItem.status === 'finished' && projectItem.status == 'cancel') {
      // get the time of output has the time field is latest
      endTime = outputs.reduce((acc, cur) => (acc.time > cur.time ? acc : cur)).time
    }

    if (projectItem.endDate) {
      endTime = projectItem.endDate
    }

    const startTime = projectItem.startDate
    const cameraIds = projectItem.cameraId
    let imageList = []
    for (const cameraId of cameraIds) {
      const image = await getImageByCameraIdAndTime({
        cameraId: cameraId._id.toString(),
        startTime,
        endTime
      })
      if (image) imageList.push(...image)
    }

    return imageList
  }

  static async getWeatherByProject({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')

    const projectItem = await getProjectInfo({ projectId })
    const outputs = await getOutput({ projectId })
    let endTime = new Date()
    if (outputs.length > 0 && projectItem.status === 'finished' && projectItem.status == 'cancel') {
      // get the time of output has the time field is latest
      endTime = outputs.reduce((acc, cur) => (acc.time > cur.time ? acc : cur)).time
    }

    if (projectItem.endDate) {
      endTime = projectItem.endDate
    }

    const farmId = projectItem.farm._id.toString()
    const startTime = projectItem.startDate

    const weatherData = await getWeatherDataByTimeRange({ startTime, endTime, farmId })

    return weatherData
  }

  static async updateCameraToProject({ projectId, cameraId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!cameraId) throw new BadRequestError('Missing camera id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    // cameraId is a list of Object id
    if (!Array.isArray(cameraId)) throw new BadRequestError('Invalid camera id')
    // check each item in cameraId is valid ObjectId
    for (const id of cameraId) {
      if (!isValidObjectId(id)) throw new BadRequestError('Invalid camera id')
    }

    const updatedProject = await updateCameraToProject({ projectId, cameraId })
    if (!updatedProject) throw new MethodFailureError('Cannot update camera to project')
    return updatedProject
  }

  static async getCameraInProject({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')

    const projectItem = await getProjectInfo({ projectId })
    return projectItem.cameraId || []
  }

  // input: projectIndex, output: list of cameraIndex (by cameraId in projectItem) and startDate and date of latest output
  static async getCameraIndexAndStartDateAndEndDate({ projectIndex }) {
    if (!projectIndex) throw new BadRequestError('Missing project index')
    const projectIndexNumber = parseInt(projectIndex)

    const projectItem = await getProjectByProjectIndex({ projectIndex: projectIndexNumber })
    if (!projectItem) throw new NotFoundError('Project not found')
    const outputs = await getOutput({ projectId: projectItem._id.toString() })
    let endTime = new Date()
    if (outputs.length > 0 && projectItem.status === 'finished' && projectItem.status == 'cancel') {
      // get the time of output has the time field is latest
      endTime = outputs.reduce((acc, cur) => (acc.time > cur.time ? acc : cur)).time
    }

    const startTime = projectItem.startDate
    const cameraIds = projectItem.cameraId
    let cameraIndex = []
    for (const cameraId of cameraIds) {
      cameraIndex.push(cameraId.cameraIndex)
    }

    return { cameraIndex, startDate: startTime, endDate: endTime }
  }

  static async getDeletedItemInProject({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')

    const deletedProcess = await getDeletedProcess({ projectId })
    const deletedExpect = await getDeletedExpect({ projectId })
    const deletedOutput = await getDeletedOutput({ projectId })

    return { deletedProcess, deletedExpect, deletedOutput }
  }
}

module.exports = ProjectService
