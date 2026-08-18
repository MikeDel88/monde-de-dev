describe('App', () => {
  it('loads and renders the topic component', () => {
    cy.visit('/');
    cy.get('app-topic').should('exist');
  });
});
