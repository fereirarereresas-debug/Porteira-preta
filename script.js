// ========== CONFIGURAÇÕES GLOBAIS ==========
const CREDENTIALS = {
    username: 'Porteira Preta',
    password: '26122008'
};

// ========== VERIFICAÇÃO DE AUTENTICAÇÃO ==========
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    // Páginas que não precisam de autenticação
    const publicPages = ['index.html', ''];
    
    if (!isLoggedIn && !publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
    }
    
    if (isLoggedIn && publicPages.includes(currentPage)) {
        window.location.href = 'dashboard.html';
    }
}

// ========== FUNÇÃO DE LOGOUT ==========
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}

// ========== MENU LATERAL ==========
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.querySelector('.menu-overlay') || createOverlay();
    
    if (menu) {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    overlay.onclick = toggleMenu;
    document.body.appendChild(overlay);
    return overlay;
}

// ========== PÁGINA DE LOGIN ==========
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = 'Usuário ou senha incorretos';
            errorMessage.style.display = 'block';
            
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
}

// ========== DASHBOARD ==========
if (window.location.pathname.includes('dashboard.html')) {
    loadDashboard();
}

function loadDashboard() {
    // Carregar estatísticas
    updateDashboardStats();
    
    // Carregar gráficos
    loadDashboardCharts();
    
    // Carregar alertas e tarefas
    loadDashboardAlerts();
}

function updateDashboardStats() {
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    const tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    
    // Total de animais
    if (document.getElementById('totalAnimais')) {
        document.getElementById('totalAnimais').textContent = animals.length;
    }
    
    // Saldo financeiro
    let totalReceitas = 0;
    let totalDespesas = 0;
    contas.forEach(conta => {
        if (conta.tipo === 'receita') {
            totalReceitas += conta.valor;
        } else {
            totalDespesas += conta.valor;
        }
    });
    const saldo = totalReceitas - totalDespesas;
    
    if (document.getElementById('saldoAtualDash')) {
        document.getElementById('saldoAtualDash').textContent = 
            saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    
    // Leite hoje
    const hoje = new Date().toISOString().split('T')[0];
    const leiteHoje = producaoLeite.filter(l => l.data === hoje);
    const totalLeiteHoje = leiteHoje.reduce((sum, l) => sum + l.litros, 0);
    
    if (document.getElementById('leiteHoje')) {
        document.getElementById('leiteHoje').textContent = totalLeiteHoje.toFixed(1) + ' L';
    }
    
    // Tarefas hoje
    const tarefasHoje = tarefas.filter(t => t.data === hoje && t.status === 'Pendente');
    if (document.getElementById('tarefasHoje')) {
        document.getElementById('tarefasHoje').textContent = tarefasHoje.length;
    }
}

function loadDashboardCharts() {
    // Gráfico de Finanças
    const ctxFinancas = document.getElementById('chartFinancas');
    if (ctxFinancas) {
        const contas = JSON.parse(localStorage.getItem('contas')) || [];
        const mesesData = getLast6MonthsData(contas);
        
        new Chart(ctxFinancas, {
            type: 'bar',
            data: {
                labels: mesesData.labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: mesesData.receitas,
                        backgroundColor: 'rgba(76, 175, 80, 0.7)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Despesas',
                        data: mesesData.despesas,
                        backgroundColor: 'rgba(244, 67, 54, 0.7)',
                        borderColor: 'rgba(244, 67, 54, 1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Gráfico de Leite
    const ctxLeite = document.getElementById('chartLeite');
    if (ctxLeite) {
        const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
        const leiteData = getLast7DaysLeite(producaoLeite);
        
        new Chart(ctxLeite, {
            type: 'line',
            data: {
                labels: leiteData.labels,
                datasets: [{
                    label: 'Litros',
                    data: leiteData.valores,
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function getLast6MonthsData(contas) {
    const meses = [];
    const receitas = [];
    const despesas = [];
    
    for (let i = 5; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const mes = data.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
        meses.push(mes);
        
        const mesAno = data.toISOString().substring(0, 7);
        const contasMes = contas.filter(c => c.data.startsWith(mesAno));
        
        const receitaMes = contasMes.filter(c => c.tipo === 'receita').reduce((sum, c) => sum + c.valor, 0);
        const despesaMes = contasMes.filter(c => c.tipo === 'despesa').reduce((sum, c) => sum + c.valor, 0);
        
        receitas.push(receitaMes);
        despesas.push(despesaMes);
    }
    
    return { labels: meses, receitas, despesas };
}

function getLast7DaysLeite(producaoLeite) {
    const labels = [];
    const valores = [];
    
    for (let i = 6; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];
        const diaStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        labels.push(diaStr);
        
        const leiteData = producaoLeite.filter(l => l.data === dataStr);
        const total = leiteData.reduce((sum, l) => sum + l.litros, 0);
        valores.push(total);
    }
    
    return { labels, valores };
}

function loadDashboardAlerts() {
    const alertsList = document.getElementById('alertasList');
    const tarefasList = document.getElementById('tarefasList');
    
    if (alertsList) {
        const alertas = getAlertas();
        if (alertas.length === 0) {
            alertsList.innerHTML = '<p class="empty-state">Nenhum alerta no momento</p>';
        } else {
            alertsList.innerHTML = alertas.map(a => `
                <div class="alert-item">
                    <strong>${a.tipo}:</strong> ${a.mensagem}
                </div>
            `).join('');
        }
    }
    
    if (tarefasList) {
        const tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
        const hoje = new Date().toISOString().split('T')[0];
        const tarefasPendentes = tarefas.filter(t => t.status === 'Pendente' && t.data >= hoje).slice(0, 5);
        
        if (tarefasPendentes.length === 0) {
            tarefasList.innerHTML = '<p class="empty-state">Nenhuma tarefa pendente</p>';
        } else {
            tarefasList.innerHTML = tarefasPendentes.map(t => `
                <div class="task-item">
                    <strong>${t.titulo}</strong><br>
                    <small>${new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')} - ${t.prioridade}</small>
                </div>
            `).join('');
        }
    }
}

function getAlertas() {
    const alertas = [];
    
    // Verificar inseminações próximas do parto
    const inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    const hoje = new Date();
    
    inseminacoes.forEach(ins => {
        if (ins.previsaoParto) {
            const previsao = new Date(ins.previsaoParto + 'T00:00:00');
            const diasRestantes = Math.floor((previsao - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes <= 7 && diasRestantes >= 0) {
                alertas.push({
                    tipo: '🐮 Parto Próximo',
                    mensagem: `A vaca ${ins.vaca} tem previsão de parto em ${diasRestantes} dias`
                });
            }
        }
    });
    
    // Verificar máquinas com manutenção próxima
    const maquinas = JSON.parse(localStorage.getItem('maquinas')) || [];
    maquinas.forEach(maq => {
        if (maq.proximaManutencao) {
            const proxima = new Date(maq.proximaManutencao + 'T00:00:00');
            const diasRestantes = Math.floor((proxima - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes <= 7 && diasRestantes >= 0) {
                alertas.push({
                    tipo: '🔧 Manutenção',
                    mensagem: `${maq.nome} precisa de manutenção em ${diasRestantes} dias`
                });
            }
        }
    });
    
    // Verificar lavouras próximas da colheita
    const lavouras = JSON.parse(localStorage.getItem('lavouras')) || [];
    lavouras.forEach(lav => {
        if (lav.previsaoColheita) {
            const colheita = new Date(lav.previsaoColheita + 'T00:00:00');
            const diasRestantes = Math.floor((colheita - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes <= 15 && diasRestantes >= 0) {
                alertas.push({
                    tipo: '🌾 Colheita Próxima',
                    mensagem: `${lav.nome} - ${lav.cultura} pronta para colheita em ${diasRestantes} dias`
                });
            }
        }
    });
    
    return alertas;
}

// ========== PÁGINA DE ANIMAIS ==========
const animalForm = document.getElementById('animalForm');
if (animalForm) {
    loadAnimals();
    
    animalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const birthDate = document.getElementById('animalBirth').value;
        let age = '';
        if (birthDate) {
            age = calculateAge(birthDate);
        }
        
        const animal = {
            id: Date.now(),
            name: document.getElementById('animalName').value.trim(),
            type: document.getElementById('animalType').value.trim(),
            race: document.getElementById('animalRace').value.trim(),
            birth: birthDate,
            age: age,
            weight: document.getElementById('animalWeight').value,
            gender: document.getElementById('animalGender').value,
            photo: document.getElementById('animalPhoto').value.trim(),
            obs: document.getElementById('animalObs').value.trim()
        };
        
        if (!animal.name || !animal.type) {
            showMessage('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        let animals = JSON.parse(localStorage.getItem('animals')) || [];
        animals.push(animal);
        localStorage.setItem('animals', JSON.stringify(animals));
        
        animalForm.reset();
        loadAnimals();
        showMessage('Animal registrado com sucesso! 🐄', 'success');
    });
}

function calculateAge(birthDate) {
    const birth = new Date(birthDate + 'T00:00:00');
    const hoje = new Date();
    
    let anos = hoje.getFullYear() - birth.getFullYear();
    let meses = hoje.getMonth() - birth.getMonth();
    
    if (meses < 0) {
        anos--;
        meses += 12;
    }
    
    if (anos > 0) {
        return `${anos} ano${anos > 1 ? 's' : ''}${meses > 0 ? ` e ${meses} mês${meses > 1 ? 'es' : ''}` : ''}`;
    } else {
        return `${meses} mês${meses > 1 ? 'es' : ''}`;
    }
}

function loadAnimals() {
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const tbody = document.getElementById('animalTableBody');
    const count = document.getElementById('animalCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (animals.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="8">Nenhum animal registrado ainda</td></tr>';
        if (count) count.textContent = '0';
        return;
    }
    
    let filteredAnimals = animals;
    
    // Aplicar filtros se existirem
    const filterType = document.getElementById('filterType');
    const searchAnimal = document.getElementById('searchAnimal');
    
    if (filterType && filterType.value) {
        filteredAnimals = filteredAnimals.filter(a => a.type === filterType.value);
    }
    
    if (searchAnimal && searchAnimal.value) {
        const search = searchAnimal.value.toLowerCase();
        filteredAnimals = filteredAnimals.filter(a => 
            a.name.toLowerCase().includes(search) ||
            a.type.toLowerCase().includes(search)
        );
    }
    
    filteredAnimals.forEach(animal => {
        const row = document.createElement('tr');
        const photoHtml = animal.photo ? 
            `<img src="${animal.photo}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\'%3E%3Crect fill=\'%23ddd\' width=\'50\' height=\'50\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'30\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\'%3E🐄%3C/text%3E%3C/svg%3E'">` : 
            '🐄';
        
        row.innerHTML = `
            <td>${photoHtml}</td>
            <td><strong>${animal.name}</strong></td>
            <td>${animal.type}</td>
            <td>${animal.race || '-'}</td>
            <td>${animal.age || '-'}</td>
            <td>${animal.weight ? animal.weight + ' kg' : '-'}</td>
            <td>${animal.gender || '-'}</td>
            <td>
                <button onclick="viewAnimal(${animal.id})" class="btn btn-info" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Ver</button>
                <button onclick="deleteAnimal(${animal.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (count) count.textContent = filteredAnimals.length;
}

function filterAnimals() {
    loadAnimals();
}

function resetFilters() {
    const filterType = document.getElementById('filterType');
    const searchAnimal = document.getElementById('searchAnimal');
    
    if (filterType) filterType.value = '';
    if (searchAnimal) searchAnimal.value = '';
    
    loadAnimals();
}

function viewAnimal(id) {
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const animal = animals.find(a => a.id === id);
    
    if (animal) {
        alert(`
🐄 FICHA DO ANIMAL

Nome: ${animal.name}
Tipo: ${animal.type}
Raça: ${animal.race || 'Não informada'}
Idade: ${animal.age || 'Não informada'}
Data Nascimento: ${animal.birth ? new Date(animal.birth + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'}
Peso: ${animal.weight ? animal.weight + ' kg' : 'Não informado'}
Sexo: ${animal.gender || 'Não informado'}
Observações: ${animal.obs || 'Nenhuma'}
        `);
    }
}

function deleteAnimal(id) {
    if (!confirm('Tem certeza que deseja excluir este animal?')) return;
    
    let animals = JSON.parse(localStorage.getItem('animals')) || [];
    animals = animals.filter(animal => animal.id !== id);
    localStorage.setItem('animals', JSON.stringify(animals));
    
    loadAnimals();
    showMessage('Animal excluído com sucesso!', 'success');
}

function clearAllAnimals() {
    if (!confirm('Tem certeza que deseja apagar TODOS os animais registrados? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('animals');
    loadAnimals();
    showMessage('Todos os animais foram removidos!', 'success');
}

function exportAnimalsCSV() {
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    if (animals.length === 0) {
        alert('Nenhum animal para exportar!');
        return;
    }
    
    let csv = 'Nome,Tipo,Raça,Nascimento,Idade,Peso,Sexo,Observações\n';
    animals.forEach(a => {
        csv += `"${a.name}","${a.type}","${a.race || ''}","${a.birth || ''}","${a.age || ''}","${a.weight || ''}","${a.gender || ''}","${a.obs || ''}"\n`;
    });
    
    downloadCSV(csv, 'animais.csv');
}

function showMessage(text, type) {
    const message = document.getElementById('message');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== CONTINUA NA PARTE 2 ==========