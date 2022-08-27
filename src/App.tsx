import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Provider as UrqlProvider } from 'urql'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'

import Notifications from './components/Notifications'

import materialTheme from './utils/materialTheme'
import createGlobalStyle from './utils/createGlobalStyle'
const GlobalStyle = createGlobalStyle()

import { Provider as MobxProvider } from './storeContext'

import initiateApp from './utils/initiateApp'
import initiateDb from './utils/initiateDb'

import logo from './logo.svg'

// trying to persist indexedDB
// https://dexie.org/docs/StorageManager#controlling-persistence
// TODO: consider calling this only if user choose it in settings
// or pop own window to explain as shown in above link
// because it pops a request window
async function persist() {
  return (
    (await navigator.storage) &&
    navigator.storage.persist &&
    navigator.storage.persist()
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="header">
          🚀 Vite + React + Typescript 🤘 & <br />
          Eslint 🔥+ Prettier
        </p>

        <div className="body">
          <button onClick={() => setCount((count) => count + 1)}>
            🪂 Click me : {count}
          </button>

          <p>
            {' '}
            Don&apos;t forgot to install Eslint and Prettier in Your Vscode.
          </p>

          <p>
            Mess up the code in <code>App.tsx </code> and save the file.
          </p>
          <p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
            {' | '}
            <a
              className="App-link"
              href="https://vitejs.dev/guide/features.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vite Docs
            </a>
          </p>
        </div>
      </header>
    </div>
  )
}

export default App
