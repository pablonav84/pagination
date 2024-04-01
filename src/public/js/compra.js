
    const addToCart = async (pid) => {
  let quantity = 1; // Cantidad por defecto
  try {
    let respuesta = await fetch("http://localhost:8080/carrito/"+pid,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: quantity }) // Envía la cantidad deseada
    });
    let data = await respuesta.json(); // Convertir la respuesta a JSON
  } catch (error) {
      console.error('Ha ocurrido un error:', error);
  }
}