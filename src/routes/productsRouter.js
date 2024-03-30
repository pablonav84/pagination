import { Router } from 'express';
import { productsModelo } from '../model/products.Modelo.js';
import { creaHash } from '../utils.js';
export const router = Router();

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