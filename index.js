import { create } from 'rung-sdk';
import { OneOf, Double } from 'rung-sdk/dist/types';
import Bluebird from 'bluebird';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import { path, lt, gt, pipe, cond, equals, contains, __, T, concat } from 'ramda';
import { JSDOM } from 'jsdom';

const request = promisifyAgent(agent, Bluebird);

function render(card_titulo, col1_tit, col1_val, col2_tit, col2_val) {

    return (
		<div style="width:165px; height:125px; box-sizing: border-box; padding: 1px; overflow: hidden; position: absolute; margin: -12px 0 0 -10px; ">

			<div style="width:100%; height:20px; background-color: rgba(255,255,255,0.5); position: relative; z-index:1; ">
				<div style="background: url('http://www.pbanimado.com.br/rung/icon-boi.png') no-repeat center center; background-size: 100%; width:50px; height: 50px; position: absolute; z-index:2; margin: -10px 0 0 54px; border: 3px solid #FFF; -webkit-border-radius: 50%; -moz-border-radius: 50%; border-radius: 50%;"></div>
			</div>

			<div style="font-size:11px; width:96%; line-height: 1.3; text-align: center; padding: 30px 2% 0; ">
				<p style="margin:0; padding: 0; ">{card_titulo}</p>
				<p style="margin:0; padding: 0; ">{col1_tit}: {col1_val}</p>
				<p style="margin:0; padding: 0; ">{col2_tit}: <strong style="text-decoration: underline; ">{col2_val}</strong></p>
			</div>
		</div>
	);


}

function nodeListToArray(dom) {
    return Array.prototype.slice.call(dom, 0);
}

function returnSelector(type, row, cell) {
	const selector = '#content .middle .tables .cotacao:nth-child(1) .table-content table ';
	const selectorTable = type == 'title'
		? `thead > tr > th:nth-child(${cell})`
		: `tbody > tr:nth-child(${row}) > td:nth-child(${cell})`;
	return selector + selectorTable;
}

function main(context, done) {

	const { fonte, condicao, valor } = context.params;

	// variáveis padrão
	var fonte_titulo = '';
	var fonte_link = 'https://www.noticiasagricolas.com.br/cotacoes/boi/';
	var fonte_data = '#content .middle .tables .cotacao:nth-child(1) .info .fechamento';

	// variáveis das colunas de busca
	var coluna1_titulo = returnSelector('title', '', '1');
	var coluna1_result = returnSelector('result', '1', '1');

	var coluna2_titulo = returnSelector('title', '', '2');
	var coluna2_result = returnSelector('result', '1', '2');

	var coluna3_titulo = returnSelector('title', '', '3');
	var coluna3_result = returnSelector('result', '1', '3');

	// definindo os valores padrão de exibição
	var fonte_coluna_tit 	= coluna1_titulo;
	var fonte_coluna_res 	= coluna1_result;

	var fonte_preco_tit 	= coluna2_titulo;
	var fonte_preco_res 	= coluna2_result;

	var fonte_variacao_tit 	= coluna3_titulo;
	var fonte_variacao_res 	= coluna3_result;

	// definindo o link de conexão
	const server = pipe(
		cond([
			[equals('Bezerro Esalq/BM&F Bovespa - MS'), () => 'indicador-bezerro-esalq-bmf-bovespa-ms'],
			[equals('Boi Gordo - BM&F (Pregão Regular)'), () => 'boi-gordo-bmf-pregao-regular'],
			[equals('Boi Gordo - Indicador Esalq / BM&F'), () => 'boi-gordo-indicador-esalq-bmf'],
			[equals('Boi Gordo - Média SP a prazo'), () => 'boi-gordo-media-sp-a-prazo'],

			[contains(__, ['Boi à Vista IMEA - Araputanga', 'Boi à Vista IMEA - Barra do Garças', 'Boi à Vista IMEA - Cuiabá', 'Boi à Vista IMEA - Juara', 'Boi à Vista IMEA - Matupá', 'Boi à Vista IMEA - Rondonópolis', 'Boi à Vista IMEA - Sinop', 'Boi à Vista IMEA - Vila Rica']), () => 'boi-a-vista-imea'],

			[contains(__, ['Preço da Reposição RS - Boi magro', 'Preço da Reposição RS - Novilho', 'Preço da Reposição RS - Terneiro', 'Preço da Reposição RS - Vaca magra', 'Preço da Reposição RS - Novilha', 'Preço da Reposição RS - Terneira']), () => 'preco-da-reposico-rs'],

			[contains(__, ['Preço a prazo - Boi Gordo', 'Preço a prazo - Vaca Gorda']), () => 'preco-do-boi-gordo-rs-a-prazo'],

			[contains(__, ['Boi Gordo - Bahia', 'Boi Gordo - Mato Grosso do Sul', 'Boi Gordo - Rio Grande do Sul', 'Boi Gordo - Goiás', 'Boi Gordo - Mato Grosso', 'Boi Gordo - Santa Catarina', 'Boi Gordo - Minas Gerais', 'Boi Gordo - Paraná', 'Boi Gordo - São Paulo']), () => 'boi-gordo'],

			[T, () => '']
		]),
		concat(fonte_link)
	)(fonte);

	// definindo os valores padrão
	switch (fonte) {

    	case 'Bezerro Esalq/BM&F Bovespa - MS':
    		fonte_titulo		= 'Bezerro Esalq/BM&F Bovespa - MS';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
    		break;

    	case 'Boi Gordo - BM&F (Pregão Regular)':
    		fonte_titulo		= 'Boi Gordo - BM&F (Pregão Regular)';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
    		break;

    	case 'Boi Gordo - Indicador Esalq / BM&F':
    		fonte_titulo		= 'Boi Gordo - Indicador Esalq / BM&F';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
    		break;

    	case 'Boi Gordo - Média SP a prazo':
    		fonte_titulo		= 'Boi Gordo - Média SP a prazo';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
    		break;

    	case 'Boi à Vista IMEA - Araputanga':
    		fonte_titulo		= 'Boi à Vista - IMEA';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
    		break;

    	case 'Boi à Vista IMEA - Barra do Garças':
    		fonte_titulo		= 'Boi à Vista - IMEA';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
    		break;

    	case 'Boi à Vista IMEA - Cuiabá':
    		fonte_titulo		= 'Boi à Vista - IMEA';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
    		break;

    	case 'Boi à Vista IMEA - Juara':
    		fonte_titulo		= 'Boi à Vista - IMEA';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
    		break;

    	case 'Boi à Vista IMEA - Matupá':
    		fonte_titulo		= 'Boi à Vista - IMEA';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
    		break;

    	case 'Boi à Vista IMEA - Rondonópolis':
    		fonte_titulo		= 'Boi à Vista - IMEA';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
    		break;

    	case 'Boi à Vista IMEA - Sinop':
    		fonte_titulo		= 'Boi à Vista - IMEA';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
    		break;

    	case 'Boi à Vista IMEA - Vila Rica':
    		fonte_titulo		= 'Boi à Vista - IMEA';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
    		break;

    	case 'Preço da Reposição RS - Boi magro':
    		fonte_titulo		= 'Preço da Reposição RS';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
    		break;

    	case 'Preço da Reposição RS - Novilho':
    		fonte_titulo		= 'Preço da Reposição RS';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
    		break;

    	case 'Preço da Reposição RS - Terneiro':
    		fonte_titulo		= 'Preço da Reposição RS';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
    		break;

    	case 'Preço da Reposição RS - Vaca magra':
    		fonte_titulo		= 'Preço da Reposição RS';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
    		break;

    	case 'Preço da Reposição RS - Novilha':
    		fonte_titulo		= 'Preço da Reposição RS';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
    		break;

    	case 'Preço da Reposição RS - Terneira':
    		fonte_titulo		= 'Preço da Reposição RS';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
    		break;

    	case 'Preço a prazo - Boi Gordo':
    		fonte_titulo		= 'Preço a prazo - Lance Agronegócios';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
    		break;

    	case 'Preço a prazo - Vaca Gorda':
    		fonte_titulo		= 'Preço a prazo - Lance Agronegócios';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
    		break;

    	case 'Boi Gordo - Bahia':
    		fonte_titulo		= 'Boi Gordo';
			fonte_coluna_res 	= returnSelector('result', '1', '1');
			fonte_preco_res 	= returnSelector('result', '1', '2');
			fonte_variacao_res 	= returnSelector('result', '1', '3');
    		break;

    	case 'Boi Gordo - Mato Grosso do Sul':
    		fonte_titulo		= 'Boi Gordo';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
    		break;

    	case 'Boi Gordo - Rio Grande do Sul':
    		fonte_titulo		= 'Boi Gordo';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
    		break;

    	case 'Boi Gordo - Goiás':
    		fonte_titulo		= 'Boi Gordo';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
    		break;

    	case 'Boi Gordo - Mato Grosso':
    		fonte_titulo		= 'Boi Gordo';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
    		break;

    	case 'Boi Gordo - Santa Catarina':
    		fonte_titulo		= 'Boi Gordo';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
    		break;

    	case 'Boi Gordo - Minas Gerais':
    		fonte_titulo		= 'Boi Gordo';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
    		break;

    	case 'Boi Gordo - Paraná':
    		fonte_titulo		= 'Boi Gordo';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
    		break;

    	case 'Boi Gordo - São Paulo':
    		fonte_titulo		= 'Boi Gordo';
			fonte_coluna_res 	= returnSelector('result', '9', '1');
			fonte_preco_res 	= returnSelector('result', '9', '2');
			fonte_variacao_res 	= returnSelector('result', '9', '3');
    		break;

	}

	// Obter todo o HTML do site em modo texto
	return request.get(server).then(({ text }) => {

		// Virtualizar o DOM do texto
		const { window } = new JSDOM(text);

		// Converter os dados da tabela para uma lista
		const retorno_data 			= window.document.querySelector(fonte_data).innerHTML;
		const retorno_coluna_tit 	= window.document.querySelector(fonte_coluna_tit).innerHTML;
		const retorno_coluna_res 	= window.document.querySelector(fonte_coluna_res).innerHTML;
		const retorno_preco_tit 	= window.document.querySelector(fonte_preco_tit).innerHTML;
		var retorno_preco_res 		= window.document.querySelector(fonte_preco_res).innerHTML;
		const retorno_variacao_tit 	= window.document.querySelector(fonte_variacao_tit).innerHTML;
		const retorno_variacao_res 	= window.document.querySelector(fonte_variacao_res).innerHTML;

		// CASOS ESPECIAIS - refazendo o preço
		if(fonte_titulo == 'Preço da Reposição RS' || fonte_titulo == 'Preço a prazo - Lance Agronegócios'){
			var parte = retorno_preco_res.split("/");		
			retorno_preco_res = parte[0];
		}

		// arrumando o valor que vem do HTML
		var valorHTML = parseFloat(retorno_preco_res.replace(',', '.'));

		// arrumando o valor que é digitado
		var valorFormatado = valor.toFixed(2);

		// formatando comentario
		var comentario = "<p style='font-weight: bold; font-size: 18px; '>Cotação do Boi</p><p style='font-weight: bold; font-size: 18px; '>" + fonte_titulo + "</p><hr><p style='font-size: 16px; font-weight: bold; '>" + retorno_data + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_coluna_tit + "</span>: " + retorno_coluna_res + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_preco_tit + "</span>: " + retorno_preco_res + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_variacao_tit + "</span>: " + retorno_variacao_res + "</p><br><p style='font-size: 16px; '>Fonte: Portal Notícias Agrícolas</p><a href='" + server + "' target='_blank' style='font-size: 14px; font-style: italic; '>http://www.noticiasagricolas.com.br</a>";

		console.log(comentario);

		// verificação de maior OU menor
		if ((condicao == 'maior' && valorHTML > valor) || (condicao == 'menor' && valorHTML < valor)) {

			done({
				alerts: {
					[`boi${fonte_titulo}`] : {
						title: fonte_titulo,
						content: render(fonte_titulo, retorno_coluna_tit, retorno_coluna_res, retorno_preco_tit, retorno_preco_res),
						comment: comentario
					}
				}
			});

		} else {

			done({ alerts: {} });

		}
	})
	.catch(() => done({ alerts: {} }));

}

const lista_fontes = [

	'Bezerro Esalq/BM&F Bovespa - MS',
	'Boi Gordo - BM&F (Pregão Regular)',
	'Boi Gordo - Indicador Esalq / BM&F',
	'Boi Gordo - Média SP a prazo',
	'Boi à Vista IMEA - Araputanga',
	'Boi à Vista IMEA - Barra do Garças',
	'Boi à Vista IMEA - Cuiabá',
	'Boi à Vista IMEA - Juara',
	'Boi à Vista IMEA - Matupá',
	'Boi à Vista IMEA - Rondonópolis',
	'Boi à Vista IMEA - Sinop',
	'Boi à Vista IMEA - Vila Rica',
	'Preço da Reposição RS - Boi magro',
	'Preço da Reposição RS - Novilho',
	'Preço da Reposição RS - Terneiro',
	'Preço da Reposição RS - Vaca magra',
	'Preço da Reposição RS - Novilha',
	'Preço da Reposição RS - Terneira',
	'Preço a prazo - Boi Gordo',
	'Preço a prazo - Vaca Gorda',
	'Boi Gordo - Mato Grosso do Sul',
	'Boi Gordo - Rio Grande do Sul',
	'Boi Gordo - Goiás',
	'Boi Gordo - Mato Grosso',
	'Boi Gordo - Santa Catarina',
	'Boi Gordo - Minas Gerais',
	'Boi Gordo - Paraná',
	'Boi Gordo - São Paulo'

];

const params = {
    fonte: {
        description: _('Informe a fonte que você deseja ser informado: '),
        type: OneOf(lista_fontes),
		required: true
    },
	condicao: {
		description: _('Informe a condição (maior, menor): '),
		type: OneOf(['maior', 'menor']),
		default: 'maior'
	},
	valor: {
		description: _('Informe o valor em reais para verificação: '),
		type: Double,
		required: true
	}
};

export default create(main, {
    params,
    primaryKey: true,
    title: _("Cotação Boi"),
    description: _("Acompanhe a cotação do boi em diversas praças."),
	preview: render('Boi Gordo', 'Praça', 'Mato Grosso', 'Preço (R$/@)', '142,16')
});