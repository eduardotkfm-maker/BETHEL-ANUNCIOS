import ReactMarkdown from 'react-markdown';

interface ScriptMarkdownProps {
    content: string;
}

/**
 * Renderizador de markdown estilizado para roteiros MOVI.
 * Usa CSS custom properties para suportar dark/light corretamente.
 */
export function ScriptMarkdown({ content }: ScriptMarkdownProps) {
    return (
        <div style={{
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            lineHeight: 1.75,
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
        }}>
            <style>{`
                .script-body {
                    width: 100%;
                    max-width: 100%;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    white-space: pre-wrap;
                    box-sizing: border-box;
                }
                .script-body h1, .script-body h2, .script-body p, .script-body ul, .script-body li, .script-body strong, .script-body span {
                    max-width: 100%;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    white-space: pre-wrap;
                    box-sizing: border-box;
                    display: inline-block; /* Garante que o wrap funcione melhor em alguns browsers */
                    width: 100%;
                }
                .script-body h1 {
                    font-size: 1.2rem;
                    font-weight: 900;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #6366f1;
                    margin-bottom: 1.2rem;
                    color: inherit;
                }
                .script-body h2 {
                    font-size: 0.9rem;
                    font-weight: 800;
                    margin: 1.2rem 0 0.4rem;
                    opacity: 0.7;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .script-body p {
                    font-size: 0.92rem;
                    margin-bottom: 0.6rem;
                    line-height: 1.75;
                }
                .script-body ul {
                    padding-left: 1.4rem;
                    margin-bottom: 0.75rem;
                    font-size: 0.92rem;
                }
                .script-body li {
                    margin-bottom: 0.3rem;
                    line-height: 1.65;
                }
                .script-body strong {
                    font-weight: 800;
                }
                .script-body hr {
                    border: none;
                    border-top: 1px solid rgba(128,128,128,0.2);
                    margin: 1.2rem 0;
                }
                /* Tags de seção */
                .script-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 3px 10px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-top: 1.2rem;
                    margin-bottom: 0.6rem;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                .script-tag-hook   { background: rgba(245,158,11,0.15); color: #b45309; border: 1px solid rgba(245,158,11,0.35); }
                .script-tag-cta    { background: rgba(16,185,129,0.12); color: #059669; border: 1px solid rgba(16,185,129,0.3); }
                .script-tag-body   { background: rgba(99,102,241,0.12); color: #6366f1; border: 1px solid rgba(99,102,241,0.3); }
                .script-tag-other  { background: rgba(107,114,128,0.1); color: #6b7280; border: 1px solid rgba(107,114,128,0.25); }
                /* Cards de fala */
                .script-fala {
                    border-left: 3px solid #6366f1;
                    border-radius: 0 10px 10px 0;
                    padding: 10px 14px;
                    margin: 8px 0 10px;
                    line-height: 1.75;
                    font-size: 0.93rem;
                    background: rgba(99,102,241,0.07);
                    border-top: 1px solid rgba(99,102,241,0.15);
                    border-right: 1px solid rgba(99,102,241,0.15);
                    border-bottom: 1px solid rgba(99,102,241,0.15);
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    max-width: 100%;
                    box-sizing: border-box;
                    display: block;
                }
                /* Diretriz de câmera */
                .script-visual {
                    font-size: 0.8rem;
                    opacity: 0.55;
                    font-style: italic;
                    margin-bottom: 5px;
                    padding-left: 2px;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    max-width: 100%;
                    box-sizing: border-box;
                    display: block;
                }
                /* Badge de Modelo / Funil */
                .script-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 12px;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-bottom: 6px;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                .script-badge-movi  { background: rgba(99,102,241,0.12); color: #6366f1; border: 1px solid rgba(99,102,241,0.3); }
                .script-badge-funil { background: rgba(16,185,129,0.12); color: #059669; border: 1px solid rgba(16,185,129,0.3); }
                
                /* Dark mode overrides */
                .dark .script-tag-hook  { color: #fbbf24; background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); }
                .dark .script-tag-cta   { color: #34d399; background: rgba(16,185,129,0.1);  border-color: rgba(16,185,129,0.25); }
                .dark .script-tag-body  { color: #a5b4fc; background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.3); }
                .dark .script-tag-other { color: #9ca3af; background: rgba(107,114,128,0.1); border-color: rgba(107,114,128,0.2); }
                .dark .script-fala { background: rgba(99,102,241,0.09); border-left-color: #818cf8; border-color: rgba(99,102,241,0.2); }
                .dark .script-badge-movi  { color: #a5b4fc; background: rgba(99,102,241,0.13); border-color: rgba(99,102,241,0.35); }
                .dark .script-badge-funil { color: #6ee7b7; background: rgba(16,185,129,0.1);  border-color: rgba(16,185,129,0.3); }
            `}</style>

            <ReactMarkdown
                components={{
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    h1: ({ node, ...props }: any) => (
                        <div className="script-body">
                            <h1 {...props} />
                        </div>
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    h2: ({ node, ...props }: any) => (
                        <div className="script-body">
                            <h2 {...props} />
                        </div>
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    h3: ({ node, ...props }: any) => {
                        const label = String(props.children).toUpperCase();
                        const isHook = label.includes('HOOK') || label.includes('QUEBRA');
                        const isCta = label.includes('CTA') || label.includes('CALL TO ACTION') || label.includes('AÇÃO');
                        const isBody = label.includes('CONSCIÊNCIA') || label.includes('CORPO') || label.includes('CONEXÃO') || label.includes('SOLUÇÃO') || label.includes('PROBLEMA') || label.includes('NÍVEL');
                        const tagClass = isHook ? 'script-tag-hook' : isCta ? 'script-tag-cta' : isBody ? 'script-tag-body' : 'script-tag-other';
                        const icon = isHook ? '⚡' : isCta ? '🎯' : isBody ? '💡' : '📌';
                        return (
                            <div style={{ display: 'block' }}>
                                <span className={`script-tag ${tagClass}`}>{icon} {props.children}</span>
                            </div>
                        );
                    },
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    p: ({ node, ...props }: any) => {
                        const text = String(props.children);
                        const isFala = text.includes('🎙️') || text.toLowerCase().startsWith('fala (ator)');
                        const isVisual = text.startsWith('(Visual:') || text.startsWith('(Instrução Visual') || text.startsWith('(Câmera');
                        const isMovi = text.toLowerCase().includes('modelo movi') || text.toLowerCase().includes('padrão movi');
                        const isFunil = text.toLowerCase().includes('funil');

                        if (isFala) return <p className="script-fala" {...props} />;
                        if (isVisual) return <p className="script-visual" {...props} />;
                        if (isMovi) return <p><span className="script-badge script-badge-movi">🧩 {props.children}</span></p>;
                        if (isFunil) return <p><span className="script-badge script-badge-funil">📊 {props.children}</span></p>;
                        return <div className="script-body"><p {...props} /></div>;
                    },
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    strong: ({ node, ...props }: any) => <strong {...props} />,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    em: ({ node, ...props }: any) => <em style={{ opacity: 0.75 }} {...props} />,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    ul: ({ node, ...props }: any) => <div className="script-body"><ul {...props} /></div>,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    li: ({ node, ...props }: any) => <li {...props} />,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                    hr: ({ node, ...props }: any) => <div className="script-body"><hr {...props} /></div>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
