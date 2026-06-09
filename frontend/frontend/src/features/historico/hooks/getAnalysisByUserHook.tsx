import { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { getAnalysisByUserEmail, type AnalysisResponse } from "../../../api/analysis/get-analysis-by-user-email";

export function useGetAnalysis() {
    const [analysis, setAnalysis] = useState<AnalysisResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const id = useAuthStore((s) => s.id);

    async function getAnalysis() {
        if (!id) {
            setError("Usuário não autenticado.");
            return;
        }

        try {
            setLoading(true);
            const response = await getAnalysisByUserEmail(id)
            setAnalysis(response);
        } catch (err) {
            setError("Falha ao carregar analises. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return {
        getAnalysis,
        analises: analysis,
        loading,
        error,
    };
}