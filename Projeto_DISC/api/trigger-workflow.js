export default async function handler(request, response) {
  // Linha de log para sabermos que a função foi chamada
  console.log("FUNÇÃO DE TESTE EXECUTADA!");

  // Apenas verifica se o método é POST, como antes
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Método não permitido. Apenas POST.' });
  }

  // Se for POST, retorna uma mensagem de sucesso simples
  response.status(200).json({ 
    message: "Olá! A função foi encontrada e executada com sucesso!" 
  });
}