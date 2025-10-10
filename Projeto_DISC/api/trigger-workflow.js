// Esta função é o nosso "manipulador" da API
export default async function handler(request, response) {
  // 1. Garantir que a requisição seja um POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Apenas o método POST é permitido.' });
  }

  // 2. Pegar a URL do n8n das variáveis de ambiente (configuradas no painel da Vercel)
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return response.status(500).json({ message: 'URL do Webhook não está configurada no servidor.' });
  }

  try {
    // 3. Pegar os dados que o frontend enviou
    const incomingData = request.body;

    // 4. Enviar esses dados para o n8n de forma segura
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incomingData),
    });

    if (!n8nResponse.ok) {
      throw new Error(`O n8n retornou um erro: ${n8nResponse.statusText}`);
    }

    // 5. Retornar uma resposta de sucesso para o frontend
    response.status(200).json({ message: 'Workflow disparado com sucesso!' });

  } catch (error) {
    console.error('Erro na serverless function:', error);
    response.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
  }
}