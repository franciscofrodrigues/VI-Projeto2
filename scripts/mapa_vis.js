// Dados
const geoMap = "https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_60M_2013_4326_LEVL_3.geojson";
const natMort = "data/NatalidadeMortalidade.csv";

// SVG
let svg = d3.select("#mapa"),
width = +svg.attr("width"),
height = +svg.attr("height");

// Mapa e projeção
// info: https://github.com/d3/d3-geo/blob/v3.0.1/README.md#geoPath
let path = d3.geoPath();

// info: https://github.com/d3/d3-geo#projections
let projection = d3.geoMercator()
.scale(5000)
.center([-8, 39.5])   
.translate([width / 2, height / 2]);


const customColors = ['#12121A', '#3E3F59', '#6A6C99', '#9699D9'];

let colorScale = d3.scaleThreshold()
.domain([8, 12, 15, 18.7]) // cores das regiões com base nos limites definidos
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
    .range([0.5, 1.5, 2.5, 3.5]); // raio dos circulos com base nos limites definidos
    return radiusScale(line.tbn);
  })
  .attr("fill", "#f2f2f2");
}


function draw_map(data) {

  const defs = svg.append("defs"); // criação dos padrões

  data[1].forEach(function (line) {
    createPattern(defs, line); // criar padrão com base nos dados de TBN
  });

  let region = svg.append("g");

  region.selectAll("path") // desenha o mapa
        .data(data[0]['features']) // mapa com as formas
        .enter()
        .filter(function (d){
            return d.properties.NUTS_ID.startsWith("PT"); // desenhar apenas os países com códigos que começam com "PT"
          })
        .append("path")
        .attr("d", d3.geoPath().projection(projection)) // desenha cada país consoante a projecção definida
        .attr("fill", function (d) { // define a cor consoante a TBM
            let line = data[1].find(o => o.codigo === d.properties.NUTS_ID) // ir buscar a linha correspondente ao país
            if (line) {
              return colorScale(line['tbm']);
            }            
          })
        .attr("stroke", "#F2F2F2")
        .attr("stroke-width", 1);


        region.selectAll("path")
        .data(data[0]['features']) // mapa com as formas
        .enter()
        .filter(function (d) {
          return d.properties.NUTS_ID.startsWith("PT"); // desenhar apenas os países com códigos que começam com "PT"
        })
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", function (d) {
          let line = data[1].find(o => o.codigo === d.properties.NUTS_ID);
          if (line) {
            return "url(#pattern_" + line.codigo + ")";
          }
        });
      }