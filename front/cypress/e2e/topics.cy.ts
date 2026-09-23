describe('Page Topics', () => {

  let user: { name: string, password: string }

  before(() => {
    cy.registerUniqueUser().then((registeredUser) => {
      user = registeredUser
    })
  })

  beforeEach(() => {
    cy.login(user.name, user.password)
    cy.visit('/topics')
  })

  it('loads and renders the topic card component', () => {
    cy.getBySelector("topic")
      .should('exist')
      .children().should('have.length', 10);
  });

  describe('Subscribe Topic', () => {
    it("should subscribe to topic without showing a toast", () => {
      cy.getBySelector("topic")
        .first()
        .find('[data-test=btn-subscribe] button')
        .should('not.be.disabled')
        .and('contain.text', "S'abonner")
        .click()

      cy.getBySelector("topic")
        .first()
        .find('[data-test=btn-subscribe] button')
        .should('be.disabled')
        .and('contain.text', "Déjà abonné")

      cy.getBySelector('app-toast').should('not.be.visible')
    })

    it('should show an error toast when the subscription fails', () => {
      cy.env(['apiUrl']).then(({ apiUrl }) => {
        cy.intercept('POST', `${apiUrl}/topics/subscribe`, { statusCode: 500, body: { message: 'Erreur serveur' } }).as('subscribeFail')
      })

      cy.getBySelector("topic")
        .eq(1)
        .find('[data-test=btn-subscribe] button')
        .click()

      cy.wait('@subscribeFail')
      cy.getBySelector('app-toast').should('be.visible')
    })
  })
});
