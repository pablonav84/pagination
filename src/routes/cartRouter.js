import { Router } from "express"
import { productsModelo } from "../model/products.Modelo.js";
import { cartModelo } from "../model/carts.Modelo.js";
import mongoose from "mongoose";
export const router = Router()

//Obtener todos los carts disponibles
router.get("/", async (req, res) => {
    try {
        const carts = await cartModelo.find();
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ carts });
    } catch (error) {
        res.status(500).json({ message: 'Error al recuperar los carritos' });
    }
});

//Crea nuevo carrito vacío
router.post('/', async (req, res) => {
    try {
        const newCart = await cartModelo.create({ items: [] });
        res.setHeader("Content-Type", "application/json");
        return res.status(201).json({ cart: newCart, message: 'Cart creado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Fallo al crear el cart' });
    }
  });  

//Crea carrito y agrega un producto al mismo tiempo
router.post('/:pid', async (req, res) => {
  try {
    // Crear un nuevo carrito
    const nuevoCarrito = await cartModelo.create({ items: [] });

    // Obtener el ID del producto desde la solicitud
    const productId = req.params.pid;
    const quantity = req.body.quantity;

    // Validar si el ID del producto es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "ID ingresado no válido" });
    }
    // Buscar el producto por su ID
    const producto = await productsModelo.findById(productId);

    // Agregar el producto al carrito si se encontró
    if (producto) {
      nuevoCarrito.items.push({ productId: producto._id, quantity: quantity || 1 });
      await nuevoCarrito.save(); // Guardar el carrito actualizado
    }
    // Enviar una respuesta con el carrito creado y el producto agregado
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ message: 'Carrito creado y producto agregado con éxito', cart: nuevoCarrito });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al crear el carrito o agregar el producto' });
  }
});

//Agrega un producto al carrito y en caso de existir el producto modifica su cantidad
router.put('/:id/products/:productId', async (req, res) => {
  try {
      const cartId = req.params.id;
      const productId = req.params.productId;
      let quantity = req.body.quantity;

      // Validar si el ID del producto es un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "ID ingresado no válido" });
    }
      //Si no se recibe un valor valido o no se recibe nada en quantity toma el valor de 1 por defecto
      if (isNaN(quantity)) {
        quantity = 1;
    }
      // Buscar el producto en la colección "productos" por su ID
      const product = await productsModelo.findById(productId);
      if (!product) {
          return res.status(404).json({ message: "Producto no encontrado" });
      }
      // Verificar si el producto ya está en el carrito
      const existingCartItem = await cartModelo.findOneAndUpdate(
          { _id: cartId, "items.productId": product._id },
          { $set: { "items.$.quantity": quantity } },
          { new: true }
      );
      // Si el producto no está en el carrito, se agrega con la cantidad especificada
      if (!existingCartItem) {
          const updatedCart = await cartModelo.findByIdAndUpdate(
              cartId,
              { $push: { items: { productId: product._id, quantity: quantity } } },
              { new: true }
          );
          res.setHeader("Content-Type", "application/json");
          res.status(200).json({cart: updatedCart, message: "agregado correctamente"});
      } else {
          res.setHeader("Content-Type", "application/json");
          res.status(200).json({cart: existingCartItem, message: "actualizado correctamente"});
      }
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
});

//Eliminar un producto del cart
router.delete('/:id/products/:productId', async (req, res) => {
    try {
        const cartId = req.params.id;
        const productId = req.params.productId;

        // Validar si el ID del producto es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "ID ingresado no válido" });
        }
        // Verificar si el carrito existe
        const cart = await cartModelo.findById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "El carrito no se encontró" });
        }
        // Verificar si el producto existe dentro del carrito
        const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({ message: "El producto no se encuentra" });
        }
        // Eliminar el producto del carrito por su ID
        const updatedCart = await cartModelo.findByIdAndUpdate(
            cartId,
            { $pull: { items: { productId: productId } } },
            { new: true }
        );
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({cart: updatedCart, message:"El producto fue eliminado correctamente"});
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//Vaciar por completo el cart
router.delete('/:cid', async (req, res) => {
  try {
      const cartId = req.params.cid;

      // Validar si el ID del producto es un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ message: "ID ingresado no válido" });
    }
      // Eliminar todos los productos del carrito
      const updatedCart = await cartModelo.findByIdAndUpdate(
          cartId,
          { $set: { items: [] } }, // Establecer el array de productos como vacío
          { new: true }  
      );
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(updatedCart);
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
});

//Actualiza el carrito con un arreglo de productos ¡¡¡¡¡(SIN FUNCIONAR)!!!!!
router.put('/:cid', async (req, res) => {
    const cartId = req.params.cid;
    const { productIds } = req.body;
    try {
      // Busca el carrito por su ID
      const cart = await cartModelo.findById(cartId);
      if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
      }
      // Busca los productos por sus IDs
      const products = await productsModelo.find({ _id: { $in: productIds } });
      if (products.length !== productIds.length) {
        return res.status(400).json({ message: 'Algunos productos no fueron encontrados' });
      }
      // Agrega el producto al carrito
      if (!cart.items || cart.items.length === 0) {
        // Si el carrito está vacío, inicializa el array de items con los productos
        cart.items = products.map(productId => ({ productId, quantity: 1 }));
      } else {
        // Si el carrito no está vacío, simplemente agrega el producto al array de items
        cart.items.push(...products.map(productId => ({ productId, quantity: 1 })));
      }
      // Guarda el carrito actualizado
      await cart.save();
  
      return res.status(200).json({ message: 'Carrito actualizado exitosamente' });
    } catch (error) {
      return res.status(500).json({ message: 'Error al actualizar el carrito', error: error.message });
    }
  });