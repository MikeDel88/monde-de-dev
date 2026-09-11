describe('Session', () => {

  let user: { name: string, password: string }

  const loginAsUser = () => cy.session(user.name, () => cy.login(user.name, user.password))

  before(() => {
    cy.registerUniqueUser().then((registeredUser) => {
      user = registeredUser
    })
  })

  describe('Route guards', () => {
    const protectedRoutes = ['/feed', '/topics', '/profile', '/post'];

    protectedRoutes.forEach((route) => {
      it(`redirects to /login when visiting ${route} while logged out`, () => {
        cy.visit(route)
        cy.url().should('include', '/login')
      })
    })

    it('redirects an authenticated user away from /login to /feed', () => {
      loginAsUser()
      cy.visit('/login')
      cy.url().should('include', '/feed')
    })

    it('redirects an authenticated user away from / to /feed', () => {
      loginAsUser()
      cy.visit('/')
      cy.url().should('include', '/feed')
    })
  })

  describe('Session expiry (error interceptor)', () => {
    it('logs the user out and redirects to /login when an authenticated request returns 401', () => {
      loginAsUser()
      cy.env(['apiUrl']).then(({ apiUrl }) => {
        cy.intercept('GET', `${apiUrl}/topics`, { statusCode: 401, body: {} }).as('unauthorized')
      })
      cy.visit('/topics')

      cy.wait('@unauthorized')
      cy.url().should('include', '/login')
      cy.getAllLocalStorage().then((result) => {
        const originStorage = result[Cypress.config('baseUrl')!]
        expect(originStorage?.token).to.be.undefined
      })
    })
  })
});
