// the data
const geoMap = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
const demographics = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv";
const countryPoints = "https://raw.githubusercontent.com/eesur/country-codes-lat-long/master/country-codes-lat-long-alpha3.json";

// The svg
let svg = d3.select("#my_map"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
// info: https://github.com/d3/d3-geo/blob/v3.0.1/README.md#geoPath
let path = d3.geoPath();

// info: https://github.com/d3/d3-geo#projections
let projection = d3.geoMercator()
    .scale(90)
    .center([20,40])
    .translate([width / 2, height / 2]);

let colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

// Load dados externos para o array
let promises = [d3.json(geoMap),
    d3.csv(demographics, function(d) { return{code: d.code, pop:+d.pop}}),
    d3.json(countryPoints)];

Promise.all(promises).then(draw_map);

function draw_map(data) {
    // Desenha o mapa
    svg.append("g")
        .selectAll("path")
        .data(data[0]['features']) // mapa com as shapes
        .enter()
        .filter(function (d){
            // desenhar apenas os paises encontrados no ficheiro das geometrias
            return data[1].find(o => o.code === d['id']) != undefined;
        })
        .append("path")
        // desenha cada país consoante a projecção definida
        .attr("d", d3.geoPath().projection(projection))
        // define a cor consoante a população
        .attr("fill", function (d) {
            // ir buscar a linha correspondente ao país
            let line = data[1].find(o => o.code === d['id']);
            return colorScale(line['pop']);
        });

    /* // escala para os circulos mediante valor da população
    let radScale = d3.scaleSqrt()
        .domain(d3.extent(data[1], function(d){
            return d['pop'];}))
        .range([0, 20]);

    // circulos com os valores da população
     svg.selectAll("myCircles")
        .data(data[1])
        .enter()
        .filter(function (d){
            // apenas os que encontra no ficheiro dos pontos centrais
            return data[2]["ref_country_codes"].find(o => o.alpha3 === d['code']) != undefined;})
        .append("circle")
        .attr("cx", function(d){
            const country = data[2]["ref_country_codes"].find(o => o.alpha3 === d['code']);
            return projection([country.longitude, country.latitude])[0]})
        .attr("cy", function(d){
            const country = data[2]["ref_country_codes"].find(o => o.alpha3 === d['code']);
            return projection([country.longitude, country.latitude])[1]})
        .attr("r", function(d){
            const pop = d['pop'] || 0;
            return radScale(pop);})
        .attr("fill", 'black')
        .attr('stroke', 'white')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.8); */


}