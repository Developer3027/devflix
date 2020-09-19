import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { FirebaseContext } from '../context/firebase'
import { HeaderContainer } from '../containers/header'
import { Form } from '../components'
import { FooterContainer } from '../containers/footer'
import * as ROUTES from '../constants/routes'

export default function Signin () {
  const history = useHistory()
  const { firebase } = useContext(FirebaseContext)
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignin = e => {
    e.preventDefault()

    firebase
      .auth()
      .signInWithEmailAndPassword(emailAddress, password)
      .then(() => {
        // push browse page
        history.push(ROUTES.BROWSE)
      })
      .catch(error => {
        setEmailAddress('')
        setPassword('')
        setError(error.message)
      })
  }

  const isInvalid = password == '' || emailAddress == ''

  // check if inputs are valid

  return (
    <>
      <HeaderContainer>
        <Form>
          <Form.Title>Sign In</Form.Title>
          {isInvalid && (
            <Form.Information>Complete the Form to submit</Form.Information>
          )}
          {error && <Form.Error>{error}</Form.Error>}

          <Form.Base onSubmit={handleSignin} method='POST'>
            <Form.Input
              placeholder='Email Address'
              value={emailAddress}
              onChange={({ target }) => setEmailAddress(target.value)}
            />
            <Form.Input
              type='password'
              autoComplete='off'
              placeholder='Password'
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
            <Form.Submit disabled={isInvalid} type='submit'>
              Sign In
            </Form.Submit>
          </Form.Base>

          <Form.Text>
            New to Devflix? <Form.Link to='/signup'>Sign Up</Form.Link>
          </Form.Text>
          <Form.TextSmall>
            This page is protected by Google reCAPTCHA to ensure you're not a
            bot. Learn more.
          </Form.TextSmall>
        </Form>
      </HeaderContainer>
      <FooterContainer />
    </>
  )
}
