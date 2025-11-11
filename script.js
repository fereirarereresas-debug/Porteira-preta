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
// ========== PÁGINA DE INSEMINAÇÃO ==========
const inseminacaoForm = document.getElementById('inseminacaoForm');
if (inseminacaoForm) {
    loadVacasSelect();
    loadInseminacoes();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataInseminacao').value = hoje;
    
    // Calcular previsão de parto automaticamente (285 dias)
    document.getElementById('dataInseminacao').addEventListener('change', function() {
        const dataInsem = new Date(this.value + 'T00:00:00');
        const previsaoParto = new Date(dataInsem);
        previsaoParto.setDate(previsaoParto.getDate() + 285);
        document.getElementById('previsaoParto').value = previsaoParto.toISOString().split('T')[0];
    });
    
    inseminacaoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inseminacao = {
            id: Date.now(),
            vaca: document.getElementById('vacaInseminacao').value,
            data: document.getElementById('dataInseminacao').value,
            boi: document.getElementById('boiInseminacao').value.trim(),
            raca: document.getElementById('racaBoi').value.trim(),
            tipo: document.getElementById('tipoInseminacao').value,
            previsaoParto: document.getElementById('previsaoParto').value,
            obs: document.getElementById('obsInseminacao').value.trim()
        };
        
        if (!inseminacao.vaca || !inseminacao.data || !inseminacao.boi) {
            showMessageInseminacao('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        let inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
        inseminacoes.push(inseminacao);
        localStorage.setItem('inseminacoes', JSON.stringify(inseminacoes));
        
        inseminacaoForm.reset();
        document.getElementById('dataInseminacao').value = hoje;
        loadInseminacoes();
        showMessageInseminacao('Inseminação registrada com sucesso! 🐮', 'success');
    });
}

function loadVacasSelect() {
    const select = document.getElementById('vacaInseminacao');
    if (!select) return;
    
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const vacas = animals.filter(animal => 
        animal.type.toLowerCase().includes('vaca') || 
        animal.type.toLowerCase().includes('novilha')
    );
    
    select.innerHTML = '<option value="">Selecione uma vaca</option>';
    
    vacas.forEach(vaca => {
        const option = document.createElement('option');
        option.value = vaca.name;
        option.textContent = `${vaca.name} (${vaca.type})`;
        select.appendChild(option);
    });
    
    if (vacas.length === 0) {
        select.innerHTML = '<option value="">Nenhuma vaca cadastrada</option>';
    }
}

function loadInseminacoes() {
    const inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    const tbody = document.getElementById('inseminacaoTableBody');
    const count = document.getElementById('inseminacaoCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (inseminacoes.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="8">Nenhuma inseminação registrada ainda</td></tr>';
        if (count) count.textContent = '0';
        return;
    }
    
    inseminacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    const hoje = new Date();
    
    inseminacoes.forEach(ins => {
        const dataFormatada = new Date(ins.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const previsaoFormatada = ins.previsaoParto ? 
            new Date(ins.previsaoParto + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
        
        let status = '';
        if (ins.previsaoParto) {
            const previsao = new Date(ins.previsaoParto + 'T00:00:00');
            const diasRestantes = Math.floor((previsao - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes < 0) {
                status = '<span class="status-badge status-atrasado">Atrasado</span>';
            } else if (diasRestantes <= 30) {
                status = `<span class="status-badge status-proximo">Faltam ${diasRestantes} dias</span>`;
            } else {
                status = `<span class="status-badge status-aguardando">Aguardando (${diasRestantes}d)</span>`;
            }
        } else {
            status = '<span class="status-badge status-aguardando">Sem previsão</span>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${ins.vaca}</td>
            <td>${ins.boi}</td>
            <td>${ins.raca || '-'}</td>
            <td>${ins.tipo}</td>
            <td>${previsaoFormatada}</td>
            <td>${status}</td>
            <td>
                <button onclick="deleteInseminacao(${ins.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (count) count.textContent = inseminacoes.length;
}

function deleteInseminacao(id) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    let inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    inseminacoes = inseminacoes.filter(ins => ins.id !== id);
    localStorage.setItem('inseminacoes', JSON.stringify(inseminacoes));
    
    loadInseminacoes();
    showMessageInseminacao('Registro excluído com sucesso!', 'success');
}

function clearAllInseminacoes() {
    if (!confirm('Tem certeza que deseja apagar TODOS os registros de inseminação? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('inseminacoes');
    loadInseminacoes();
    showMessageInseminacao('Todos os registros foram removidos!', 'success');
}

function exportInseminacoesCSV() {
    const inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    if (inseminacoes.length === 0) {
        alert('Nenhuma inseminação para exportar!');
        return;
    }
    
    let csv = 'Data,Vaca,Boi/Touro,Raça,Tipo,Previsão Parto,Observações\n';
    inseminacoes.forEach(i => {
        csv += `"${i.data}","${i.vaca}","${i.boi}","${i.raca || ''}","${i.tipo}","${i.previsaoParto || ''}","${i.obs || ''}"\n`;
    });
    
    downloadCSV(csv, 'inseminacoes.csv');
}

function showMessageInseminacao(text, type) {
    const message = document.getElementById('messageInseminacao');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== PÁGINA DE PRODUÇÃO DE LEITE ==========
const leiteForm = document.getElementById('leiteForm');
if (leiteForm) {
    loadLeiteData();
    loadLeiteTable();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataLeite').value = hoje;
    
    leiteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const leite = {
            id: Date.now(),
            data: document.getElementById('dataLeite').value,
            litros: parseFloat(document.getElementById('litrosLeite').value),
            precoLitro: parseFloat(document.getElementById('precoLitro').value) || 0
        };
        
        if (!leite.data || !leite.litros || leite.litros <= 0) {
            showMessageLeite('Preencha os campos corretamente!', 'error');
            return;
        }
        
        let producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
        producaoLeite.push(leite);
        localStorage.setItem('producaoLeite', JSON.stringify(producaoLeite));
        
        leiteForm.reset();
        document.getElementById('dataLeite').value = hoje;
        loadLeiteData();
        loadLeiteTable();
        loadLeiteChart();
        showMessageLeite('Produção de leite registrada! 🥛', 'success');
    });
    
    loadLeiteChart();
}

function loadLeiteData() {
    const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    
    if (producaoLeite.length === 0) {
        if (document.getElementById('leite7dias')) {
            document.getElementById('leite7dias').textContent = '0 L';
            document.getElementById('media7dias').textContent = 'Média: 0 L/dia';
            document.getElementById('leite30dias').textContent = '0 L';
            document.getElementById('media30dias').textContent = 'Média: 0 L/dia';
            document.getElementById('valor30dias').textContent = 'R$ 0,00';
            document.getElementById('litrosVendidos30dias').textContent = '0 L vendidos';
        }
        return;
    }
    
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 7);
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    
    const leite7dias = producaoLeite.filter(l => {
        const data = new Date(l.data + 'T00:00:00');
        return data >= seteDiasAtras && data <= hoje;
    });
    
    const leite30dias = producaoLeite.filter(l => {
        const data = new Date(l.data + 'T00:00:00');
        return data >= trintaDiasAtras && data <= hoje;
    });
    
    const totalLitros7 = leite7dias.reduce((sum, l) => sum + l.litros, 0);
    const totalLitros30 = leite30dias.reduce((sum, l) => sum + l.litros, 0);
    
    const leiteVendido30 = leite30dias.filter(l => l.precoLitro > 0);
    const litrosVendidos = leiteVendido30.reduce((sum, l) => sum + l.litros, 0);
    const valorTotal = leiteVendido30.reduce((sum, l) => sum + (l.litros * l.precoLitro), 0);
    
    if (document.getElementById('leite7dias')) {
        document.getElementById('leite7dias').textContent = `${totalLitros7.toFixed(1)} L`;
        document.getElementById('media7dias').textContent = 
            `Média: ${leite7dias.length > 0 ? (totalLitros7 / leite7dias.length).toFixed(1) : 0} L/dia`;
        
        document.getElementById('leite30dias').textContent = `${totalLitros30.toFixed(1)} L`;
        document.getElementById('media30dias').textContent = 
            `Média: ${leite30dias.length > 0 ? (totalLitros30 / leite30dias.length).toFixed(1) : 0} L/dia`;
        
        document.getElementById('valor30dias').textContent = 
            valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('litrosVendidos30dias').textContent = 
            `${litrosVendidos.toFixed(1)} L vendidos`;
    }
}

function loadLeiteTable() {
    const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    const tbody = document.getElementById('leiteTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (producaoLeite.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">Nenhum registro de produção ainda</td></tr>';
        return;
    }
    
    producaoLeite.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    producaoLeite.forEach(leite => {
        const dataFormatada = new Date(leite.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const precoFormatado = leite.precoLitro > 0 ? 
            leite.precoLitro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';
        const valorTotal = leite.precoLitro > 0 ? 
            (leite.litros * leite.precoLitro).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td><strong>${leite.litros.toFixed(1)} L</strong></td>
            <td>${precoFormatado}</td>
            <td style="font-weight: 600; color: #4caf50;">${valorTotal}</td>
            <td>
                <button onclick="deleteLeite(${leite.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadLeiteChart() {
    const ctx = document.getElementById('chartProducaoLeite');
    if (!ctx) return;
    
    const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    const labels = [];
    const valores = [];
    
    for (let i = 29; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];
        const diaStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        labels.push(diaStr);
        
        const leiteData = producaoLeite.filter(l => l.data === dataStr);
        const total = leiteData.reduce((sum, l) => sum + l.litros, 0);
        valores.push(total);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Litros por Dia',
                data: valores,
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

function deleteLeite(id) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    let producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    producaoLeite = producaoLeite.filter(l => l.id !== id);
    localStorage.setItem('producaoLeite', JSON.stringify(producaoLeite));
    
    loadLeiteData();
    loadLeiteTable();
    showMessageLeite('Registro excluído com sucesso!', 'success');
}

function clearAllLeite() {
    if (!confirm('Tem certeza que deseja apagar TODOS os registros de produção de leite? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('producaoLeite');
    loadLeiteData();
    loadLeiteTable();
    showMessageLeite('Todos os registros foram removidos!', 'success');
}

function exportLeiteCSV() {
    const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    if (producaoLeite.length === 0) {
        alert('Nenhum registro de leite para exportar!');
        return;
    }
    
    let csv = 'Data,Litros,Preço por Litro,Valor Total\n';
    producaoLeite.forEach(l => {
        const valorTotal = l.precoLitro > 0 ? (l.litros * l.precoLitro).toFixed(2) : '0';
        csv += `"${l.data}","${l.litros}","${l.precoLitro}","${valorTotal}"\n`;
    });
    
    downloadCSV(csv, 'producao_leite.csv');
}

function showMessageLeite(text, type) {
    const message = document.getElementById('messageLeite');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== CONTINUA NA PARTE 3 ==========
// ========== PÁGINA DE CONTAS/FINANÇAS ==========
const contasForm = document.getElementById('contasForm');
if (contasForm) {
    loadContas();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('contaData').value = hoje;
    
    // Carregar gráfico se existir
    const ctxFinancasPage = document.getElementById('chartFinancasPage');
    if (ctxFinancasPage) {
        loadFinancasChart();
    }
    
    // Carregar resumo por categoria
    loadResumoCategoria();
    
    // Popular filtro de categorias
    populateFilterCategorias();
    
    contasForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const conta = {
            id: Date.now(),
            descricao: document.getElementById('contaDescricao').value.trim(),
            tipo: document.getElementById('contaTipo').value,
            categoria: document.getElementById('contaCategoria').value || 'Geral',
            valor: parseFloat(document.getElementById('contaValor').value),
            data: document.getElementById('contaData').value
        };
        
        if (!conta.descricao || !conta.tipo || !conta.valor || !conta.data) {
            showMessageContas('Preencha todos os campos!', 'error');
            return;
        }
        
        if (conta.valor <= 0) {
            showMessageContas('O valor deve ser maior que zero!', 'error');
            return;
        }
        
        let contas = JSON.parse(localStorage.getItem('contas')) || [];
        contas.push(conta);
        localStorage.setItem('contas', JSON.stringify(contas));
        
        contasForm.reset();
        document.getElementById('contaData').value = hoje;
        loadContas();
        loadResumoCategoria();
        if (ctxFinancasPage) loadFinancasChart();
        showMessageContas('Registro adicionado com sucesso! 💰', 'success');
    });
}

function loadContas() {
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const tbody = document.getElementById('contasTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (contas.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">Nenhum registro financeiro ainda</td></tr>';
        updateTotals(0, 0);
        return;
    }
    
    let filteredContas = contas;
    
    // Aplicar filtros
    const filterTipo = document.getElementById('filterTipo');
    const filterCategoria = document.getElementById('filterCategoria');
    const filterMes = document.getElementById('filterMes');
    
    if (filterTipo && filterTipo.value !== 'all') {
        filteredContas = filteredContas.filter(c => c.tipo === filterTipo.value);
    }
    
    if (filterCategoria && filterCategoria.value !== 'all') {
        filteredContas = filteredContas.filter(c => c.categoria === filterCategoria.value);
    }
    
    if (filterMes && filterMes.value) {
        filteredContas = filteredContas.filter(c => c.data.startsWith(filterMes.value));
    }
    
    filteredContas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    filteredContas.forEach(conta => {
        if (conta.tipo === 'receita') {
            totalReceitas += conta.valor;
        } else {
            totalDespesas += conta.valor;
        }
        
        const row = document.createElement('tr');
        const dataFormatada = new Date(conta.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const valorFormatado = conta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const tipoClass = conta.tipo === 'receita' ? 'style="color: #4caf50; font-weight: 600;"' : 'style="color: #f44336; font-weight: 600;"';
        const tipoTexto = conta.tipo === 'receita' ? '✅ Receita' : '❌ Despesa';
        
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${conta.descricao}</td>
            <td><span style="background: #f0f0f0; padding: 3px 8px; border-radius: 4px; font-size: 0.85rem;">${conta.categoria}</span></td>
            <td ${tipoClass}>${tipoTexto}</td>
            <td style="font-weight: 600;">${valorFormatado}</td>
            <td>
                <button onclick="deleteConta(${conta.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateTotals(totalReceitas, totalDespesas);
}

function updateTotals(receitas, despesas) {
    const saldo = receitas - despesas;
    
    const totalReceitasEl = document.getElementById('totalReceitas');
    const totalDespesasEl = document.getElementById('totalDespesas');
    const saldoAtualEl = document.getElementById('saldoAtual');
    
    if (totalReceitasEl) totalReceitasEl.textContent = receitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (totalDespesasEl) totalDespesasEl.textContent = despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (saldoAtualEl) {
        saldoAtualEl.textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        saldoAtualEl.style.color = saldo >= 0 ? '#4caf50' : '#f44336';
    }
}

function filterContas() {
    loadContas();
}

function populateFilterCategorias() {
    const filterCategoria = document.getElementById('filterCategoria');
    if (!filterCategoria) return;
    
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const categorias = [...new Set(contas.map(c => c.categoria))];
    
    filterCategoria.innerHTML = '<option value="all">Todas Categorias</option>';
    categorias.forEach(cat => {
        if (cat) {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterCategoria.appendChild(option);
        }
    });
}

function loadResumoCategoria() {
    const resumoDiv = document.getElementById('resumoCategoria');
    if (!resumoDiv) return;
    
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const hoje = new Date();
    const mesAtual = hoje.toISOString().substring(0, 7);
    
    const contasMes = contas.filter(c => c.data.startsWith(mesAtual));
    
    if (contasMes.length === 0) {
        resumoDiv.innerHTML = '<p class="empty-state">Nenhum registro no mês atual</p>';
        return;
    }
    
    const categorias = {};
    
    contasMes.forEach(c => {
        if (!categorias[c.categoria]) {
            categorias[c.categoria] = { receitas: 0, despesas: 0 };
        }
        
        if (c.tipo === 'receita') {
            categorias[c.categoria].receitas += c.valor;
        } else {
            categorias[c.categoria].despesas += c.valor;
        }
    });
    
    resumoDiv.innerHTML = '';
    
    Object.keys(categorias).forEach(cat => {
        const data = categorias[cat];
        const total = data.receitas - data.despesas;
        
        const div = document.createElement('div');
        div.className = 'categoria-item';
        div.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #6b8e23;">${cat}</h4>
            <p style="margin: 5px 0; color: #4caf50;">Receitas: ${data.receitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p style="margin: 5px 0; color: #f44336;">Despesas: ${data.despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p style="margin: 5px 0; font-weight: 600; color: ${total >= 0 ? '#4caf50' : '#f44336'};">Saldo: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        `;
        resumoDiv.appendChild(div);
    });
}

function loadFinancasChart() {
    const ctx = document.getElementById('chartFinancasPage');
    if (!ctx) return;
    
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const mesesData = getLast6MonthsData(contas);
    
    new Chart(ctx, {
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

function deleteConta(id) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    let contas = JSON.parse(localStorage.getItem('contas')) || [];
    contas = contas.filter(conta => conta.id !== id);
    localStorage.setItem('contas', JSON.stringify(contas));
    
    loadContas();
    loadResumoCategoria();
    showMessageContas('Registro excluído com sucesso!', 'success');
}

function clearAllContas() {
    if (!confirm('Tem certeza que deseja apagar TODOS os registros financeiros? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('contas');
    loadContas();
    loadResumoCategoria();
    showMessageContas('Todos os registros foram removidos!', 'success');
}

function exportContasCSV() {
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    if (contas.length === 0) {
        alert('Nenhum registro financeiro para exportar!');
        return;
    }
    
    let csv = 'Data,Descrição,Categoria,Tipo,Valor\n';
    contas.forEach(c => {
        csv += `"${c.data}","${c.descricao}","${c.categoria}","${c.tipo}","${c.valor}"\n`;
    });
    
    downloadCSV(csv, 'financas.csv');
}

function gerarRelatorioPDF() {
    alert('Funcionalidade de PDF em desenvolvimento!\n\nPor enquanto, use a opção "Exportar CSV" para salvar seus dados.');
}

function showMessageContas(text, type) {
    const message = document.getElementById('messageContas');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== PÁGINA DE LAVOURAS ==========
const lavouraForm = document.getElementById('lavouraForm');
if (lavouraForm) {
    loadLavouras();
    
    lavouraForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const lavoura = {
            id: Date.now(),
            nome: document.getElementById('lavouraName').value.trim(),
            cultura: document.getElementById('lavouraCultura').value,
            area: parseFloat(document.getElementById('lavouraArea').value),
            plantio: document.getElementById('lavouraPlantio').value,
            colheita: document.getElementById('lavouraColheita').value,
            irrigacao: document.getElementById('lavouraIrrigacao').value,
            ultimaRega: document.getElementById('lavouraUltimaRega').value,
            proximaRega: document.getElementById('lavouraProximaRega').value,
            obs: document.getElementById('lavouraObs').value.trim()
        };
        
        if (!lavoura.nome || !lavoura.cultura || !lavoura.area || !lavoura.plantio) {
            showMessageLavoura('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        let lavouras = JSON.parse(localStorage.getItem('lavouras')) || [];
        lavouras.push(lavoura);
        localStorage.setItem('lavouras', JSON.stringify(lavouras));
        
        lavouraForm.reset();
        loadLavouras();
        showMessageLavoura('Lavoura cadastrada com sucesso! 🌱', 'success');
    });
}

function loadLavouras() {
    const lavouras = JSON.parse(localStorage.getItem('lavouras')) || [];
    const tbody = document.getElementById('lavouraTableBody');
    const count = document.getElementById('lavouraCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (lavouras.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="8">Nenhuma lavoura cadastrada ainda</td></tr>';
        if (count) count.textContent = '0';
        return;
    }
    
    const hoje = new Date();
    
    lavouras.forEach(lav => {
        const plantioFormatado = new Date(lav.plantio + 'T00:00:00').toLocaleDateString('pt-BR');
        const colheitaFormatada = lav.colheita ? 
            new Date(lav.colheita + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
        const proximaRegaFormatada = lav.proximaRega ? 
            new Date(lav.proximaRega + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
        
        // Calcular status
        let status = '<span class="status-badge status-aguardando">Em cultivo</span>';
        if (lav.colheita) {
            const colheita = new Date(lav.colheita + 'T00:00:00');
            const diasRestantes = Math.floor((colheita - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes < 0) {
                status = '<span class="status-badge status-atrasado">Colheita atrasada</span>';
            } else if (diasRestantes <= 15) {
                status = `<span class="status-badge status-proximo">Colher em ${diasRestantes}d</span>`;
            }
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${lav.nome}</strong></td>
            <td>${lav.cultura}</td>
            <td>${lav.area} ha</td>
            <td>${plantioFormatado}</td>
            <td>${colheitaFormatada}</td>
            <td>${status}</td>
            <td>${proximaRegaFormatada}</td>
            <td>
                <button onclick="deleteLavoura(${lav.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (count) count.textContent = lavouras.length;
}

function deleteLavoura(id) {
    if (!confirm('Tem certeza que deseja excluir esta lavoura?')) return;
    
    let lavouras = JSON.parse(localStorage.getItem('lavouras')) || [];
    lavouras = lavouras.filter(l => l.id !== id);
    localStorage.setItem('lavouras', JSON.stringify(lavouras));
    
    loadLavouras();
    showMessageLavoura('Lavoura excluída com sucesso!', 'success');
}

function clearAllLavouras() {
    if (!confirm('Tem certeza que deseja apagar TODAS as lavouras? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('lavouras');
    loadLavouras();
    showMessageLavoura('Todas as lavouras foram removidas!', 'success');
}

function exportLavourasCSV() {
    const lavouras = JSON.parse(localStorage.getItem('lavouras')) || [];
    if (lavouras.length === 0) {
        alert('Nenhuma lavoura para exportar!');
        return;
    }
    
    let csv = 'Nome,Cultura,Área (ha),Data Plantio,Previsão Colheita,Irrigação\n';
    lavouras.forEach(l => {
        csv += `"${l.nome}","${l.cultura}","${l.area}","${l.plantio}","${l.colheita || ''}","${l.irrigacao}"\n`;
    });
    
    downloadCSV(csv, 'lavouras.csv');
}

function showMessageLavoura(text, type) {
    const message = document.getElementById('messageLavoura');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== ESTOQUE DE INSUMOS ==========
const insumoForm = document.getElementById('insumoForm');
if (insumoForm) {
    loadInsumos();
    
    insumoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const insumo = {
            id: Date.now(),
            nome: document.getElementById('insumoNome').value.trim(),
            tipo: document.getElementById('insumoTipo').value,
            quantidade: parseFloat(document.getElementById('insumoQuantidade').value),
            unidade: document.getElementById('insumoUnidade').value
        };
        
        if (!insumo.nome || !insumo.tipo || !insumo.quantidade) {
            showMessageInsumo('Preencha todos os campos!', 'error');
            return;
        }
        
        let insumos = JSON.parse(localStorage.getItem('insumos')) || [];
        insumos.push(insumo);
        localStorage.setItem('insumos', JSON.stringify(insumos));
        
        insumoForm.reset();
        loadInsumos();
        showMessageInsumo('Insumo adicionado ao estoque! 📦', 'success');
    });
}

function loadInsumos() {
    const insumos = JSON.parse(localStorage.getItem('insumos')) || [];
    const tbody = document.getElementById('insumoTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (insumos.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="4">Nenhum insumo cadastrado</td></tr>';
        return;
    }
    
    insumos.forEach(ins => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${ins.nome}</strong></td>
            <td>${ins.tipo}</td>
            <td>${ins.quantidade} ${ins.unidade}</td>
            <td>
                <button onclick="deleteInsumo(${ins.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteInsumo(id) {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) return;
    
    let insumos = JSON.parse(localStorage.getItem('insumos')) || [];
    insumos = insumos.filter(i => i.id !== id);
    localStorage.setItem('insumos', JSON.stringify(insumos));
    
    loadInsumos();
    showMessageInsumo('Insumo excluído!', 'success');
}

function showMessageInsumo(text, type) {
    const message = document.getElementById('messageInsumo');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== CONTINUA NA PARTE 4 ==========
// ========== PÁGINA DE MÁQUINAS ==========
const maquinaForm = document.getElementById('maquinaForm');
if (maquinaForm) {
    loadMaquinas();
    loadMaquinasSelect();
    loadManutencoes();
    
    maquinaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const maquina = {
            id: Date.now(),
            nome: document.getElementById('maquinaNome').value.trim(),
            tipo: document.getElementById('maquinaTipo').value,
            ano: document.getElementById('maquinaAno').value,
            placa: document.getElementById('maquinaPlaca').value.trim(),
            horas: parseFloat(document.getElementById('maquinaHoras').value) || 0,
            ultimaManutencao: document.getElementById('maquinaUltimaManutencao').value,
            proximaManutencao: document.getElementById('maquinaProximaManutencao').value,
            status: document.getElementById('maquinaStatus').value,
            obs: document.getElementById('maquinaObs').value.trim()
        };
        
        if (!maquina.nome || !maquina.tipo) {
            showMessageMaquina('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        let maquinas = JSON.parse(localStorage.getItem('maquinas')) || [];
        maquinas.push(maquina);
        localStorage.setItem('maquinas', JSON.stringify(maquinas));
        
        maquinaForm.reset();
        loadMaquinas();
        loadMaquinasSelect();
        showMessageMaquina('Máquina cadastrada com sucesso! 🚜', 'success');
    });
}

function loadMaquinas() {
    const maquinas = JSON.parse(localStorage.getItem('maquinas')) || [];
    const tbody = document.getElementById('maquinaTableBody');
    const count = document.getElementById('maquinaCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (maquinas.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">Nenhuma máquina cadastrada ainda</td></tr>';
        if (count) count.textContent = '0';
        return;
    }
    
    const hoje = new Date();
    
    maquinas.forEach(maq => {
        const proximaManutFormatada = maq.proximaManutencao ? 
            new Date(maq.proximaManutencao + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
        
        let statusBadge = '';
        if (maq.status === 'Operacional') {
            statusBadge = '<span class="status-badge" style="background: #e8f5e9; color: #2e7d32;">✅ Operacional</span>';
        } else if (maq.status === 'Manutenção') {
            statusBadge = '<span class="status-badge" style="background: #fff3cd; color: #856404;">🔧 Manutenção</span>';
        } else {
            statusBadge = '<span class="status-badge status-atrasado">⛔ Parado</span>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${maq.nome}</strong></td>
            <td>${maq.tipo}</td>
            <td>${maq.ano || '-'}</td>
            <td>${maq.horas ? maq.horas + ' h' : '-'}</td>
            <td>${statusBadge}</td>
            <td>${proximaManutFormatada}</td>
            <td>
                <button onclick="deleteMaquina(${maq.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (count) count.textContent = maquinas.length;
}

function loadMaquinasSelect() {
    const select = document.getElementById('manutencaoMaquina');
    if (!select) return;
    
    const maquinas = JSON.parse(localStorage.getItem('maquinas')) || [];
    
    select.innerHTML = '<option value="">Selecione uma máquina</option>';
    
    maquinas.forEach(maq => {
        const option = document.createElement('option');
        option.value = maq.nome;
        option.textContent = `${maq.nome} (${maq.tipo})`;
        select.appendChild(option);
    });
}

function deleteMaquina(id) {
    if (!confirm('Tem certeza que deseja excluir esta máquina?')) return;
    
    let maquinas = JSON.parse(localStorage.getItem('maquinas')) || [];
    maquinas = maquinas.filter(m => m.id !== id);
    localStorage.setItem('maquinas', JSON.stringify(maquinas));
    
    loadMaquinas();
    loadMaquinasSelect();
    showMessageMaquina('Máquina excluída com sucesso!', 'success');
}

function clearAllMaquinas() {
    if (!confirm('Tem certeza que deseja apagar TODAS as máquinas? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('maquinas');
    loadMaquinas();
    loadMaquinasSelect();
    showMessageMaquina('Todas as máquinas foram removidas!', 'success');
}

function exportMaquinasCSV() {
    const maquinas = JSON.parse(localStorage.getItem('maquinas')) || [];
    if (maquinas.length === 0) {
        alert('Nenhuma máquina para exportar!');
        return;
    }
    
    let csv = 'Nome,Tipo,Ano,Placa,Horas,Status,Última Manutenção,Próxima Manutenção\n';
    maquinas.forEach(m => {
        csv += `"${m.nome}","${m.tipo}","${m.ano || ''}","${m.placa || ''}","${m.horas}","${m.status}","${m.ultimaManutencao || ''}","${m.proximaManutencao || ''}"\n`;
    });
    
    downloadCSV(csv, 'maquinas.csv');
}

function showMessageMaquina(text, type) {
    const message = document.getElementById('messageMaquina');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== MANUTENÇÕES ==========
const manutencaoForm = document.getElementById('manutencaoForm');
if (manutencaoForm) {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('manutencaoData').value = hoje;
    
    manutencaoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const manutencao = {
            id: Date.now(),
            maquina: document.getElementById('manutencaoMaquina').value,
            data: document.getElementById('manutencaoData').value,
            custo: parseFloat(document.getElementById('manutencaoCusto').value) || 0,
            descricao: document.getElementById('manutencaoDescricao').value.trim()
        };
        
        if (!manutencao.maquina || !manutencao.data || !manutencao.descricao) {
            showMessageManutencao('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        let manutencoes = JSON.parse(localStorage.getItem('manutencoes')) || [];
        manutencoes.push(manutencao);
        localStorage.setItem('manutencoes', JSON.stringify(manutencoes));
        
        manutencaoForm.reset();
        document.getElementById('manutencaoData').value = hoje;
        loadManutencoes();
        showMessageManutencao('Manutenção registrada! 🔧', 'success');
    });
}

function loadManutencoes() {
    const manutencoes = JSON.parse(localStorage.getItem('manutencoes')) || [];
    const tbody = document.getElementById('manutencaoTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (manutencoes.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">Nenhuma manutenção registrada</td></tr>';
        return;
    }
    
    manutencoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    manutencoes.forEach(man => {
        const dataFormatada = new Date(man.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const custoFormatado = man.custo > 0 ? 
            man.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td><strong>${man.maquina}</strong></td>
            <td>${man.descricao}</td>
            <td>${custoFormatado}</td>
            <td>
                <button onclick="deleteManutencao(${man.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteManutencao(id) {
    if (!confirm('Tem certeza que deseja excluir esta manutenção?')) return;
    
    let manutencoes = JSON.parse(localStorage.getItem('manutencoes')) || [];
    manutencoes = manutencoes.filter(m => m.id !== id);
    localStorage.setItem('manutencoes', JSON.stringify(manutencoes));
    
    loadManutencoes();
    showMessageManutencao('Manutenção excluída!', 'success');
}

function showMessageManutencao(text, type) {
    const message = document.getElementById('messageManutencao');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== PÁGINA DE FUNCIONÁRIOS ==========
const funcionarioForm = document.getElementById('funcionarioForm');
if (funcionarioForm) {
    loadFuncionarios();
    loadFuncionariosSelect();
    loadPresencas();
    
    funcionarioForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const funcionario = {
            id: Date.now(),
            nome: document.getElementById('funcNome').value.trim(),
            funcao: document.getElementById('funcFuncao').value,
            telefone: document.getElementById('funcTelefone').value.trim(),
            tipoPagamento: document.getElementById('funcTipoPagamento').value,
            valor: parseFloat(document.getElementById('funcValor').value),
            dataAdmissao: document.getElementById('funcDataAdmissao').value,
            status: document.getElementById('funcStatus').value,
            obs: document.getElementById('funcObs').value.trim()
        };
        
        if (!funcionario.nome || !funcionario.funcao || !funcionario.valor) {
            showMessageFuncionario('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        let funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
        funcionarios.push(funcionario);
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        
        funcionarioForm.reset();
        loadFuncionarios();
        loadFuncionariosSelect();
        showMessageFuncionario('Funcionário cadastrado com sucesso! 👨‍🌾', 'success');
    });
}

function loadFuncionarios() {
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    const tbody = document.getElementById('funcionarioTableBody');
    const count = document.getElementById('funcionarioCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (funcionarios.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">Nenhum funcionário cadastrado ainda</td></tr>';
        if (count) count.textContent = '0';
        return;
    }
    
    funcionarios.forEach(func => {
        const valorFormatado = func.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        let statusBadge = '';
        if (func.status === 'Ativo') {
            statusBadge = '<span class="status-badge" style="background: #e8f5e9; color: #2e7d32;">✅ Ativo</span>';
        } else if (func.status === 'Afastado') {
            statusBadge = '<span class="status-badge" style="background: #fff3cd; color: #856404;">⏸️ Afastado</span>';
        } else {
            statusBadge = '<span class="status-badge status-atrasado">❌ Demitido</span>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${func.nome}</strong></td>
            <td>${func.funcao}</td>
            <td>${func.telefone || '-'}</td>
            <td>${func.tipoPagamento}</td>
            <td>${valorFormatado}</td>
            <td>${statusBadge}</td>
            <td>
                <button onclick="deleteFuncionario(${func.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (count) count.textContent = funcionarios.length;
}

function loadFuncionariosSelect() {
    const select = document.getElementById('presencaFuncionario');
    if (!select) return;
    
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    const ativos = funcionarios.filter(f => f.status === 'Ativo');
    
    select.innerHTML = '<option value="">Selecione um funcionário</option>';
    
    ativos.forEach(func => {
        const option = document.createElement('option');
        option.value = func.nome;
        option.textContent = `${func.nome} (${func.funcao})`;
        select.appendChild(option);
    });
}

function deleteFuncionario(id) {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;
    
    let funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    funcionarios = funcionarios.filter(f => f.id !== id);
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    
    loadFuncionarios();
    loadFuncionariosSelect();
    showMessageFuncionario('Funcionário excluído com sucesso!', 'success');
}

function clearAllFuncionarios() {
    if (!confirm('Tem certeza que deseja apagar TODOS os funcionários? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('funcionarios');
    loadFuncionarios();
    loadFuncionariosSelect();
    showMessageFuncionario('Todos os funcionários foram removidos!', 'success');
}

function exportFuncionariosCSV() {
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    if (funcionarios.length === 0) {
        alert('Nenhum funcionário para exportar!');
        return;
    }
    
    let csv = 'Nome,Função,Telefone,Tipo Pagamento,Valor,Status,Data Admissão\n';
    funcionarios.forEach(f => {
        csv += `"${f.nome}","${f.funcao}","${f.telefone || ''}","${f.tipoPagamento}","${f.valor}","${f.status}","${f.dataAdmissao || ''}"\n`;
    });
    
    downloadCSV(csv, 'funcionarios.csv');
}

function showMessageFuncionario(text, type) {
    const message = document.getElementById('messageFuncionario');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== PRESENÇA ==========
const presencaForm = document.getElementById('presencaForm');
if (presencaForm) {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('presencaData').value = hoje;
    
    presencaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const presenca = {
            id: Date.now(),
            funcionario: document.getElementById('presencaFuncionario').value,
            data: document.getElementById('presencaData').value,
            tipo: document.getElementById('presencaTipo').value
        };
        
        if (!presenca.funcionario || !presenca.data) {
            showMessagePresenca('Preencha todos os campos!', 'error');
            return;
        }
        
        let presencas = JSON.parse(localStorage.getItem('presencas')) || [];
        presencas.push(presenca);
        localStorage.setItem('presencas', JSON.stringify(presencas));
        
        presencaForm.reset();
        document.getElementById('presencaData').value = hoje;
        loadPresencas();
        showMessagePresenca('Presença registrada! 📅', 'success');
    });
}

function loadPresencas() {
    const presencas = JSON.parse(localStorage.getItem('presencas')) || [];
    const tbody = document.getElementById('presencaTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (presencas.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="4">Nenhum registro de presença</td></tr>';
        return;
    }
    
    presencas.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 20);
    
    presencas.forEach(pres => {
        const dataFormatada = new Date(pres.data + 'T00:00:00').toLocaleDateString('pt-BR');
        
        let tipoBadge = '';
        if (pres.tipo === 'Presente') {
            tipoBadge = '<span class="status-badge" style="background: #e8f5e9; color: #2e7d32;">✅ Presente</span>';
        } else if (pres.tipo === 'Folga') {
            tipoBadge = '<span class="status-badge" style="background: #e3f2fd; color: #1976d2;">🏖️ Folga</span>';
        } else {
            tipoBadge = '<span class="status-badge status-atrasado">❌ Falta</span>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td><strong>${pres.funcionario}</strong></td>
            <td>${tipoBadge}</td>
            <td>
                <button onclick="deletePresenca(${pres.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deletePresenca(id) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    let presencas = JSON.parse(localStorage.getItem('presencas')) || [];
    presencas = presencas.filter(p => p.id !== id);
    localStorage.setItem('presencas', JSON.stringify(presencas));
    
    loadPresencas();
    showMessagePresenca('Registro excluído!', 'success');
}

function showMessagePresenca(text, type) {
    const message = document.getElementById('messagePresenca');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== CONTINUA NA PARTE 5 FINAL ==========
// ========== PÁGINA DE AGENDA E TAREFAS ==========
const tarefaForm = document.getElementById('tarefaForm');
if (tarefaForm) {
    loadTarefas();
    loadLembretes();
    loadBlocoNotas();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('tarefaData').value = hoje;
    
    tarefaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tarefa = {
            id: Date.now(),
            titulo: document.getElementById('tarefaTitulo').value.trim(),
            data: document.getElementById('tarefaData').value,
            prioridade: document.getElementById('tarefaPrioridade').value,
            descricao: document.getElementById('tarefaDescricao').value.trim(),
            status: 'Pendente'
        };
        
        if (!tarefa.titulo || !tarefa.data) {
            showMessageTarefa('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
        tarefas.push(tarefa);
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
        
        tarefaForm.reset();
        document.getElementById('tarefaData').value = hoje;
        loadTarefas();
        showMessageTarefa('Tarefa adicionada com sucesso! 📅', 'success');
    });
}

function loadTarefas() {
    const tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    const container = document.getElementById('tasksContainer');
    const count = document.getElementById('tarefaCount');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    let filteredTarefas = tarefas;
    
    // Aplicar filtros
    const filterStatus = document.getElementById('filterTarefaStatus');
    const filterPrioridade = document.getElementById('filterTarefaPrioridade');
    
    if (filterStatus && filterStatus.value !== 'all') {
        filteredTarefas = filteredTarefas.filter(t => t.status === filterStatus.value);
    }
    
    if (filterPrioridade && filterPrioridade.value !== 'all') {
        filteredTarefas = filteredTarefas.filter(t => t.prioridade === filterPrioridade.value);
    }
    
    if (filteredTarefas.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma tarefa cadastrada</p>';
        if (count) count.textContent = '0';
        return;
    }
    
    // Ordenar por data
    filteredTarefas.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    filteredTarefas.forEach(tarefa => {
        const dataFormatada = new Date(tarefa.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const prioridadeClass = tarefa.prioridade.toLowerCase();
        const concluidaClass = tarefa.status === 'Concluída' ? ' concluida' : '';
        
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${prioridadeClass}${concluidaClass}`;
        taskCard.innerHTML = `
            <div class="task-info">
                <h4>${tarefa.titulo}</h4>
                <p>${dataFormatada} - ${tarefa.prioridade}</p>
                ${tarefa.descricao ? `<p style="font-size: 0.85rem; color: #666; margin-top: 5px;">${tarefa.descricao}</p>` : ''}
            </div>
            <div class="task-actions">
                ${tarefa.status === 'Pendente' ? 
                    `<button onclick="concluirTarefa(${tarefa.id})" class="btn btn-info" style="padding: 8px 15px; font-size: 0.85rem;">✓ Concluir</button>` : 
                    `<button onclick="reabrirTarefa(${tarefa.id})" class="btn btn-secondary" style="padding: 8px 15px; font-size: 0.85rem;">↻ Reabrir</button>`
                }
                <button onclick="deleteTarefa(${tarefa.id})" class="btn btn-delete">Excluir</button>
            </div>
        `;
        container.appendChild(taskCard);
    });
    
    if (count) count.textContent = filteredTarefas.length;
}

function filterTarefas() {
    loadTarefas();
}

function concluirTarefa(id) {
    let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.status = 'Concluída';
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
        loadTarefas();
        showMessageTarefa('Tarefa concluída! ✓', 'success');
    }
}

function reabrirTarefa(id) {
    let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.status = 'Pendente';
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
        loadTarefas();
        showMessageTarefa('Tarefa reaberta!', 'success');
    }
}

function deleteTarefa(id) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    tarefas = tarefas.filter(t => t.id !== id);
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    
    loadTarefas();
    showMessageTarefa('Tarefa excluída!', 'success');
}

function clearAllTarefas() {
    if (!confirm('Tem certeza que deseja limpar TODAS as tarefas? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('tarefas');
    loadTarefas();
    showMessageTarefa('Todas as tarefas foram removidas!', 'success');
}

function showMessageTarefa(text, type) {
    const message = document.getElementById('messageTarefa');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== LEMBRETES ==========
const lembreteForm = document.getElementById('lembreteForm');
if (lembreteForm) {
    lembreteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const lembrete = {
            id: Date.now(),
            texto: document.getElementById('lembreteTexto').value.trim(),
            categoria: document.getElementById('lembreteCategoria').value
        };
        
        if (!lembrete.texto) {
            showMessageLembrete('Digite o lembrete!', 'error');
            return;
        }
        
        let lembretes = JSON.parse(localStorage.getItem('lembretes')) || [];
        lembretes.push(lembrete);
        localStorage.setItem('lembretes', JSON.stringify(lembretes));
        
        lembreteForm.reset();
        loadLembretes();
        showMessageLembrete('Lembrete adicionado! 🔔', 'success');
    });
}

function loadLembretes() {
    const lembretes = JSON.parse(localStorage.getItem('lembretes')) || [];
    const container = document.getElementById('lembretesList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (lembretes.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum lembrete cadastrado</p>';
        return;
    }
    
    lembretes.forEach(lem => {
        const div = document.createElement('div');
        div.className = 'lembrete-item';
        div.innerHTML = `
            <div>
                <strong>${lem.categoria}</strong><br>
                <span>${lem.texto}</span>
            </div>
            <button onclick="deleteLembrete(${lem.id})" class="btn btn-delete">✕</button>
        `;
        container.appendChild(div);
    });
}

function deleteLembrete(id) {
    let lembretes = JSON.parse(localStorage.getItem('lembretes')) || [];
    lembretes = lembretes.filter(l => l.id !== id);
    localStorage.setItem('lembretes', JSON.stringify(lembretes));
    
    loadLembretes();
    showMessageLembrete('Lembrete excluído!', 'success');
}

function showMessageLembrete(text, type) {
    const message = document.getElementById('messageLembrete');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== BLOCO DE ANOTAÇÕES ==========
function loadBlocoNotas() {
    const blocoNotas = document.getElementById('blocoNotas');
    if (!blocoNotas) return;
    
    const notas = localStorage.getItem('blocoNotas') || '';
    blocoNotas.value = notas;
    
    // Auto-save a cada 2 segundos
    blocoNotas.addEventListener('input', function() {
        clearTimeout(blocoNotas.saveTimeout);
        blocoNotas.saveTimeout = setTimeout(() => {
            localStorage.setItem('blocoNotas', blocoNotas.value);
            const indicator = document.getElementById('autoSaveIndicator');
            if (indicator) {
                indicator.textContent = '✓ Salvo automaticamente';
                indicator.style.color = '#4caf50';
                setTimeout(() => {
                    indicator.textContent = 'Salvamento automático ativo';
                    indicator.style.color = '#999';
                }, 2000);
            }
        }, 2000);
    });
}

function clearNotas() {
    if (!confirm('Tem certeza que deseja limpar todas as anotações?')) return;
    
    localStorage.removeItem('blocoNotas');
    const blocoNotas = document.getElementById('blocoNotas');
    if (blocoNotas) blocoNotas.value = '';
    alert('Anotações limpas!');
}

// ========== PÁGINA DE FERRAMENTAS ==========

// Calculadora
let calcValue = '';

function calcInput(value) {
    calcValue += value;
    document.getElementById('calcDisplay').value = calcValue;
}

function calcEqual() {
    try {
        calcValue = eval(calcValue).toString();
        document.getElementById('calcDisplay').value = calcValue;
    } catch {
        document.getElementById('calcDisplay').value = 'Erro';
        calcValue = '';
    }
}

function calcClear() {
    calcValue = '';
    document.getElementById('calcDisplay').value = '';
}

// Ganho de Peso
function calcGanhoPeso() {
    const pesoInicial = parseFloat(document.getElementById('pesoInicial').value);
    const pesoFinal = parseFloat(document.getElementById('pesoFinal').value);
    const dias = parseInt(document.getElementById('diasPeso').value);
    
    if (!pesoInicial || !pesoFinal || !dias || dias <= 0) {
        alert('Preencha todos os campos corretamente!');
        return;
    }
    
    if (pesoFinal <= pesoInicial) {
        alert('O peso final deve ser maior que o inicial!');
        return;
    }
    
    const ganhoTotal = pesoFinal - pesoInicial;
    const ganhoDiario = ganhoTotal / dias;
    
    document.getElementById('ganhoDiario').textContent = ganhoDiario.toFixed(2);
    document.getElementById('ganhoTotal').textContent = ganhoTotal.toFixed(2);
    document.getElementById('resultadoGanhoPeso').style.display = 'block';
}

// Conversores
function convertArroba() {
    const arrobas = parseFloat(document.getElementById('arrobas').value) || 0;
    document.getElementById('kilos').value = (arrobas * 15).toFixed(2);
}

function convertKilos() {
    const kilos = parseFloat(document.getElementById('kilos').value) || 0;
    document.getElementById('arrobas').value = (kilos / 15).toFixed(2);
}

function convertHectares() {
    const hectares = parseFloat(document.getElementById('hectares').value) || 0;
    document.getElementById('metros').value = (hectares * 10000).toFixed(0);
}

function convertMetros() {
    const metros = parseFloat(document.getElementById('metros').value) || 0;
    document.getElementById('hectares').value = (metros / 10000).toFixed(4);
}

// Consumo de Água
function calcConsumoAgua() {
    const numAnimais = parseInt(document.getElementById('numAnimaisAgua').value);
    const consumoPorAnimal = parseFloat(document.getElementById('consumoPorAnimal').value);
    const dias = parseInt(document.getElementById('diasAgua').value);
    
    if (!numAnimais || !consumoPorAnimal || !dias) {
        alert('Preencha todos os campos!');
        return;
    }
    
    const consumoDiario = numAnimais * consumoPorAnimal;
    const consumoTotal = consumoDiario * dias;
    
    document.getElementById('consumoDiario').textContent = consumoDiario.toFixed(1);
    document.getElementById('consumoTotal').textContent = consumoTotal.toFixed(1);
    document.getElementById('resultadoAgua').style.display = 'block';
}

// Cálculo de Ração
function calcRacao() {
    const numAnimais = parseInt(document.getElementById('numAnimaisRacao').value);
    const racaoPorAnimal = parseFloat(document.getElementById('racaoPorAnimal').value);
    const dias = parseInt(document.getElementById('diasRacao').value);
    const preco = parseFloat(document.getElementById('precoRacao').value) || 0;
    
    if (!numAnimais || !racaoPorAnimal || !dias) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    
    const racaoDiaria = numAnimais * racaoPorAnimal;
    const totalRacao = racaoDiaria * dias;
    const custoTotal = totalRacao * preco;
    
    document.getElementById('racaoDiaria').textContent = racaoDiaria.toFixed(1);
    document.getElementById('totalRacao').textContent = totalRacao.toFixed(1);
    document.getElementById('custoRacao').textContent = 
        custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('resultadoRacao').style.display = 'block';
}

// ========== REGISTRO CLIMÁTICO ==========
const climaForm = document.getElementById('climaForm');
if (climaForm) {
    loadClimas();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('climaData').value = hoje;
    
    climaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const clima = {
            id: Date.now(),
            data: document.getElementById('climaData').value,
            tempMin: parseFloat(document.getElementById('tempMin').value) || 0,
            tempMax: parseFloat(document.getElementById('tempMax').value) || 0,
            chuva: parseFloat(document.getElementById('chuva').value) || 0,
            vento: document.getElementById('vento').value,
            condicao: document.getElementById('condicao').value
        };
        
        if (!clima.data) {
            showMessageClima('Selecione a data!', 'error');
            return;
        }
        
        let climas = JSON.parse(localStorage.getItem('climas')) || [];
        climas.push(clima);
        localStorage.setItem('climas', JSON.stringify(climas));
        
        climaForm.reset();
        document.getElementById('climaData').value = hoje;
        loadClimas();
        showMessageClima('Registro climático adicionado! 🌡️', 'success');
    });
}

function loadClimas() {
    const climas = JSON.parse(localStorage.getItem('climas')) || [];
    const tbody = document.getElementById('climaTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (climas.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">Nenhum registro climático</td></tr>';
        return;
    }
    
    climas.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 15);
    
    climas.forEach(clima => {
        const dataFormatada = new Date(clima.data + 'T00:00:00').toLocaleDateString('pt-BR');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${clima.tempMin}°C / ${clima.tempMax}°C</td>
            <td>${clima.chuva} mm</td>
            <td>${clima.condicao}</td>
            <td>
                <button onclick="deleteClima(${clima.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteClima(id) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    let climas = JSON.parse(localStorage.getItem('climas')) || [];
    climas = climas.filter(c => c.id !== id);
    localStorage.setItem('climas', JSON.stringify(climas));
    
    loadClimas();
    showMessageClima('Registro excluído!', 'success');
}

function showMessageClima(text, type) {
    const message = document.getElementById('messageClima');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== FUNÇÕES AUXILIARES ==========

// Download CSV
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ========== VERIFICAR AUTENTICAÇÃO AO CARREGAR QUALQUER PÁGINA ==========
checkAuth();

// ========== FIM DO SCRIPT ==========
console.log('🌾 Sistema Porteira Preta carregado com sucesso!');
