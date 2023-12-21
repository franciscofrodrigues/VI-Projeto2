

var csvData;

// Função para atualizar o gráfico de radar com base na seleção do utilizador
function updateRadarChart(regionName) {
  var selectedData = csvData.find(function (d) {
    return d.nome === regionName;
  });

  console.log('selectedData',selectedData);

  // Remove o gráfico anterior se existir
  d3.select('#radarChart svg').remove();


  // Configuração do radar chart
  var margin = { top: 100, right: 50, bottom: 50, left: 50},
    width = 300,
    height = 300;

  // Configuração do SVG
  var svg = d3.select('#radarChart svg');

if (svg.empty()) {
  // Criar SVG apenas se não existir
  svg = d3.select('#radarChart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + (width / 2 + margin.left) + ',' + (height / 2 + margin.top) + ')');
} else {
  // Limpar conteúdo anterior (se necessário)
  svg.selectAll('*').remove();
}

  // Número de variáveis (número de lados no radar chart)
  var numVars = 5;  // número de faixas etárias no seu exemplo

  // Angulo de cada eixo no radar chart
  var angleSlice = Math.PI * 2 / numVars;

  // Configuração da escala radial
  var rScale = d3.scaleLinear()
    .range([0, Math.min(width / 2, height / 2)]);

  // Linhas do radar chart
  var radarLine = d3.lineRadial()
    .curve(d3.curveLinearClosed)
    .radius(function (d) { return rScale(d); })
    .angle(function (d, i) { return i * angleSlice; });


  // Adiciona os eixos
  var eixos = svg.selectAll('.axis')
    .data(d3.range(numVars))
    .enter()
    .append('g')
    .attr('class', 'axis')
    .style('stroke', 'black');

  // Dentro do bloco onde você adiciona as linhas do eixo
  eixos.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', function (d, i) { return rScale.range()[1] * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr('y2', function (d, i) { return rScale.range()[1] * Math.sin(angleSlice * i - Math.PI / 2); })
    .attr('class', 'axisLine')
    .style('stroke', 'black')  // Cor das linhas do eixo
    .style('stroke-width', 1); // Largura das linhas do eixo
    

  // Lê os dados do CSV e cria o radar chart
  var faixasEtarias = Object.keys(selectedData).filter(key => key !== "codigo" && key !== "nome");
  var valores = faixasEtarias.map(key => +selectedData[key]); // Converte os valores para números
  var regioes = Object(selectedData.nome)

  // Logo antes de criar o gráfico
  console.log('Valores:', valores);
  console.log('regioes:', regioes);

  // Atualiza a escala radial com base nos novos valores
  rScale.domain([0, d3.max(valores)]);

  // Adiciona os marcadores (pontos) nos eixos
  eixos.append('circle')
    .attr('class', 'axisMarker')
    .attr('r', 2)  // raio do marcador
    .attr('cx', function (d, i) { return rScale(valores[i]) * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr('cy', function (d, i) { return rScale(valores[i]) * Math.sin(angleSlice * i - Math.PI / 2); })
    .on('mouseover', function (d, i) {
      showTooltip(d, i); // Função para exibir tooltip
    })
    .on('mouseout', function () {
      hideTooltip(); // Função para ocultar tooltip
    });;

  // Função para exibir o tooltip
  function showTooltip(d, i) {
    var tooltip = d3.select('#tooltip');

    // Use d3.event.pageX e d3.event.pageY diretamente se disponíveis, caso contrário, use event.clientX e event.clientY
    var xPosition = d3.event ? d3.event.pageX : event.clientX + window.pageXOffset;
    var yPosition = d3.event ? d3.event.pageY : event.clientY + window.pageYOffset;

    tooltip.html(valores[i])
      .style('left', (xPosition + 10) + 'px')
      .style('top', (yPosition - 10) + 'px')
      .style('display', 'block');
  }

  // Função para ocultar o tooltip
  function hideTooltip() {
    d3.select('#tooltip').style('display', 'none');
  }

  // Adiciona as legendas nos eixos
  eixos.append('text')
    .attr('class', 'axisLabel')
    .attr('x', function (d, i) { return rScale.range()[1] * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr('y', function (d, i) { return rScale.range()[1] * Math.sin(angleSlice * i - Math.PI / 2); })
    .attr('dy', -10)  // ajuste de posição vertical
    .text(function (d, i) { return faixasEtarias[i]; });


  // Adiciona os paths
  svg.append('path')
    .attr('class', 'radarLine')
    .datum(valores)
    .attr('d', radarLine)
    .style('stroke', 'black')
    .style('fill', 'blue')
    .style('fill-opacity', 0.2)
    .style('stroke-width', 2);  // Adicione a largura da borda
}


// Lê o arquivo CSV para obter a lista de países
d3.csv('./data/DatasetResidentes3.csv').then(function (data) {
  csvData = data;  // Armazena os dados globalmente
  
  if (data.length > 0) {
    var primeiraRegiao = data[0].nome;
    updateRadarChart(primeiraRegiao);
  }
});
