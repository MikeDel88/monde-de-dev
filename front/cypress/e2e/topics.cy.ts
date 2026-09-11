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
    it("should subscribe to topic", () => {
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
    })
  })
});
