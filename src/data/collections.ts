import type { Collection } from '../types/product'

type CollectionItem = {
  slug: Collection
  name: string
  description: string
  image: string
  imageAlt: string
}

export const collections: CollectionItem[] = [
  {
    slug: 'essencia',
    name: 'Essência',
    description:
      'A expressão da simplicidade e da delicadeza. Com pérolas, é uma coleção clássica e atemporal.',
    image: '/images/produtos/terco-essencia/terco-azul.png',
    imageAlt: 'Terço de pérolas azuis da coleção Essência',
  },
  {
    slug: 'promessa',
    name: 'Promessa',
    description:
      'Une a beleza das pérolas ao significado da personalização, com fé e significado em cada detalhe.',
    image: '/images/produtos/terco-promessa/terco-branco.png',
    imageAlt: 'Terço de pérolas brancas da coleção Promessa',
  },
  {
    slug: 'luz',
    name: 'Luz',
    description:
      'Encanta pelo brilho e pela sofisticação. Uma coleção para quem procura um terço marcante.',
    image: '/images/produtos/terco-luz/terco-azul-royal.png',
    imageAlt: 'Terço de cristais azuis da coleção Luz',
  },
  {
    slug: 'graca',
    name: 'Graça',
    description:
      'Reúne a elegância dos cristais e a exclusividade da personalização, pensada para representar sua história.',
    image: '/images/produtos/terco-graca/terco-rosa-claro.png',
    imageAlt: 'Terço de cristais rosa-claro da coleção Graça',
  },
  {
    slug: 'raizes',
    name: 'Raízes',
    description:
      'A beleza da simplicidade, inspirada na fé, na oração e nas raízes que carregamos no coração.',
    image: '/images/produtos/terco-raizes/terco-marrom.png',
    imageAlt: 'Terço de madeira marrom da coleção Raízes',
  },
]