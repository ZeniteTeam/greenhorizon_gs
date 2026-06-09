import { useState } from "react";
import { userLogin, type AuthRequest, type AuthResponse } from "../../../api/user/user-login";
import { useAuthStore } from "../../../store/authStore";

export function useLogin() {
    const [auth, setAuth] = useState<AuthResponse>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setUser = useAuthStore((s) => s.setUser);

    async function login(AuthRequest: AuthRequest) {
        try {
            setLoading(true);

            const response = await userLogin(AuthRequest);

            setAuth(response);
            setUser(response.id, response.username, response.email);
        } catch (err) {
            setError("Falha ao realizar o login.");
            throw err;
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