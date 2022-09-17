import React from 'react'
import styled from 'styled-components'
import CircularProgress from '@mui/material/CircularProgress'

const SpinnerContainer = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const InnerContainer = styled.div`
  min-height: 50px;
  padding-top: 10px;
  padding-bottom: 10px;
`
const SpinnerText = styled.div`
  padding: 10px;
`

const SpinnerComponent = ({ message }) => (
  <SpinnerContainer>
    <InnerContainer>
      <CircularProgress />
      {!!message && <SpinnerText>{message}</SpinnerText>}
    </InnerContainer>
  </SpinnerContainer>
)

export default SpinnerComponent
