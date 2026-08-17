export interface PortfolioResult {
  id: string;
  name: string;
  occupations: string[];
  description: string;
  hasCnpj: boolean;
}

export const mockResults: PortfolioResult[] = [
  {
    id: '1',
    name: 'Ricardo Antunes',
    occupations: ['Pintor', 'Pedreiro'],
    description: 'Sou pintor e pedreiro com 7 anos de experiência, já trabalhei em...',
    hasCnpj: false,
  },
  {
    id: '2',
    name: 'Thiago Brotas',
    occupations: ['Pintor'],
    description: 'Sou pintor e pedreiro com 7 anos de experiência, já trabalhei em...',
    hasCnpj: false,
  },
  {
    id: '3',
    name: 'Pedro Silveira',
    occupations: ['Pintor', 'Pedreiro'],
    description: 'Sou pedreiro de profissão há 20 anos. Trabalhei em mais de 10 ...',
    hasCnpj: false,
  },
  {
    id: '4',
    name: 'Carlos Cardoso',
    occupations: ['Pintor'],
    description: 'Pinturas em geral',
    hasCnpj: false,
  },
  {
    id: '5',
    name: 'Fernando Construtor LTDA',
    occupations: ['Construtor'],
    description: 'Somos uma construtora localizada em Sorocaba com 35 anos de ex...',
    hasCnpj: true,
  },
  {
    id: '6',
    name: 'Francisco Silva',
    occupations: ['Pedreiro'],
    description: 'Serviços de construção em geral',
    hasCnpj: false,
  },
];
