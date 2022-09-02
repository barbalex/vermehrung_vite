import React from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import materialTheme from './utils/materialTheme'
import createGlobalStyle from './utils/createGlobalStyle'
const GlobalStyle = createGlobalStyle()

import Home from './routes/index.js'
import Vermehrung from './routes/Vermehrung'
import Dokumentation from './routes/Dokumentation'
import FourOhFour from './routes/404'

const App = () => (
  <BrowserRouter>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={materialTheme}>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="Dokumentation/*" element={<Dokumentation />} />
          <Route path="Vermehrung/*" element={<Vermehrung />} />
          <Route path="*" element={<FourOhFour />} />
        </Routes>
      </ThemeProvider>
    </StyledEngineProvider>
  </BrowserRouter>
)

export default App
