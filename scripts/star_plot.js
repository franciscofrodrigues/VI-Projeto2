var RadarChart = {
    defaultConfig: {
      containerClass: 'radar-chart',
      w: 400,
      h: 400,
      factor: 0.9, //fator que determina o tamanho do gráfico
      factorLegend: 1,
      levels: 5, //numero de niveis do gráfico
      levelTick: false,
      TickLength: 10,
      maxValue: 0, //valor maximo e minimo nos eixos
      minValue: 0,
      radians: 2 * Math.PI,
      color: d3.scale.category10(),
      axisLine: true, //exibir as linhas e os textos
      axisText: true,
      circles: true, //para exibir os círculos
      radius: 1,
      open: false,
      backgroundTooltipColor: "#555", //para formatar os textos quando passamos o rato por cima
      backgroundTooltipOpacity: "0.7",
      tooltipColor: "white",
      axisJoin: function(d, i) {
        return d.className || i;
      },
      tooltipFormatValue: function(d) {
        return d;
      },
      tooltipFormatClass: function(d) {
        return d;
      },
      transitionDuration: 300
    },
    chart: function() { //retorna o gráfico
      // default config
      var cfg = Object.create(RadarChart.defaultConfig);
      function setTooltip(tooltip, msg){ //para exibi o texto quando passamos o rato por cima
        if(msg === false || msg == undefined){
          tooltip.classed("visible", 0);
          tooltip.select("rect").classed("visible", 0);
        }else{
          tooltip.classed("visible", 1);
  
          var container = tooltip.node().parentNode;
          var coords = d3.mouse(container);
  
          tooltip.select("text").classed('visible', 1).style("fill", cfg.tooltipColor);
          var padding=5;
          var bbox = tooltip.select("text").text(msg).node().getBBox();
  
          tooltip.select("rect")
          .classed('visible', 1).attr("x", 0)
          .attr("x", bbox.x - padding)
          .attr("y", bbox.y - padding)
          .attr("width", bbox.width + (padding*2))
          .attr("height", bbox.height + (padding*2))
          .attr("rx","5").attr("ry","5")
          .style("fill", cfg.backgroundTooltipColor).style("opacity", cfg.backgroundTooltipOpacity);
          tooltip.attr("transform", "translate(" + (coords[0]+10) + "," + (coords[1]-10) + ")")
        }
      }
      function radar(selection) { //função principal que desenha o radar
        selection.each(function(data) {
          var container = d3.select(this);
          var tooltip = container.selectAll('g.tooltip').data([data[0]]);
  
          var tt = tooltip.enter()
          .append('g')
          .classed('tooltip', true)
  
          tt.append('rect').classed("tooltip", true);
          tt.append('text').classed("tooltip", true);
  
          // allow simple notation
          data = data.map(function(datum) {
            if(datum instanceof Array) {
              datum = {axes: datum};
            }
            return datum;
          });
  
          var maxValue = Math.max(cfg.maxValue, d3.max(data, function(d) {
            return d3.max(d.axes, function(o){ return o.value; });
          }));
          maxValue -= cfg.minValue;
  
          var allAxis = data[0].axes.map(function(i, j){ return {name: i.axis, xOffset: (i.xOffset)?i.xOffset:0, yOffset: (i.yOffset)?i.yOffset:0}; });
          var total = allAxis.length;
          var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
          var radius2 = Math.min(cfg.w / 2, cfg.h / 2);
  
          container.classed(cfg.containerClass, 1);
  
          function getPosition(i, range, factor, func){ //funções auxiliares para calcular as coordenadas x e y com base no índice, intervalo e fator.
            factor = typeof factor !== 'undefined' ? factor : 1;
            return range * (1 - factor * func(i * cfg.radians / total));
          }
          function getHorizontalPosition(i, range, factor){
            return getPosition(i, range, factor, Math.sin);
          }
          function getVerticalPosition(i, range, factor){
            return getPosition(i, range, factor, Math.cos);
          }
  
          // desenhar os grupos e as linhas que representam os níveis
          var levelFactors = d3.range(0, cfg.levels).map(function(level) {
            return radius * ((level + 1) / cfg.levels);
          });
  
          var levelGroups = container.selectAll('g.level-group').data(levelFactors);
  
          levelGroups.enter().append('g');
          levelGroups.exit().remove();
  
          levelGroups.attr('class', function(d, i) {
            return 'level-group level-group-' + i;
          });
  
          var levelLine = levelGroups.selectAll('.level').data(function(levelFactor) {
            return d3.range(0, total).map(function() { return levelFactor; });
          });
  
          levelLine.enter().append('line');
          levelLine.exit().remove();
  
          if (cfg.levelTick){
            levelLine
            .attr('class', 'level')
            .attr('x1', function(levelFactor, i){
              if (radius == levelFactor) {
                return getHorizontalPosition(i, levelFactor);
              } else {
                return getHorizontalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
              }
            })
            .attr('y1', function(levelFactor, i){
              if (radius == levelFactor) {
                return getVerticalPosition(i, levelFactor);
              } else {
                return getVerticalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
              }
            })
            .attr('x2', function(levelFactor, i){
              if (radius == levelFactor) {
                return getHorizontalPosition(i+1, levelFactor);
              } else {
                return getHorizontalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
              }
            })
            .attr('y2', function(levelFactor, i){
              if (radius == levelFactor) {
                return getVerticalPosition(i+1, levelFactor);
              } else {
                return getVerticalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
              }
            })
            .attr('transform', function(levelFactor) {
              return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
            });
          }
          else{
            levelLine
            .attr('class', 'level')
            .attr('x1', function(levelFactor, i){ return getHorizontalPosition(i, levelFactor); })
            .attr('y1', function(levelFactor, i){ return getVerticalPosition(i, levelFactor); })
            .attr('x2', function(levelFactor, i){ return getHorizontalPosition(i+1, levelFactor); })
            .attr('y2', function(levelFactor, i){ return getVerticalPosition(i+1, levelFactor); })
            .attr('transform', function(levelFactor) {
              return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
            });
          }
          if(cfg.axisLine || cfg.axisText) {
            var axis = container.selectAll('.axis').data(allAxis); //linhas e textos que representam os eixos
  
            var newAxis = axis.enter().append('g');
            if(cfg.axisLine) {
              newAxis.append('line');
            }
            if(cfg.axisText) {
              newAxis.append('text');
            }
  
            axis.exit().remove();
  
            axis.attr('class', 'axis');
  
            if(cfg.axisLine) {
              axis.select('line')
              .attr('x1', cfg.w/2)
              .attr('y1', cfg.h/2)
              .attr('x2', function(d, i) { return (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factor); })
              .attr('y2', function(d, i) { return (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factor); });
            }
  
            if(cfg.axisText) {
              axis.select('text')
              .attr('class', function(d, i){
                var p = getHorizontalPosition(i, 0.5);
  
                return 'legend ' +
                ((p < 0.4) ? 'left' : ((p > 0.6) ? 'right' : 'middle'));
              })
              .attr('dy', function(d, i) {
                var p = getVerticalPosition(i, 0.5);
                return ((p < 0.1) ? '1em' : ((p > 0.9) ? '0' : '0.5em'));
              })
              .text(function(d) { return d.name; })
              .attr('x', function(d, i){ return d.xOffset+ (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factorLegend); })
              .attr('y', function(d, i){ return d.yOffset+ (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factorLegend); });
            }
          }
  
          // content
          data.forEach(function(d){
            d.axes.forEach(function(axis, i) {
              axis.x = (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, (parseFloat(Math.max(axis.value - cfg.minValue, 0))/maxValue)*cfg.factor);
              axis.y = (cfg.h/2-radius2)+getVerticalPosition(i, radius2, (parseFloat(Math.max(axis.value - cfg.minValue, 0))/maxValue)*cfg.factor);
            });
          });
          var polygon = container.selectAll(".area").data(data, cfg.axisJoin); //elemento svg
  
          var polygonType = 'polygon';
          if (cfg.open) {
            polygonType = 'polyline';
          }
  
          polygon.enter().append(polygonType)
          .classed({area: 1, 'd3-enter': 1})
          .on('mouseover', function (dd){
            d3.event.stopPropagation();
            container.classed('focus', 1);
            d3.select(this).classed('focused', 1);
            setTooltip(tooltip, cfg.tooltipFormatClass(dd.className));
          })
          .on('mouseout', function(){
            d3.event.stopPropagation();
            container.classed('focus', 0);
            d3.select(this).classed('focused', 0);
            setTooltip(tooltip, false);
          });
  
          polygon.exit()
          .classed('d3-exit', 1) // trigger css transition
          .transition().duration(cfg.transitionDuration)
          .remove();
  
          polygon
          .each(function(d, i) {
            var classed = {'d3-exit': 0}; // if exiting element is being reused
            classed['radar-chart-serie' + i] = 1;
            if(d.className) {
              classed[d.className] = 1;
            }
            d3.select(this).classed(classed);
          })
          // styles should only be transitioned with css
          .style('stroke', function(d, i) { return cfg.color(i); })
          .style('fill', function(d, i) { return cfg.color(i); })
          .transition().duration(cfg.transitionDuration)
          // svg attrs with js
          .attr('points',function(d) {
            return d.axes.map(function(p) {
              return [p.x, p.y].join(',');
            }).join(' ');
          })
          .each('start', function() {
            d3.select(this).classed('d3-enter', 0); // trigger css transition
          });
  
          if(cfg.circles && cfg.radius) {
  
            var circleGroups = container.selectAll('g.circle-group').data(data, cfg.axisJoin);
  
            circleGroups.enter().append('g').classed({'circle-group': 1, 'd3-enter': 1});
            circleGroups.exit()
            .classed('d3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();
  
            circleGroups
            .each(function(d) {
              var classed = {'d3-exit': 0}; // if exiting element is being reused
              if(d.className) {
                classed[d.className] = 1;
              }
              d3.select(this).classed(classed);
            })
            .transition().duration(cfg.transitionDuration)
            .each('start', function() {
              d3.select(this).classed('d3-enter', 0); // trigger css transition
            });
  
            var circle = circleGroups.selectAll('.circle').data(function(datum, i) { //elemento svg
              return datum.axes.map(function(d) { return [d, i]; });
            });
  
            circle.enter().append('circle')
            .classed({circle: 1, 'd3-enter': 1})
            .on('mouseover', function(dd){
              d3.event.stopPropagation();
              setTooltip(tooltip, cfg.tooltipFormatValue(dd[0].value));
              //container.classed('focus', 1);
              //container.select('.area.radar-chart-serie'+dd[1]).classed('focused', 1);
            })
            .on('mouseout', function(dd){
              d3.event.stopPropagation();
              setTooltip(tooltip, false);
              container.classed('focus', 0);
              //container.select('.area.radar-chart-serie'+dd[1]).classed('focused', 0);
              //No idea why previous line breaks tooltip hovering area after hoverin point.
            });
  
            circle.exit()
            .classed('d3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();
  
            circle
            .each(function(d) {
              var classed = {'d3-exit': 0}; // if exit element reused
              classed['radar-chart-serie'+d[1]] = 1;
              d3.select(this).classed(classed);
            })
            // styles should only be transitioned with css
            .style('fill', function(d) { return cfg.color(d[1]); })
            .transition().duration(cfg.transitionDuration)
            // svg attrs with js
            .attr('r', cfg.radius)
            .attr('cx', function(d) {
              return d[0].x;
            })
            .attr('cy', function(d) {
              return d[0].y;
            })
            .each('start', function() {
              d3.select(this).classed('d3-enter', 0); // trigger css transition
            });
  
            //Make sure layer order is correct
            var poly_node = polygon.node();
            poly_node.parentNode.appendChild(poly_node);
  
            var cg_node = circleGroups.node();
            cg_node.parentNode.appendChild(cg_node);
  
            // ensure tooltip is upmost layer
            var tooltipEl = tooltip.node();
            tooltipEl.parentNode.appendChild(tooltipEl);
          }
        });
      }
  
      radar.config = function(value) { //para obter as configurações do gráfico
        if(!arguments.length) {
          return cfg;
        }
        if(arguments.length > 1) {
          cfg[arguments[0]] = arguments[1];
        }
        else {
          d3.entries(value || {}).forEach(function(option) {
            cfg[option.key] = option.value;
          });
        }
        return radar;
      };

      return radar;
    },
    draw: function(id, d, options) { //criar um novo gráfico
      var chart = RadarChart.chart().config(options);
      var cfg = chart.config();
  
      d3.select(id).select('svg').remove();
      d3.select(id)
      .append("svg")
      .attr("width", cfg.w)
      .attr("height", cfg.h)
      .datum(d)
      .call(chart);
    }
  };




RadarChart.defaultConfig.color = function() {};
RadarChart.defaultConfig.radius = 3;

  
// Função para carregar dados de um arquivo CSV
function loadList(callback) {
  d3.csv("./data/DatasetResidentes2.csv", function (data) {
      // Chama a função de callback com os dados carregados
      callback(data);
  });
}

// Função para extrair a primeira coluna do CSV
function extrairPrimeiraColuna(data, callback) {
  // Obtém os valores da primeira coluna
  var primeiraColuna = data.map(function (d) {
      return d.nome;
  });

  // Imprime os valores na página
  var listaConteudo = document.getElementById('listaConteudo');
  primeiraColuna.forEach(function (valor) {
      var li = document.createElement('li');
      li.textContent = valor;
      li.addEventListener('click', function () {
          // Quando um nome é clicado, encontra os dados correspondentes no CSV
          var dadosDoNome = data.find(function (item) {
              return item.nome === valor;
          });

          // Atualiza o gráfico de radar
          callback([dadosDoNome]);
      });
      listaConteudo.appendChild(li);
  });
}

// Carregar dados e extrair a primeira coluna
loadList(function (data) {
  extrairPrimeiraColuna(data, drawRadarChart);
});


      // Função para carregar dados de um arquivo CSV
  function loadCSV(callback) {
    d3.csv("./data/DatasetResidentes2.csv", function(data) {

      var primeiraLinha = data[0];

      // Formatar os dados conforme esperado pelo gráfico de radar
      var formattedData = data.map(function(d) {
        return {
          className: primeiraLinha.nome,
          axes: [
            {axis: "0 - 19", value: +d['0-19']},
            {axis: "20 - 39", value: +d['20-39']},
            {axis: "40 - 59", value: +d['40-59']},
            {axis: "60 - 79", value: +d['60-79']},
            {axis: "80+", value: +d['80+']}
          ]
        };
      });
      
      callback(formattedData);
      console.log(formattedData[0].className)
      console.log(formattedData.map(item => item.className));
    });

  }

  // Função para desenhar o gráfico de radar com os dados carregados
  function drawRadarChart(data) {
    RadarChart.defaultConfig.levelTick = true;

    console.log("Dados recebidos:", data);

    d3.select(".chart-container").html("");

    console.log("Desenhando gráfico com dados:", data);
    
    RadarChart.draw(".chart-container", data);
  }
  
  

  // Carregar dados e desenhar o gráfico de radar
  loadCSV(drawRadarChart);