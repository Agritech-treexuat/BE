'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model')
const { BadRequestError } = require('../core/error.response')
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById
} = require('../models/repositories/product.repo')
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils')

// define Factory class to create product
class ProductFactory {
  static productRegistry = {}

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef
    console.log('register new type', this.productRegistry)
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)

    return new productClass(payload).createProduct()
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)

    return new productClass(payload).updateProduct(productId)
  }

  // PUT //
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id })
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id })
  }

  // END PUT //

  // query //
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true }
    return await findAllDraftsForShop({ query, limit, skip })
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true }
    return await findAllPublishForShop({ query, limit, skip })
  }

  static async searchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch })
  }

  static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ['product_name', 'product_price', 'product_thumb']
    })
  }

  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ['__v'] })
  }
}

// define base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  // create new product
  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id })
  }

  // update Product
  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({ productId, bodyUpdate, model: product })
  }
}

// Define sub-class for different product types Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newClothing) throw new BadRequestError('create new Clothing error')

    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) throw new BadRequestError('create new Product error')

    return newProduct
  }

  async updateProduct(productId) {
    //1. remove attribute has null or undefined
    const objectParams = removeUndefinedObject(this)
    //2. check xem update ở chỗ nào?
    if (objectParams.product_attributes) {
      // update child
      await updateProductById({
        productId,
        bodyUpdate: objectParams,
        model: clothing
      })
    }
    const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
    return updateProduct
  }
}

// Define sub-class for different product types Electronic
class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newElectronic) throw new BadRequestError('create new Electronic error')

    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct) throw new BadRequestError('create new Product error')

    return newProduct
  }

  async updateProduct(productId) {
    //1. remove attribute has null or undefined
    const objectParams = this
    //2. check xem update ở chỗ nào?
    if (objectParams.product_attributes) {
      // update child
      await updateProduct({ productId, objectParams, model: electronic })
    }

    const updateProduct = await super.updateProduct(productId, objectParams)
    return updateProduct
  }
}

// Define sub-class for different product types Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newFurniture) throw new BadRequestError('create new Furniture error')

    const newProduct = await super.createProduct(newFurniture._id)
    if (!newProduct) throw new BadRequestError('create new Product error')

    return newProduct
  }

  async updateProduct(productId) {
    //1. remove attribute has null or undefined
    const objectParams = this
    //2. check xem update ở chỗ nào?
    if (objectParams.product_attributes) {
      // update child
      await updateProduct({ productId, objectParams, model: furniture })
    }

    const updateProduct = await super.updateProduct(productId, objectParams)
    return updateProduct
  }
}

// register product types
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory
