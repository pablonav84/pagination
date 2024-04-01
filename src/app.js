import express from 'express';
import { engine } from "express-handlebars";
import mongoose from 'mongoose';
import __dirname from "./utils.js"
import path from 'path';
import { router as vistasRouter } from './routes/vistasRouter.js';
import { router as productsRouter } from "./routes/productsRouter.js"
import { router as cartRouter } from "./routes/cartRouter.js"
engine

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.engine("handlebars", engine({
       runtimeOptions: {
           allowProtoPropertiesByDefault: true,
           allowProtoMethodsByDefault: true,
      },
   }))
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use("/", vistasRouter)
app.use("/api/products", productsRouter)
app.use("/api/carts", cartRouter)

app.post('/carrito/:pid', async (req, res) => {
  try {
    // Crear un nuevo carrito
    const nuevoCarrito = await cartModelo.create({ items: [] });

    // Obtener el ID del producto desde la solicitud
    const pid = req.params.pid;
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

app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send('error 404 - page not found');
});
const server = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});
const connect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://pablonav84:pablo1810@cluster0.1ym0zxu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      { dbName: "ecommerce"}
    );
    console.log("DB Online");
  } catch (error) {
    console.log("Fallo conexión. Detalle:", error.message);
  }
};
connect();