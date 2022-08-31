import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Provider as UrqlProvider } from 'urql'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import materialTheme from './utils/materialTheme'
import createGlobalStyle from './utils/createGlobalStyle'
const GlobalStyle = createGlobalStyle()

import { Provider as MobxProvider } from './storeContext'

import initiateApp from './utils/initiateApp'

import Layout from './components/Layout'
import Home from './routes/index.js'
import Vermehrung from './routes/Vermehrung'
import Dokumentation from './routes/Dokumentation'
import FourOhFour from './routes/404'

const App = ({ element }) => (
  <BrowserRouter>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={materialTheme}>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="Dokumentation/*" element={<Dokumentation />} />
          <Route path="Vermehrung/*" element={<Vermehrung />}/>
          <Route path="*" element={<FourOhFour />} />
        </Routes>
      </ThemeProvider>
    </StyledEngineProvider>
  </BrowserRouter>
)


export default observer(App)
