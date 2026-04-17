# Table

Tabela com scroll horizontal automático, hover em linhas e tokens de tema.

## Componentes

| Componente    | Descrição                          |
|---------------|------------------------------------|
| `Table`       | Contêiner com scroll e borda       |
| `TableHead`   | Seção de cabeçalho (`<thead>`)     |
| `TableBody`   | Seção de corpo (`<tbody>`)         |
| `TableRow`    | Linha (`<tr>`) com hover           |
| `TableHeader` | Célula de cabeçalho (`<th>`)       |
| `TableCell`   | Célula de dado (`<td>`)            |

Todos aceitam `className` e os atributos nativos do elemento correspondente.

## Uso

```tsx
import { Table } from '@/design-system';

const users = [
  { id: 1, name: 'Ana Silva', email: 'ana@exemplo.com', role: 'Admin' },
  { id: 2, name: 'Bruno Costa', email: 'bruno@exemplo.com', role: 'Editor' },
  { id: 3, name: 'Carla Dias', email: 'carla@exemplo.com', role: 'Viewer' },
];

<Table>
  <Table.Head>
    <Table.Row>
      <Table.Header>#</Table.Header>
      <Table.Header>Nome</Table.Header>
      <Table.Header>E-mail</Table.Header>
      <Table.Header>Perfil</Table.Header>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {users.map((user) => (
      <Table.Row key={user.id}>
        <Table.Cell>{user.id}</Table.Cell>
        <Table.Cell>{user.name}</Table.Cell>
        <Table.Cell>{user.email}</Table.Cell>
        <Table.Cell>{user.role}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```
