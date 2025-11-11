// ========== CONFIGURAÇÕES GLOBAIS ==========
const CREDENTIALS = {
    username: 'Porteira Preta',
    password: '26122008'
};

// ========== VERIFICAÇÃO DE AUTENTICAÇÃO ==========
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    // Se não estiver logado e não estiver na página de login
    if (!isLoggedIn && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'index.html';
    }
    
    // Se estiver logado e tentar acessar o login
    if (isLoggedIn && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'painel.html';
    }
}

// ========== FUNÇÃO DE LOGOUT ==========
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
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
            window.location.href = 'painel.html';
        } else {
            errorMessage.textContent = 'Usuário ou senha incorretos';
            errorMessage.style.display = 'block';
            
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
}

// ========== PÁGINA DE ANIMAIS (painel.html) ==========
const animalForm = document.getElementById('animalForm');
if (animalForm) {
    loadAnimals();
    
    animalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const animal = {
            id: Date.now(),
            name: document.getElementById('animalName').value.trim(),
            type: document.getElementById('animalType').value.trim(),
            age: document.getElementById('animalAge').value.trim(),
            weight: document.getElementById('animalWeight').value.trim(),
            obs: document.getElementById('animalObs').value.trim()
        };
        
        if (!animal.name || !animal.type || !animal.age || !animal.weight) {
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

function loadAnimals() {
    const animals = JSON.parse(localStorage.getItem('animals')) || [];
    const tbody = document.getElementById('animalTableBody');
    const count = document.getElementById('animalCount');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (animals.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">Nenhum animal registrado ainda</td></tr>';
        if (count) count.textContent = '0';
        return;
    }
    
    animals.forEach(animal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${animal.name}</td>
            <td>${animal.type}</td>
            <td>${animal.age}</td>
            <td>${animal.weight}</td>
            <td>${animal.obs || '-'}</td>
            <td>
                <button onclick="deleteAnimal(${animal.id})" class="btn btn-delete">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (count) count.textContent = animals.length;
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

// ========== PÁGINA DE INSEMINAÇÃO (inseminacao.html) ==========
const inseminacaoForm = document.getElementById('inseminacaoForm');
if (inseminacaoForm) {
    loadVacasSelect();
    loadInseminacoes();
    
    // Definir data atual
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
    
    // Ordenar por data (mais recente primeiro)
    inseminacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    const hoje = new Date();
    
    inseminacoes.forEach(ins => {
        const dataFormatada = new Date(ins.data + 'T00:00:00').toLocaleDateString('pt-BR');
        const previsaoFormatada = ins.previsaoParto ? 
            new Date(ins.previsaoParto + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
        
        // Calcular status
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

// ========== PÁGINA DE CONTAS COM PRODUÇÃO DE LEITE (contas.html) ==========
const leiteForm = document.getElementById('leiteForm');
if (leiteForm) {
    loadLeiteData();
    
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
        showMessageLeite('Produção de leite registrada! 🥛', 'success');
    });
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
    
    // Filtrar últimos 7 dias
    const leite7dias = producaoLeite.filter(l => {
        const data = new Date(l.data + 'T00:00:00');
        return data >= seteDiasAtras && data <= hoje;
    });
    
    // Filtrar últimos 30 dias
    const leite30dias = producaoLeite.filter(l => {
        const data = new Date(l.data + 'T00:00:00');
        return data >= trintaDiasAtras && data <= hoje;
    });
    
    // Calcular totais
    const totalLitros7 = leite7dias.reduce((sum, l) => sum + l.litros, 0);
    const totalLitros30 = leite30dias.reduce((sum, l) => sum + l.litros, 0);
    
    // Calcular valores pagos (apenas registros com preço)
    const leiteVendido30 = leite30dias.filter(l => l.precoLitro > 0);
    const litrosVendidos = leiteVendido30.reduce((sum, l) => sum + l.litros, 0);
    const valorTotal = leiteVendido30.reduce((sum, l) => sum + (l.litros * l.precoLitro), 0);
    
    // Atualizar interface
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

// ========== CONTROLE FINANCEIRO (contas.html) ==========
const contasForm = document.getElementById('contasForm');
if (contasForm) {
    loadContas();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('contaData').value = hoje;
    
    contasForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const conta = {
            id: Date.now(),
            descricao: document.getElementById('contaDescricao').value.trim(),
            tipo: document.getElementById('contaTipo').value,
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
        showMessageContas('Registro adicionado com sucesso! 💰', 'success');
    });
}

function loadContas() {
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const tbody = document.getElementById('contasTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (contas.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">Nenhum registro financeiro ainda</td></tr>';
        updateTotals(0, 0);
        return;
    }
    
    contas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    contas.forEach(conta => {
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
    if (saldoAtualEl) saldoAtualEl.textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function deleteConta(id) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    let contas = JSON.parse(localStorage.getItem('contas')) || [];
    contas = contas.filter(conta => conta.id !== id);
    localStorage.setItem('contas', JSON.stringify(contas));
    
    loadContas();
    showMessageContas('Registro excluído com sucesso!', 'success');
}

function clearAllContas() {
    if (!confirm('Tem certeza que deseja apagar TODOS os registros financeiros? Esta ação não pode ser desfeita!')) return;
    
    localStorage.removeItem('contas');
    loadContas();
    showMessageContas('Todos os registros foram removidos!', 'success');
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

// ========== VERIFICAR AUTENTICAÇÃO AO CARREGAR QUALQUER PÁGINA ==========
checkAuth();