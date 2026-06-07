import api from "../axios";

export interface Point {
    latitude: number;
    longitude: number;
}

export interface AnalysisRequest {
    Points : Point [];
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
};


export async function getAnalysisByUser(points: Point[]): Promise<AnalysisResponse> {
    try {
        const response = await api.post<AnalysisResponse>("/analysis", { Points: points });
        return response.data;
    } catch (error) {
        console.error("Error ao criar analise:", error);
        throw error;
    }
}
