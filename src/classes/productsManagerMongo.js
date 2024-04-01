import { productsModelo } from "../model/products.Modelo.js"

//.lean() sirve para convertir de documento hidratado a documento normal la salida que entrega mongoose
//y se usa en los find()

export class ProductsManager{
    constructor(){}

    async getProducts(){
        return await productsModelo.find().lean()
}

async getProductById(id){
  //este es un metodo propio de mongoose(findById)
  return await productsModelo.findById(id).lean()
}

async getProductByCode(code){
  return await productsModelo.findOne({code}).lean()
}

async getProductBy(filtro){
  return await productsModelo.findOne(filtro).lean()
}

async addProduct(product) {
    return await productsModelo.create(product);
}

async updateProduct(id, modificacion={}){
  return await productsModelo.updateOne({_id:id}, modificacion)
}

async deleteProduct(id){
  return await productsModelo.deleteOne({_id:id})
}
}