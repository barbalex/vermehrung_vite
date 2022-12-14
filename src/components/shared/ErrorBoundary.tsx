import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import styled from 'styled-components'
import Button from '@mui/material/Button'

const Container = styled.div`
  padding: 15px;
`
const ButtonContainer = styled.div`
  margin-right: 10px;
  margin-bottom: 10px;
`
const StyledButton = styled(Button)`
  text-transform: none !important;
`
const Details = styled.details`
  margin-bottom: 25px;
`
const Summary = styled.summary`
  user-select: none;
  &:focus {
    outline: none !important;
  }
`
const PreWrapping = styled.pre`
  white-space: normal;
`
const Pre = styled.pre`
  background-color: rgba(128, 128, 128, 0.09);
`

const onReload = () => window.location.reload(true)

const ErrorFallback = ({ error, componentStack, resetErrorBoundary }) => (
  <Container>
    <p>Sorry, ein Fehler ist aufgetreten:</p>
    <PreWrapping>{error.message}</PreWrapping>
    <Details>
      <Summary>Mehr Informationen</Summary>
      <Pre>{componentStack}</Pre>
    </Details>
    <ButtonContainer>
      <StyledButton variant="outlined" onClick={onReload} color="inherit">
        neu starten
      </StyledButton>
    </ButtonContainer>
    <ButtonContainer>
      <StyledButton
        variant="outlined"
        onClick={resetErrorBoundary}
        color="inherit"
      >
        Cache leeren und neu starten (neue Anmeldung nötig)
      </StyledButton>
    </ButtonContainer>
  </Container>
)

const MyErrorBoundary = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onReset={onReload}>
    {children}
  </ErrorBoundary>
)

export default MyErrorBoundary
