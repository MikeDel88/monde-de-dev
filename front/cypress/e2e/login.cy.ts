describe('Auth Login', () => {

  beforeEach(() => cy.visit('/login'))

  it('loads and renders the login component', () => {
    cy.getBySelector("name").should('exist');
    cy.getBySelector("password").should('exist');
    cy.getBySelector("btn-submit").should('exist');
  });

  it('shoud password must to be type password', () => {
    cy.getBySelector('password').type('test')
    cy.getBySelector('password').should('have.attr', 'type', 'password')
  })

  it("should redirect to /feed on successful login", () => {
    cy.login();
  });

  it('should display an error message on invalid credentials', () => {
    cy.env(['apiUrl']).then(({ apiUrl }) => {
      cy.intercept('POST', `${apiUrl}/auth/login`, {
        statusCode: 401,
        body: {},
      }).as('login')
    })
    cy.getBySelector('name').type('test')
    cy.getBySelector('password').type('WrongPassword1!')
    cy.getBySelector('btn-submit').click()
    cy.wait('@login')
    cy.getBySelector('error').should('exist').and('contain.text', 'Vérifier le couple')
    cy.url().should('include', '/login')
  })

  it('should not submit and should show required errors on empty fields', () => {
    cy.env(['apiUrl']).then(({ apiUrl }) => {
      cy.intercept('POST', `${apiUrl}/auth/login`).as('login')
    })
    cy.getBySelector('btn-submit').click()
    cy.getBySelector('error-name').should('exist')
    cy.getBySelector('error-password').should('exist')
    cy.get('@login.all').should('have.length', 0)
  })

  it('should clear the error message on field focus', () => {
    cy.env(['apiUrl']).then(({ apiUrl }) => {
      cy.intercept('POST', `${apiUrl}/auth/login`, { statusCode: 401, body: {} }).as('login')
    })
    cy.getBySelector('name').type('test')
    cy.getBySelector('password').type('WrongPassword1!')
    cy.getBySelector('btn-submit').click()
    cy.wait('@login')
    cy.findBySelector("error", "error").should('exist')
    cy.findBySelector('name', "input").focus()
    cy.findBySelector("error", "error").should('not.exist')
  })
});
