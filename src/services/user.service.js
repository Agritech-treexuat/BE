const { Types } = require('mongoose')
const { findUserByEmail, getUser, addUser, updateUser, getPasswordHash } = require('../repositories/user.repo')
const { BadRequestError, NotFoundError, MethodFailureError } = require('../core/error.response')
const { isValidObjectId } = require('../utils/index')

class UserService {
  static async findUserByEmail({ email }) {
    if (!email) {
      throw new BadRequestError('Email is required')
    }
    const user = await findUserByEmail({ email })
    return user
  }

  static async getUser({ userId }) {
    if (!userId) {
      throw new BadRequestError('userId is required')
    }
    if (!isValidObjectId(userId)) {
      throw new BadRequestError('Invalid userId')
    }
    const user = await getUser({ userId })
    if (!user) {
      throw new NotFoundError('User not found')
    }
    return user
  }

  static async getPasswordHash({ userId }) {
    if (!userId) {
      throw new BadRequestError('userId is required')
    }
    if (!isValidObjectId(userId)) {
      throw new BadRequestError('Invalid userId')
    }
    const passwordHash = await getPasswordHash({ userId })
    return passwordHash
  }

  static async addUser({ email, password, roles }) {
    if (!email || !password || !roles) {
      throw new BadRequestError('Email and password are required')
    }
    const user = await addUser({ email, password, roles })
    if (!user) {
      throw new MethodFailureError('Add user failed')
    }
    return user
  }

  static async updateUser({ userId, data }) {
    if (!userId || !data) {
      throw new BadRequestError('userId and data are required')
    }
    if (!isValidObjectId(userId)) {
      throw new BadRequestError('Invalid userId')
    }
    const user = await getUser({ userId })
    if (!user) {
      throw new NotFoundError('User not found')
    }
    const updatedUser = await updateUser({ userId, data })
    if (!updatedUser) {
      throw new MethodFailureError('Update user failed')
    }
    return updatedUser
  }
}

module.exports = UserService
