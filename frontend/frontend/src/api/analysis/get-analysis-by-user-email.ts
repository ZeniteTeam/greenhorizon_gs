import api from "../axios";
import type { InterpretacaoDto, RecomendacaoDto } from "./post-analysis-by-user";


export interface AnalysisResponse {
    id : number;
    ndviMedia : number;
    tipo : string;
    clima : string;
    date : string;
    status : string;
    recomendacao : RecomendacaoDto [];
    interpretacao : InterpretacaoDto [];
    temporada : string
    safra : string;
    coberturaVegetal : number;
    areaTotalPercentual : number;
    tileUrl : string;
};


export async function getAnalysisByUserEmail(id: number): Promise<AnalysisResponse[]> {
    try {
        const response = await api.get<AnalysisResponse[]>(`/analysis/user/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error ao criar analise:", error);
        throw error;
    }
}
