const _ = Cypress._;

describe('Flights', () => {
  Cypress.Commands.add('loginBySingleSignOn', (overrides = {}) => {
    Cypress.log({
      name: 'loginBySingleSignOn'
    });

    const options = {
      method: 'POST',
      url: 'http://id.staging.prx.tech/token.json',
      body: {
        client_id: Cypress.env('clientId'),
        client_secret: Cypress.env('clientSecret'),
        scope: 'apps',
        response_type: 'token',
        grant_type: 'client_credentials',
        account: Cypress.env('accountId')
      }
    };

    // allow us to override defaults with passed in overrides
    _.extend(options, overrides);

    cy.request(options);
  });

  it('can create new flight', function() {
    cy.loginBySingleSignOn().then(resp => {
      expect(resp.status).to.eq(200);
      expect(resp.body.token_type).eq('bearer');

      cy.visit(`https://grove.prx.docker/tokenauth?authToken=${resp.body.access_token}`);
      cy.get('grove-campaign-card')
        .first()
        .find('a')
        .click();
      cy.get('.add-flight > a')
        .should('contain', 'Add a Flight')
        .click();
      cy.get('a[href*="flight"]').should('contain', 'New Flight');
    });
  });
});
