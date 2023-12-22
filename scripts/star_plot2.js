var csvData;

//função para atualizar o gráfico de radar com base na seleção do utilizador no mapa
function updateRadarChart(regionName) {
  var selectedData = csvData.find(function (d) {
    return d.nome === regionName;
  });

  console.log('selectedData', selectedData);

  //remove o gráfico anterior se existir
  d3.select('#radarChart svg').remove();

  //configuração do radar chart
  var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 300,
    height = 300;

  var svg = d3.select('#radarChart svg');

  if (svg.empty()) {
    //criar SVG apenas se não existir
    svg = d3.select('#radarChart').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + (width / 2 + margin.left) + ',' + (height / 2 + margin.top) + ')');
  } else {
    //limpar conteúdo se houver
    svg.selectAll('*').remove();
  }

  //número de lados no radar chart
  var numVars = 5;  // número de faixas etárias

  //angulo de cada eixo no radar chart
  var angleSlice = Math.PI * 2 / numVars;

  //configuração da escala radial
  var rScale = d3.scaleLinear()
    .range([0, Math.min(width / 2, height / 2)]);

  //linhas
  var radarLine = d3.lineRadial()
    .curve(d3.curveLinearClosed)
    .radius(function (d) { return rScale(d); })
    .angle(function (d, i) { return i * angleSlice; });


  //adiciona os eixos
  var eixos = svg.selectAll('.axis')
    .data(d3.range(numVars))
    .enter()
    .append('g')
    .attr('class', 'axis')
    .style('stroke', 'black');

  eixos.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', function (d, i) { return rScale.range()[1] * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr('y2', function (d, i) { return rScale.range()[1] * Math.sin(angleSlice * i - Math.PI / 2); })
    .attr('class', 'axisLine')
    .style('stroke', 'black')  
    .style('stroke-width', 1); 


  //lê os dados do CSV e cria o radar chart
  var faixasEtarias = Object.keys(selectedData).filter(key => key !== "codigo" && key !== "nome");
  var valores = faixasEtarias.map(key => +selectedData[key]); //converte os valores para números
  var regioes = Object(selectedData.nome)

  console.log('Valores:', valores);
  console.log('regioes:', regioes);

  //escala
  rScale.domain([0, d3.max(valores)]);

  //adiciona pontos nos eixos
  eixos.append('circle')
    .attr('class', 'axisMarker')
    .attr('r', 3)  // raio do marcador
    .attr('cx', function (d, i) { return rScale(valores[i]) * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr('cy', function (d, i) { return rScale(valores[i]) * Math.sin(angleSlice * i - Math.PI / 2); })
    .on('mouseover', function (d, i) {
      showTooltip(d, i); //função para exibir tooltip
    })
    .on('mouseout', function () {
      hideTooltip(); //unção para ocultar tooltip
    });;


  //função para exibir o tooltip
  function showTooltip(d, i) {
    var tooltip = d3.select('#tooltip');

    //posições do que é exibido
    var xPosition = d3.event ? d3.event.pageX : event.clientX + window.pageXOffset;
    var yPosition = d3.event ? d3.event.pageY : event.clientY + window.pageYOffset;

    tooltip
      .html(valores[i])
      .style('position', 'absolute')
      .style('left', (xPosition - 100) + 'px') 
      .style('top', (yPosition - 30) + 'px')  
      .style('display', 'block');
  }

  //função para ocultar o tooltip
  function hideTooltip() {
    d3.select('#tooltip').style('display', 'none');
  }

  //adiciona as legendas nos eixos
  eixos.append('text')
    .attr('class', 'axisLabel')
    .attr('x', function (d, i) { return rScale.range()[1] * Math.cos(angleSlice * i - Math.PI / 2); })
    .attr('y', function (d, i) { return rScale.range()[1] * Math.sin(angleSlice * i - Math.PI / 2); })
    .attr('dy', -10)  // ajuste de posição vertical
    .text(function (d, i) { return faixasEtarias[i]; });


  //adiciona os paths
  svg.append('path')
    .attr('class', 'radarLine')
    .datum(valores)
    .attr('d', radarLine)
    .style('stroke', 'black')
    .style('fill', '#9699D9')
    .style('fill-opacity', 0.5)
    .style('stroke-width', 1);  
}


// Lê o arquivo CSV para obter a lista de países
d3.csv('./data/DatasetResidentes3.csv').then(function (data) {
  csvData = data;  // Armazena os dados globalmente

  if (data.length > 0) {
    var primeiraRegiao = data[0].nome;
    updateRadarChart(primeiraRegiao);
  }
});
