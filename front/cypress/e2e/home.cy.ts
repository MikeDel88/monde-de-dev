describe('Page Home', () => {

  beforeEach(() => cy.visit("/"))

  it('loads and renders the home component', () => {
    cy.getBySelector("login").should('exist');
    cy.getBySelector("register").should('exist');
  });

  describe('Navigation', () => {
    it('navigates to the login page', () => {
      cy.getBySelector("login").click()
      cy.url().should('include', '/login');
      cy.getBySelector("btn-back").click()
      cy.url().should('include', '/');
    })

    it('navigates to the register page', () => {
      cy.getBySelector("register").click()
      cy.url().should('include', '/register');
      cy.getBySelector("btn-back").click()
      cy.url().should('include', '/');
    })
  })

});
