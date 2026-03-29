import requests
from models.payload import CNPJPesquisaSolicitacao, ExportacaoEmpresasDTO
from models.responses import CNPJPesquisaResposta
import os


API_KEY = os.getenv('API_KEY')
URL_BASE = 'https://api.casadosdados.com.br'
headers = {"Api-Key": API_KEY}


def post_v5_cnpj_pesquisa(filtro_empresa: CNPJPesquisaSolicitacao, tipo_resultado: str):
    """
    Realiza uma pesquisa de CNPJ com base nos filtros fornecidos.
    Retorna os resultados da pesquisa.
    """
    url = f'{URL_BASE}/v5/cnpj/pesquisa?tipo_resultado={tipo_resultado}'
    resp = requests.post(url, json=filtro_empresa, headers=headers)
    resp.raise_for_status()
    print(resp.json())

def post_v5_cnpj_pesquisa_arquivo(export_empresas: ExportacaoEmpresasDTO):
    """Pesquisa e demais campos para gerar o arquivo, o mesmo fica disponivel na tela Arquivos de Empresas"""
    url = f'{URL_BASE}/v5/cnpj/pesquisa/arquivo'
    resp = requests.post(url, json=export_empresas, headers=headers)
    resp.raise_for_status()
    print(resp.json())

def get_v5_meu_saldo():
    """Retorna o saldo atual do usuário."""
    url = f'{URL_BASE}/v5/saldo'
    resp = requests.get(url)
    resp.raise_for_status()
    print(resp.json())