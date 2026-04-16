# 🔗 Integração com APIs Públicas de CNPJ

## Visão Geral

Se você quer integrar dados **em tempo real** de bases públicas brasileiras, aqui estão os passos para conectar com APIs gratuitas e públicas.

## APIs Recomendadas

### 1. **BrasilAPI** (Recomendada - Gratuita)
- **URL**: https://brasilapi.com.br
- **Endpoint CNPJ**: `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`
- **Limite**: Sem limite oficial, mas recomenda-se rate limiting
- **Resposta**: JSON com dados cadastrais

#### Exemplo de Resposta:
```json
{
  "cnpj": "54780998000113",
  "name": "Fernando Martins",
  "legal_nature": {
    "code": "2135",
    "description": "Empresário (individual)"
  },
  "type": "CNPJ",
  "main_activity": {
    "code": "9511900",
    "description": "Reparação e manutenção de computadores..."
  },
  "founded_at": "2024-04-17",
  "address": {
    "street": "Rua Professor Jose de Sousa",
    "number": "227",
    "district": "Parque Boturussu",
    "city": "São Paulo",
    "state": "SP",
    "postal_code": "03801010"
  },
  "status": "ATIVA"
}
```

### 2. **ViaCEP** (Para Validação de CEP)
- **URL**: https://viacep.com.br
- **Endpoint**: `https://viacep.com.br/ws/{cep}/json/`
- **Limite**: Sem limite
- **Uso**: Enriquecer e validar endereços

#### Exemplo:
```bash
https://viacep.com.br/ws/03801010/json/
```

### 3. **Mapa CNPJ** (Para Busca)
- **URL**: https://mapa.cnpj.com.br
- **Método**: Web scraping ou API própria
- **Uso**: Buscar empresas por nome

## Implementação

### Opção 1: Integração com BrasilAPI (Recomendada)

Adicione esta função ao seu `core.js`:

```javascript
async searchBrasilAPIByCNPJ(cnpj) {
    try {
        const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
        
        if (!response.ok) {
            throw new Error('CNPJ não encontrado');
        }
        
        const data = await response.json();
        
        return {
            cnpj: data.cnpj,
            company: data.name,
            legalType: data.legal_nature?.description || 'N/A',
            activity: data.main_activity?.description || 'N/A',
            cnae: data.main_activity?.code || 'N/A',
            openDate: new Date(data.founded_at).toLocaleDateString('pt-BR'),
            address: data.address?.street || 'N/A',
            zipCode: this.formatZipCode(data.address?.postal_code || ''),
            neighborhood: data.address?.district || 'N/A',
            city: data.address?.city || 'N/A',
            state: data.address?.state || 'N/A',
            status: data.status || 'N/A'
        };
    } catch (error) {
        console.error('BrasilAPI Error:', error);
        return null;
    }
}

formatZipCode(cep) {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}
```

### Opção 2: Buscar CNPJ a Partir do Email

Se quiser buscar automaticamente o CNPJ associado ao email:

```javascript
async searchBrasilAPIByEmail(email) {
    try {
        // Extrai domínio do email
        const domain = email.split('@')[1].toUpperCase();
        
        // Tenta buscar pelo email usando DuckDuckGo/Google Search
        const searchQuery = `${email} brasil cnpj site:receita.federal.gov.br`;
        
        // Implementar busca ou usar base de dados pré-carregada
        // Retornar CNPJ encontrado
        
    } catch (error) {
        console.error('Email search error:', error);
        return null;
    }
}
```

### Opção 3: Integração Completa (Email → CNPJ → Dados)

```javascript
async enrichEmailWithLiveData(email) {
    try {
        this.showToast('Buscando dados públicos...', 'info');
        
        // Passo 1: Tentar encontrar CNPJ associado
        let cnpj = await this.extractCNPJFromEmail(email);
        
        if (cnpj) {
            // Passo 2: Buscar dados completos do CNPJ
            const data = await this.searchBrasilAPIByCNPJ(cnpj);
            
            if (data) {
                // Passo 3: Renderizar dados
                this.renderPublicDataCard(data, document.getElementById('resultsGrid'));
                this.showToast('Dados encontrados!', 'info');
                return;
            }
        }
        
        this.showToast('Nenhum dado público encontrado para este email', 'info');
        
    } catch (error) {
        console.error('Enrichment failed:', error);
        this.showToast('Erro ao buscar dados', 'error');
    }
}
```

## Rate Limiting e Boas Práticas

Para evitar bloqueios e respeitar os servidores:

```javascript
class APIRateLimiter {
    constructor(maxRequests = 10, timeWindow = 60000) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }
    
    async execute(fn) {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            const waitTime = this.timeWindow - (now - this.requests[0]);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.requests.push(now);
        return fn();
    }
}

// Uso
const limiter = new APIRateLimiter(5, 60000); // 5 requests por minuto

async function searchWithLimit(cnpj) {
    return limiter.execute(() => searchBrasilAPIByCNPJ(cnpj));
}
```

## Tratamento de Erros

```javascript
async searchBrasilAPIByCNPJ(cnpj) {
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
            timeout: 5000 // Timeout de 5 segundos
        });
        
        if (response.status === 404) {
            this.showToast('CNPJ não encontrado', 'error');
            return null;
        }
        
        if (response.status === 429) {
            this.showToast('Muitas requisições. Aguarde...', 'warning');
            return null;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        if (error.name === 'AbortError') {
            this.showToast('Requisição expirou', 'error');
        } else {
            console.error('Erro na requisição:', error);
        }
        return null;
    }
}
```

## Alternativas (Se BrasilAPI não funcionar)

### 1. **Recurson.API** (Alternativa)
- API gratuita de CNPJ
- Endpoint: `https://api.recurson.com/cnpj/{cnpj}`

### 2. **Web Scraping** (Última opção)
- Usar bibliotecas como `cheerio` (Node.js) ou `Beautiful Soup` (Python)
- Fazer scraping do site da Receita Federal (respeitar robots.txt)
- ⚠️ Pode ser bloqueado por anti-bot

### 3. **Base de Dados Local**
- Manter uma cópia local de dados conhecidos (como está agora)
- Atualizar periodicamente com dados públicos
- Mais confiável e sem rate limit

## Dados Adicionais Disponíveis

### Além do CNPJ, você pode enriquecer com:

1. **Histórico de Alterações**
   - Todas as mudanças cadastrais da empresa
   - Datas de alteração

2. **Sócios e Administradores**
   - Nomes dos donos
   - Porcentagem de participação
   - Documentos (CPF)

3. **Filiais**
   - Outras unidades da empresa
   - Localização de cada filial

4. **Pendências**
   - Débitos na Receita Federal
   - Status de regularização

5. **Processos Judiciais**
   - Via Jusbrasil API
   - Litígios e ações em andamento

## Exemplo Completo (Pronto para Uso)

Execute este código no console do seu navegador:

```javascript
async function testBrasilAPI() {
    const cnpj = '54780998000113';
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    const data = await response.json();
    console.log(data);
}

testBrasilAPI();
```

## Checklist de Implementação

- [ ] Testar BrasilAPI com alguns CNPJs
- [ ] Implementar tratamento de erros
- [ ] Adicionar rate limiter
- [ ] Criar fallback para dados locais
- [ ] Adicionar cache de resultados
- [ ] Testar com emails reais
- [ ] Adicionar documentação de uso
- [ ] Configurar logging de erros

---

**Última atualização**: 2026-04-13  
**Status**: Pronto para implementação
