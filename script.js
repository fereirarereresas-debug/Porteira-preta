// ===============================================
// SISTEMA DE AUTENTICAÇÃO
// ===============================================

// Credenciais fixas
const CREDENCIAIS = {
    usuario: "Porteira Preta",
    senha: "26122008"
};

// Verificar se o usuário está logado ao carregar páginas protegidas
function verificarAutenticacao() {
    const paginaAtual = window.location.pathname;
    const estaLogado = sessionStorage.getItem('logado') === 'true';
    
    // Se estiver em página protegida e não estiver logado, redirecionar
    if ((paginaAtual.includes('index.html') || paginaAtual.includes('contas.html')) && !estaLogado) {
        window.location.href = 'logina.html';
    }
    
    // Se estiver logado e tentar acessar o login, redirecionar para index
    if (paginaAtual.includes('login.html') && estaLogado) {
        window.location.href = 'logina.html';
    }
}

// Função de logout
function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        sessionStorage.removeItem('logado');
        window.location.href = 'index.html';
    }
}

// ===============================================
// PÁGINA DE LOGIN
// ===============================================

// Processar login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('username').value;
        const senha = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        // Validar credenciais
        if (usuario === CREDENCIAIS.usuario && senha === CREDENCIAIS.senha) {
            sessionStorage.setItem('logado', 'true');
            window.location.href = 'logina.html';
        } else {
            errorMessage.textContent = '❌ Usuário ou senha incorretos';
            errorMessage.style.display = 'block';
            
            // Limpar mensagem após 3 segundos
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
}

// ===============================================
// PAINEL DE ANIMAIS (index.html)
// ===============================================

// Carregar animais do localStorage
function carregarAnimais() {
    const animais = JSON.parse(localStorage.getItem('animais')) || [];
    const tbody = document.getElementById('animaisTableBody');
    const totalAnimais = document.getElementById('totalAnimais');
    
    if (!tbody) return;
    
    // Atualizar contador
    totalAnimais.textContent = animais.length;
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    // Se não houver animais
    if (animais.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Nenhum animal registrado ainda</td></tr>';
        return;
    }
    
    // Adicionar cada animal na tabela
    animais.forEach((animal, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${animal.nome}</td>
            <td>${animal.tipo}</td>
            <td>${animal.idade}</td>
            <td>${animal.peso}</td>
            <td>${animal.observacoes || '-'}</td>
            <td>
                <button onclick="excluirAnimal(${index})" class="btn btn-danger btn-small">🗑️ Excluir</button>
            </td>
        `;
    });
}

// Adicionar novo animal
if (document.getElementById('animalForm')) {
    document.getElementById('animalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const animal = {
            nome: document.getElementById('animalNome').value.trim(),
            tipo: document.getElementById('animalTipo').value.trim(),
            idade: document.getElementById('animalIdade').value.trim(),
            peso: document.getElementById('animalPeso').value.trim(),
            observacoes: document.getElementById('animalObs').value.trim()
        };
        
        // Validação
        if (!animal.nome || !animal.tipo || !animal.idade || !animal.peso) {
            mostrarMensagem('errorMessageAnimais', '❌ Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        // Obter animais existentes
        const animais = JSON.parse(localStorage.getItem('animais')) || [];
        
        // Adicionar novo animal
        animais.push(animal);
        
        // Salvar no localStorage
        localStorage.setItem('animais', JSON.stringify(animais));
        
        // Limpar formulário
        document.getElementById('animalForm').reset();
        
        // Recarregar lista
        carregarAnimais();
        
        // Mostrar mensagem de sucesso
        mostrarMensagem('successMessage', `✅ Animal "${animal.nome}" registrado com sucesso!`, 'success');
    });
}

// Excluir um animal
function excluirAnimal(index) {
    if (confirm('Deseja realmente excluir este animal?')) {
        const animais = JSON.parse(localStorage.getItem('animais')) || [];
        const animalRemovido = animais[index];
        
        animais.splice(index, 1);
        localStorage.setItem('animais', JSON.stringify(animais));
        
        carregarAnimais();
        mostrarMensagem('successMessage', `✅ Animal "${animalRemovido.nome}" excluído com sucesso!`, 'success');
    }
}

// Apagar todos os animais
function apagarTodosAnimais() {
    if (confirm('⚠️ ATENÇÃO: Deseja realmente apagar TODOS os animais? Esta ação não pode ser desfeita!')) {
        localStorage.removeItem('animais');
        carregarAnimais();
        mostrarMensagem('successMessage', '✅ Todos os animais foram removidos!', 'success');
    }
}

// ===============================================
// CONTROLE DE CONTAS (contas.html)
// ===============================================

// Carregar contas do localStorage
function carregarContas() {
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const tbody = document.getElementById('contasTableBody');
    
    if (!tbody) return;
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    // Se não houver contas
    if (contas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Nenhuma conta registrada ainda</td></tr>';
        atualizarResumoFinanceiro();
        return;
    }
    
    // Adicionar cada conta na tabela
    contas.forEach((conta, index) => {
        const row = tbody.insertRow();
        const tipoEmoji = conta.tipo === 'receita' ? '💚' : '❌';
        const tipoTexto = conta.tipo === 'receita' ? 'Receita' : 'Despesa';
        const valorFormatado = parseFloat(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        
        row.innerHTML = `
            <td>${formatarData(conta.data)}</td>
            <td>${conta.descricao}</td>
            <td>${tipoEmoji} ${tipoTexto}</td>
            <td>R$ ${valorFormatado}</td>
            <td>
                <button onclick="excluirConta(${index})" class="btn btn-danger btn-small">🗑️ Excluir</button>
            </td>
        `;
    });
    
    // Atualizar resumo financeiro
    atualizarResumoFinanceiro();
}

// Adicionar nova conta
if (document.getElementById('contaForm')) {
    // Definir data atual como padrão
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('contaData').value = hoje;
    
    document.getElementById('contaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const conta = {
            descricao: document.getElementById('contaDescricao').value.trim(),
            tipo: document.getElementById('contaTipo').value,
            valor: parseFloat(document.getElementById('contaValor').value),
            data: document.getElementById('contaData').value
        };
        
        // Validação
        if (!conta.descricao || !conta.tipo || !conta.valor || !conta.data) {
            mostrarMensagem('errorMessageContas', '❌ Por favor, preencha todos os campos', 'error');
            return;
        }
        
        if (conta.valor <= 0) {
            mostrarMensagem('errorMessageContas', '❌ O valor deve ser maior que zero', 'error');
            return;
        }
        
        // Obter contas existentes
        const contas = JSON.parse(localStorage.getItem('contas')) || [];
        
        // Adicionar nova conta
        contas.push(conta);
        
        // Salvar no localStorage
        localStorage.setItem('contas', JSON.stringify(contas));
        
        // Limpar formulário
        document.getElementById('contaForm').reset();
        document.getElementById('contaData').value = hoje;
        
        // Recarregar lista
        carregarContas();
        
        // Mostrar mensagem de sucesso
        const tipoTexto = conta.tipo === 'receita' ? 'Receita' : 'Despesa';
        mostrarMensagem('successMessageContas', `✅ ${tipoTexto} adicionada com sucesso!`, 'success');
    });
}

// Excluir uma conta
function excluirConta(index) {
    if (confirm('Deseja realmente excluir esta conta?')) {
        const contas = JSON.parse(localStorage.getItem('contas')) || [];
        
        contas.splice(index, 1);
        localStorage.setItem('contas', JSON.stringify(contas));
        
        carregarContas();
        mostrarMensagem('successMessageContas', '✅ Conta excluída com sucesso!', 'success');
    }
}

// Limpar todas as contas
function limparTodasContas() {
    if (confirm('⚠️ ATENÇÃO: Deseja realmente limpar TODAS as contas? Esta ação não pode ser desfeita!')) {
        localStorage.removeItem('contas');
        carregarContas();
        mostrarMensagem('successMessageContas', '✅ Todas as contas foram removidas!', 'success');
    }
}

// Atualizar resumo financeiro
function atualizarResumoFinanceiro() {
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    contas.forEach(conta => {
        if (conta.tipo === 'receita') {
            totalReceitas += parseFloat(conta.valor);
        } else {
            totalDespesas += parseFloat(conta.valor);
        }
    });
    
    const saldo = totalReceitas - totalDespesas;
    
    // Atualizar elementos na página
    const elementoReceitas = document.getElementById('totalReceitas');
    const elementoDespesas = document.getElementById('totalDespesas');
    const elementoSaldo = document.getElementById('saldoAtual');
    
    if (elementoReceitas) {
        elementoReceitas.textContent = totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    
    if (elementoDespesas) {
        elementoDespesas.textContent = totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    
    if (elementoSaldo) {
        elementoSaldo.textContent = saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
}

// ===============================================
// FUNÇÕES AUXILIARES
// ===============================================

// Mostrar mensagem (sucesso ou erro)
function mostrarMensagem(elementoId, mensagem, tipo) {
    const elemento = document.getElementById(elementoId);
    
    if (!elemento) return;
    
    elemento.textContent = mensagem;
    elemento.style.display = 'block';
    
    // Rolar para a mensagem
    elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Esconder após 5 segundos
    setTimeout(() => {
        elemento.style.display = 'none';
    }, 5000);
}

// Formatar data para padrão brasileiro
function formatarData(data) {
    const partes = data.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ===============================================
// INICIALIZAÇÃO
// ===============================================

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    verificarAutenticacao();
    
    // Carregar dados conforme a página
    if (document.getElementById('animaisTableBody')) {
        carregarAnimais();
    }
    
    if (document.getElementById('contasTableBody')) {
        carregarContas();
    }
});
