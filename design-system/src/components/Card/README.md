# Card

Contêiner com borda, sombra e suporte a header, conteúdo e footer.

## Sub-componentes

| Sub-componente  | Descrição                             |
|-----------------|---------------------------------------|
| `Card`          | Contêiner principal                   |
| `Card.Header`   | Título ou cabeçalho do card           |
| `Card.Content`  | Área de conteúdo principal            |
| `Card.Footer`   | Rodapé, alinhado à direita por padrão |

Todos aceitam `className` para customização.

## Uso

```tsx
import { Card, Button } from '@/design-system';

// Completo
<Card>
  <Card.Header>Título do Card</Card.Header>
  <Card.Content>
    <p>Este é o conteúdo principal do card.</p>
  </Card.Content>
  <Card.Footer>
    <Button variant="ghost">Cancelar</Button>
    <Button variant="primary">Confirmar</Button>
  </Card.Footer>
</Card>

// Simples
<Card>
  <p>Conteúdo direto sem sub-componentes.</p>
</Card>
```
