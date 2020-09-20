import styled from 'styled-components/macro'
import { Link as ReactRouterLink } from 'react-router-dom'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 660px;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 5px;
  width: 100%;
  margin: auto;
  max-width: 450px;
  padding: 60px 68px 40px;
  margin-bottom: 100px;
`

export const Base = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 450px;
  width: 100%;
`

export const Error = styled.div`
  background: #e87c03;
  border-radius: 4px;
  font-size: 14px;
  margin: 0 0 16px;
  color: white;
  padding: 15px 20px;
`

export const Title = styled.h1`
  color: #fff;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 28px;
`

export const Information = styled.p`
  border: 4px solid rgba(255, 255, 0, 0.7);
  border-radius: 4px;
  font-size: 14px;
  margin: 0 0 16px;
  color: #ffff00;
  padding: 15px 20px;
  animation: pulse 2.5s 3.8;
  animation-delay: 15s;
  animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);

  @keyframes pulse {
    0%,
    100% {
      color: #ffff00;
    }
    50% {
      background: rgba(0, 170, 0, 0.5);
      color: white;
    }
  }
`

export const Text = styled.p`
  color: #737373;
  font-size: 16px;
  font-weight: 500;
`

export const TextSmall = styled.p`
  margin-top: 10px;
  font-size: 13px;
  line-height: normal;
  color: #8c8c8c;
`

export const Link = styled(ReactRouterLink)`
  color: white;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export const Input = styled.input`
  background: #333;
  border-radius: 4px;
  border: 0;
  color: white;
  height: 50px;
  line-height: 50px;
  padding: 5px 20px;
  margin-bottom: 20px;

  &:last-of-type {
    margin-bottom: 30px;
  }
`

export const Submit = styled.button`
  background: #00aa00;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  margin: 24px 0 12px;
  padding: 16px;
  border: 0;
  color: white;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;

    &:hover {
      background: #00aa00;
      cursor: wait;
    }
  }

  &:hover {
    background: #00d400;
  }
`
