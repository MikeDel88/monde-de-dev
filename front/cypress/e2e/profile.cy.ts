describe('Page Profile', () => {

  let user: { name: string, email: string, password: string }

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
    })
  })

  beforeEach(() => {
    loginAsUser()
    cy.visit("/profile")
  })

  it('loads and renders the home component', () => {
    cy.getBySelector("name").should('exist');
    cy.getBySelector("email").should('exist');
    cy.getBySelector("password").should('exist');
    cy.getBySelector("btn-submit").should('exist');
    cy.getBySelector("modal").should('exist');
    cy.getBySelector("title").should('exist');
    cy.getBySelector("topic").should('exist');
  });

  describe('Form', () => {
    it('shoud render user information except password', () => {
      cy.findBySelector('name', 'input').should('have.value', user.name);
      cy.findBySelector('email', 'input').should('have.value', user.email);
      cy.findBySelector('password', 'input').should('not.have.value', user.password);
    })
  })

  describe('Update profile', () => {
    it('updates the name and does not send the password', () => {
      const newName = `Updated-${Date.now()}`;
      cy.intercept('PATCH', '**/profile').as('updateProfile');

      cy.findBySelector('name', 'input').clear().type(newName);
      cy.getBySelector('btn-submit').click();

      cy.wait('@updateProfile').its('request.body').should((body) => {
        expect(body).to.not.have.property('password');
        expect(body.name).to.eq(newName);
        expect(body.email).to.be.null;
      });
    });

    it('updates the email and does not send the password', () => {
      const newEmail = `updated-${Date.now()}@test.com`;
      cy.intercept('PATCH', '**/profile').as('updateProfile');

      cy.findBySelector('email', 'input').clear().type(newEmail);
      cy.getBySelector('btn-submit').click();

      cy.wait('@updateProfile').its('request.body').should((body) => {
        expect(body).to.not.have.property('password');
        expect(body.email).to.eq(newEmail);
        expect(body.name).to.be.null;
      });
    });
  })

  describe('Update password', () => {
    const newPassword = 'NewPassword1!';

    it('opens the confirmation modal and sends the password only after confirming the current password', () => {
      cy.intercept('PATCH', '**/profile').as('updateProfile');
      cy.intercept('PATCH', '**/profile/password').as('updatePassword');

      cy.findBySelector('password', 'input').clear().type(newPassword);
      cy.getBySelector('btn-submit').click();

      cy.findBySelector('current-password', 'input').type(user.password);
      cy.getBySelector('btn-confirm').click();

      cy.wait('@updatePassword').its('request.body').should((body) => {
        expect(body).to.deep.equal({ newPassword, currentPassword: user.password });
      });
      cy.get('@updateProfile.all').should('have.length', 0);
    });

    it('does not send the password when the confirmation modal is cancelled', () => {
      cy.intercept('PATCH', '**/profile/password').as('updatePassword');

      cy.findBySelector('password', 'input').clear().type(newPassword);
      cy.getBySelector('btn-submit').click();

      cy.getBySelector('btn-cancel').click();

      cy.get('@updatePassword.all').should('have.length', 0);
    });
  })

  describe('Unsubscribe from a topic', () => {
    it('unsubscribes from a topic and removes it from the list', () => {
      cy.intercept('DELETE', '**/topics/*/subscribe').as('unsubscribe');
      cy.intercept('GET', '**/profile').as('getProfile');

      cy.getBySelector('topic').should('have.length', 1);
      cy.getBySelector('topic').first().find('[data-test=btn-subscribe] button').click();

      cy.wait('@unsubscribe');
      cy.wait('@getProfile');

      cy.getBySelector('topic').should('not.exist');
    });
  })
});
