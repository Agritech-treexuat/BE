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
  addOutput,
  updateOutput,
  deleteOutput
} = require('../models/repositories/project.repo')
const { addPlantFarming } = require('../services/plantFarming.service')
const { updateNestedObjectParser, removeUndefinedObject, isValidObjectId } = require('../utils')
const { BadRequestError, MethodFailureError, NotFoundError } = require('../core/error.response')

class ProjectService {
  static async getAllProjectsByFarm({ farmId, limit, sort, page }) {
    if (!farmId) throw new BadRequestError('Missing farm id')
    if (!isValidObjectId(farmId)) throw new BadRequestError('Invalid farm id')
    const filter = { farm: new Types.ObjectId(farmId) }
    const projects = await getAllProjectsByFarm({ limit, sort, page, filter })
    return projects
  }

  static async initProject({ farmId, project }) {
    if (!farmId) throw new BadRequestError('Missing farm id')
    if (!isValidObjectId(farmId)) throw new BadRequestError('Invalid farm id')
    if (!project) throw new BadRequestError('Missing project')

    const { plant, seed, farm, ...newProject } = project
    const { plantId, seedId } = newProject
    if (!plantId) throw new BadRequestError('Missing plant id')
    if (!seedId) throw new BadRequestError('Missing seed id')

    const updatedProject = await initProject({ farmId, plantId, seedId, projectData: newProject })
    if (!updatedProject) throw new MethodFailureError('Cannot init project')
    return updatedProject
  }

  static async getProjectInfo(projectId) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    const project = await getProjectInfo({
      projectId,
      select: ['plant', 'seed', 'farm', 'startDate', 'square', 'status']
    })
    if (!project) throw new NotFoundError('Project not found')
    return project
  }

  static async updateProjectInfo({ projectId, updatedFields }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!updatedFields) throw new BadRequestError('Missing updated fields')

    const { seed, startDate, square, status } = updatedFields
    if (seed && !isValidObjectId(seed)) throw new BadRequestError('Invalid seed id')
    const projectUpdate = removeUndefinedObject({ seed, startDate, square, status })

    const updatedProject = await updateProjectInfo({ projectId, project: projectUpdate })
    if (!updatedProject) throw new MethodFailureError('Cannot update project')
    return updatedProject
  }

  static async deleteProject({ projectId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    const updatedProject = await deleteProject({ projectId })
    if (!updatedProject) throw new MethodFailureError('Cannot delete project')
    return updatedProject
  }

  static async addPlantFarmingToProject({ projectId, plantFarming, farmId }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!plantFarming) throw new BadRequestError('Missing plant farming')

    const projectInfo = await getProjectInfo({ projectId })
    console.log(projectInfo)

    const plantId = projectInfo.plant._id.toString()
    const seedId = projectInfo.seed._id.toString()
    const addedPlantFarming = await addPlantFarming({ plantFarmingData: plantFarming, farmId: farmId, plantId, seedId })
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

    const updatedProject = await addProcess({ projectId, process: process })
    if (!updatedProject) throw new MethodFailureError('Cannot add process')
    return updatedProject
  }

  static async updateProcess({ projectId, processId, process }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!processId) throw new BadRequestError('Missing process id')
    if (!isValidObjectId(processId)) throw new BadRequestError('Invalid process id')
    if (!process) throw new BadRequestError('Missing process')

    const { tx, isEdited, historyProcess, ...updatedProcess } = process
    const updatedProject = await updateProcess({
      projectId,
      processId,
      newProcessData: removeUndefinedObject(updatedProcess)
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

    const updatedProject = await addExpect({ projectId, expect: expect })
    if (!updatedProject) throw new MethodFailureError('Cannot add expect')
    return updatedProject
  }

  static async updateExpect({ projectId, expectId, expect }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!expectId) throw new BadRequestError('Missing expect id')
    if (!isValidObjectId(expectId)) throw new BadRequestError('Invalid expect id')
    if (!expect) throw new BadRequestError('Missing expect')

    const { tx, isEdited, historyExpect, ...updatedExpect } = expect

    const updatedProject = await updateExpect({ projectId, expectId, newExpectData: updatedExpect })
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

  // ...

  static async addOutput({ projectId, output }) {
    if (!projectId) throw new BadRequestError('Missing project id')
    if (!isValidObjectId(projectId)) throw new BadRequestError('Invalid project id')
    if (!output) throw new BadRequestError('Missing output')

    delete output.exportQR
    delete output.isEdited
    delete output.historyOutput
    // Validate and convert distributer to ObjectId
    if (output.distributerWithAmount && Array.isArray(output.distributerWithAmount)) {
      output.distributerWithAmount.forEach((item) => {
        if (item.distributer && !isValidObjectId(item.distributer)) {
          throw new BadRequestError('Invalid distributer id')
        }
        item.distributer = isValidObjectId(item.distributer) ? new Types.ObjectId(item.distributer) : null
      })
    }

    const updatedProject = await addOutput({ projectId, output: output })
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

    const { tx, isEdited, historyOutput, exportQR, ...updatedOutput } = output

    const updatedProject = await updateOutput({ projectId, outputId, newOutputData: updatedOutput })
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
}

module.exports = ProjectService
