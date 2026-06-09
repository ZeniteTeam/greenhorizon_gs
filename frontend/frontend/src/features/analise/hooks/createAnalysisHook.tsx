import { useState } from "react";
import { postAnalysisByUser, type AnalysisResponse, type Point} from "../../../api/analysis/post-analysis-by-user";
import { useAuthStore } from "../../../store/authStore";

interface CreateAnalysisParams {
    points: Point[];
    tipo: string;
}

export function useCreateAnalysis() {
    const [analysis, setAnalysis] = useState<AnalysisResponse>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const email = useAuthStore((s) => s.email);

    async function createAnalysis(params: CreateAnalysisParams) {
        if (!email) {
            setError("Usuário não autenticado.");
            return;
        }

        try {
            setLoading(true);
            const response = await postAnalysisByUser({ email, points: params.points, tipo: params.tipo });

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