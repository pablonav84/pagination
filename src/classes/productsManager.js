import fs from "fs"

export class ProductsManager{
    constructor(ruta){
        this.path=ruta
    }

    async getProducts(){
        if(fs.existsSync(this.path)){
            return JSON.parse(await fs.promises.readFile(this.path, {encoding:'utf-8'}))
        }else{
            return []
        }
}

saveDatos(ruta, datos){
    fs.writeFileSync(ruta, JSON.stringify(datos, null, 5))
}

async addProduct(product) {

    let products = await this.getProducts();

    let id = 1;
    if (products.length > 0) {
        // Filtrar los productos con valores de ID nulos o indefinidos
        let filteredProducts = products.filter(p => p.id !== null && p.id !== undefined);
        id = Math.max(...filteredProducts.map(d => d.id)) + 1;
    }

    let nuevoProducto = await {
        id,
        ...product
    };

    products.push(nuevoProducto);
    this.saveDatos(this.path, products);

    return nuevoProducto;
}

async getProductById(id) {
    let products = await this.getProducts();
    let foundProduct = await products.find(product => product.id === id);

    return foundProduct;
  }

  async updateProduct(id, updatedFields) {
      const products = await this.getProducts();
      const index = await products.findIndex((p) => p.id === id);
       
      if (index !== -1) { 
        products[index] = { ...products[index], ...updatedFields };
        
        this.saveDatos(this.path, products);
    } return products[index];
  }

  async deleteProduct(id) {
      const products = await this.getProducts();
      const index = await products.findIndex((p) => p.id === id);
    
      if (index !== -1) {
        const deletedProduct = products.splice(index, 1)[0];
        this.saveDatos(this.path, products);
        return deletedProduct;
      } else {
        return null;
      }
    }
}