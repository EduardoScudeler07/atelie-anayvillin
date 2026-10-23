export type Collection =
  | 'essencia'
  | 'promessa'
  | 'luz'
  | 'graca'
  | 'raizes'
  | 'infantil'

export type Material = 'perolas' | 'cristais' | 'madeira'

export type Product = {
  id: string
  slug: string
  name: string
  collection: Collection
  materials: Material[]
  image: string
  imageAlt: string
}