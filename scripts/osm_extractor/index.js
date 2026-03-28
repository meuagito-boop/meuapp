const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURAÇÕES DA EXTRAÇÃO
// ==========================================
const CITY = "São Paulo";
const STATE = "São Paulo";
const COUNTRY = "Brazil";
const TIMEOUT_SEC = 300; // Tempo máximo de resposta, pois a busca é gigante

// Onde o arquivo super completo com os dados reais será salvo
const OUTPUT_FILE = path.join(__dirname, 'sao_paulo_todos_comercios.json');

// ==========================================
// QUERY DO OVERPASS (Idêntica ao Overpass Turbo)
// ==========================================
const query = `
  [out:json][timeout:${TIMEOUT_SEC}];
  
  // 1. Definição da Área
  area["name"="${CITY}"]["admin_level"="8"]->.searchArea;
  
  // 2. O que nós queremos buscar lá dentro? (Todas as categorias)
  (
    // Gastronomia, Lazer e Noite
    node["amenity"~"restaurant|bar|cafe|fast_food|pub|nightclub|ice_cream|events_venue|cinema|theatre"](area.searchArea);
    
    // Hospedagem
    node["tourism"~"hotel|hostel|motel|guest_house"](area.searchArea);
    
    // Beleza e Clínicas
    node["shop"~"hairdresser|beauty|massage|tattoo"](area.searchArea);
    node["amenity"~"clinic|dentist|doctors|veterinary"](area.searchArea);
    node["healthcare"~"psychotherapist|physiotherapist|alternative"](area.searchArea);
    
    // Serviços, Varejo e Carros
    node["shop"~"car_repair|supermarket|convenience|clothes|electronics|bakery|pet|florist|hardware"](area.searchArea);
    
    // Prática de Esportes
    node["leisure"~"fitness_centre|sports_centre|bowling_alley|dance"](area.searchArea);
  );
  
  // 3. Me entregue os dados!
  out body;
  >;
  out skel qt;
`;

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

async function extrairTudo() {
  console.log(`\n🚀 Iniciando extração MASSIVA de dados reais pelo Script (OSM)...`);
  console.log(`📍 Alvo: ${CITY}`);
  console.log(`🛒 Buscando: Bares, Hotéis, Salões, Oficinas, Clínicas, etc...\n`);
  
  try {
    console.log(`⏳ Aguarde. Conectando aos satélites do OSM e processando o grande volume de dados (Isso leva alguns minutos)...\n`);
    
    // O Axios envia a "Frase (Query)" silenciosamente para a API do site, igual o botão "Run" do Wizard
    const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;
    
    if (!data.elements || data.elements.length === 0) {
      console.log('❌ Nada encontrado.');
      return;
    }

    const estabelecimentos = [];

    for (const element of data.elements) {
      // Regra de Ouro: Só queremos os que tem NOME, senão é lixo inútil para o Meu Agito
      if (!element.tags || !element.tags.name) continue;

      const tags = element.tags;
      
      const poi = {
        osm_id: element.id,
        nome: tags.name,
        // Pegando a categoria raiz de onde achou: amenity, shop, tourism, leisure, healthcare...
        categoria_bruta: tags.amenity || tags.shop || tags.tourism || tags.healthcare || tags.leisure || 'outros',
        telefone: tags.phone || tags['contact:phone'] || null,
        site: tags.website || tags['contact:website'] || null,
        // Endereçamento Geoespacial
        rua: tags['addr:street'] || null,
        numero: tags['addr:housenumber'] || null,
        bairro: tags['addr:suburb'] || null,
        cidade: tags['addr:city'] || CITY,
        cep: tags['addr:postcode'] || null,
        latitude: element.lat,
        longitude: element.lon
      };

      estabelecimentos.push(poi);
    }

    console.log(`✅ O Overpass nos devolveu ${data.elements.length} pontos brutos.`);
    console.log(`🎯 Após nossa limpeza térmica de robô, salvamos ${estabelecimentos.length} comércios VÁLIDOS (com nome e categoria).\n`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(estabelecimentos, null, 2));
    
    console.log(`💾 Golaço! O arquivo está salvo em:`);
    console.log(`👉 ${OUTPUT_FILE}`);
    console.log(`Agora está pronto para a próxima etapa (Cruzar Foursquare/CNPJ)!`);

  } catch (error) {
    console.error('❌ Erro da API:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

extrairTudo();
