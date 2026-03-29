from dotenv import load_dotenv
load_dotenv()

from routes.v4 import get_v4_cnpj, get_v4_dashboard_cnpj_abertos_hoje, get_v4_dashboard_cnpj_empresas_abertas, get_v4_public_cnpj_pesquisa_arquiv_UUID, get_v4_cnpj_pesquisa_arquivo
from routes.v5 import post_v5_cnpj_pesquisa, post_v5_cnpj_pesquisa_arquivo, get_v5_meu_saldo


if __name__ == '__main__':
    cnpj = 33000167004794
    get_v4_cnpj(cnpj)