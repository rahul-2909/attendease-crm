import { lazy } from 'react'
import Loading from '../components/Loading'

export const lazyLoad = (importFunc) => {
  return lazy(importFunc)
}

export const PageLoader = (props) => <Loading {...props} />
