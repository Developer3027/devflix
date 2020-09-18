import React from 'react'
import { HeaderContainer } from '../containers/header'
import { Feature, OptForm } from '../components'
import { FaqsContainer } from '../containers/faqs'
import { FooterContainer } from '../containers/footer'
import { JumbotronContainer } from '../containers/Jumbotron'

export default function Home () {
  return (
    <>
      <HeaderContainer>
        <Feature>
          <Feature.Title>Unlimited films, Tv programs, and more.</Feature.Title>
          <Feature.SubTitle>Watch anywhere. Cancel anytime.</Feature.SubTitle>

          <OptForm>
            <OptForm.Input placeholder='Email address' />
            <OptForm.Button>Try it now</OptForm.Button>
            <OptForm.Break />
            <OptForm.Text>
              Ready to watch? Enter your email to create or restart your
              membership.
            </OptForm.Text>
          </OptForm>
        </Feature>
      </HeaderContainer>
      <JumbotronContainer />
      <FaqsContainer />
      <FooterContainer />
    </>
  )
}
