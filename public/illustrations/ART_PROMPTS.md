# Wonderland Command Center — Prompts Oficiais de Arte

Este diretório deve armazenar os PNGs finais utilizados pela landing page (`src/pages/index.tsx`).
As imagens precisam seguir estética anime/cartoon cinematográfica, com iluminação dramática e cores vibrantes.

## Como gerar

1. Utilize geradores com suporte a prompts detalhados (ex.: Midjourney v6, Stable Diffusion XL, DALL·E 3).
2. Resolução sugerida: **4096×4096** (exporte em PNG, fundo transparente quando possível).
3. Após gerar, salve o arquivo em `public/illustrations/<ID>.png` conforme a tabela abaixo.
4. Otimize com `pngquant` ou ferramenta similar para manter performance sem perder qualidade.

## Prompts sugeridos

| ID do arquivo | Uso recomendado | Prompt | Observações |
| --- | --- | --- | --- |
| `hero-rabbit-observatory.png` | Hero background e cartões principais | `Ultra-detailed anime illustration of a cyberpunk white rabbit sentinel inside a crystal observatory, glowing holographic clocks, teal and indigo lighting, volumetric fog, particles, cinematic composition, studio quality` | Utilize profundidade de campo leve. |
| `queen-guardian-hall.png` | Sessão de governança/administrativo | `Regal anime queen of hearts in a futuristic war room, golden holographic dashboards, crimson and magenta glow, ornate armor, dramatic rim lighting, 4k concept art, painterly finish` | Exportar com espaço negativo nas bordas para aplicar como background. |
| `alchemist-lab-forge.png` | Sessão Laboratório do Alquimista | `Fantastical anime alchemist mixing glowing potions inside a high-tech laboratory, floating formulas, sapphire and violet palette, soft bloom, cinematic shot, intricate details` | Incluir partículas luminosas. |
| `runall-atrium-control.png` | Painel `/api/runall` e rodapé | `Wide shot anime scene of a control atrium with floating monitors, steampunk consoles, characters coordinating data streams, turquoise and amethyst lighting, depth of field, ultra high resolution` | Ideal para largura panorâmica. |

## Pós-processamento

- Ajuste brilho/contraste para destacar elementos principais.
- Se precisar remover ruídos, utilize filtro de redução de ruído leve.
- Verifique acessibilidade: contraste adequado quando aplicado sobre gradientes escuros.

Após inserir os PNGs, nenhuma alteração adicional no código é necessária — basta recarregar a aplicação.
