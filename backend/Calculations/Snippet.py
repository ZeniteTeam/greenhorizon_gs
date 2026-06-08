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
    coordinates = build_polygon(points)
    area = ee.Geometry.Polygon(coordinates)

    # Carrega a coleção Sentinel-2 Surface Reflectance Harmonized

    sentinel = (
       ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
       .filterBounds(area)
       .filterDate("2025-05-01", "2025-05-31")
       .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
    )

    # Cria uma composição mediana do período
    image = sentinel.median()

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
    
    #Cálculo da cobertura vegetal da área
    vegetation_mask = ndvi.gt(0.3).rename("vegetacao")
    
    # Calcula a área vegetada em m²
    vegetation_area_image = vegetation_mask.multiply(ee.Image.pixelArea()).rename("area_vegetada")

    vegetation_area_stats = vegetation_area_image.reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=area,
        scale=10,
        maxPixels=1e9
    )

    # Área vegetada em hectares
    area_vegetada_m2 = vegetation_area_stats.get("area_vegetada")
    area_vegetada_ha = ee.Number(area_vegetada_m2).divide(10000).getInfo()

    # Área total do polígono em hectares
    area_total_ha = area.area().divide(10000).getInfo()
    
    area_total_ha = round(area_total_ha, 1)

    # Percentual de cobertura vegetal
    cobertura_vegetal_percentual = (area_vegetada_ha / area_total_ha) * 100
    
    cobertura_vegetal_percentual = round(cobertura_vegetal_percentual, 1)

    #Tratamento caso o NDVI seja "None"
    if ndvi_value is None:
        return {
            "recomendacao": "Não foi possível calcular o NDVI para essa área e período. Tente outra área ou outro intervalo de datas.",
            "status": "Sem dados",
            "ndvi": None,
            "html": None
        }

    # Classifica a saúde da plantação com base no NDVI médio
    if ndvi_value < 0.3:
        status = "Ruim"
        recomendacao = "A vegetação está baixa ou estressada. Recomenda-se verificar irrigação, solo exposto ou falhas no plantio."
    elif ndvi_value < 0.6:
        status = "Médio"
        recomendacao = "A vegetação apresenta desenvolvimento moderado. Recomenda-se acompanhar a evolução nos próximos dias."
    else:
        status = "Bom"
        recomendacao = "A vegetação apresenta bom vigor. Manter o acompanhamento periódico da área."


    # Cria o mapa
    Map = geemap.Map()

    # Centraliza o mapa na área escolhida
    Map.centerObject(area, 15)

    # Adiciona a área de análise
    Map.addLayer(area, {"color": "red"}, "Área de análise")

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

    result = {
        "recomendacao": recomendacao,
        "status": status,
        "ndvi": ndvi_value,
        "area_total_ha": area_total_ha,
        "cobertura_vegetal_percentual": cobertura_vegetal_percentual,
        "html": Map.to_html()
    }

    return result