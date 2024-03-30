import fs from "fs"

export class CartManager {
    constructor(ruta) {
        this.path = ruta;
    }

    async getCarts(){
        if(fs.existsSync(this.path)){
            return JSON.parse(await fs.promises.readFile(this.path, {encoding:'utf-8'}))
        }else{
            return []
        }
}

saveDatos(ruta, datos){
    fs.writeFileSync(ruta, JSON.stringify(datos, null, 5))
}

async getById(id){
    let carts=await this.getCarts()
    return carts.find(crt=>crt.id===id)
}

async comprar(idCart, id, description){
    let compra = await this.getCarts()
    
    let cid = 1;
    if (compra.length > 0) {
        // Obtener el valor máximo actual de cid en el carrito
        let maxCid = Math.max(...compra.map(p => p.cid));
        // Asignar un nuevo valor único para cid
        cid = maxCid + 1;
    }

    let nuevoCart = {
        cid,
        id,
        description        
    }

    compra.push(nuevoCart)
    this.saveDatos(this.path, compra);
    console.log({cid, id, description})
    return nuevoCart
}
}