'use strict'

const { gardenServiceTemplate } = require('../../models/gardenServiceTemplate.model')
const { Types } = require('mongoose')
const { getSelectData, unGetSelectData } = require('../../utils/index')

const getAllGardenServiceTemplatesByFarm = async ({ limit, sort, page, filter } = {}) => {
  let query = gardenServiceTemplate.find(filter || {})

  if (sort) {
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    query = query.sort(sortBy)
  }

  if (page && limit) {
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)
  }

  const gardenServiceTemplates = await query.lean().exec()
  return gardenServiceTemplates
}

const getGardenServiceTemplateByGardenServiceTemplateId = async ({ gardenServiceTemplateId }, unSelect = ['__v']) => {
  return await gardenServiceTemplate.findById(gardenServiceTemplateId).select(unGetSelectData(unSelect)).lean().exec()
}

const addGardenServiceTemplate = async ({ gardenServiceTemplateData, farmId }) => {
  return await gardenServiceTemplate.create({
    ...gardenServiceTemplateData,
    farm: new Types.ObjectId(farmId)
  })
}

const updateGardenServiceTemplate = async ({ gardenServiceTemplateId, bodyUpdate }) => {
  return await gardenServiceTemplate.findByIdAndUpdate(gardenServiceTemplateId, bodyUpdate, { new: true }).exec()
}

const deleteGardenServiceTemplate = async ({ gardenServiceTemplateId }) => {
  return await gardenServiceTemplate.findByIdAndDelete(gardenServiceTemplateId).exec()
}

module.exports = {
  getAllGardenServiceTemplatesByFarm,
  getGardenServiceTemplateByGardenServiceTemplateId,
  addGardenServiceTemplate,
  updateGardenServiceTemplate,
  deleteGardenServiceTemplate
}
