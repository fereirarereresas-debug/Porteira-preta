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
            
            // Limpar mensagem após 3 segundos
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
}

// ========== PÁGINA DE ANIMAIS (painel.html) ==========
const animalForm = document.getElementById('animalForm');
if (animalForm) {
    // Carregar animais ao iniciar a página
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
        
        // Validação
        if (!animal.name || !animal.type || !animal.age || !animal.weight) {
            showMessage('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        // Salvar no localStorage
        let animals = JSON.parse(localStorage.getItem('animals')) || [];
        animals.push(animal);
        localStorage.setItem('animals', JSON.stringify(animals));
        
        // Limpar formulário
        animalForm.reset();
        
        // Recarregar tabela
        loadAnimals();
        
        // Mostrar mensagem de sucesso
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

// ========== PÁGINA DE CONTAS (contas.html) ==========
const contasForm = document.getElementById('contasForm');
if (contasForm) {
    // Carregar contas ao iniciar
    loadContas();
    
    // Definir data atual como padrão
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
        
        // Validação
        if (!conta.descricao || !conta.tipo || !conta.valor || !conta.data) {
            showMessageContas('Preencha todos os campos!', 'error');
            return;
        }
        
        if (conta.valor <= 0) {
            showMessageContas('O valor deve ser maior que zero!', 'error');
            return;
        }
        
        // Salvar no localStorage
        let contas = JSON.parse(localStorage.getItem('contas')) || [];
        contas.push(conta);
        localStorage.setItem('contas', JSON.stringify(contas));
        
        // Limpar formulário
        contasForm.reset();
        document.getElementById('contaData').value = hoje;
        
        // Recarregar tabela
        loadContas();
        
        // Mostrar mensagem de sucesso
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
    
    // Ordenar por data (mais recente primeiro)
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