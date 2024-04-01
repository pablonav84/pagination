import { Router } from 'express';
import { productsModelo } from '../model/products.Modelo.js';
import { creaHash } from '../utils.js';
import {ProductsManager} from "../classes/productsManagerMongo.js";
import mongoose from "mongoose";
export const router = Router();

let pManager = new ProductsManager()

//Obtener los productos
router.get("/", async (req, res) => {
    
    let {limit, pagina, sort, category}=req.query
    if(!pagina){
        pagina=1
    }
    let sortOption = {}; // Inicializa un objeto vacío para las opciones de ordenamiento

    if (sort) {
        // Verifica si se proporciona el parámetro 'sort'
        if (sort === 'asc') {
            sortOption = { price: 1 };
        } else if (sort === 'desc') {
            sortOption = { price: -1 };
        }
    }

    let query = {};
    if (category) {
        query.category = category; // Filtrar por categoría
    }

    let {
        docs:productos,
        totalPages, 
        prevPage, nextPage, 
        hasPrevPage, hasNextPage
    } = await productsModelo.paginate(query,{limit: limit || 10, page:pagina, lean:true, sort: sortOption })
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({productos,
        totalPages, 
        prevPage, nextPage, 
        hasPrevPage, hasNextPage})
    });

    //Crear un nuevo producto
    router.post("/", async (req, res) => {
        let {
          title,
          description,
          price,
          thumbnail,
          code,
          stock,
          category,
          password,
        } = req.body;
        // Verificar si alguno de los campos está incompleto
        if (
          !title ||
          !description ||
          !price ||
          !code ||
          !stock ||
          !category ||
          !password
        ) {
          res.status(400).json({ error: "Hay campos que faltan ser completados" });
          return;
        }
        // Verificar si el código ya existe
        let existCode = await productsModelo.findOne({code});
        if (existCode) {
          res.status(400).json({ error: "Ya existe un producto con el mismo código" });
          return;
        }
        password = creaHash(password);
        try {
          let nuevoProducto = await productsModelo.create({
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            category,
            password,
          });
          res.setHeader("Content-Type", "application/json");
          return res.status(201).json({ nuevoProducto: nuevoProducto });
        } catch (error) {
          return res.status(500).json({ error: `Error inesperado en el servidor`, detalle: error.message });
        }
      });
      
//Modifica cualquier campo del producto
router.put("/:id", async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `id inválido` });
  }
let upDate=req.body
if(upDate._id){
  delete upDate._id
}
if(upDate.code){
  let existe=await pManager.getProductBy({code:upDate.code, _id:{$ne:id}})
if(existe){
  res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Ya existe un producto con code ${upDate.code}` });
}
}
if(upDate.password){
  upDate.password=creaHash(upDate.password)
}
  try {
    let resProduct = await pManager.updateProduct(id, upDate);
    if (resProduct.modifiedCount>0) {
      res.status(200).json({ message: `Producto con id ${id} modificado` });
    } else {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `No existen productos con id ${id}` });
    }
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor`,
      detalle: `${error.message}`,
    });
  }
});

      //Elimina un producto
      router.delete("/:id", async (req, res) => {
        const productId = (req.params.id);
        try {
            const deletedProduct = productsModelo.findByIdAndDelete(productId);
        if (deletedProduct) {
          let remainingProducts = await productsModelo.find()
          
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json({ mensaje: "El producto ha sido eliminado exitosamente" });
        } else {
          res.status(404).json({ error: "Producto no encontrado" });
        }
        } catch (error) {
            return res.status(500).json({ error: `Error inesperado en el servidor`, detalle: error.message });
        }
      });