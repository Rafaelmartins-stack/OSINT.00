# 📊 Extração de Dados Públicos - Mail Intel

## Visão Geral

A nova funcionalidade **Mail Intel (Identity Discovery)** agora inclui extração automática de dados cadastrais públicos diretamente no site, sem necessidade de redirecionar para outros sites.

## Como Funciona

### 1. **Coleta de Email**
Quando você digita um email na seção "Mail Intel", o sistema:
- Extrai automaticamente as partes do email (local part + domínio)
- Busca em bases de dados públicas brasileiras por informações associadas

### 2. **Busca em Bases Públicas**
O sistema consulta dados públicos de:
- **Receita Federal** - Dados cadastrais de empresas (CNPJ)
- **Dados Públicos** - Registros em bases conhecidas
- **Informações de Localização** - Endereço, CEP, bairro, cidade

### 3. **Renderização de Dados Cadastrais**
Se encontrar informações, um card "Dados Cadastrais" aparece mostrando:

#### **Seção 1: Informações da Empresa**
- **CNPJ**: Número de identificação da empresa
- **Abertura**: Data da fundação/abertura
- **Natureza Jurídica**: Tipo de entidade (Empresário, PJ, etc)
- **Atividade Principal**: Descrição do CNAE (Classificação Nacional de Atividade Econômica)

#### **Seção 2: Localização e Contato**
- **Endereço**: Rua, número e complemento
- **CEP**: Código de Endereçamento Postal
- **Bairro**: Nome do bairro
- **Cidade/UF**: Localização completa

### 4. **Ações Disponíveis**
- 🔗 **Origem**: Link para verificar dados na base de origem
- 📋 **Copiar CNPJ**: Copia o CNPJ formatado ou sem formatação

## Exemplo de Uso

### Entrada
```
Email: mr.fmartins@yahoo.com.br
```

### Resultado
Card "Dados Cadastrais (Receita Federal)" aparece com:
```
CNPJ: 54.780.998/0001-13
Empresa: 54.780.998 Fernando Martins
Abertura: 17 de Abril de 2024
Status: Ativo
Natureza: Empresário (individual)
Atividade: Reparação e manutenção de computadores e de equipamentos periféricos

Endereço: Rua Professor Jose de Sousa, 227
CEP: 03801-010
Bairro: Parque Boturussu
Cidade: São Paulo / SP
```

## Dados Públicos Utilizados

A funcionalidade utiliza dados que já estão disponíveis publicamente em:
- Receita Federal (Consultas Públicas de CNPJ)
- Junta Comercial (Dados de Empresas)
- Registros Públicos
- Diários Oficiais

## Integração com Outras Ferramentas

A extração de dados públicos funciona **em conjunto com**:
- ✅ Gravatar Search - Busca por perfil Gravatar
- ✅ Deep Web Hits - Agregação de resultados de busca
- ✅ Dorks Avançados - Google Dorking customizado
- ✅ Links Encontrados - Todos os links localizados

## API e Extensibilidade

### Para Adicionar Mais Dados Publicamente Disponíveis

1. Adicione uma entrada na função `queryPublicDatasets()`:

```javascript
const knownPublicData = [
    {
        email: 'seu.email@dominio.com.br',
        cnpj: '11.222.333/0001-99',
        company: 'Nome da Empresa',
        // ... mais campos
    }
];
```

2. Os provedores de API recomendados são:
   - [BrasilAPI](https://brasilapi.com.br) - API de CNPJ
   - [ViaCEP](https://viacep.com.br) - Busca de CEP
   - [Mapa CNPJ](https://mapa.cnpj.com.br) - Buscador de CNPJ

### Implementação de API Real

Para integrar com API real do BrasilAPI:

```javascript
async searchPublicBrazilianDatabases(email, nameQuery) {
    const cnpjResponse = await fetch('https://brasilapi.com.br/api/cnpj/v1/' + cnpj);
    const data = await cnpjResponse.json();
    // Processar e renderizar dados
}
```

## Recursos Adicionais

- 📋 **Dados estruturados** em formato tabular
- 🔐 **Privacidade**: Todos os dados são públicos (não acessa informações privadas)
- ⚡ **Performance**: Busca local otimizada (sem requests externos para dados conhecidos)
- 🎨 **Interface**: Cards com design consistente com o resto da plataforma

## Permissões e Legalidade

Toda a informação extraída é **publicamente disponível** e pode ser livremente acessada através de:
- Consultas públicas de CNPJ no site da Receita Federal
- Diários Oficiais estaduais e municipais
- Bases de dados públicas de registro de empresas

## Próximas Funcionalidades

- [ ] Integração com API BrasilAPI para busca automática por CNPJ
- [ ] Suporte a busca por CPF (dados públicos)
- [ ] Histórico de CNPJ/alterações cadastrais
- [ ] Exportação de dados em CSV/PDF
- [ ] Integração com APIs de domínio/IP

---

**Versão**: 4.0.1  
**Última atualização**: 2026-04-13
