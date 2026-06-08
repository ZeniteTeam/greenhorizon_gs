import api from "../axios";

export interface Point {
    latitude: number;
    longitude: number;
}

export interface AnalysisRequest {
    tipo: string;
    points : Point [];
};

export interface AnalysisResponse {
    id : number;
    ndviMedia : number;
    tipo : string;
    clima : string;
    date : string;
    status : string;
    recomendacao : string;
    temporada : string
    safra : string;
    coberturaVegetal : number;
    areaTotalPercentual : number;
};


export async function getAnalysisByUser(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
        console.log(request);
        const response = await api.post<AnalysisResponse>("/analysis", request );
        return response.data;
    } catch (error) {
        console.error("Error ao criar analise:", error);
        throw error;
    }
}
