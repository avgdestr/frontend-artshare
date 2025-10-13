// src/api/apiHelper.ts
import api from "./api"; // your Axios instance
import type { AxiosProgressEvent } from "axios";

// Types
export interface Artist {
    id: number;
    username: string;
    email: string;
    bio?: string;
    profile_picture?: string;
    created_at: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    bio?: string;
    profile_picture?: File | null;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface Artwork {
    id: number;
    title: string;
    image: string;
    description?: string;
    artist: Artist;
    created_at: string;
}

export interface ArtworkData {
    title: string;
    image: File;
    description?: string;
}

// Artist API
export async function registerArtist(data: RegisterData): Promise<Artist> {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.bio) formData.append("bio", data.bio);
    if (data.profile_picture) formData.append("profile_picture", data.profile_picture);

    const response = await api.post<Artist>("/api/register/", formData);
    return response.data;
}

export async function loginArtist(data: LoginData) {
    // Return the full Axios response so callers can inspect headers in case
    // the backend returns the token there instead of in the JSON body.
    const response = await api.post("/api/login/", data);
    return response;
}

export async function getArtist(id: number): Promise<Artist> {
    const response = await api.get<Artist>(`/api/artists/${id}/`);
    return response.data;
}

// Some backends authenticate with session cookies instead of returning tokens.
// This helper attempts to fetch the currently authenticated artist. It enables
// sending credentials (cookies) on the request so servers that set a session
// cookie on login can be used for subsequent requests.
export async function getCurrentArtist(): Promise<Artist> {
    // Ensure cookies are sent for this request (the backend must allow credentials in CORS).
    api.defaults.withCredentials = true;
    const response = await api.get<Artist>(`/api/artists/me/`);
    return response.data;
}

export async function updateArtist(id: number, data: Partial<RegisterData>): Promise<Artist> {
    const formData = new FormData();
    if (data.username) formData.append("username", data.username);
    if (data.email) formData.append("email", data.email);
    if (data.password) formData.append("password", data.password);
    if (data.bio) formData.append("bio", data.bio);
    if (data.profile_picture) formData.append("profile_picture", data.profile_picture);

    const response = await api.patch<Artist>(`/api/artists/${id}/`, formData);
    return response.data;
}

// Artwork API
export async function createArtwork(
    data: ArtworkData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<Artwork> {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("image", data.image);
    if (data.description) formData.append("description", data.description);

    const response = await api.post<Artwork>("/api/artworks/", formData, {
        onUploadProgress,
    });
    return response.data;
}

export async function getArtwork(id: number): Promise<Artwork> {
    const response = await api.get<Artwork>(`/api/artworks/${id}/`);
    return response.data;
}

export async function getAllArtworks(): Promise<Artwork[]> {
    const response = await api.get<Artwork[]>("/api/artworks/");
    return response.data;
}

export async function updateArtwork(id: number, data: Partial<ArtworkData>): Promise<Artwork> {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.image) formData.append("image", data.image);
    if (data.description) formData.append("description", data.description);

    const response = await api.patch<Artwork>(`/api/artworks/${id}/`, formData);
    return response.data;
}

export async function deleteArtwork(id: number): Promise<void> {
    await api.delete(`/api/artworks/${id}/`);
}
