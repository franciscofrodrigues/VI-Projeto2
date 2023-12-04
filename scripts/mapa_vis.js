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

const customColors = ['#12121A', '#3E3F59', '#6A6C99', '#9699D9'];

let colorScale = d3.scaleThreshold()
.domain([5, 7, 9, 11])
.range(customColors);

// Load dados externos para o array
let promises = [
    d3.json(geoMap),
    d3.csv(natMort, function(d) { 
        return {
            nome: d.nome,
            codigo: "PT" + d.codigo,
            tbn: +d.tbn.replace(" ", "").replace(",", ".")
        };
    })
    ];

Promise.all(promises).then(draw_map);

function draw_map(data) {
    console.log(data[1]);

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
        // define a cor consoante a população
        .attr("fill", function (d) {
            // ir buscar a linha correspondente ao país
            let line = data[1].find(o => o.codigo === d.properties.NUTS_ID)
            console.log('Line:', line);

            if (line) {
                return colorScale(line['tbn']);
            }
});
}