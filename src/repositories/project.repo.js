'use strict'

const { project } = require('../models/project.model')
const { Types } = require('mongoose')
const { getSelectData } = require('../utils/index')

const getAllProjectsByFarm = async ({ limit, sort, page, filter } = {}) => {
  let query = project
    .find(filter || {})
    .populate('farm')
    .populate('plant')
    .populate('seed')

  if (sort) {
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    query = query.sort(sortBy)
  }

  if (page && limit) {
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)
  }

  const projects = await query.lean().exec()
  return projects
}

const initProject = async ({ projectData, farmId, plantId, seedId, status }) => {
  return await project.create({
    ...projectData,
    farm: new Types.ObjectId(farmId),
    plant: new Types.ObjectId(plantId),
    seed: new Types.ObjectId(seedId),
    status
  })
}

const getProjectInfo = async ({ projectId, select }) => {
  const projectInfo = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .populate('farm')
    .populate('plant')
    .populate('seed')
    .populate('historyInfo.seed')
    .populate('cameraId')
    .select(getSelectData(select))
    .lean()
    .exec()

  return projectInfo
}

const updateProjectInfo = async ({ projectId, projectData, historyInfoItem }) => {
  const projectItem = await project.findOne({ _id: new Types.ObjectId(projectId) })
  if (!projectItem) {
    return null
  }
  projectItem.isInfoEdited = true
  projectItem.historyInfo.push(historyInfoItem)
  await projectItem.save()
  const result = await project.updateOne({ _id: new Types.ObjectId(projectId) }, projectData).exec()

  return result
}

const deleteProject = async ({ projectId }) => {
  const result = await project.deleteOne({ _id: new Types.ObjectId(projectId) }).exec()

  return result
}

const getAllProcess = async ({ projectId }) => {
  const processes = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select(getSelectData(['process']))
    .lean()
    .exec()

  const filteredProcesses = processes.process.filter((process) => !process.isDeleted)
  return filteredProcesses
}

const addPlantFarmingToProject = async ({ projectId, plantFarmingId }) => {
  const result = await project
    .updateOne({ _id: new Types.ObjectId(projectId) }, { plantFarming: new Types.ObjectId(plantFarmingId) })
    .exec()

  return result
}

const addProcess = async ({ projectId, process }) => {
  const result = await project.updateOne({ _id: new Types.ObjectId(projectId) }, { $push: { process: process } }).exec()

  return result
}

const updateProcess = async ({ projectId, processId, newProcessData }) => {
  const projectItem = await project.findOne({ _id: new Types.ObjectId(projectId) })
  if (!projectItem) {
    return null
  }

  const process = projectItem.process.id(processId)
  if (!process) {
    return null
  }

  // Tạo một bản sao của quy trình trước khi chỉnh sửa
  const previousProcessData = { ...process.toObject() }
  delete previousProcessData._id // Xóa trường _id

  // Cập nhật quy trình với dữ liệu mới
  for (const key in newProcessData) {
    if (newProcessData.hasOwnProperty(key) && key !== 'historyProcess' && key != 'isEdited') {
      process[key] = newProcessData[key]
    }
  }

  // Xóa các trường không còn tồn tại trong dữ liệu mới
  for (const key in previousProcessData) {
    if (!newProcessData.hasOwnProperty(key) && key !== 'historyProcess' && key !== '_id' && key != 'isEdited') {
      delete process[key]
    }
  }

  // Đánh dấu quy trình đã được chỉnh sửa
  process.isEdited = true

  // Lưu lịch sử chỉnh sửa
  process.historyProcess.push({
    ...previousProcessData,
    modifiedAt: new Date()
  })

  // Lưu lại dự án với thông tin cập nhật
  await projectItem.save()
  return process
}

const deleteProcess = async ({ projectId, processId }) => {
  const result = await project
    .updateOne(
      { _id: new Types.ObjectId(projectId), 'process._id': new Types.ObjectId(processId) },
      {
        $set: { 'process.$.isDeleted': true, 'process.$.deletedAt': new Date() }
      }
    )
    .exec()

  return result
}

const getExpect = async ({ projectId }) => {
  const expect = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select(getSelectData(['expect']))
    .lean()
    .exec()

  const filteredExpect = expect.expect.filter((expect) => !expect.isDeleted)
  return filteredExpect
}

const addExpect = async ({ projectId, expect }) => {
  const result = await project.updateOne({ _id: new Types.ObjectId(projectId) }, { $push: { expect: expect } }).exec()

  return result
}

const updateExpect = async ({ projectId, expectId, newExpectData }) => {
  const projectItem = await project.findOne({ _id: new Types.ObjectId(projectId) })
  if (!projectItem) {
    return null
  }

  const expect = projectItem.expect.id(expectId)
  if (!expect) {
    return null
  }

  // Tạo một bản sao của quy trình trước khi chỉnh sửa
  const previousExpectData = { ...expect.toObject() }
  delete previousExpectData._id // Xóa trường _id

  // Cập nhật quy trình với dữ liệu mới
  for (const key in newExpectData) {
    if (newExpectData.hasOwnProperty(key) && key !== 'historyExpect' && key != 'isEdited') {
      expect[key] = newExpectData[key]
    }
  }

  // Xóa các trường không còn tồn tại trong dữ liệu mới
  for (const key in previousExpectData) {
    if (!newExpectData.hasOwnProperty(key) && key !== 'historyExpect' && key !== '_id' && key != 'isEdited') {
      delete expect[key]
    }
  }

  // Đánh dấu quy trình đã được chỉnh sửa
  expect.isEdited = true

  // Lưu lịch sử chỉnh sửa
  expect.historyExpect.push({
    ...previousExpectData,
    modifiedAt: new Date()
  })

  // Lưu lại dự án với thông tin cập nhật
  await projectItem.save()
  return expect
}

const deleteExpect = async ({ projectId, expectId }) => {
  const result = await project
    .updateOne(
      { _id: new Types.ObjectId(projectId), 'expect._id': new Types.ObjectId(expectId) },
      {
        $set: { 'expect.$.isDeleted': true, 'expect.$.deletedAt': new Date() }
      }
    )
    .exec()

  return result
}

const getOutput = async ({ projectId }) => {
  const output = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select(getSelectData(['output']))
    .populate('output.distributerWithAmount.distributer')
    .populate('output.historyOutput.distributerWithAmount.distributer')
    .lean()
    .exec()

  if (!output) return []
  const filteredOutput = output.output.filter((output) => !output.isDeleted)

  return filteredOutput
}

const getAllProjectOutputByFarmId = async ({ farmId }) => {
  const projects = await project.find({ farm: farmId }).populate('output.distributerWithAmount.distributer')
  return projects
}

const addOutput = async ({ projectId, output }) => {
  const result = await project.updateOne({ _id: new Types.ObjectId(projectId) }, { $push: { output: output } }).exec()

  return result
}

const updateOutput = async ({ projectId, outputId, newOutputData }) => {
  const projectItem = await project.findOne({ _id: new Types.ObjectId(projectId) })
  if (!projectItem) {
    return null
  }

  const output = projectItem.output.id(outputId)
  if (!output) {
    return null
  }

  // Tạo một bản sao của quy trình trước khi chỉnh sửa
  const previousOutputData = { ...output.toObject() }
  delete previousOutputData._id // Xóa trường _id

  // Cập nhật quy trình với dữ liệu mới
  for (const key in newOutputData) {
    if (newOutputData.hasOwnProperty(key) && key !== 'historyOutput' && key != 'isEdited') {
      output[key] = newOutputData[key]
    }
  }

  // Xóa các trường không còn tồn tại trong dữ liệu mới
  for (const key in previousOutputData) {
    if (!newOutputData.hasOwnProperty(key) && key !== 'historyOutput' && key !== '_id' && key != 'isEdited') {
      delete output[key]
    }
  }

  // Đánh dấu quy trình đã được chỉnh sửa
  output.isEdited = true

  // Lưu lịch sử chỉnh sửa
  output.historyOutput.push({
    ...previousOutputData,
    modifiedAt: new Date()
  })

  // Lưu lại dự án với thông tin cập nhật
  await projectItem.save()
  return output
}

const deleteOutput = async ({ projectId, outputId }) => {
  const result = await project
    .updateOne(
      { _id: new Types.ObjectId(projectId), 'output._id': new Types.ObjectId(outputId) },
      {
        $set: { 'output.$.isDeleted': true, 'output.$.deletedAt': new Date() }
      }
    )
    .exec()

  return result
}

const getPlantFarmingId = async ({ projectId }) => {
  const projectInfo = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select('plantFarming')
    .lean()
    .exec()

  return projectInfo.plantFarming
}

const getCertificateImages = async ({ projectId }) => {
  const projectInfo = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select('images')
    .lean()
    .exec()

  console.log('project info', projectInfo)

  if (!projectInfo.images) return []

  return projectInfo.images
}

const updateCertificateImages = async ({ projectId, images }) => {
  const result = await project.updateOne({ _id: new Types.ObjectId(projectId) }, { images }).exec()

  return result
}

const updateCameraToProject = async ({ projectId, cameraId }) => {
  const result = await project.updateOne({ _id: new Types.ObjectId(projectId) }, { cameraId: cameraId }).exec()
  return result
}

const getProjectByProjectIndex = async ({ projectIndex }) => {
  const projectInfo = await project
    .findOne({ projectIndex })
    .select(getSelectData(['_id', 'startDate', 'cameraId']))
    .populate('cameraId')
    .lean()
    .exec()

  return projectInfo
}

const getDeletedProcess = async ({ projectId }) => {
  const processes = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select(getSelectData(['process']))
    .lean()
    .exec()

  const filteredProcesses = processes.process.filter((process) => process.isDeleted)
  return filteredProcesses
}

const getDeletedExpect = async ({ projectId }) => {
  const expect = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select(getSelectData(['expect']))
    .lean()
    .exec()

  const filteredExpect = expect.expect.filter((expect) => expect.isDeleted)
  return filteredExpect
}

const getDeletedOutput = async ({ projectId }) => {
  const output = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select(getSelectData(['output']))
    .lean()
    .exec()

  const filteredOutput = output.output.filter((output) => output.isDeleted)
  return filteredOutput
}

module.exports = {
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
  getCertificateImages,
  updateCertificateImages,
  updateCameraToProject,
  getProjectByProjectIndex,
  getDeletedProcess,
  getDeletedExpect,
  getDeletedOutput
}
