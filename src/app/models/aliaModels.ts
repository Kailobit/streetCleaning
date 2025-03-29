export interface AliaDateRequestPayload {
    id_strada: string;
    trattostrada: string;
    tipo_strada: string;
    civico: string;
    comune: string;
}

export interface AliaStreetResponse {
    id_strada: string;
    nome: string;
    tipo_strada: string;
}

export interface AliaStretchResponse {
    tratto: string;
}
