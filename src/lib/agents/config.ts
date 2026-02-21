// Aqui você define as URLs dos seus endpoints de IA (Webhook, n8n, Flowise, ou API Própria)
export const AGENT_CONFIG = {
    adAnalyzerUrl: import.meta.env.VITE_AD_ANALYZER_URL || 'YOUR_API_ENDPOINT_HERE',
    scriptGeneratorUrl: import.meta.env.VITE_SCRIPT_GENERATOR_URL || 'YOUR_API_ENDPOINT_HERE',
    adLibraryUrl: import.meta.env.VITE_AD_LIBRARY_URL || 'YOUR_API_ENDPOINT_HERE',
    // Adicione tokens de autorização se sua API precisar, ex:
    // apiKey: import.meta.env.VITE_AGENT_API_KEY || '',
};
