function updateRadarChart(containerId, data) {
    var margin = { top: 200, right: 50, bottom: 50, left: 90 },
      width = 300,
      height = 300;
  
    var svg = d3.select('#' + containerId).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + (width / 2 + margin.left) + ',' + (height / 2 + margin.top) + ')');
  
    var numVars = 5;
    var angleSlice = Math.PI * 2 / numVars;
  
    var rScale = d3.scaleLinear()
      .range([0, Math.min(width / 2, height / 2)]);
  
    var radarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(function (d) { return rScale(d); })
      .angle(function (d, i) { return i * angleSlice; });
  
    var faixasEtarias = Object.keys(data).filter(key => key !== "codigo" && key !== "nome");
    var valores = faixasEtarias.map(key => +data[key]);
    var total = d3.sum(valores);

    rScale.domain([0, d3.max(valores)]);
  
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
  
    eixos.append('circle')
      .attr('class', 'axisMarker')
      .attr('r', 3)
      .attr('cx', function (d, i) { return rScale(valores[i]) * Math.cos(angleSlice * i - Math.PI / 2); })
      .attr('cy', function (d, i) { return rScale(valores[i]) * Math.sin(angleSlice * i - Math.PI / 2); })
      .on('mouseover', function (d, i) {
        showTooltip(valores[i]);
      })
      .on('mouseout', hideTooltip);
  
    function showTooltip(value) {
      var tooltip = d3.select('#tooltip');
  
      var xPosition = d3.event ? d3.event.pageX : event.clientX + window.pageXOffset;
      var yPosition = d3.event ? d3.event.pageY : event.clientY + window.pageYOffset;
  
      tooltip.html('Valor: ' + value)
        .style('left', (xPosition + 10) + 'px')
        .style('top', (yPosition - 10) + 'px')
        .style('display', 'block');
    }
  
    function hideTooltip() {
      d3.select('#tooltip').style('display', 'none');
    }
  
    eixos.append('text')
      .attr('class', 'axisLabel')
      .attr('x', function (d, i) { return rScale.range()[1] * Math.cos(angleSlice * i - Math.PI / 2); })
      .attr('y', function (d, i) { return rScale.range()[1] * Math.sin(angleSlice * i - Math.PI / 2); })
      .attr('dy', -5)
      .text(function (d, i) { return faixasEtarias[i]; });
  
    svg.append('path')
      .attr('class', 'radarLine')
      .datum(valores)
      .attr('d', radarLine)
      .style('stroke', 'black')
      .style('fill', 'blue')
      .style('fill-opacity', 0.2)
      .style('stroke-width', 2);
  
    // Adiciona título ao gráfico com o nome associado e numero total de habitantes
    svg.append('text')
      .attr('x', 0)
      .attr('y', -height / 2 - margin.top / 3)
      .attr('text-anchor', 'middle')
      .style('font-style', 'bold')
      .style('font-size', '120%')
      .text(data.nome);

      svg.append('text')
      .attr('x', 0)
      .attr('y', -height / 2 - margin.top / 5)
      .attr('text-anchor', 'middle')
      .style('font-style', 'bold')
      .style('font-size', '100%')
      .text('Total de Habitantes: '+ total);
  }
  
  // Lê o arquivo CSV para obter a lista de países
  d3.csv('./data/DatasetResidentes3.csv').then(function (data) {
    data.forEach(function (d, i) {
      var containerId = 'radarChart' + i;
      d3.select('body').append('div')
        .attr('id', containerId)
        .attr('class', 'radarContainer')
        .style('float', 'left')
        .style('margin-right', '20px');
      updateRadarChart(containerId, d);
    });
  });
  