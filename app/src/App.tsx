import { useState } from 'react'

import './App.css'

import Home from "./pages/Home";
import About from "./pages/About";

export const translation = {
  title: 'Hello {name:string}!',
  text: 'Start editing to see some magic happen :)',
  data_name: 'data englisch',
} as const;

export default function App() {
  const [page, setPage] = useState(0)

  return (
    <>
      <button onClick={() => setPage(0)}>Home</button>
      <button onClick={() => setPage(1)}>About</button>

      { page === 0 &&
        <Home />
      }
      { page === 1 &&
        <About />
      }
    </>
  )
}
