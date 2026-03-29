from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import date


class CodigoDescricao(BaseModel):
    codigo: str
    descricao: str


class SituacaoCadastral(BaseModel):
    situacao_atual: str
    motivo: Optional[str]
    data: Optional[date]


class IBGEMunicipio(BaseModel):
    codigo_municipio: int
    codigo_uf: int
    latitude: float
    longitude: float


class Endereco(BaseModel):
    cep: str
    tipo_logradouro: str
    logradouro: str
    numero: str
    complemento: Optional[str]
    bairro: str
    uf: str
    municipio: str
    ibge: IBGEMunicipio


class SituacaoEspecial(BaseModel):
    descricao: Optional[str]
    data: Optional[date]


class Socio(BaseModel):
    nome: str
    qualificacao_socio: str
    qualificacao_socio_codigo: int
    identificador_socio: str
    documento: str
    data_entrada_sociedade: Optional[date]
    pais_socio: str
    cpf_representante_legal: Optional[str]
    nome_representante_legal: Optional[str]
    qualificacao_representante_legal: Optional[str]
    faixa_etaria_codigo: Optional[int]
    faixa_etaria_descricao: Optional[str]


class CNPJPesquisaResposta(BaseModel):
    cnpj: str
    cnpj_raiz: str
    filial_numero: int
    razao_social: str
    qualificacao_responsavel: CodigoDescricao
    porte_empresa: CodigoDescricao
    matriz_filial: Literal["MATRIZ", "FILIAL"]
    codigo_natureza_juridica: str
    descricao_natureza_juridica: str
    nome_fantasia: Optional[str]
    situacao_cadastral: SituacaoCadastral
    endereco: Endereco
    data_abertura: date
    capital_social: int
    situacao_especial: Optional[SituacaoEspecial]
    quadro_societario: List[Socio]
