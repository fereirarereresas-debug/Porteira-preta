// ========================================
// PORTEIRA PRETA - SISTEMA RURAL PROFISSIONAL
// JAVASCRIPT COMPLETO
// © 2025 Porteira Preta
// ========================================

// ========== VERIFICAÇÃO DE AUTENTICAÇÃO ==========
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    if (!isLoggedIn && !currentPage.includes('index.html') && currentPage !== '/') {
        window.location.href = 'index.html';
    }
}

// Executar verificação ao carregar página
if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
    checkAuth();
}

// ========== LOGIN ==========
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMessage = document.getElementById('errorMessage');
        
        // Credenciais de acesso
        if (username === 'Porteira Preta' && password === '26122008') {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = '❌ Usuário ou senha incorretos!';
            errorMessage.style.display = 'block';
            
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
}

// ========== LOGOUT ==========
function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// ========== MENU LATERAL ==========
function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (sideMenu && menuOverlay) {
        sideMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    }
}

// ========== FUNÇÕES AUXILIARES ==========
function calculateAge(birthDate) {
    if (!birthDate) return 'N/I';
    
    const birth = new Date(birthDate + 'T00:00:00');
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
        return `${diffDays} dias`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        return months > 0 ? `${years}a ${months}m` : `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ========== GESTÃO DE ANIMAIS ==========
const animalForm = document.getElementById('animalForm');
if (animalForm) {
    loadAnimals();
    updateAnimalStats();
    
    animalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const animal = {
            id: Date.now(),
            name: document.getElementById('animalName').value.trim(),
            type: document.getElementById('animalType').value,
            race: document.getElementById('animalRace').value,
            birth: document.getElementById('animalBirth').value,
            age: calculateAge(document.getElementById('animalBirth').value),
            weight: parseFloat(document.getElementById('animalWeight').value) || 0,
            gender: document.getElementById('animalGender').value,
            photo: document.getElementById('animalPhoto').value.trim(),
            mae: document.getElementById('animalMae').value.trim(),
            pai: document.getElementById('animalPai').value.trim(),
            obs: document.getElementById('animalObs').value.trim()
        };
        
        let animals = JSON.parse(localStorage.getItem('animals')) || [];
        animals.push(animal);
        localStorage.setItem('animals', JSON.stringify(animals));
        
        animalForm.reset();
        loadAnimals();
        updateAnimalStats();
        showMessage('Animal cadastrado com sucesso! 🐄', 'success');
    });
}

function loadAnimals() {
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const tbody = document.getElementById('animalTableBody');
    const count = document.getElementById('animalCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (animals.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="8">
                    <div class="empty-state-content">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <h3>Nenhum animal cadastrado</h3>
                        <p>Comece cadastrando seu primeiro animal usando o formulário acima</p>
                    </div>
                </td>
            </tr>
        `;
        if (count) count.textContent = '0 animais';
        return;
    }
    
    animals.forEach(animal => {
        const row = document.createElement('tr');
        
        const photoCell = document.createElement('td');
        if (animal.photo) {
            photoCell.innerHTML = `<img src="${animal.photo}" alt="${animal.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">`;
        } else {
            photoCell.innerHTML = `<div style="width: 50px; height: 50px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">🐄</div>`;
        }
        row.appendChild(photoCell);
        
        row.innerHTML += `
            <td><strong>${animal.name}</strong></td>
            <td>${animal.type}</td>
            <td>${animal.race || '-'}</td>
            <td>${animal.age}</td>
            <td>${animal.weight ? animal.weight + ' kg' : '-'}</td>
            <td>${animal.gender || '-'}</td>
            <td>
                <button onclick="deleteAnimal(${animal.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    if (count) count.textContent = `${animals.length} ${animals.length === 1 ? 'animal' : 'animais'}`;
}

function updateAnimalStats() {
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    
    const total = animals.length;
    const vacas = animals.filter(a => a.type.toLowerCase().includes('vaca')).length;
    const bezerros = animals.filter(a => a.type.toLowerCase().includes('bezerr')).length;
    
    const pesosValidos = animals.filter(a => a.weight > 0);
    const pesoMedio = pesosValidos.length > 0 
        ? pesosValidos.reduce((sum, a) => sum + a.weight, 0) / pesosValidos.length 
        : 0;
    
    if (document.getElementById('totalAnimaisCount')) {
        document.getElementById('totalAnimaisCount').textContent = total;
    }
    if (document.getElementById('vacasCount')) {
        document.getElementById('vacasCount').textContent = vacas;
    }
    if (document.getElementById('bezerrosCount')) {
        document.getElementById('bezerrosCount').textContent = bezerros;
    }
    if (document.getElementById('pesoMedio')) {
        document.getElementById('pesoMedio').textContent = pesoMedio.toFixed(0) + ' kg';
    }
}

function deleteAnimal(id) {
    if (!confirm('Tem certeza que deseja excluir este animal?')) return;
    
    let animals = JSON.parse(localStorage.getItem('animals')) || [];
    animals = animals.filter(a => a.id !== id);
    localStorage.setItem('animals', JSON.stringify(animals));
    
    loadAnimals();
    updateAnimalStats();
    showMessage('Animal excluído com sucesso!', 'success');
}

function filterAnimals() {
    const filterType = document.getElementById('filterType').value.toLowerCase();
    const searchTerm = document.getElementById('searchAnimal').value.toLowerCase();
    
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const tbody = document.getElementById('animalTableBody');
    
    const filtered = animals.filter(animal => {
        const matchType = !filterType || animal.type.toLowerCase().includes(filterType);
        const matchSearch = !searchTerm || 
            animal.name.toLowerCase().includes(searchTerm) ||
            (animal.race && animal.race.toLowerCase().includes(searchTerm));
        
        return matchType && matchSearch;
    });
    
    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="8">Nenhum animal encontrado</td></tr>';
        return;
    }
    
    filtered.forEach(animal => {
        const row = document.createElement('tr');
        
        const photoCell = document.createElement('td');
        if (animal.photo) {
            photoCell.innerHTML = `<img src="${animal.photo}" alt="${animal.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">`;
        } else {
            photoCell.innerHTML = `<div style="width: 50px; height: 50px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">🐄</div>`;
        }
        row.appendChild(photoCell);
        
        row.innerHTML += `
            <td><strong>${animal.name}</strong></td>
            <td>${animal.type}</td>
            <td>${animal.race || '-'}</td>
            <td>${animal.age}</td>
            <td>${animal.weight ? animal.weight + ' kg' : '-'}</td>
            <td>${animal.gender || '-'}</td>
            <td>
                <button onclick="deleteAnimal(${animal.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function resetFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('searchAnimal').value = '';
    loadAnimals();
}

function clearAllAnimals() {
    if (!confirm('Tem certeza que deseja excluir TODOS os animais? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('animals');
    loadAnimals();
    updateAnimalStats();
    showMessage('Todos os animais foram removidos!', 'success');
}

function exportAnimalsCSV() {
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    
    if (animals.length === 0) {
        alert('Nenhum animal para exportar!');
        return;
    }
    
    let csv = 'Nome,Tipo,Raça,Data Nascimento,Idade,Peso,Sexo,Observações\n';
    
    animals.forEach(animal => {
        csv += `"${animal.name}","${animal.type}","${animal.race || ''}","${animal.birth || ''}","${animal.age}","${animal.weight || ''}","${animal.gender || ''}","${animal.obs || ''}"\n`;
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

// ========== PRODUÇÃO DE LEITE ==========
const leiteForm = document.getElementById('leiteForm');
if (leiteForm) {
    loadLeite();
    updateLeiteStats();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataLeite').value = hoje;
    
    leiteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const leite = {
            id: Date.now(),
            data: document.getElementById('dataLeite').value,
            periodo: document.getElementById('periodoLeite').value,
            litros: parseFloat(document.getElementById('litrosLeite').value),
            vacas: parseInt(document.getElementById('vacasLeite').value) || 0,
            obs: document.getElementById('obsLeite').value.trim()
        };
        
        let producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
        producaoLeite.push(leite);
        localStorage.setItem('producaoLeite', JSON.stringify(producaoLeite));
        
        leiteForm.reset();
        document.getElementById('dataLeite').value = hoje;
        loadLeite();
        updateLeiteStats();
        showMessageLeite('Produção de leite registrada com sucesso! 🥛', 'success');
    });
}

function loadLeite() {
    const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    const tbody = document.getElementById('leiteTableBody');
    const count = document.getElementById('leiteCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (producaoLeite.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6"><div class="empty-state-content"><h3>Nenhuma produção registrada</h3><p>Comece registrando a primeira produção de leite</p></div></td></tr>';
        if (count) count.textContent = '0 registros';
        return;
    }
    
    producaoLeite.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    producaoLeite.forEach(leite => {
        const dataFormatada = formatDate(leite.data);
        const mediaVaca = leite.vacas > 0 ? (leite.litros / leite.vacas).toFixed(1) : '-';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${leite.periodo}</td>
            <td><strong>${leite.litros.toFixed(1)} L</strong></td>
            <td>${leite.vacas || '-'}</td>
            <td>${mediaVaca}${mediaVaca !== '-' ? ' L' : ''}</td>
            <td>
                <button onclick="deleteLeite(${leite.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (count) count.textContent = `${producaoLeite.length} ${producaoLeite.length === 1 ? 'registro' : 'registros'}`;
}

function updateLeiteStats() {
    const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    const hoje = new Date().toISOString().split('T')[0];
    const mesAtual = hoje.substring(0, 7);
    
    const leiteHoje = producaoLeite
        .filter(l => l.data === hoje)
        .reduce((sum, l) => sum + l.litros, 0);
    
    const leiteMes = producaoLeite
        .filter(l => l.data.startsWith(mesAtual))
        .reduce((sum, l) => sum + l.litros, 0);
    
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const vacas = animals.filter(a => a.type.toLowerCase().includes('vaca')).length;
    
    const mediaVaca = vacas > 0 ? (leiteHoje / vacas).toFixed(1) : 0;
    
    const precoLitro = 2.50; // Preço estimado por litro
    const receitaMes = leiteMes * precoLitro;
    
    if (document.getElementById('leiteHoje')) {
        document.getElementById('leiteHoje').textContent = leiteHoje.toFixed(1) + ' L';
    }
    if (document.getElementById('leiteMes')) {
        document.getElementById('leiteMes').textContent = leiteMes.toFixed(1) + ' L';
    }
    if (document.getElementById('mediaVaca')) {
        document.getElementById('mediaVaca').textContent = mediaVaca + ' L';
    }
    if (document.getElementById('receitaLeite')) {
        document.getElementById('receitaLeite').textContent = formatCurrency(receitaMes);
    }
}

function deleteLeite(id) {
    if (!confirm('Excluir este registro de produção?')) return;
    
    let producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    producaoLeite = producaoLeite.filter(l => l.id !== id);
    localStorage.setItem('producaoLeite', JSON.stringify(producaoLeite));
    
    loadLeite();
    updateLeiteStats();
    showMessageLeite('Registro excluído!', 'success');
}

function clearAllLeite() {
    if (!confirm('Excluir TODOS os registros de produção?')) return;
    
    localStorage.removeItem('producaoLeite');
    loadLeite();
    updateLeiteStats();
    showMessageLeite('Todos os registros foram removidos!', 'success');
}

function exportLeiteCSV() {
    const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    
    if (producaoLeite.length === 0) {
        alert('Nenhum registro para exportar!');
        return;
    }
    
    let csv = 'Data,Período,Litros,Nº Vacas,Média/Vaca\n';
    
    producaoLeite.forEach(l => {
        const mediaVaca = l.vacas > 0 ? (l.litros / l.vacas).toFixed(1) : '';
        csv += `"${l.data}","${l.periodo}","${l.litros}","${l.vacas || ''}","${mediaVaca}"\n`;
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

// ========== CONTROLE FINANCEIRO ==========
const contaForm = document.getElementById('contaForm');
if (contaForm) {
    loadContas();
    updateContasStats();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataConta').value = hoje;
    
    contaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const conta = {
            id: Date.now(),
            tipo: document.getElementById('tipoConta').value,
            descricao: document.getElementById('descricaoConta').value.trim(),
            valor: parseFloat(document.getElementById('valorConta').value),
            data: document.getElementById('dataConta').value,
            categoria: document.getElementById('categoriaConta').value,
            formaPagamento: document.getElementById('formaPagamento').value,
            obs: document.getElementById('obsConta').value.trim()
        };
        
        let contas = JSON.parse(localStorage.getItem('contas')) || [];
        contas.push(conta);
        localStorage.setItem('contas', JSON.stringify(contas));
        
        contaForm.reset();
        document.getElementById('dataConta').value = hoje;
        document.getElementById('tipoConta').value = 'receita';
        loadContas();
        updateContasStats();
        showMessageConta('Lançamento registrado com sucesso! 💰', 'success');
    });
}

function loadContas() {
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const tbody = document.getElementById('contaTableBody');
    const count = document.getElementById('contaCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (contas.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7"><div class="empty-state-content"><h3>Nenhum lançamento financeiro</h3><p>Comece registrando sua primeira receita ou despesa</p></div></td></tr>';
        if (count) count.textContent = '0 lançamentos';
        return;
    }
    
    contas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    contas.forEach(conta => {
        const dataFormatada = formatDate(conta.data);
        const tipoIcon = conta.tipo === 'receita' ? '📈' : '📉';
        const tipoClass = conta.tipo === 'receita' ? 'text-success' : 'text-danger';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td><span style="font-size: 1.2rem;">${tipoIcon}</span> ${conta.tipo === 'receita' ? 'Receita' : 'Despesa'}</td>
            <td><strong>${conta.descricao}</strong></td>
            <td>${conta.categoria || '-'}</td>
            <td class="${tipoClass}" style="font-weight: 700; font-size: 1.1rem;">${formatCurrency(conta.valor)}</td>
            <td>${conta.formaPagamento || '-'}</td>
            <td>
                <button onclick="deleteConta(${conta.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (count) count.textContent = `${contas.length} ${contas.length === 1 ? 'lançamento' : 'lançamentos'}`;
}

function updateContasStats() {
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const hoje = new Date();
    const mesAtual = hoje.toISOString().substring(0, 7);
    
    let totalReceitas = 0;
    let totalDespesas = 0;
    let receitaMes = 0;
    let despesaMes = 0;
    
    contas.forEach(conta => {
        if (conta.tipo === 'receita') {
            totalReceitas += conta.valor;
            if (conta.data.startsWith(mesAtual)) {
                receitaMes += conta.valor;
            }
        } else {
            totalDespesas += conta.valor;
            if (conta.data.startsWith(mesAtual)) {
                despesaMes += conta.valor;
            }
        }
    });
    
    const saldo = totalReceitas - totalDespesas;
    const saldoMes = receitaMes - despesaMes;
    
    if (document.getElementById('saldoAtual')) {
        document.getElementById('saldoAtual').textContent = formatCurrency(saldo);
        document.getElementById('receitaTotal').textContent = formatCurrency(totalReceitas);
        document.getElementById('despesaTotal').textContent = formatCurrency(totalDespesas);
    }
    
    if (document.getElementById('receitaMes')) {
        document.getElementById('receitaMes').textContent = formatCurrency(receitaMes);
        document.getElementById('despesaMes').textContent = formatCurrency(despesaMes);
        document.getElementById('saldoMes').textContent = formatCurrency(saldoMes);
        document.getElementById('totalLancamentos').textContent = contas.length;
    }
}

function deleteConta(id) {
    if (!confirm('Excluir este lançamento?')) return;
    
    let contas = JSON.parse(localStorage.getItem('contas')) || [];
    contas = contas.filter(c => c.id !== id);
    localStorage.setItem('contas', JSON.stringify(contas));
    
    loadContas();
    updateContasStats();
    showMessageConta('Lançamento excluído!', 'success');
}

function clearAllContas() {
    if (!confirm('Excluir TODOS os lançamentos financeiros?')) return;
    
    localStorage.removeItem('contas');
    loadContas();
    updateContasStats();
    showMessageConta('Todos os lançamentos foram removidos!', 'success');
}

function exportContasCSV() {
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    
    if (contas.length === 0) {
        alert('Nenhum lançamento para exportar!');
        return;
    }
    
    let csv = 'Data,Tipo,Descrição,Categoria,Valor,Forma Pagamento\n';
    
    contas.forEach(c => {
        csv += `"${c.data}","${c.tipo}","${c.descricao}","${c.categoria || ''}","${c.valor}","${c.formaPagamento || ''}"\n`;
    });
    
    downloadCSV(csv, 'lancamentos_financeiros.csv');
}

function filterContas() {
    loadContas(); // Implementar filtros se necessário
}

function showMessageConta(text, type) {
    const message = document.getElementById('messageConta');
    if (!message) return;
    
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// ========== INSEMINAÇÃO ==========
const inseminacaoForm = document.getElementById('inseminacaoForm');
if (inseminacaoForm) {
    loadVacasInseminacao();
    loadInseminacoes();
    updateInseminacaoStats();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataInseminacao').value = hoje;
    
    // Calcular previsão de parto automaticamente (285 dias)
    document.getElementById('dataInseminacao').addEventListener('change', function() {
        const dataIA = new Date(this.value + 'T00:00:00');
        dataIA.setDate(dataIA.getDate() + 285);
        const previsao = dataIA.toISOString().split('T')[0];
        document.getElementById('previsaoParto').value = previsao;
    });
    
    inseminacaoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inseminacao = {
            id: Date.now(),
            vaca: document.getElementById('vacaInseminacao').value,
            dataIA: document.getElementById('dataInseminacao').value,
            boi: document.getElementById('boiInseminacao').value.trim(),
            raca: document.getElementById('racaBoi').value.trim(),
            tipo: document.getElementById('tipoInseminacao').value,
            previsaoParto: document.getElementById('previsaoParto').value,
            numeroIA: parseInt(document.getElementById('numeroIA').value) || 1,
            obs: document.getElementById('obsInseminacao').value.trim()
        };
        
        let inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
        inseminacoes.push(inseminacao);
        localStorage.setItem('inseminacoes', JSON.stringify(inseminacoes));
        
        inseminacaoForm.reset();
        document.getElementById('dataInseminacao').value = hoje;
        loadInseminacoes();
        updateInseminacaoStats();
        showMessageInseminacao('Inseminação registrada com sucesso! 🐮', 'success');
    });
}

function loadVacasInseminacao() {
    const select = document.getElementById('vacaInseminacao');
    if (!select) return;
    
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const vacas = animals.filter(a => 
        a.gender === 'Fêmea' && 
        (a.type.toLowerCase().includes('vaca') || a.type.toLowerCase().includes('novilha'))
    );
    
    select.innerHTML = '<option value="">Selecione a vaca</option>';
    
    vacas.forEach(vaca => {
        const option = document.createElement('option');
        option.value = vaca.name;
        option.textContent = `${vaca.name} (${vaca.type})`;
        select.appendChild(option);
    });
}

function loadInseminacoes() {
    const inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    const tbody = document.getElementById('inseminacaoTableBody');
    const count = document.getElementById('inseminacaoCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (inseminacoes.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="8"><div class="empty-state-content"><h3>Nenhuma inseminação registrada</h3><p>Comece registrando a primeira inseminação</p></div></td></tr>';
        if (count) count.textContent = '0 registros';
        return;
    }
    
    inseminacoes.sort((a, b) => new Date(b.dataIA) - new Date(a.dataIA));
    
    const hoje = new Date();
    
    inseminacoes.forEach(ins => {
        const dataIAFormatada = formatDate(ins.dataIA);
        const previsaoFormatada = formatDate(ins.previsaoParto);
        
        let status = '🟡 Gestação';
        if (ins.previsaoParto) {
            const previsao = new Date(ins.previsaoParto + 'T00:00:00');
            if (previsao < hoje) {
                status = '🔴 Parto Previsto';
            } else {
                const diasRestantes = Math.floor((previsao - hoje) / (1000 * 60 * 60 * 24));
                if (diasRestantes <= 30) {
                    status = `⚠️ ${diasRestantes} dias`;
                }
            }
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataIAFormatada}</td>
            <td><strong>${ins.vaca}</strong></td>
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
    
    if (count) count.textContent = `${inseminacoes.length} ${inseminacoes.length === 1 ? 'registro' : 'registros'}`;
    
    loadAlertasPartos();
}

function loadAlertasPartos() {
    const inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    const alertasDiv = document.getElementById('alertasPartos');
    
    if (!alertasDiv) return;
    
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 30);
    
    const partosProximos = inseminacoes.filter(ins => {
        if (!ins.previsaoParto) return false;
        const previsao = new Date(ins.previsaoParto + 'T00:00:00');
        return previsao >= hoje && previsao <= dataLimite;
    });
    
    if (partosProximos.length === 0) {
        alertasDiv.innerHTML = '<p class="empty-state-content" style="padding: 20px; text-align: center;">Nenhum parto previsto para os próximos 30 dias</p>';
        return;
    }
    
    alertasDiv.innerHTML = partosProximos.map(ins => {
        const previsao = new Date(ins.previsaoParto + 'T00:00:00');
        const diasRestantes = Math.floor((previsao - hoje) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="alert-item alert-warning">
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <strong>Parto Próximo: ${ins.vaca}</strong>
                    <p>Previsão: ${formatDate(ins.previsaoParto)} - Faltam ${diasRestantes} dias</p>
                </div>
            </div>
        `;
    }).join('');
}

function updateInseminacaoStats() {
    const inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    const hoje = new Date();
    
    const gestacoes = inseminacoes.filter(ins => {
        if (!ins.previsaoParto) return false;
        const previsao = new Date(ins.previsaoParto + 'T00:00:00');
        return previsao > hoje;
    });
    
    const partosProximos = gestacoes.filter(g => {
        const previsao = new Date(g.previsaoParto + 'T00:00:00');
        const diasRestantes = Math.floor((previsao - hoje) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 30;
    });
    
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const femeas = animals.filter(a => a.gender === 'Fêmea').length;
    const taxaPrenhez = femeas > 0 ? ((gestacoes.length / femeas) * 100) : 0;
    
    if (document.getElementById('totalInseminacoes')) {
        document.getElementById('totalInseminacoes').textContent = inseminacoes.length;
        document.getElementById('gestacoesAtivas').textContent = gestacoes.length;
        document.getElementById('partosProximos').textContent = partosProximos.length;
        document.getElementById('taxaPrenhez').textContent = taxaPrenhez.toFixed(1) + '%';
    }
}

function deleteInseminacao(id) {
    if (!confirm('Excluir este registro de inseminação?')) return;
    
    let inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    inseminacoes = inseminacoes.filter(i => i.id !== id);
    localStorage.setItem('inseminacoes', JSON.stringify(inseminacoes));
    
    loadInseminacoes();
    updateInseminacaoStats();
    showMessageInseminacao('Registro excluído!', 'success');
}

function clearAllInseminacoes() {
    if (!confirm('Excluir TODOS os registros?')) return;
    
    localStorage.removeItem('inseminacoes');
    loadInseminacoes();
    updateInseminacaoStats();
    showMessageInseminacao('Todos os registros foram removidos!', 'success');
}

function exportInseminacoesCSV() {
    const inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    
    if (inseminacoes.length === 0) {
        alert('Nenhum registro para exportar!');
        return;
    }
    
    let csv = 'Data IA,Vaca,Boi,Raça,Tipo,Previsão Parto\n';
    
    inseminacoes.forEach(i => {
        csv += `"${i.dataIA}","${i.vaca}","${i.boi}","${i.raca || ''}","${i.tipo}","${i.previsaoParto || ''}"\n`;
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

// ========== DASHBOARD ==========
if (window.location.pathname.includes('dashboard.html')) {
    loadDashboard();
}

function loadDashboard() {
    // Exibir data e hora atual
    const hoje = new Date();
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const dataFormatada = `${diasSemana[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
    
    if (document.getElementById('currentDateTime')) {
        document.getElementById('currentDateTime').textContent = dataFormatada;
    }
    
    updateDashboardStats();
    loadDashboardCharts();
    loadDashboardAlerts();
}

function updateDashboardStats() {
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
    const tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    const inseminacoes = JSON.parse(localStorage.getItem('inseminacoes')) || [];
    const nascimentos = JSON.parse(localStorage.getItem('nascimentos')) || [];
    const sanitarios = JSON.parse(localStorage.getItem('sanitarios')) || [];
    const piquetes = JSON.parse(localStorage.getItem('piquetes')) || [];
    
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    const anoAtual = hoje.getFullYear();
    
    // ANIMAIS
    const totalAnimais = animals.length;
    const vacas = animals.filter(a => a.type.toLowerCase().includes('vaca')).length;
    const bois = animals.filter(a => a.type.toLowerCase().includes('boi')).length;
    const bezerros = animals.filter(a => a.type.toLowerCase().includes('bezerr')).length;
    
    if (document.getElementById('totalAnimais')) {
        document.getElementById('totalAnimais').textContent = totalAnimais;
        document.getElementById('detailAnimais').textContent = `Vacas: ${vacas} | Bois: ${bois} | Bezerros: ${bezerros}`;
    }
    
    // FINANÇAS
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
    
    if (document.getElementById('saldoFinanceiro')) {
        document.getElementById('saldoFinanceiro').textContent = formatCurrency(saldo);
        document.getElementById('detailSaldo').textContent = `Receitas: ${formatCurrency(totalReceitas)} | Despesas: ${formatCurrency(totalDespesas)}`;
    }
    
    // LEITE
    const leiteHoje = producaoLeite
        .filter(l => l.data === hojeStr)
        .reduce((sum, l) => sum + l.litros, 0);
    
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 7);
    
    const leite7dias = producaoLeite.filter(l => {
        const data = new Date(l.data + 'T00:00:00');
        return data >= seteDiasAtras && data <= hoje;
    }).reduce((sum, l) => sum + l.litros, 0);
    
    if (document.getElementById('leiteHoje')) {
        document.getElementById('leiteHoje').textContent = leiteHoje.toFixed(1) + ' L';
        document.getElementById('detailLeite').textContent = `Últimos 7 dias: ${leite7dias.toFixed(1)} L`;
    }
    
    // TAREFAS
    const tarefasPendentes = tarefas.filter(t => t.status === 'Pendente');
    const tarefasAtrasadas = tarefasPendentes.filter(t => new Date(t.data + 'T00:00:00') < hoje);
    
    if (document.getElementById('tarefasPendentes')) {
        document.getElementById('tarefasPendentes').textContent = tarefasPendentes.length;
        document.getElementById('detalhesTarefas').textContent = tarefasAtrasadas.length > 0 
            ? `${tarefasAtrasadas.length} atrasadas` 
            : 'Todas em dia';
    }
    
    // GESTAÇÕES
    const gestacoes = inseminacoes.filter(ins => {
        if (!ins.previsaoParto) return false;
        const previsao = new Date(ins.previsaoParto + 'T00:00:00');
        return previsao > hoje;
    });
    
    const partosProximos = gestacoes.filter(g => {
        const previsao = new Date(g.previsaoParto + 'T00:00:00');
        const diasRestantes = Math.floor((previsao - hoje) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 30;
    });
    
    if (document.getElementById('gestacoesAtivas')) {
        document.getElementById('gestacoesAtivas').textContent = gestacoes.length;
        document.getElementById('detalhesGestacoes').textContent = `${partosProximos.length} partos em 30 dias`;
    }
    
    // SANITÁRIO
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 30);
    
    let acoesProximas = 0;
    sanitarios.forEach(s => {
        if (s.proximaDose) {
            const proxima = new Date(s.proximaDose + 'T00:00:00');
            if (proxima <= dataLimite && proxima >= hoje) acoesProximas++;
        }
        if (s.proximoVermifugo) {
            const proxima = new Date(s.proximoVermifugo + 'T00:00:00');
            if (proxima <= dataLimite && proxima >= hoje) acoesProximas++;
        }
    });
    
    const vacinasAno = sanitarios.filter(s => {
        const ano = new Date(s.data + 'T00:00:00').getFullYear();
        return ano === anoAtual && s.tipo === 'vacina';
    }).length;
    
    if (document.getElementById('acoesSanitarias')) {
        document.getElementById('acoesSanitarias').textContent = acoesProximas;
        document.getElementById('detalheSanitario').textContent = `${vacinasAno} vacinas este ano`;
    }
    
    // PIQUETES
    const piquetesOcupados = piquetes.filter(p => p.status === 'Ocupado').length;
    
    if (document.getElementById('totalPiquetes')) {
        document.getElementById('totalPiquetes').textContent = piquetes.length;
        document.getElementById('detalhesPiquetes').textContent = `${piquetesOcupados} ocupados`;
    }
    
    // NASCIMENTOS
    const nascimentosAno = nascimentos.filter(n => {
        const ano = new Date(n.dataNascimento + 'T00:00:00').getFullYear();
        return ano === anoAtual;
    }).length;
    
    const femeasAdultas = animals.filter(a => 
        a.gender === 'Fêmea' && 
        (a.type.toLowerCase().includes('vaca') || a.type.toLowerCase().includes('novilha'))
    ).length;
    
    const taxaNatalidade = femeasAdultas > 0 
        ? ((nascimentosAno / femeasAdultas) * 100) 
        : 0;
    
    if (document.getElementById('nascimentosAno')) {
        document.getElementById('nascimentosAno').textContent = nascimentosAno;
        document.getElementById('detalhesNascimentos').textContent = `Taxa: ${taxaNatalidade.toFixed(1)}%`;
    }
}

function loadDashboardCharts() {
    // Gráfico de Finanças
    const ctxFinancas = document.getElementById('chartFinancas');
    if (ctxFinancas) {
        const contas = JSON.parse(localStorage.getItem('contas')) || [];
        const { labels, receitas, despesas } = getLast6MonthsFinancialData(contas);
        
        new Chart(ctxFinancas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: receitas,
                        backgroundColor: 'rgba(76, 175, 80, 0.7)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Despesas',
                        data: despesas,
                        backgroundColor: 'rgba(244, 67, 54, 0.7)',
                        borderColor: 'rgba(244, 67, 54, 1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de Leite
    const ctxLeite = document.getElementById('chartLeite');
    if (ctxLeite) {
        const producaoLeite = JSON.parse(localStorage.getItem('producaoLeite')) || [];
        const { labels, valores } = getLast30DaysLeiteData(producaoLeite);
        
        new Chart(ctxLeite, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Litros',
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
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Gráfico de Animais
    const ctxAnimais = document.getElementById('chartAnimais');
    if (ctxAnimais) {
        const animals = JSON.parse(localStorage.getItem('animals')) || [];
        const tipos = {};
        
        animals.forEach(a => {
            tipos[a.type] = (tipos[a.type] || 0) + 1;
        });
        
        new Chart(ctxAnimais, {
            type: 'doughnut',
            data: {
                labels: Object.keys(tipos),
                datasets: [{
                    data: Object.values(tipos),
                    backgroundColor: [
                        '#4caf50',
                        '#2196f3',
                        '#ff9800',
                        '#e91e63',
                        '#9c27b0',
                        '#00bcd4',
                        '#ffc107'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
    
    // Gráfico de Piquetes
    const ctxPiquetes = document.getElementById('chartPiquetes');
    if (ctxPiquetes) {
        const piquetes = JSON.parse(localStorage.getItem('piquetes')) || [];
        const status = {};
        
        piquetes.forEach(p => {
            status[p.status] = (status[p.status] || 0) + 1;
        });
        
        new Chart(ctxPiquetes, {
            type: 'pie',
            data: {
                labels: Object.keys(status),
                datasets: [{
                    data: Object.values(status),
                    backgroundColor: [
                        '#4caf50',
                        '#f44336',
                        '#ffc107',
                        '#ff9800',
                        '#2196f3'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
}

function getLast6MonthsFinancialData(contas) {
    const labels = [];
    const receitas = [];
    const despesas = [];
    
    for (let i = 5; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const mesAno = data.toISOString().substring(0, 7);
        const mesNome = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        labels.push(mesNome);
        
        const contasMes = contas.filter(c => c.data.startsWith(mesAno));
        const receitaMes = contasMes.filter(c => c.tipo === 'receita').reduce((sum, c) => sum + c.valor, 0);
        const despesaMes = contasMes.filter(c => c.tipo === 'despesa').reduce((sum, c) => sum + c.valor, 0);
        
        receitas.push(receitaMes);
        despesas.push(despesaMes);
    }
    
    return { labels, receitas, despesas };
}

function getLast30DaysLeiteData(producaoLeite) {
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
    
    return { labels, valores };
}

function loadDashboardAlerts() {
    const alertasDiv = document.getElementById('alertasContainer');
    if (!alertasDiv) return;
    
    alertasDiv.innerHTML = `
        <div class="alert-item alert-info">
            <div class="alert-icon">✅</div>
            <div class="alert-content">
                <strong>Sistema Carregado</strong>
                <p>Todos os módulos estão funcionando corretamente. Bem-vindo ao Porteira Preta!</p>
            </div>
        </div>
    `;
}

// ========== TABS (SANITÁRIO) ==========
function switchTab(tabName) {
    // Remover classe active de todos os botões e conteúdos
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Adicionar classe active ao botão e conteúdo selecionados
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    // Fechar menu ao clicar no overlay
    const menuOverlay = document.getElementById('menuOverlay');
    if (menuOverlay) {
        menuOverlay.addEventListener('click', toggleMenu);
    }
    
    // Marcar item ativo no menu
    const currentPage = window.location.pathname.split('/').pop();
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
});

// FIM DO SCRIPT.JS
console.log('🌾 Sistema Porteira Preta carregado com sucesso!');