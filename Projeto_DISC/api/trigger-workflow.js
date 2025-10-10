// /api/trigger-workflow.js - VERSÃO FINAL

export default async function handler(request, response) {
  // 1. Garante que a requisição é um POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Apenas o método POST é permitido.' });
  }

  // 2. Tenta pegar a URL do n8n das variáveis de ambiente
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  // 3. Validação crucial para garantir que a variável existe
  if (!webhookUrl) {
    console.error("ERRO CRÍTICO: A variável de ambiente N8N_WEBHOOK_URL não foi encontrada.");
    return response.status(500).json({ message: 'URL do Webhook não está configurada no servidor.' });
  }

  // 4. Bloco try...catch para lidar com erros de comunicação com o n8n
  try {
    const incomingData = request.body; // Pega os dados que o frontend enviou

    // Envia os dados para o n8n
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incomingData),
    });

    // Se o n8n retornar um erro, trata-o como uma falha
    if (!n8nResponse.ok) {
      throw new Error(`O n8n retornou um erro: ${n8nResponse.statusText}`);
    }

    // Se tudo correu bem, retorna sucesso para o frontend
    response.status(200).json({ message: 'Workflow disparado com sucesso!' });

  } catch (error) {
    // Se qualquer erro acontecer no bloco 'try', ele será capturado aqui
    console.error('Erro na serverless function ao tentar contactar o n8n:', error);
    response.status(500).json({ message: 'Ocorreu um erro interno no servidor ao contactar o n8n.' });
  }
}