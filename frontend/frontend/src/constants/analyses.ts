import type { Analysis } from '../types';

export const GH_ANALYSES: Analysis[] = [
  {
    id: 'a-2024-0612',
    crop: 'Soja',
    cropIcon: '/imagery/crop-soy.png',
    date: '12/06/2024',
    location: 'Fazenda Santa Helena · Sorriso, MT',
    area: '97,6 ha',
    ndvi: 0.72,
    coverage: 86,
    vigor: 'Bom',
    verdict: 'good',
    verdictLabel: 'Cultivo Saudável',
    interpretation:[
      {
        id: 1,
        descricao: 'A área apresenta bom vigor vegetativo, com NDVI dentro da faixa ideal para a fase atual da cultura. Pequenas áreas com índices mais baixos (amarelos e vermelhos) podem indicar variações de solo, manejo ou estresse hídrico pontual.',
      }
    ],
    recommendations: [
      {
        id: 1,
        descricao: 'Manter o manejo atual, garantindo irrigação adequada e monitoramento contínuo.'
      },
      {
        id: 2,
        descricao: 'Monitorar áreas com NDVI mais baixo (vermelho e laranja).'
      },
      {
        id: 3,
        descricao: 'Verificar disponibilidade hídrica nas próximas semanas.'
      },
      {
        id: 4,
        descricao: 'Acompanhar pragas e doenças de acordo com o estágio da cultura.'
      },
      {
        id: 5,
        descricao: 'Realizar nova análise em 15–20 dias para acompanhar a evolução.'
      },
    ],
  },
  {
    id: 'a-2024-0528',
    crop: 'Milho',
    cropIcon: '/imagery/crop-corn.png',
    date: '28/05/2024',
    location: 'Sítio Boa Vista · Rio Verde, GO',
    area: '42,1 ha',
    ndvi: 0.58,
    coverage: 71,
    vigor: 'Moderado',
    verdict: 'warn',
    verdictLabel: 'Atenção pontual',
    interpretation:
    [{
      id: 1,
      descricao: 'O vigor está ligeiramente abaixo da faixa ideal para o estágio atual. Manchas com NDVI baixo sugerem estresse hídrico e possível deficiência de nitrogênio na porção sul do talhão.',
    }],
    recommendations: [
      {id: 1, descricao: 'Verificar o sistema de irrigação e a umidade do solo nas áreas afetadas.'},
      {
        id: 2, descricao: 'Considerar aplicação de adubo nitrogenado de cobertura, especialmente nas áreas com NDVI mais baixo.'
      },
      {id: 3, descricao: 'Inspecionar a campo para identificar possíveis pragas ou doenças que possam estar contribuindo para o estresse.'  },
      {id: 4, descricao: 'Realizar nova análise em 10–15 dias para monitorar a resposta às intervenções.'},
    ],    
  },
  {
    id: 'a-2024-0415',
    crop: 'Arroz',
    cropIcon: '/imagery/crop-rice.png',
    date: '15/04/2024',
    location: 'Fazenda Lagoa · Uruguaiana, RS',
    area: '63,4 ha',
    ndvi: 0.81,
    coverage: 92,
    vigor: 'Excelente',
    verdict: 'good',
    verdictLabel: 'Vigor excelente',
    interpretation: [
      {
        id: 1,
        descricao: 'Cobertura vegetal uniforme e vigorosa em quase toda a área analisada, com NDVI no topo da faixa ideal. A lavoura está bem estabelecida para a fase de enchimento de grãos.',
      }
    ],
    recommendations: [
      {
        id: 1,
        descricao: "Manter a lâmina d'água e o manejo atual."
      },
      {
        id: 2,
        descricao: 'Monitorar bordaduras com leve queda de índice.'
      },
      {
        id: 3,
        descricao: 'Planejar a colheita conforme a maturação fisiológica.'
      },
    ],
  },
  {
    id: 'a-2024-0322',
    crop: 'Soja',
    cropIcon: '/imagery/crop-soy.png',
    date: '22/03/2024',
    location: 'Fazenda Três Irmãos · Luís Eduardo Magalhães, BA',
    area: '118,9 ha',
    ndvi: 0.44,
    coverage: 58,
    vigor: 'Baixo',
    verdict: 'alert',
    verdictLabel: 'Estresse acentuado',
    interpretation: [
      {
        id: 1,
        descricao: 'Boa parte da área apresenta NDVI abaixo da faixa ideal, com predominância de tons amarelos e vermelhos. O padrão indica estresse hídrico acentuado e possível falha de estande na região central.',
      }
    ],
    recommendations: [
      {
        id: 1,
        descricao: 'Inspecionar a campo as regiões em vermelho com urgência.'
      },
      {
        id: 2,
        descricao: 'Verificar o sistema de irrigação e a compactação do solo.'
      },
      {
        id: 3,
        descricao: 'Avaliar replantio nas falhas de estande, se viável.'
      },
      {
        id: 4,
        descricao: 'Realizar nova análise em 7 dias.'
      },
    ],
  },
];
