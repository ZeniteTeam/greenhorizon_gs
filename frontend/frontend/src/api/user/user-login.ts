import api from "../axios";

export interface AuthRequest {
    email: string;
    password: string;
};

export interface AuthResponse {
    username: string;
    email: string;
};


export async function userLogin(AuthRequest: AuthRequest): Promise<AuthResponse> {
    try {
        const response = await api.post<AuthResponse>("/users/login", { AuthRequest: AuthRequest });
        return response.data;
    } catch (error) {
        console.error("Error ao realizar login:", error);
        throw error;
    }
}
