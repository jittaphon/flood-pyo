import { useRoutes } from 'react-router-dom'
import { routes } from './routes'
import React from 'react'
export default function App() {
  const element = useRoutes(routes)
  return element
}
