import { Router } from 'express';
import { productsModelo } from '../model/products.Modelo.js';
import { cartModelo } from "../model/carts.Modelo.js"
export const router = Router();

//Vista Home page
router.get("/", async (req, res) => {

    res.setHeader("Content-Type", "text/html");
    return res.status(200).render("home");
    });

//Vista Productos
router.get("/products", async (req, res) => {
  let { pagina, limit, sort } = req.query;
  if (!pagina) {
    pagina = 1;
  }
  let sortOption = {}; // Inicializa un objeto vacío para las opciones de ordenamiento
  if (sort) {
    // Verifica si se proporciona el parámetro 'sort'
    if (sort === "asc") {
      sortOption = {
        /* Define los criterios de ordenamiento para el orden ascendente */
      };
    } else if (sort === "desc") {
      sortOption = {
        /* Define los criterios de ordenamiento para el orden descendente */
      };
    }
  }
  let {
    docs: productos,
    totalPages,
    prevPage,
    nextPage,
    hasPrevPage,
    hasNextPage,
  } = await productsModelo.paginate(
    {},
    { limit: limit || 10, page: pagina, lean: true, sort: sortOption }
  );
  res.setHeader("Content-Type", "text/html");
  return res
    .status(200)
    .render("products", {
      productos,
      totalPages,
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
    });
});

//Vista detalle de los productos
router.get("/products/:id", async (req, res) => {
      let id = req.params.id;
      let product = await productsModelo.findById(id);

      res.setHeader("Content-Type", "text/html");
      return res.status(200).render("detail", { product });
    });

//Vista de carritos
router.get("/carts", async (req, res) => {
      let { pagina, limit } = req.query;
      if (!pagina) {
        pagina = 1;
      }
      let {
        docs: carts,
        totalPages,
        prevPage,
        nextPage,
        hasPrevPage,
        hasNextPage,
      } = await cartModelo.paginate(
        {},
        { limit: limit || 5, page: pagina, lean: true }
      );
      res.render("carts", {
        carts,
        totalPages,
        prevPage,
        nextPage,
        hasPrevPage,
        hasNextPage,
      });
    });

// Vista detalle de carrito
router.get("/carts/:id", async (req, res) => {
      const cartId = req.params.id;
      
    let carts = await cartModelo.findById(cartId).populate("items.productId");

    res.setHeader("Content-Type", "text/html");
    return res.status(200).render("detailCarts", { carts });
    });