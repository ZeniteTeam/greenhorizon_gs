import api from "../axios";

export interface Point {
    latitude: number;
    longitude: number;
}

export interface InterpretacaoDto {
    id: number;
    descricao: string;
}

export interface RecomendacaoDto {
    id: number;
    descricao: string;
}

export interface AnalysisRequest {
    email: string;
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
    recomendacao : RecomendacaoDto [];
    interpretacao : InterpretacaoDto [];
    temporada : string;
    safra : string;
    coberturaVegetal : number;
    areaTotalPercentual : number;
    tileUrl : string;
};


export async function postAnalysisByUser(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
        const response = await api.post<AnalysisResponse>("/analysis", request );
        return response.data;
    } catch (error) {
        console.error("Error ao criar analise:", error);
        throw error;
    }
}
