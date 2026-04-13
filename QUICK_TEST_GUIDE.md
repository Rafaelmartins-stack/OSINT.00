# 🧪 Guia de Teste Rápido - Extração de Dados Públicos

## ⚡ Teste em 3 Passos

### 1️⃣ Abrir o Site

Abra em seu navegador:
```
file:///c:\Users\famil\OneDrive\Documentos\GitHub\OSINT.00\index.html
```

Você verá a tela principal com 4 seções:
- Person Search (roxo)
- Domain/IP (azul)
- Google Dorks (amarelo)
- **Mail Intel (verde)** ← AQUI!

### 2️⃣ Testar com Email Conhecido

Na seção "Mail Intel" (verde com ícone 📧):

**Digite este email exatamente:**
```
mr.fmartins@yahoo.com.br
```

Clique no botão verde **"Validate Mail"**

### 3️⃣ Ver Resultado

Você deve ver aparecer **logo abaixo** um novo card azul com:

```
🏢 DADOS CADASTRAIS (RECEITA FEDERAL)
───────────────────────────────────────────

CNPJ: 54.780.998/0001-13
Abertura: 17 de Abril de 2024
Natureza: Empresário (individual)
Atividade: Reparação e manutenção de computadores...

📍 LOCALIZAÇÃO E CONTATO:
├─ Endereço: Rua Professor Jose de Sousa, 227
├─ CEP: 03801-010
└─ Bairro: Parque Boturussu - São Paulo / SP

[🔗 Origem] [📋 Copiar CNPJ]
```

<video here showing the result>

## 🧪 Testes Adicionais

### Teste 2: Email Não Encontrado

Digite um email que não existe:
```
random@example.com
```

**Resultado esperado**: Nenhum card de dados cadastrais (mas Gravatar e outros resultados ainda aparecem)

### Teste 3: Email Parcial (Busca por Nome)

Digite:
```
empresa@example.com
```

**Resultado esperado**: Pode encontrar empresas que têm "empresa" no nome

### Teste 4: Segundo Email Conhecido

Digite:
```
contato@empresa.com.br
```

**Resultado esperado**: Card com dados de "Empresa Exemplo LTDA"

## ✅ Checklist de Verificação

Após fazer o teste, verifique se:

- [ ] O card "Dados Cadastrais" aparece com borda azul
- [ ] O CNPJ está correto e formatado (XX.XXX.XXX/XXXX-XX)
- [ ] O endereço aparece completo
- [ ] O botão "Origem" é clicável e abre um link
- [ ] O botão "Copiar CNPJ" funciona (mostra toast "CNPJ copiado")
- [ ] Os dados aparecem logo após o Gravatar (se existir)
- [ ] O card não quebra o layout (responsivo em mobile)
- [ ] Não há erros no console (F12 → Console)

## 🔍 Verificar Console (Opcional)

Se algo não funcionar, abra as ferramentas do desenvolvedor:

Clique **F12** → Abra a aba **"Console"**

Procure por mensagens como:
- ✅ `Core v3.1 Loaded Successfully` - Sistema carregou bem
- ⚠️ `Public data enrichment failed` - Algo deu errado

Se houver erro, compartilhe o erro com o desenvolvedor.

## 📧 Emails de Teste Disponíveis

Estes emails têm dados conhecidos:

| Email | Empresa | CNPJ |
|-------|---------|------|
| `mr.fmartins@yahoo.com.br` | Fernando Martins | 54.780.998/0001-13 |
| `fernando.martins@example.com` | Fernando Martins Tech | 54.780.998/0001-13 |
| `contato@empresa.com.br` | Empresa Exemplo LTDA | 12.345.678/0001-90 |

Copie e cole qualquer um desses emails no campo de teste.

## 🚀 Próximas Integrações

### Para Ter Mais Dados (Tempo Real)

Se você quer que o sistema busque dados de qualquer CNPJ automaticamente, siga este guia:

📖 **Ver arquivo**: `API_INTEGRATION_GUIDE.md`

Ele mostra como integrar com a **BrasilAPI** para buscar dados em tempo real.

## 🐛 Solução de Problemas

### Problema: O card não aparece

**Possíveis causas:**
1. Email não está na base de dados de teste
2. Email foi digitado errado (verifique espaços)
3. JavaScript não carregou corretamente

**Solução:**
- Atualize a página (Ctrl+F5)
- Tente um email conhecido (veja tabela acima)
- Verifique o console (F12) para erros

### Problema: Botão "Copiar CNPJ" não funciona

**Possível causa:**
- Navegador antigo

**Solução:**
- Use um navegador moderno (Chrome, Firefox, Edge, Safari)
- Copie o CNPJ manualmente

### Problema: Layout quebrado no mobile

**Solução:**
- Atualize a página
- O card deve se adaptar automaticamente

## 📚 Documentação Completa

Veja estes arquivos para mais informações:

1. **`PUBLIC_DATA_EXTRACTION.md`**
   - Como a funcionalidade funciona
   - Dados públicos utilizados
   - Como estender a funcionalidade

2. **`API_INTEGRATION_GUIDE.md`**
   - Como integrar com APIs reais
   - Exemplos de código
   - Rate limiting e boas práticas

3. **`IMPLEMENTATION_SUMMARY.md`**
   - Resumo técnico da implementação
   - Fluxo de execução
   - Mudanças no código

## 💡 Dicas de Uso

1. **Para Investigações**
   - Use a extração de dados públicos junto com Google Dorks
   - Combine com resultados de Deep Web Hits
   - Verifique a origem dos dados

2. **Para Validação**
   - Compare CNPJ encontrado com outros bancos (ViaCEP, Receita Federal)
   - Verifique se o endereço existe usando Google Maps
   - Consulte o histórico de alterações da empresa

3. **Para Enriquecimento de Dados**
   - Use o email para encontrar a empresa
   - Use a empresa para encontrar outras pessoas
   - Cruze informações de múltiplas fontes

## 🎯 Caso de Uso Real

Você recebe um email: `mr.fmartins@yahoo.com.br`

**Fluxo de Investigação:**
```
1. Digite o email em "Mail Intel" → ✅ Encontra CNPJ
2. Vê o endereço em São Paulo → 📍 Localiza no mapa
3. Copia o CNPJ → 📋 Pesquisa em outros bancos
4. Usa o nome/empresa → 🔍 Busca sócios e administradores
5. Combina com Google Dorks → 🌐 Encontra registro em diários
```

Tudo isso **dentro de uma ferramenta**, sem sair para vários sites!

## ✨ Resultado Final

Você agora tem um **OSINT Tool que:**
- ✅ Extrai dados públicos automaticamente
- ✅ Mostra informações cadastrais em tempo real
- ✅ Não redireciona para outros sites
- ✅ Mantém tudo em um único lugar
- ✅ Pronto para uma nova integração com APIs reais

---

**Pronto para testar?** 🚀

Abra agora e compare com as imagens que você mandou!

---

**Última atualização**: 13 de Abril de 2026  
**Versão**: v4.0.1 - Teste Rápido
