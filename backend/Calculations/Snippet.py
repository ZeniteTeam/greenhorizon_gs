import ee
import geemap

def calculate():
    # Autentica e inicializa o Google Earth Engine
    ee.Authenticate()

    ee.Initialize(project='powerful-balm-394623')

    # Área rural de exemplo no Brasil
    area = ee.Geometry.Polygon([
            [-53.8508, -24.7668],
            [-53.8478, -24.7668],
            [-53.8478, -24.7642],
            [-53.8508, -24.7642],
            [-53.8508, -24.7668]
    ])

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

    # Exibe os resultados no notebook
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
        "html": Map.to_html()
    }

    return result