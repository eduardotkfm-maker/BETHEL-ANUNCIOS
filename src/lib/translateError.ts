/**
 * Traduz mensagens de erro comuns do Supabase e APIs para português.
 * Usado para exibir mensagens amigáveis ao usuário.
 */

const errorMap: Record<string, string> = {
    // Auth
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'Email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada (incluindo spam).',
    'User already registered': 'Este e-mail já está cadastrado.',
    'Signup requires a valid password': 'A senha precisa ter no mínimo 6 caracteres.',
    'Password should be at least 6 characters': 'A senha precisa ter no mínimo 6 caracteres.',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
    'For security purposes, you can only request this once every 60 seconds': 'Por segurança, aguarde 60 segundos antes de tentar novamente.',
    'New password should be different from the old password.': 'A nova senha deve ser diferente da senha atual.',
    'Auth session missing!': 'Sessão expirada. Faça login novamente.',
    'JWT expired': 'Sessão expirada. Faça login novamente.',
    'Invalid Refresh Token: Already Used': 'Sessão expirada. Faça login novamente.',
    'invalid claim: missing sub claim': 'Sessão inválida. Faça login novamente.',

    // Storage
    'The resource already exists': 'Este arquivo já existe.',
    'Bucket not found': 'Armazenamento não encontrado.',
    'The object exceeded the maximum allowed size': 'Arquivo muito grande. Reduza o tamanho e tente novamente.',
    'new row violates row-level security policy': 'Sem permissão para realizar esta ação.',

    // Database / RLS
    'duplicate key value violates unique constraint': 'Este registro já existe.',
    'violates foreign key constraint': 'Não é possível realizar esta ação pois há dados vinculados.',
    'permission denied for table': 'Sem permissão para acessar estes dados.',

    // Network
    'Failed to fetch': 'Erro de conexão. Verifique sua internet e tente novamente.',
    'Load failed': 'Erro de conexão. Verifique sua internet e tente novamente.',
    'NetworkError when attempting to fetch resource.': 'Erro de conexão. Verifique sua internet e tente novamente.',
    'The user aborted a request.': 'Requisição cancelada.',
};

export function traduzirErro(error: unknown, fallback?: string): string {
    if (!error) return fallback || 'Ocorreu um erro inesperado.';

    const msg = typeof error === 'string'
        ? error
        : (error as any)?.message || (error as any)?.error_description || '';

    // Busca tradução exata
    if (errorMap[msg]) return errorMap[msg];

    // Busca tradução parcial (contém o texto)
    for (const [key, translation] of Object.entries(errorMap)) {
        if (msg.toLowerCase().includes(key.toLowerCase())) {
            return translation;
        }
    }

    // Rate limit genérico
    if (msg.toLowerCase().includes('rate limit') || (error as any)?.status === 429) {
        return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';
    }

    return fallback || 'Ocorreu um erro inesperado. Tente novamente.';
}
