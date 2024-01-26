'use strict'

const { project } = require('../../models/project.model')
const { Types } = require('mongoose')
const { getSelectData, unGetSelectData } = require('../../utils/index')

const getAllProjectsByFarm = async ({ limit, sort, page, filter } = {}) => {
  let query = project.find(filter || {})

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

const initProject = async ({ projectData, farmId, plantId, seedId }) => {
  return await project.create({
    ...projectData,
    farm: new Types.ObjectId(farmId),
    plant: new Types.ObjectId(plantId),
    seed: new Types.ObjectId(seedId),
    status: 'inProgress'
  })
}

const getProjectInfo = async ({ projectId, select }) => {
  const projectInfo = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .populate('farm')
    .populate('plant')
    .populate('seed')
    .select(getSelectData(select))
    .lean()
    .exec()

  return projectInfo
}

const updateProjectInfo = async ({ projectId, projectData }) => {
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

  return processes
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
    .updateOne({ _id: new Types.ObjectId(projectId) }, { $pull: { process: { _id: new Types.ObjectId(processId) } } })
    .exec()

  return result
}

const getExpect = async ({ projectId }) => {
  const expect = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select(getSelectData(['expect']))
    .lean()
    .exec()

  return expect
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
    .updateOne({ _id: new Types.ObjectId(projectId) }, { $pull: { expect: { _id: new Types.ObjectId(expectId) } } })
    .exec()

  return result
}

const getOutput = async ({ projectId }) => {
  const output = await project
    .findOne({ _id: new Types.ObjectId(projectId) })
    .select(getSelectData(['output']))
    .populate('output.distributerWithAmount.distributer')
    .lean()
    .exec()

  return output
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
    .updateOne({ _id: new Types.ObjectId(projectId) }, { $pull: { output: { _id: new Types.ObjectId(outputId) } } })
    .exec()

  return result
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
  addOutput,
  updateOutput,
  deleteOutput
}
