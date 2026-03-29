import requests
from models.payload import CNPJPesquisaSolicitacao, ExportacaoEmpresasDTO
from models.responses import CNPJPesquisaResposta
import os


API_KEY = os.getenv('API_KEY')
URL_BASE = 'https://api.casadosdados.com.br'
headers = {"Api-Key": API_KEY}

def get_v4_cnpj(cnpj) -> CNPJPesquisaResposta:
    """Obtem os dados de um único cnpj"""
    url = f'{URL_BASE}/v4/cnpj/{cnpj}'
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    print(resp.json())
    return CNPJPesquisaResposta(**resp.json())

def get_v4_dashboard_cnpj_abertos_hoje():
    """Quantidade de empresas abertas do dia"""
    url = f'{URL_BASE}/v4/dashboard/cnpj/empresas-abertas/hoje'
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    print(resp.json())

def get_v4_dashboard_cnpj_empresas_abertas(qtd_dias:int):
    """Quantidade de empresas abertas nos últimos X dias"""
    url = f'{URL_BASE}/v4/dashboard/cnpj/empresas-abertas/{qtd_dias}'
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    print(resp.json())

def get_v4_public_cnpj_pesquisa_arquiv_UUID(uuid):
    """
    Listar as solicitações de geração de arquivo
    de pesquisa por UUID.
    """
    url = f'{URL_BASE}/v4/public/cnpj/pesquisa/arquivo/{uuid}?corpo=true'
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    print(resp.json())

def get_v4_cnpj_pesquisa_arquivo(page: int):
    url = f'{URL_BASE}/v4/cnpj/pesquisa/arquivo?page={page}'
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    print(resp.json())