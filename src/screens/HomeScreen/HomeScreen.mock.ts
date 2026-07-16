import { Professional, FeedPost } from '../../../types/home';

export const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Richard Santos',
    city: 'Santa Rita do Sapucaí',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    hasCnpj: true,
  },
  {
    id: '2',
    name: 'Marina Alves',
    city: 'Pouso Alegre',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    hasCnpj: true,
  },
  {
    id: '3',
    name: 'Carlos Eduardo',
    city: 'Itajubá',
    avatarUrl: 'https://randomuser.me/api/portraits/men/56.jpg',
    hasCnpj: false,
  },
  {
    id: '4',
    name: 'Fernanda Lima',
    city: 'Três Corações',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    hasCnpj: true,
  },
];

export const mockFeedPosts: FeedPost[] = [
  {
    id: '1',
    title: 'Transforme sua casa em um Oásis',
    authorName: 'Richard Santos',
    date: '15/04/2026',
    excerpt:
      'Muito se fala de uma casa com piscina, mas pouco se fala das casas que parecem um Oásis a céu aberto. Parece coisa de outro mundo, mas com tudo planejado, verá que é mais fácil do que imagina...',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
  },
  {
    id: '2',
    title: '5 dicas para economizar na reforma',
    authorName: 'Marina Alves',
    date: '10/04/2026',
    excerpt:
      'Reformar não precisa custar caro. Separamos dicas práticas para você planejar cada etapa da obra sem estourar o orçamento e ainda ter um resultado incrível...',
    imageUrl:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200',
  },
  {
    id: '3',
    title: 'Iluminação natural: como aproveitar melhor',
    authorName: 'Carlos Eduardo',
    date: '02/04/2026',
    excerpt:
      'A luz do sol pode ser sua maior aliada na hora de projetar os ambientes. Veja como posicionar janelas e aberturas para economizar energia e valorizar o imóvel...',
    imageUrl:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200',
  },
];
