import { useEffect, useState } from "react";
import { getAnalysisByUser, type AnalysisResponse, type Point} from "../../../api/analysis/get-analysis-by-user";

export function useCreateAnalysis() {
    const [analysis, setAnalysis] = useState<AnalysisResponse>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function createAnalysis(points : Point []) {
        try {
            setLoading(true);

            const response = await getAnalysisByUser(points);

            setAnalysis(response);
        } catch (err) {
            setError("Falha ao criar análise. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return {
        createAnalysis,
        analise: analysis,
        loading,
        error,
    };
}