import { useEffect, useState } from "react";
import { userLogin, type AuthRequest, type AuthResponse } from "../../../api/user/user-login";

export function useLogin() {
    const [auth, setAuth] = useState<AuthResponse>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function login(AuthRequest: AuthRequest) {
        try {
            setLoading(true);

            const response = await userLogin(AuthRequest);

            setAuth(response);
        } catch (err) {
            setError("Falha ao criar análise. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return {
        login,
        user: auth,
        loading,
        error,
    };
}