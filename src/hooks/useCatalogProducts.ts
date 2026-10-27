import { useEffect, useState } from 'react'
import { useProductApi } from '../config/dataSource'
import { products } from '../data/products'
import { getProducts } from '../services/productsApi'
import type { Product } from '../types/product'

type CatalogState =
  | { status: 'loading'; products: Product[] }
  | { status: 'error'; products: Product[] }
  | { status: 'loaded'; products: Product[] }

export function useCatalogProducts(): CatalogState {
  const [state, setState] = useState<CatalogState>(() =>
    useProductApi
      ? { status: 'loading', products: [] }
      : { status: 'loaded', products },
  )

  useEffect(() => {
    if (!useProductApi) return

    const controller = new AbortController()

    getProducts(controller.signal)
      .then((loadedProducts) => {
        if (!controller.signal.aborted) {
          setState({
            status: 'loaded',
            products: loadedProducts,
          })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            products: [],
          })
        }
      })

    return () => controller.abort()
  }, [])

  return state
}