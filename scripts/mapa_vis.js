// the data
const geoMap = "https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_60M_2013_4326_LEVL_3.geojson";
const natMort = "data/NatalidadeMortalidade.csv";
const demographics = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv";

// The svg
let svg = d3.select("#my_tree"),
width = +svg.attr("width"),
height = +svg.attr("height");

// Map and projection
// info: https://github.com/d3/d3-geo/blob/v3.0.1/README.md#geoPath
let path = d3.geoPath();

// info: https://github.com/d3/d3-geo#projections
let projection = d3.geoMercator()
.scale(5000)
.center([-8, 39.5])   
.translate([width / 2, height / 2]);

let colorScale = d3.scaleThreshold()
.domain([0, 2, 4, 6, 8, 10])
.range(d3.schemeBlues[7]);

// Load dados externos para o array
let promises = [d3.json(geoMap),
    d3.csv(natMort, function(d) { return{name: d.name, code: "PT" + d.code, tbn: +d.tbn.replace(",", ".")}}),
    ];

Promise.all(promises).then(draw_map);

function draw_map(data) {
    // Desenha o mapa
    svg.append("g")
    .selectAll("path")
        .data(data[0]['features']) // mapa com as shapes
        .enter()
        .filter(function (d){
            // desenhar apenas os países com códigos que começam com "PT"
            return d.properties.NUTS_ID.startsWith("PT");
        })
        .append("path")
        // desenha cada país consoante a projecção definida
        .attr("d", d3.geoPath().projection(projection))
        // .attr("fill", "#000000");
        // define a cor consoante a população
        .attr("fill", function (d) {
            // ir buscar a linha correspondente ao país
            let line = data[1].find(o => o.code === d.properties.NUTS_ID)
            return colorScale(line['tbn']);
        });
}