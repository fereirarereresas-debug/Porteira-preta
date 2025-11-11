// ============================================
// CONFIGURAÇÕES E CONSTANTES
// ============================================
const CONFIG = {
    credentials: {
        username: 'Porteira Preta',
        password: '26122008'
    },
    storageKeys: {
        session: 'porteiraPretaSession',
        animals: 'porteiraPretaAnimals',
        darkMode: 'porteiraPretaDarkMode'
    }
};

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================

/**
 * Verifica se o usuário está logado
 */
function checkAuth() {
    const session = sessionStorage.getItem(CONFIG.storageKeys.session);
    const currentPage = window.location.pathname;
    
    // Se está na página index.html e NÃO está logado
    if (currentPage.includes('index.html') && session !== 'active') {
        window.location.href = 'login.html';
        return false;
    }
    
    // Se está na página login.html e JÁ está logado
    if (currentPage.includes('login.html') && session === 'active') {
        window.location.href = 'index.html';
        return false;
    }
    
    return session === 'active';
}

/**
 * Processa o login do usuário
 */
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    // Validação das credenciais
    if (username === CONFIG.credentials.username && password === CONFIG.credentials.password) {
        sessionStorage.setItem(CONFIG.storageKeys.session, 'active');
        window.location.href = 'index.html';
    } else {
        errorElement.textContent = '❌ Usuário ou senha incorretos!';
        errorElement.style.display = 'block';
        
        // Ocultar mensagem após 3 segundos
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
}

/**
 * Realiza o logout do usuário
 */
function handleLogout() {
    if (confirm('Deseja realmente sair?')) {
        sessionStorage.removeItem(CONFIG.storageKeys.session);
        window.location.href = 'login.html';
    }
}

// ============================================
// FUNÇÕES DE GERENCIAMENTO DE ANIMAIS
// ============================================

/**
 * Obtém a lista de animais do localStorage
 */
function getAnimals() {
    const animals = localStorage.getItem(CONFIG.storageKeys.animals);
    return animals ? JSON.parse(animals) : [];
}

/**
 * Salva a lista de animais no localStorage
 */
function saveAnimals(animals) {
    localStorage.setItem(CONFIG.storageKeys.animals, JSON.stringify(animals));
}

/**
 * Registra um novo animal
 */
function handleAnimalSubmit(event) {
    event.preventDefault();
    
    // Coletar dados do formulário
    const animal = {
        id: Date.now(),
        name: document.getElementById('animalName').value.trim(),
        type: document.getElementById('animalType').value,
        age: parseFloat(document.getElementById('animalAge').value),
        weight: parseFloat(document.getElementById('animalWeight').value),
        notes: document.getElementById('animalNotes').value.trim() || '-',
        createdAt: new Date().toLocaleDateString('pt-BR')
    };
    
    // Salvar no localStorage
    const animals = getAnimals();
    animals.push(animal);
    saveAnimals(animals);
    
    // Mostrar mensagem de sucesso
    showSuccess(`✓ ${animal.name} foi registrado com sucesso!`);
    
    // Limpar formulário e atualizar lista
    document.getElementById('animalForm').reset();
    loadAnimals();
}

/**
 * Exclui um animal específico
 */
function deleteAnimal(id) {
    if (confirm('Tem certeza que deseja excluir este animal?')) {
        let animals = getAnimals();
        const animal = animals.find(a => a.id === id);
        
        animals = animals.filter(a => a.id !== id);
        saveAnimals(animals);
        
        showSuccess(`Animal "${animal.name}" excluído com sucesso!`);
        loadAnimals();
    }
}

/**
 * Apaga todos os animais
 */
function clearAllAnimals() {
    const animals = getAnimals();
    
    if (animals.length === 0) {
        alert('Não há animais para apagar!');
        return;
    }
    
    if (confirm(`⚠️ ATENÇÃO! Isso irá apagar TODOS os ${animals.length} animais registrados. Deseja continuar?`)) {
        if (confirm('Tem certeza mesmo? Esta ação não pode ser desfeita!')) {
            localStorage.removeItem(CONFIG.storageKeys.animals);
            loadAnimals();
            showSuccess('Todos os registros foram apagados!');
        }
    }
}

/**
 * Carrega e exibe a lista de animais
 */
function loadAnimals() {
    const animals = getAnimals();
    const tableBody = document.getElementById('animalsTableBody');
    const emptyState = document.getElementById('emptyState');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const totalAnimals = document.getElementById('totalAnimals');
    
    // Atualizar contador
    if (totalAnimals) {
        totalAnimals.textContent = animals.length;
    }
    
    // Se não há animais
    if (animals.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.classList.add('show');
        if (clearAllBtn) clearAllBtn.style.display = 'none';
        return;
    }
    
    // Mostrar tabela e botão de limpar
    if (emptyState) emptyState.classList.remove('show');
    if (clearAllBtn) clearAllBtn.style.display = 'inline-block';
    
    // Renderizar lista de animais
    tableBody.innerHTML = animals.map(animal => `
        <tr>
            <td><strong>${animal.name}</strong></td>
            <td>${animal.type}</td>
            <td>${animal.age} ${animal.age === 1 ? 'ano' : 'anos'}</td>
            <td>${animal.weight} kg</td>
            <td>${animal.notes}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteAnimal(${animal.id})">
                    🗑️ Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Exibe mensagem de sucesso
 */
function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

/**
 * Atualiza a exibição da data atual
 */
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('pt-BR', options);
    }
}

/**
 * Alterna entre modo claro e escuro
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem(CONFIG.storageKeys.darkMode, isDark);
    
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) {
        toggleBtn.textContent = isDark ? '☀️' : '🌙';
    }
}

/**
 * Carrega a preferência de modo escuro
 */
function loadDarkModePreference() {
    const isDark = localStorage.getItem(CONFIG.storageKeys.darkMode) === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            toggleBtn.textContent = '☀️';
        }
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa a página de login
 */
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

/**
 * Inicializa a página principal (index)
 */
function initDashboardPage() {
    // Atualizar data
    updateDate();
    
    // Carregar animais
    loadAnimals();
    
    // Event Listeners
    const animalForm = document.getElementById('animalForm');
    if (animalForm) {
        animalForm.addEventListener('submit', handleAnimalSubmit);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllAnimals);
    }
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
}

// ============================================
// EXECUÇÃO PRINCIPAL
// ============================================

// Quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    checkAuth();
    
    // Carregar preferência de modo escuro
    loadDarkModePreference();
    
    // Inicializar página apropriada
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('login.html')) {
        initLoginPage();
    } else if (currentPage.includes('index.html')) {
        initDashboardPage();
    }
});

// Expor funções globais necessárias
window.deleteAnimal = deleteAnimal;