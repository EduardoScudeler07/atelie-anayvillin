import type { Product } from '../types/product'

export const products: Product[] = [
  {
    id: 'amostra-essencia-azul',
    slug: 'terco-perola-azul',
    name: 'Terço Pérola Azul',
    collection: 'essencia',
    materials: ['perolas'],
    image: '/images/produtos/terco-essencia/terco-azul.png',
    imageAlt: 'Terço de pérolas azuis da coleção Essência',
  },
  {
    id: 'amostra-promessa-branca',
    slug: 'terco-perola-branca',
    name: 'Terço Pérola Branca',
    collection: 'promessa',
    materials: ['perolas'],
    image: '/images/produtos/terco-promessa/terco-branco.png',
    imageAlt: 'Terço de pérolas brancas da coleção Promessa',
  },
  {
    id: 'amostra-luz-azul-royal',
    slug: 'terco-cristal-azul-royal',
    name: 'Terço Cristal Azul Royal',
    collection: 'luz',
    materials: ['cristais'],
    image: '/images/produtos/terco-luz/terco-azul-royal.png',
    imageAlt: 'Terço de cristais azuis da coleção Luz',
  },
  {
    id: 'amostra-graca-rosa-claro',
    slug: 'terco-cristal-rosa-claro',
    name: 'Terço Cristal Rosa Claro',
    collection: 'graca',
    materials: ['cristais'],
    image: '/images/produtos/terco-graca/terco-rosa-claro.png',
    imageAlt: 'Terço de cristais rosa-claro da coleção Graça',
  },
  {
    id: 'amostra-raizes-marrom',
    slug: 'terco-madeira-marrom',
    name: 'Terço Madeira Marrom',
    collection: 'raizes',
    materials: ['madeira'],
    image: '/images/produtos/terco-raizes/terco-marrom.png',
    imageAlt: 'Terço de madeira marrom da coleção Raízes',
  },
]