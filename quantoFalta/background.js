chrome.webNavigation.onCompleted.addListener((details) => {
  // Verifica se a URL corresponde à do SIGAA
  if (details.url === "https://si3.ufc.br/sigaa/portais/discente/discente.jsf") {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      function: getCargaHorariaObrigatoria
    });
  }
}, { url: [{ urlMatches: "https://si3.ufc.br/sigaa/portais/discente/discente.jsf" }] });


function getCargaHorariaObrigatoria() {
  // Verifica se a frase "Consultar Pendências de Conclusão" está presente no HTML
  if (document.body.innerText.includes("Consultar Pendências de Conclusão")) {
    // Aqui vai o código que será executado na página ativa
    const secaoCargaHorariaTotal = document.querySelectorAll('tr.title_irregular')[1];

    if (secaoCargaHorariaTotal.textContent.trim().includes("Carga Horária Total")) {
      // Seleciona o elemento da carga total exigida.
      const cargaTotalExigido = secaoCargaHorariaTotal.nextElementSibling;

      // Seleciona o elemento da carga integralizada.
      const cargaIntegralizada = cargaTotalExigido ? cargaTotalExigido.nextElementSibling : null;

      // Verifica se o elemento da carga total exigida existe e extrai a parte inteira
      let totalExigido = cargaTotalExigido ? cargaTotalExigido.textContent.trim().match(/\d+/)[0] : null;

      // Verifica se o elemento da carga integralizada existe e extrai a parte inteira
      let totalIntegralizado = cargaIntegralizada ? cargaIntegralizada.textContent.trim().match(/\d+/)[0] : null;    
      
      // Converte os valores extraídos para números
      const exigido = totalExigido ? parseInt(totalExigido) : 0; // Converte para número ou 0 se não existir
      const integralizado = totalIntegralizado ? parseInt(totalIntegralizado) : 0; // Converte para número ou 0 se não existir

      // Calcula a porcentagem se o totalExigido não for zero
      let porcentagem = exigido > 0 ? (integralizado / exigido) * 100 : 0;

      // Exibe os resultados
      console.log("Total Exigido:", exigido); 
      console.log("Total Integralizado:", integralizado);
      console.log("Porcentagem de Carga Integralizada:", porcentagem.toFixed(0) + "%"); // Mostra a porcentagem formatada com duas casas decimais

      // Cria um novo elemento <tr>
      const novaLinha = document.createElement('tr');

      // Cria uma nova célula <td> para a barra de progresso
      const celulaBarraProgresso = document.createElement('td');

      // Adiciona o HTML da barra de progresso
      celulaBarraProgresso.innerHTML = `
          <div style="width: 100%; background-color: #e0e0e0; border-radius: 5px;">
              <div style="width: ${porcentagem}%; height: 20px; background-color: #76c7c0; border-radius: 5px;"></div>
          </div>
          <p style="text-align: center; margin: 5px 0;">${porcentagem.toFixed(0)}% Completo</p>
      `;

      // Adiciona a célula com a barra de progresso à nova linha
      novaLinha.appendChild(celulaBarraProgresso);

      // Adiciona a nova linha após a última linha selecionada
      secaoCargaHorariaTotal.insertAdjacentElement('afterend', novaLinha);
    } 

    else {
      alert('Elemento não encontrado');
    }
  }
}
