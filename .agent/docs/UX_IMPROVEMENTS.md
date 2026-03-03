# Histórico de Melhorias de UX e Interface (Contextos)

Este documento centraliza as últimas decisões e resoluções tomadas para aprimorar a experiência de usuário (UX). Mantê-lo atualizado nos permite ser mais precisos em manutenções e novas funcionalidades baseando-se no que já deu certo.

## Modificações Recentes

### 03 de Março de 2026 - Biblioteca de Ouro: Experiência Visual Imersiva (TikTok View)
**Contexto do Pedido**: O usuário precisava visualizar os vídeos dentro da Gold Library como no "TikTok", ocupando a tela toda no celular, com arrastar para cima/baixo para rolar entre vídeos, botões práticos aparentes e a possibilidade de pausar tocando diretamente na tela. Além disso, havia dificuldade em usar o arrastar nativamente em navegadores desktop que simulavam a versão mobile.

**Soluções e Códigos Aplicados**:
1. **Vídeo em Tela Cheia (Mobile)**:
   - Configurado com `h-dvh` (novo padrão Tailwind que se ajusta melhor à área util da tela mobile que o vh padrão, lidando com barras de endereço que somem e aparecem).
   - Botões principais("Baixar MP4", "Clonar na IA") reposicionados de modo flutuante na parte inferior utilizando blocos com `absolute bottom-0`.

2. **Detecção Híbrida de Arraste (Swipe)**:
   - Os eventos simples de mobile (`onTouchStart`) impediam o comportamento de Mouse Drag via browsers em computadores.
   - Refatoração total para eventos universais de ponteiro (`onPointerDown`, `onPointerUp`), calculando uma distância (variação > 50px) para trocar o vídeo e alterando dinamicamente a `playingVideo`.
   - Implementado um contorno onde um ref (`isDragging`) determina se o usuário apenas "tocou" ou se "arrastou", garantindo que arrastes não causem cliques falsos e vice-versa.

3. **Toque Inteligente para Pausa/Play**:
   - Através de um `<video ref={videoRef}>`, um simples clique (ou "tap") pausará ou retornará o vídeo, desobrigando o usuário a mirar nos minúsculos ícones nativos de controle de reprodução.

4. **Gerenciamento de Categorias Ocultas em Modais**:
   - Escondido a seleção de "Nicho" quando inserindo um vídeo dentro do modo de pasta de Estilos, e vice-versa. Essa restrição limpa o cognitivo do usuário durante inserções massivas.

5. **Transição Fluida Entre Pastas no Arraste (Cross-Folder)**:
   - Adicionada uma lógica complexa de `handleSwipe` que intercepta quando o usuário atinge o limite final (ou inicial) de uma pasta/nicho ao arrastar.
   - Em vez de travar a tela limitando os vídeos àquela pasta, o algoritmo pula silenciosamente na interface para a *próxima pasta que contenha vídeos*, atualizando o rótulo visualmente e proporcionando o *infinite scrolling* nativo estilo TikTok sobre categorias contínuas.
