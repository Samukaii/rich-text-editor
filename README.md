# Ideias

- Transformar o Text Editor em um componente com uma toolbar personalizável
- Criar um service geral para realizar todas as ações no editor
	- Aplicar um formato
    - Adicionar novos formatos
    - Definir regex para formatos
- Coisas em comum para todas as ações da toolbar
	- Todas à sua maneira aplicam uma formatação
    - Todas possuem uma forma de identificar se elas estão ativas na seleção atual
- Diferenças
	- O botão aplica ou remove a edição na hora
    - O overlay abre um overlay para adicionar posteriormente a formatação
    - O select permite entre uma lista de opções decidir a formatação
    - O select possui a opção de "Texto normal" ao invés de clicar na formatação atual para remover

### Como unir todas essas ideias?
