// Data provided
const data = `nome,codigo,tbn,tbm
Alto Minho,111,6.7,14.2
Cávado,112,8.0,8.8
Ave,119,7.7,9.3
Área Metropolitana do Porto,11A,7.5,10.2
Alto Tâmega,11B,4.8,17.3
Tâmega e Sousa,11C,7.2,9.7
Douro,11D,5.8,14.8
Terras de Trás-os-Montes,11E,5.7,16.4
Oeste,16B,8.0,12.6
Região de Aveiro,16D,7.5,11.2
Região de Coimbra,16E,6.7,13.7
Região de Leiria,16F,7.4,12.1
Viseu Dão Lafões,16G,6.4,14.5
Beira Baixa,16H,6.6,18.2
Médio Tejo,16I,6.3,15.7
Beiras e Serra da Estrela,16J,5.5,17.9
Área Metropolitana de Lisboa,170,9.8,10.9
Alentejo Litoral,181,8.0,14.0
Baixo Alentejo,184,8.1,18.0
Lezíria do Tejo,185,7.7,14.2
Alto Alentejo,186,6.7,18.7
Alentejo Central,187,7.2,16.2
Algarve,150,8.6,12.4
Ilha de Santa Maria,41,6.9,12.6
Ilha de São Miguel,42,9.3,9.9
Ilha Terceira,43,7.8,12.6
Ilha Graciosa,44,10.0,16.3
Ilha de São Jorge,45,7.7,15.7
Ilha do Pico,46,7.9,14.7
Ilha do Faial,47,7.8,11.9
Ilha das Flores,48,5.7,13.4
Ilha do Corvo,49,9.5,4.7
Ilha da Madeira,31,6.9,12.3
Ilha de Porto Santo,32,7.4,11.7`;

// Parsing the data
const rows = d3.csvParse(data, d => ({
  nome: d.nome,
  codigo: d.codigo,
  tbn: +d.tbn, // Convert strings to numbers
  tbm: +d.tbm
}));

// Extract the tbn values for the histogram
const tbnValues = rows.map(d => d.tbn);

// Assuming tbnValues contains your data values

const minValue = d3.min(tbnValues);
const maxValue = d3.max(tbnValues);

// Define explicit thresholds
const thresholds = [
  minValue,
  Math.floor(minValue + (maxValue - minValue) * 0.2),
  Math.floor(minValue + (maxValue - minValue) * 0.4),
  Math.floor(minValue + (maxValue - minValue) * 0.6),
  Math.floor(minValue + (maxValue - minValue) * 0.8),
  maxValue
];

const histogram = d3.histogram()
  .domain([minValue, maxValue])
  .thresholds(thresholds);

const bins = histogram(tbnValues);

console.log("Min: "+minValue + " " + "Max: "+maxValue);

// Display the bins
bins.forEach(bin => {
  console.log(`[${bin.x0}-${bin.x1}): ${bin.length}`);
});
