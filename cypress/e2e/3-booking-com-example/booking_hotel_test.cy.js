/// <reference types="cypress" />
import { addDays, formatISO, startOfToday } from 'date-fns';

describe('', () => {
    const DESTINATION = 'Madrid';
    const DESTINATION_TITLE_LINK_SELECTOR = '[data-testid="property-card"] [data-testid="title-link"]';
    const DESTINATION_TITLE_SELECTOR = '[data-testid="property-card"] [data-testid="title"]';
    const PAGE_LOAD_TIMEOUT = 5000;
    const formatCalDate = date => formatISO(date, { representation: 'date' });

    beforeEach(() => {
        console.log('before each');
        cy.visit('https://www.booking.com/index.html'); // en-US site
    });

    it('Can try to book a hotel in Madrid', async () => {
        const today = startOfToday();
        const checkIn = addDays(today, 14);
        const fCheckIn = formatCalDate(checkIn);
        const checkOut = addDays(checkIn, 7);
        const fCheckOut = formatCalDate(checkOut);
        await cy.get('[role="dialog"][aria-modal="true"]', { timeout: 5000 }).should('exist');
        await cy.get('[role="dialog"][aria-modal="true"] button').first().click();
        await cy.get('[role="dialog"][aria-modal="true"]').should('not.exist');
        // await cy.get('[name=ss]', { timeout: 2000 }).type(DESTINATION);
        await cy.get('[name=ss]', { timeout: 2000 }).then($element => $element.focus()); // Workaround for a Cypress bug having to do with an id with ':'.
        await cy.focused().type(DESTINATION);
        await cy.get('[data-testid="autocomplete-results"] li', { timeout: 2000 }).first().click();
        console.log('Destination:', DESTINATION);
        await cy.get('[data-testid="autocomplete-results"]').should('not.exist');
        await cy.get(`[data-date="${fCheckIn}"]`).click();
        console.log('Check-in:', fCheckIn);
        await cy.get(`[data-date="${fCheckOut}"]`).click();
        console.log('Check-out:', fCheckOut);
        await cy.get('[type="submit"]').click();
        console.log('Submitted');
        const propertyName = await cy.get(DESTINATION_TITLE_SELECTOR).first().then($el => $el.text()).promisify();
        console.log(`Property Name: ${propertyName}`);
        await cy
            .get(DESTINATION_TITLE_LINK_SELECTOR, { timeout: PAGE_LOAD_TIMEOUT })
            .first()
            .invoke('attr', 'target', '_self')
            .click();
        await cy.get('.pp-header__title', { timeout: 5000 }).should('have.text', propertyName);
    });
});
