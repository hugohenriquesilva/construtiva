// Futuramente este objeto será preenchido a partir do documento do prestador no Firebase.
export const professional = {
  name: 'Richard Santos',
  city: 'Santa Rita do Sapucaí',
  occupation: 'Pintor profissional',
  secondaryOccupations: ['Gesseiro', 'Pedreiro', 'Marceneiro'],
  hasCnpj: true,
  avatar:
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=480&q=85',
  cover:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85',
  bio: 'Minha trajetória na construção civil começou como ajudante de pintura, aprendendo na prática a importância de preparar bem cada superfície antes de aplicar a primeira demão. Com dedicação, aperfeiçoei técnicas de massa corrida, pintura interna e externa, textura e acabamento fino em residências e comércios. Hoje atuo como pintor profissional em Santa Rita do Sapucaí e região, cuidando de cada obra com organização, pontualidade e atenção aos detalhes. Meu compromisso é entregar ambientes renovados, limpos e bem-acabados, sempre com transparência e respeito ao seu investimento. Se você procura um serviço confiável para transformar seu espaço, será um prazer conversar sobre o seu projeto.',
  work: [
    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=85',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85',
  ],
};

export const workRows = [professional.work.slice(0, 5), professional.work.slice(5, 10)];
