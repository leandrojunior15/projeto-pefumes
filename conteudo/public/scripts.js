document.addEventListener('DOMContentLoaded', () => {
    iniciarApp(); 
    configurarEventos();
    
});
async function iniciarApp() {
    try {
        atualizarFiltros();
    } catch (error) {
    }
}

let textoProdutos = "";
let produtos = [];
let carrinho = [];
const db = window.db;
const getDocs = window.getDocs;
const collection = window.collection;


async function iniciarApp() {
    try {

        const querySnapshot = await getDocs(collection(db, "produtos"));


        produtos = [];


        querySnapshot.forEach((doc) => {

            produtos.push({ id: doc.id, ...doc.data() });
        });

        console.log("Produtos carregados do Firebase:", produtos);
        filtrarProdutos('Todos');

    } catch (error) {
        console.error("Erro ao buscar produtos: ", error);
        alert("Falha ao carregar os produtos. Tente recarregar a página.");
    }
}

function carregarProdutos(marcaFiltrada = 'Todos', termoPesquisa = '') {
    const listaProdutosDiv = document.getElementById('lista-produtos');
    listaProdutosDiv.innerHTML = '';

    // 1. Primeiro, filtra por MARCA
    const produtosFiltradosPorMarca = marcaFiltrada === 'Todos'
        ? produtos
        : produtos.filter(produto => produto.marca === marcaFiltrada);

    // 2. Em seguida, filtra o resultado anterior pela PESQUISA
    const termo = termoPesquisa.toLowerCase();
    const produtosParaExibir = produtosFiltradosPorMarca.filter(produto => {
        return produto.nome.toLowerCase().includes(termo);
    });

    // 3. Renderiza os produtos ou mostra mensagem de "não encontrado"
    if (produtosParaExibir.length === 0) {
        listaProdutosDiv.innerHTML = '<p class="mensagem-vazio">Nenhum produto encontrado com esse nome.</p>';
        return;
    }

    produtosParaExibir.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}">
            <h3>${produto.nome}</h3>
            <p>R$ ${produto.preco.toFixed(2)}</p>
            <button class="btn-adicionar" onclick="adicionarAoCarrinho('${produto.id}')">Adicionar ao Carrinho</button>
        `;
        listaProdutosDiv.appendChild(card);
    });
}

function filtrarProdutos(marca) {

    const botoes = document.querySelectorAll('.btn-filtro');
    botoes.forEach(botao => {
        botao.classList.remove('ativo');
        if (botao.textContent === marca) {
            botao.classList.add('ativo');
        }
    });

    atualizarFiltros();
}

function atualizarFiltros() {
    // 1. Pega a marca ativa
    const marcaAtiva = document.querySelector('.btn-filtro.ativo').textContent;

    // 2. Pega o texto da pesquisa
    const termoPesquisa = document.getElementById('barra-pesquisa').value;

    // 3. Chama a função carregarProdutos com AMBOS os valores
    carregarProdutos(marcaAtiva, termoPesquisa);
}

function pesquisarProdutos() {
    let termoPesquisa = document.getElementById('campo-pesquisa').value.toLowerCase();
    let listaProdutosDiv = document.getElementById('lista-produtos');
    listaProdutosDiv.innerHTML = '';
}

pesquisarProdutos();

function adicionarAoCarrinho(idProduto) {
    const produtoExistente = carrinho.find(item => item.id === idProduto);

    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        const produto = produtos.find(p => p.id === idProduto);
        carrinho.push({ ...produto, quantidade: 1 });
    }

    atualizarCarrinho();
}


function atualizarCarrinho() {
    const itensCarrinhoDiv = document.getElementById('itens-carrinho');
    const valorTotalSpan = document.getElementById('valor-total');
    let total = 0;

    if (carrinho.length === 0) {
        itensCarrinhoDiv.innerHTML = '<p>Seu carrinho está vazio.</p>';
        valorTotalSpan.textContent = '0.00';
        return;
    }

    itensCarrinhoDiv.innerHTML = '';
    carrinho.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-no-carrinho';

        itemDiv.innerHTML = `
            <div class="item-info">
                <span>${item.quantidade}x ${item.nome}</span>
                <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
            </div>
            <button class="btn-remover" onclick="removerDoCarrinho('${item.id}')">Remover</button>
        `;

        itensCarrinhoDiv.appendChild(itemDiv);
        total += item.preco * item.quantidade;
    });

    valorTotalSpan.textContent = total.toFixed(2);
}


function removerDoCarrinho(idProduto) {

    const indiceProduto = carrinho.findIndex(item => item.id === idProduto);


    if (indiceProduto === -1) {
        return;
    }


    carrinho[indiceProduto].quantidade--;


    if (carrinho[indiceProduto].quantidade === 0) {
        carrinho.splice(indiceProduto, 1);
    }


    atualizarCarrinho();
}


function configurarEventos() {
    const btnFinalizar = document.getElementById('finalizar-pedido');
    btnFinalizar.addEventListener('click', enviarMensagemWhatsApp);

    const barraPesquisa = document.getElementById('barra-pesquisa');
    barraPesquisa.addEventListener('keyup', atualizarFiltros)
}


function enviarMensagemWhatsApp() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const numeroTelefone = '5596991562635';
    let mensagem = 'Olá! Gostaria de fazer o seguinte pedido:\n\n';
    let totalPedido = 0;

    carrinho.forEach(item => {
        mensagem += `${item.quantidade}x - ${item.nome}\n`;
        totalPedido += item.preco * item.quantidade;
    });

    mensagem += `\n*Total do Pedido: R$ ${totalPedido.toFixed(2)}*`;

    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroTelefone}&text=${mensagemCodificada}`;
    window.open(urlWhatsApp, '_blank');
}