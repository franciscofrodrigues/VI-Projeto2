// Dados
const geoMap = "https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_60M_2013_4326_LEVL_3.geojson";
const natMort = "data/NatalidadeMortalidade.csv";

// SVG
let svg = d3.select("#mapa"),
width = +svg.attr("width"),
height = +svg.attr("height");

// Mapa e projeção
let path = d3.geoPath();

let projection = d3.geoMercator()
.scale(7000)
.center([-8, 39.5])
.translate([width / 2, height / 2]);

let customColors = ['#9699D9', '#6A6C99', '#3E3F59', '#12121A'];

let colorScale = d3.scaleThreshold()
.domain([8, 12, 15, 18.7])
.range(customColors);

// Carregar dados externos para o array
let promises = [
  d3.json(geoMap),
  d3.csv(natMort, function(d) {
    return {
      nome: d.nome,
      codigo: "PT" + d.codigo,
      tbn: +d.tbn,
      tbm: +d.tbm
    };
  })
  ];

Promise.all(promises).then(draw_map);

function createPattern(defs, line) {
  const pattern = defs.append("pattern")
  .attr("id", "pattern_" + line.codigo)
  .attr("patternUnits", "userSpaceOnUse")
  .attr("width", line.tbn)
  .attr("height", line.tbn);

  pattern.append("circle")
  .attr("cx", line.tbn / 2)
  .attr("cy", line.tbn / 2)
  .attr("r", function() {
    let radiusScale = d3.scaleThreshold()
    .domain([6, 7, 8, 9])
    .range([0.5, 1.5, 2.5, 3.5]);
    return radiusScale(line.tbn);
  })
  .attr("fill", "#F2F2F2");
}


function draw_map(data) {
  const defs = svg.append("defs"); // Create pattern definitions

  data[1].forEach(function(line) {
    createPattern(defs, line); // Create pattern with TBN data
  });

  const region = {};

  data[0]['features']
  .filter(function(d) {
    return d.properties.NUTS_ID.startsWith("PT");
  })
  .forEach(function(d) {
    const codigo = d.properties.NUTS_ID;

    if (!region[codigo]) {
      region[codigo] = svg.append("g").attr("class", codigo);
    }

    const regionGroup = region[codigo];

    regionGroup.append("path")
    .attr("class", "region")
    .attr("d", path.projection(projection)(d))
    .attr("fill", function() {
      const line = data[1].find(o => o.codigo === codigo);
      if (line) {
        return colorScale(line['tbm']);
      }            
    })
    .attr("stroke", "#F2F2F2")
    .attr("stroke-width", 1);

    regionGroup.append("path")
    .attr("class", "pattern")
    .attr("d", path.projection(projection)(d))
    .attr("fill", function() {
      const line = data[1].find(o => o.codigo === codigo);
      if (line) {
        return "url(#pattern_" + line.codigo + ")";
      }
    });
  });

  d3.select('body')
  .on('click', function(e) {

      let targetSelected = e.target; // local onde ocorreu o clique
      let targetClass = e.target.classList; // verificar se o clique foi feito numa das regiões ou fora

      const codigoTarget = d3.select(targetSelected.parentNode).attr('class'); //verificar o código da região selecionada

      if(e.target.classList.contains('pattern')) { // se o clique se deu numa das re 

        const line = data[1].find(o => o.codigo === codigoTarget); // recolher dados da região selecionada
        let tbnValue, tbmValue, regionName = '';
        if (line) {
          regionName = line.nome;
          tbnValue = line.tbn;
          tbmValue = line.tbm;
        }


        var tbmArr = data[1].map(d => d.tbm);

        customColors = ['#9699D9', '#9699D9', '#12121A']; // trocar as cores para ter apenas 3 (abaixo, valor região selecionada, acima)

        let domain = [d3.min(tbmArr), tbmValue, d3.max(tbmArr)]; // recalcular o domínio para a região selecionada

        colorScale = d3.scaleThreshold()
        .domain(domain)
        .range(customColors);

        const filterRegion = data[0].features.filter(d => d.properties.NUTS_ID.startsWith("PT"));

        svg.selectAll(".region")
        .data(filterRegion)
        .attr("fill", function(d) {
          const codigo = d.properties.NUTS_ID;
          const line = data[1].find(o => o.codigo === codigo);
          if (line) {
            return colorScale(line['tbm']);
          }
        });

        // alterar texto (html) para o da região selecionada
        d3.select("#tbnH4").text('Taxa Bruta de Natalidade – '+tbnValue);
        d3.select("#tbmH4").text('Taxa Bruta de Mortalidade – '+tbmValue);
        d3.select("#regionSelected").text(regionName);
        d3.select("#regionSelected2").text(regionName);
        handleMapMouseOver(regionName);

        // svg.selectAll(".region").attr("opacity", 0.4); // trocar opacidade das restantes
        d3.select(targetSelected.parentNode).select(".region").attr("opacity", 1).attr('fill', '#6A6C99'); // região selecionada com opacidade máxima
      } else {
        svg.selectAll(".region").attr("opacity", 1); // se o clique se deu fora de uma das regiões 

        // alterar texto (html) para Portugal Continental
        d3.select("#tbnH4").text('');
        d3.select("#tbmH4").text('');
        d3.select("#regionSelected").text('');
        d3.select("#regionSelected2").text('Portugal Continental');
        handleMapMouseOver('Portugal Continental'); // reset radar chart
      }
    });
}

function handleMapMouseOver(regionName) {
  updateRadarChart(regionName); // Atualizar o valor da região no arquivo do gráfico de radar
}












