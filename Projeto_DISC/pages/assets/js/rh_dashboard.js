// Configuração do Firebase do PAINEL RH
const firebaseConfig = {
    apiKey: "AIzaSyCyH4CIG08T4bPDmYd5N-5Q1FSyTCMX_6I",
    authDomain: "teste-disc-bricobread.firebaseapp.com",
    projectId: "teste-disc-bricobread",
    storageBucket: "teste-disc-bricobread.appspot.com",
    messagingSenderId: "827161354543",
    appId: "1:827161354543:web:d92fc84518f507e5f601da"
};
// Inicializa Firebase (evita reinit)
if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Variáveis para as instâncias dos gráficos
let modalChart = null;
let modalRadarChart = null;

// NOVO: Objeto de cores para os perfis, para fácil acesso
const profileColors = {
    D: { solid: '#a30000', transparent: 'rgba(163, 0, 0, 0.4)' },
    I: { solid: '#2980b9', transparent: 'rgba(41, 128, 185, 0.4)' },
    S: { solid: '#318a20', transparent: 'rgba(49, 138, 32, 0.4)' },
    C: { solid: '#555555', transparent: 'rgba(85, 85, 85, 0.4)' }
};

// Texto do perfil predominante para o modal do RH
function textoPerfil(sigla) {
    switch (sigla) {
        case 'D': return 'Perfil predominante: Dominância. Direto, orientado a resultados e desafios.';
        case 'I': return 'Perfil predominante: Influência. Comunicativo, persuasivo, motivado por interação.';
        case 'S': return 'Perfil predominante: Estabilidade. Calmo, consistente; valoriza segurança e colaboração.';
        case 'C': return 'Perfil predominante: Conformidade. Analítico, preciso; preza qualidade e regras.';
        default: return '';
    }
}

function abrirModal(nome, valores) {
    const modal = document.getElementById('resultado-modal');
    const title = document.getElementById('modal-title');
    const prof = document.getElementById('modal-profile');
    const barCanvas = document.getElementById('modal-chart');
    const radarCanvas = document.getElementById('modal-radar-chart');

    title.textContent = `Resultado do Teste DISC – ${nome}`;

    const labels = ['Dominância', 'Influência', 'Estabilidade', 'Conformidade'];
    const barData = [valores.dominancia, valores.influencia, valores.estabilidade, valores.conformidade];

    const total = barData.reduce((sum, value) => sum + value, 0);
    const radarData = barData.map(count => total > 0 ? Math.round((count / total) * 100) : 0);

    // Perfil predominante
    const pares = [['D', valores.dominancia], ['I', valores.influencia], ['S', valores.estabilidade], ['C', valores.conformidade]].sort((a,b)=>b[1]-a[1]);
    const predominantProfile = pares[0][0]; // Identifica o perfil dominante (D, I, S, ou C)
    prof.textContent = textoPerfil(predominantProfile);

    const dominantColor = profileColors[predominantProfile] || profileColors['C'];

    if (modalChart) modalChart.destroy();
    if (modalRadarChart) modalRadarChart.destroy();

    // Desenhar o Gráfico de Barras
    modalChart = new Chart(barCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Contagem de Respostas',
                data: barData,
                backgroundColor: [profileColors.D.solid, profileColors.I.solid, profileColors.S.solid, profileColors.C.solid]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, color: '#333' }, grid: { color: '#ccc' } },
                x: { ticks: { color: '#333' }, grid: { color: '#ccc' } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Desenhar o Gráfico de Radar (COM AS MUDANÇAS)
    modalRadarChart = new Chart(radarCanvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Dominância (D)', 'Influência (I)', 'Estabilidade (S)', 'Conformidade (C)'],
            datasets: [{
                label: 'Perfil (%)',
                data: radarData,
                // --- MUDANÇA 1: Cores dinâmicas ---
                backgroundColor: dominantColor.transparent,
                borderColor: dominantColor.solid,
                pointBackgroundColor: dominantColor.solid,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: dominantColor.solid,
                borderWidth: 2,
                // --- MUDANÇA 2: Pontas arredondadas ---
                pointStyle: 'circle', // Estilo do ponto
                pointRadius: 2.5,            // Tamanho do ponto para melhor visualização
                pointHoverRadius: 5        // Tamanho do ponto ao passar o mouse
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            scales: {
                r: {
                    angleLines: { color: '#ccc' },
                    grid: { color: '#ccc' },
                    pointLabels: { color: '#333', font: { size: 12 } },
                    ticks: {
                        beginAtZero: true,
                        max: 100,
                        stepSize: 20,
                        color: '#333',
                        backdropColor: 'rgba(255, 255, 255, 0.75)'
                    }
                }
            },
            plugins: { legend: { position: 'top' } }
        }
    });

    modal.classList.remove('hidden');
}

// Fecha o modal
function fecharModal() {
    document.getElementById('resultado-modal').classList.add('hidden');
}

document.addEventListener('click', (e) => {
    if (e.target?.id === 'modal-close' || e.target?.id === 'resultado-modal') fecharModal();
});

async function captureModalContent(format = 'jpeg') {
    const modalContent = document.querySelector('#resultado-modal .modal-content');
    
    const closeButton = document.getElementById('modal-close');
    const actionButtons = document.querySelector('.modal-actions');
    closeButton.style.display = 'none';
    actionButtons.style.display = 'none';

    await new Promise(resolve => setTimeout(resolve, 50)); 

    const canvas = await html2canvas(modalContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fefefe'
    });

    closeButton.style.display = '';
    actionButtons.style.display = '';

    if (format === 'jpeg') {
        return canvas.toDataURL('image/jpeg', 0.6); 
    } else if (format === 'canvas') {
        return canvas;
    }
    return null;
}

document.getElementById('btn-download-jpeg').addEventListener('click', async () => {
    const nome = document.getElementById('modal-title').textContent.replace('Resultado do Teste DISC – ', '');
    const dataUrl = await captureModalContent('jpeg');
    if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `relatorio-disc-${nome}.jpeg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});

document.getElementById('btn-print-pdf').addEventListener('click', async () => {
    const nome = document.getElementById('modal-title').textContent.replace('Resultado do Teste DISC – ', '');
    const canvas = await captureModalContent('canvas');
    if (!canvas) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 

    const imgData = canvas.toDataURL('image/jpeg', 0.6); 
    const imgWidth = 190;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const position = 10;

    doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    doc.save(`relatorio-disc-${nome}.pdf`);
});

async function fetchResults() {
    const resultsTbody = document.getElementById('results-tbody');
    resultsTbody.innerHTML = '';

    try {
        const querySnapshot = await db.collection("resultadosDISC").orderBy("data", "desc").get();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');

      // Garante que `data.data` é um Timestamp do Firebase ou ISO string para formatação
            const dateObject = data.data instanceof firebase.firestore.Timestamp ? data.data.toDate() : new Date(data.data);
            const formattedDate = dateObject.toLocaleString('pt-BR');

            row.innerHTML = `
                <td>${data.nome ?? ''}</td>
                <td>${data.email ?? ''}</td>
                <td>${data.dominancia ?? 0}</td>
                <td>${data.influencia ?? 0}</td>
                <td>${data.estabilidade ?? 0}</td>
                <td>${data.conformidade ?? 0}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn-ver-grafico"
                        data-nome="${data.nome ?? ''}"
                        data-d="${data.dominancia ?? 0}"
                        data-i="${data.influencia ?? 0}"
                        data-s="${data.estabilidade ?? 0}"
                        data-c="${data.conformidade ?? 0}">
                        Ver gráfico
                    </button>
                </td>
            `;
            resultsTbody.appendChild(row);
        });

    } catch (error) {
        console.error("Erro ao buscar resultados: ", error);
        resultsTbody.innerHTML = `<tr><td colspan="8" style="color: #a30000; text-align: center;">Erro ao carregar dados. Verifique a conexão com o Firebase ou as permissões de acesso.</td></tr>`;
    }
}

// Clique no botão “Ver gráfico” (delegação para funcionar em qualquer linha)
document.addEventListener('click', (e) => {
    const btn = e.target?.closest('.btn-ver-grafico');
    if (!btn) return;

    const nome = btn.dataset.nome || '';
    const valores = {
        dominancia: parseInt(btn.dataset.d || '0', 10),
        influencia: parseInt(btn.dataset.i || '0', 10),
        estabilidade: parseInt(btn.dataset.s || '0', 10),
        conformidade: parseInt(btn.dataset.c || '0', 10),
    };
    abrirModal(nome, valores);
});

// Inicializa a tabela ao carregar a página
document.addEventListener('DOMContentLoaded', fetchResults);