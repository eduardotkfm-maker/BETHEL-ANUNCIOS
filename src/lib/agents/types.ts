export interface AdAnalyzerRequest {
    url: string;
}

export interface AdAnalyzerResponse {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export interface ScriptGeneratorRequest {
    productName: string;
    niche: string;
    pain: string;
    desire: string;
}

export interface ScriptGeneratorResponse {
    script: string;
}

export interface AdLibraryRequest {
    searchTerm: string;
    country: string;
    status: 'all' | 'active' | 'inactive';
}

export interface AdResult {
    title: string;
    niche: string;
    thumbnailUrl: string;
    ctr: string;
    roas: string;
    views: string;
}

export interface AdLibraryResponse {
    results: AdResult[];
}
