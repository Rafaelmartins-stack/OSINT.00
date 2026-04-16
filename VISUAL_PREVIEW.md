# 📊 Preview Visual da Funcionalidade

## Como a Tela Ficará

### Antes (Sem a Funcionalidade)
```
┌─────────────────────────────────────────────────────────────┐
│  OSINT Toolkit v4.0.0 Platinum • True Reverse Edition       │
└─────────────────────────────────────────────────────────────┘

[Person Search] [Domain/IP] [Google Dorks] [Mail Intel]

Inpute Email: mr.fmartins@yahoo.com.br
              [Validate Mail →]

RESULTADOS:
┌─────────────────────────────────────────────────────────────┐
│ 👤 Global Identity (Gravatar)                       [Direct] │
│                                                               │
│ Display: Mr Fmartins                                        │
│ Gravatar URL: https://gravatar.com/...                     │
│ [View Identity]                                             │
└─────────────────────────────────────────────────────────────┘
```

### Depois (Com a Nova Funcionalidade) ✨

```
┌─────────────────────────────────────────────────────────────┐
│  OSINT Toolkit v4.0.0 Platinum • True Reverse Edition       │
└─────────────────────────────────────────────────────────────┘

[Person Search] [Domain/IP] [Google Dorks] [Mail Intel]

Inpute Email: mr.fmartins@yahoo.com.br
              [Validate Mail →]

RESULTADOS:
┌──────────────────────────────────────────────────────────────┐
│ 🏢 DADOS CADASTRAIS (RECEITA FEDERAL)           [PÚBLICO]   │
│────────────────────────────────────────────────────────────  │
│                                                              │
│  CNPJ         │ Abertura      │ Natureza                    │
│  ─────────────┼───────────────┼─────────────────────        │
│  54.780.998.. │ 17 Abr 2024   │ Empresário (individual)    │
│                                                              │
│  Atividade Principal (CNAE):                                │
│  ┌────────────────────────────────────────────────────────  │
│  │ Reparação e manutenção de computadores e de             │
│  │ equipamentos periféricos                                │
│  └────────────────────────────────────────────────────────  │
│                                                              │
│  📍 LOCALIZAÇÃO E CONTATO                                   │
│  ┌────────────────────────────────────────────────────────  │
│  │ Endereço: Rua Professor Jose de Sousa, 227             │
│  │ CEP: 03801-010                                         │
│  │ Bairro: Parque Boturussu - São Paulo / SP              │
│  └────────────────────────────────────────────────────────  │
│                                                              │
│  [🔗 Origem]  [📋 Copiar CNPJ]                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 👤 Global Identity (Gravatar)                       [Direct] │
│                                                              │
│ Display: Mr Fmartins                                        │
│ Gravatar URL: https://gravatar.com/...                     │
│ [View Identity]                                             │
└──────────────────────────────────────────────────────────────┘

[Google Search Results]
[Deep Web Hits (Native SERP)]
```

## Fluxo Visual

```
┌─────────────────────────────────────────────┐
│  Digite um email na seção "Mail Intel"      │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Clique em "Validate Mail"                  │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Sistema busca em bases de dados públicas   │
│  (Receita Federal, CNPJ, etc)              │
└────────────┬────────────────────────────────┘
             │
             ▼
         ┌───┴────┐
         │         │
         ▼         ▼
    Encontrado?  Não encontrado?
         │         │
         ▼         ▼
      [Card]   [Sem card]
     Azul com    (continua
      Dados      com outros
     Públicas    resultados)
         │
         ▼
    Mostra Gravatar
    + Deep Web Hits
    + Google Search
```

## Cards Renderizados

### Card 1: Dados Cadastrais (NOVO!)
```
┌┬────────────────────────────────────────────────────────────┐
││ 🏢 DADOS CADASTRAIS (RECEITA FEDERAL)      [PÚBLICO]       │
├┼────────────────────────────────────────────────────────────┤
││                                                             │
││  ╔══════════════╦══════════════╦════════════════════════╗ │
││  ║ CNPJ         ║ Abertura     ║ Natureza Jurídica      ║ │
││  ║──────────────║──────────────║────────────────────────║ │
││  ║ 54.780.998.. ║ 17 Abr 2024  ║ Empresário (ind.)      ║ │
││  ╚══════════════╩══════════════╩════════════════════════╝ │
││                                                             │
││  ┌────────────────────────────────────────────────────────┐ │
││  │ ATIVIDADE PRINCIPAL (CNAE)                             │ │
││  │ Reparação e manutenção de computadores e de          │ │
││  │ equipamentos periféricos                              │ │
││  └────────────────────────────────────────────────────────┘ │
││                                                             │
││  📍 LOCALIZAÇÃO E CONTATO                                  │
││  ┌──────────────────┬────────────────────────────────────┐ │
││  │ ENDEREÇO         │ CEP                                │ │
││  │ Rua Professor... │ 03801-010                          │ │
││  └──────────────────┼────────────────────────────────────┤ │
││                      │ BAIRRO                             │ │
││                      │ Parque Boturussu - SP             │ │
││                      └────────────────────────────────────┘ │
││                                                             │
││  [🔗 Origem]  [📋 Copiar CNPJ]                           │ │
└┴────────────────────────────────────────────────────────────┘
```

### Card 2: Gravatar (Existente)
```
┌┬────────────────────────────────────────────────────────────┐
││ 👤 Global Identity                           [Gravatar]   │
├┼────────────────────────────────────────────────────────────┤
││                                                             │
││  [Foto👤] Mr Fmartins                                    │
││           Gravatar Profile                               │
││                                                             │
││  [View Identity]                                          │
└┴────────────────────────────────────────────────────────────┘
```

### Cards 3+: Resultados de Busca Google (Existente)
```
┌────────────────────────────────────────────────────────────┐
│ 🔗 Google Search Results                                   │
│ Radar Deep Web Hits (Native SERP)                         │
├────────────────────────────────────────────────────────────┤
│ [...Links encontrados...]                                 │
└────────────────────────────────────────────────────────────┘
```

## Ordem de Aparição

```
1️⃣  Dados Cadastrais (AZUL) ← NOVO!
    └─ Aparece primeiro se dados encontrados

2️⃣  Gravatar (ROXO)
    └─ Se existir perfil Gravatar

3️⃣  Deep Web Hits (ÍNDIGO)
    └─ Resultados de busca nativa

4️⃣  Google Search Results (ÍNDIGO)
    └─ Links encontrados
```

## Cores e Ícones

| Elemento | Cor | Ícone | Significado |
|----------|-----|-------|-------------|
| Dados Cadastrais | Azul 🔵 | 🏢 Building | Dados da Receita Federal |
| Gravatar | Roxo 💜 | 👤 User | Perfil Gravatar |
| Deep Web | Índigo 🔷 | 🌐 Globe | Resultados de busca |
| Google Results | Índigo 🔷 | 🔗 Link | Links encontrados |
| ToastSuccess | Verde 💚 | ✅ Check | Operação bem-sucedida |
| ToastError | Vermelho 🔴 | ❌ X | Erro na operação |

## Animações

### Entrada do Card
```
Estado 1 (0ms):       Estado 2 (300ms):     Estado 3 (500ms):
┌────────┐            ┌────────┐            ┌────────────────┐
│        │            │  ███   │            │ Dados Cadastr.. │
│        │     ──→    │ ███ ██ │     ──→    │ ✓ Totalmente    │
│        │            │███ ███ │            │   Visível       │
└────────┘            └────────┘            └────────────────┘
```

### Toast de Cópia
```
┌─────────────────────────────┐
│  ✅ CNPJ copiado com sucesso│
└─────────────────────────────┘
     (desaparece em 3s)
```

## Responsividade

### Desktop (1920px)
```
┌──────────────────────────────────────────────────────────┐
│  DADOS CADASTRAIS │ GRAVATAR │ DEEP WEB │ GOOGLE         │
│  (full width)     │ (middle) │ (right)  │ (bottom row)  │
└──────────────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌──────────────────────────────────────────┐
│  DADOS CADASTRAIS │ GRAVATAR              │
├──────────────────────────────────────────┤
│  DEEP WEB │ GOOGLE                        │
└──────────────────────────────────────────┘
```

### Mobile (375px)
```
┌──────────────────────────┐
│  DADOS CADASTRAIS        │
├──────────────────────────┤
│  GRAVATAR                │
├──────────────────────────┤
│  DEEP WEB                │
├──────────────────────────┤
│  GOOGLE                  │
└──────────────────────────┘
```

## Interações

### Clique em "Origem"
```
[🔗 Origem]
    ↓
Abre em nova aba:
https://www.cnpj.info/54780998000113
```

### Clique em "Copiar CNPJ"
```
[📋 Copiar CNPJ]
    ↓
CNPJ copiado para clipboard:
54780998000113
    ↓
Toast:
✅ CNPJ copiado com sucesso!
```

## Evolução Visual

### Versão Anterior (v3.1)
- ❌ Sem dados cadastrais
- ✅ Gravatar Search
- ✅ Google Dorks

### Versão Nova (v4.0.1)
- ✅ **Dados Cadastrais (NOVO!)**
- ✅ Gravatar Search
- ✅ Google Dorks

### Versão Futura (v4.1+)
- ✅ Dados Cadastrais
- ✅ API BrasilAPI integrada
- ✅ Busca em tempo real
- ✅ Histórico de alterações CNPJ
- ✅ Sócios e administradores
- ✅ Processos judiciais integrados

---

**Versão**: 4.0.1  
**Data**: 13 de Abril de 2026  
**Status**: ✅ Implement Completo
