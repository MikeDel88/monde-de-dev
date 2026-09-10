describe('Page Feed', () => {

  let user: { name: string, password: string }

  const loginAsUser = () => cy.session(user.name, () => cy.login(user.name, user.password))

  before(() => {
    cy.registerUniqueUser().then((registeredUser) => {
      user = registeredUser
      loginAsUser()
      cy.visit('/topics')
      cy.getBySelector('topic')
        .first()
        .find('[data-test=btn-subscribe] button')
        .click()
        .should('be.disabled')

      cy.createPost('Mon titre de test', 'Mon contenu de test')
      cy.createPost('Mon titre de test 2', 'Mon contenu de test')
    })
  })

  beforeEach(() => {
    loginAsUser()
    cy.visit('/feed')
  })

  it('loads and renders the feed component', () => {
    cy.getBySelector('posts').should('have.length.greaterThan', 1)
  })

  it('should toggle sort order when clicking the sort button', () => {
    cy.getBySelector('posts').its('length').then((initialCount) => {
      cy.getBySelector('btn-sort').find('[data-test=desc]').should('exist')
      cy.getBySelector('btn-sort').click()
      cy.getBySelector('btn-sort').find('[data-test=asc]').should('exist')
      cy.getBySelector('posts').should('have.length', initialCount)
    })
  })

  describe('Nav Menu', () => {
    it('should display the desktop nav menu on a wide viewport', () => {
      cy.viewport(1280, 720)
      cy.getBySelector('nav-menu').should('be.visible')
      cy.getBySelector('btn-burger').should('not.be.visible')
    })

    it('should display and toggle the mobile burger menu on a narrow viewport', () => {
      cy.viewport('iphone-6')
      cy.getBySelector('nav-menu').should('not.exist')
      cy.getBySelector('btn-burger').should('be.visible').and('have.attr', 'aria-expanded', 'false')

      cy.getBySelector('btn-burger').click()
      cy.getBySelector('btn-burger').should('have.attr', 'aria-expanded', 'true')
      cy.getBySelector('nav-menu-mobile').should('be.visible')
      cy.getBySelector('menu-backdrop').should('exist')

      cy.getBySelector('menu-backdrop').click({ force: true })
      cy.getBySelector('nav-menu-mobile').should('not.exist')
      cy.getBySelector('btn-burger').should('have.attr', 'aria-expanded', 'false')
    })
  })

  it("should logout when click logout button", () => {
    cy.getBySelector("btn-logout").should('exist').click()
    cy.url().should('include', '/login')
    cy.getAllLocalStorage().then((result) => {
      const originStorage = result[Cypress.config('baseUrl')!]
      expect(originStorage?.token).to.be.undefined
    })
  })
});
