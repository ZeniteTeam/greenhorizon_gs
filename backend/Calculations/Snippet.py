import ee
import geemap


def build_polygon(points):
    if len(points) < 3:
        raise ValueError("É necessário informar pelo menos 3 pontos para formar uma área.")

    coordinates = []

    for point in points:
        coordinates.append([
            point.longitude,
            point.latitude
        ])

    if coordinates[0] != coordinates[-1]:
        coordinates.append(coordinates[0])

    return coordinates

def calculate(points):
    # Autentica e inicializa o Google Earth Engine
    ee.Authenticate()

    ee.Initialize(project='powerful-balm-394623')

    # Coordenadas
    print("Iniciando Cálculo...")
    coordinates = build_polygon(points)
    area = ee.Geometry.Polygon(coordinates)

    # Carrega a coleção Sentinel-2 Surface Reflectance Harmonized

    print("Carrega coleção Sentinel...")
    sentinel = (
       ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
       .filterBounds(area)
       .filterDate("2025-05-01", "2025-05-31")
       .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
    )

    # Cria uma composição mediana do período
    image = sentinel.median()

    print("Calcula NDVI...")
    # Calcula o NDVI: (B8 - B4) / (B8 + B4)
    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")

    # Calcula o NDVI médio da área
    ndvi_mean = ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=area,
        scale=10,
        maxPixels=1e9
    )
    # Pega o valor numérico do NDVI médio
    ndvi_value = ndvi_mean.get("NDVI").getInfo()
    ndvi_value = round(ndvi_value, 2)

    print("Cálcula área vegetal...")
    #Cálculo da cobertura vegetal da área
    vegetation_mask = ndvi.gt(0.3).rename("vegetacao")

    # Calcula a área vegetada em m²
    vegetation_area_image = vegetation_mask.multiply(ee.Image.pixelArea()).rename("area_vegetada")

    print("Imagem área vegetal...")
    vegetation_area_stats = vegetation_area_image.reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=area,
        scale=10,
        maxPixels=1e9
    )

    # Área vegetada em hectares
    print("Imagem área vegetal...")
    area_vegetada_m2 = vegetation_area_stats.get("area_vegetada")

    print("Imagem área vegetal...")
    area_vegetada_ha = ee.Number(area_vegetada_m2).divide(10000).getInfo()

    # Área total do polígono em hectares
    print("Imagem área vegetal...")
    area_total_ha = area.area().divide(10000).getInfo()
    
    area_total_ha = round(area_total_ha, 1)

    # Percentual de cobertura vegetal
    cobertura_vegetal_percentual = (area_vegetada_ha / area_total_ha) * 100
    
    cobertura_vegetal_percentual = round(cobertura_vegetal_percentual, 1)

    #Tratamento caso o NDVI seja "None"
    if ndvi_value is None:
        print("NDVI vazio")
        return {
            "recomendacao": "Não foi possível calcular o NDVI para essa área e período. Tente outra área ou outro intervalo de datas.",
            "status": "Sem dados",
            "ndvi": None,
            "html": None
        }

    # Classifica a saúde da plantação com base no NDVI médio
    recomendacao = []
    interpretacao = []
    if ndvi_value < 0.3:
        status = "Ruim"
        interpretacao.append("A vegetação apresenta desenvolvimento insuficiente.")
        recomendacao.append("Verificar irrigação e possíveis áreas mais secas.")
        recomendacao.append("Possível exposição do solo, verifique a mata.")
        recomendacao.append("Busque pela presença de pragas nas áreas amareladas e laranjas, caso encontre, aplicar defensivos imediatamente.")
    elif ndvi_value < 0.6:
        status = "Médio"
        interpretacao.append("A vegetação apresenta desenvolvimento moderado.")
        recomendacao.append("Recomenda-se acompanhar a evolução do solo mais de perto nos próximos dias.")
        recomendacao.append("Verifique possível presença de pragas.")
    elif ndvi_value >= 0.8:
        status = "Excelente"
        interpretacao.append("A vegetação apresenta um desenvolvimento incrível.")
        interpretacao.append("Solo está verde e bem irrigado dentro do nível médio NDVI esperado.")
        recomendacao.append("Continuar o manejo atual, indicadores demonstram bom desempenho da cultura.")
        recomendacao.append("Realizar inspeções preventivas para detecção antecipada de pragas e doenças.")
    else:
        status = "Bom"
        interpretacao.append("A vegetação apresenta bom vigor vegetativo.")
        interpretacao.append("Os índices indicam boa cobertura vegetal e atividade fotossintética adequada.")
        interpretacao.append("A maior parte da lavoura encontra-se dentro dos padrões esperados de crescimento.")
        recomendacao.append("Monitorar possíveis alterações nos próximos ciclos para identificar quedas precoces de vigor.")
        recomendacao.append("Manter as práticas de manejo adotadas, avaliando possíveis otimizações conforme a fase da cultura.")
        recomendacao.append("Comparar os resultados com análises anteriores para identificar padrões de desenvolvimento.")

    # Cria o mapa
    print("Cria mapa...")
    Map = geemap.Map()

    # Centraliza o mapa na área escolhida
    Map.centerObject(area, 15)

    # Adiciona a área de análise
    print("Cria Layer...")

    Map.addLayer(area, {"color": "red"}, "Área de análise")

    print("Cria Layer...")
    # Adiciona a imagem RGB natural
    Map.addLayer(
       image.clip(area),
       {
           "bands": ["B4", "B3", "B2"],
           "min": 0,
           "max": 3000
       },
       "Sentinel-2 RGB"
    )

    print("Cria Layer...")
    # Adiciona a camada NDVI
    Map.addLayer(
       ndvi.clip(area),
       {
           "min": 0,
           "max": 1,
           "palette": ["brown", "yellow", "green"]
       },
       "NDVI"
    )

    ndvi_vis = {
        "min": 0,
        "max": 1,
        "palette": ["brown", "yellow", "green"]
    }

    ndvi_clipped = ndvi.clip(area)

    map_id = ndvi_clipped.getMapId(ndvi_vis)

    tile_url = map_id["tile_fetcher"].url_format
    result = {
        "recomendacao": recomendacao,
        "interpretacao": interpretacao,
        "status": status,
        "ndvi": ndvi_value,
        "area_total_ha": area_total_ha,
        "cobertura_vegetal_percentual": cobertura_vegetal_percentual,
        "tile_url": tile_url
    }

    return result