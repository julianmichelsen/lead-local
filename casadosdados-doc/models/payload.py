from typing import List, Optional, Literal
from pydantic import BaseModel, Field, EmailStr
from datetime import date


class BuscaTextual(BaseModel):
    texto: List[str]
    tipo_busca: Literal['exata', 'radical']
    razao_social: Optional[bool] = False
    nome_fantasia: Optional[bool] = False
    nome_socio: Optional[bool] = False


class DataAbertura(BaseModel):
    inicio: Optional[date]
    fim: Optional[date]
    ultimos_dias: Optional[int]


class CapitalSocial(BaseModel):
    minimo: Optional[int]
    maximo: Optional[int]


class Mei(BaseModel):
    optante: Optional[bool] = False
    excluir_optante: Optional[bool] = False


class Simples(BaseModel):
    optante: Optional[bool] = False
    excluir_optante: Optional[bool] = False


class MaisFiltros(BaseModel):
    somente_matriz: Optional[bool] = False
    somente_filial: Optional[bool] = False
    com_email: Optional[bool] = False
    com_telefone: Optional[bool] = False
    somente_fixo: Optional[bool] = False
    somente_celular: Optional[bool] = False
    excluir_empresas_visualizadas: Optional[bool] = False
    excluir_email_contab: Optional[bool] = False


class CNPJPesquisaSolicitacao(BaseModel):
    cnpj: Optional[List[str]] = Field(default_factory=list)
    busca_textual: Optional[List[BuscaTextual]] = None
    codigo_atividade_principal: Optional[List[str]] = Field(default_factory=list)
    incluir_atividade_secundaria: Optional[bool] = False
    codigo_atividade_secundaria: Optional[List[str]] = Field(default_factory=list)
    codigo_natureza_juridica: Optional[List[str]] = Field(default_factory=list)
    situacao_cadastral: Optional[Literal['ATIVA', 'BAIXADA', 'INAPTA', 'NULA', 'SUSPENSA']] = None
    matriz_filial: Optional[Literal["MATRIZ", "FILIAL"]] = None
    cnpj_raiz: Optional[List[str]] = Field(default_factory=list)
    cep: Optional[List[str]] = Field(default_factory=list)
    endereco_numero: Optional[List[str]] = Field(default_factory=list)
    uf: Optional[List[str]] = Field(default_factory=list)
    municipio: Optional[List[str]] = Field(default_factory=list)
    bairro: Optional[List[str]] = Field(default_factory=list)
    ddd: Optional[List[str]] = Field(default_factory=list)
    data_abertura: Optional[DataAbertura] = None
    capital_social: Optional[CapitalSocial] = None
    mei: Optional[Mei] = None
    simples: Optional[Simples] = None
    mais_filtros: Optional[MaisFiltros] = None
    limite: Optional[int] = Field(default=10, ge=1, le=100)
    pagina: Optional[int] = Field(default=1, ge=1)


class ExportacaoEmpresasDTO(BaseModel):
    total_linhas: Optional[int] = 0
    nome: str
    tipo: Literal["csv"]
    enviar_para: Optional[List[EmailStr]] = None
    pesquisa: CNPJPesquisaSolicitacao
