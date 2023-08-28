import { Ticket } from '../ticket';

it('implements optimistic cocurrency control', async () => {
  // Create a Ticket
  const ticket = Ticket.build({
    title: 'Ticket1',
    price: 5,
    userId: '123',
  });

  // Save the Ticket
  await ticket.save();

  // Fetch the same Ticket - 1st time
  const firstInstance = await Ticket.findById(ticket.id);
  // Change it
  firstInstance?.set({ price: 10 });

  // Fetch the same Ticket - 2nd time
  const secondInstance = await Ticket.findById(ticket.id);
  // Change it
  secondInstance?.set({ price: 20 });

  // Save the Ticket fetched 1st time
  // expects success
  await firstInstance?.save();

  // Save the Ticket fetched 2nd time
  // expects an error since the version has been changed in between.
  try {
    await secondInstance?.save();
  } catch (err) {
    return;
    // This return cannot function properly since there is a await statement,
    // in order to work this, we need to receive a callback and invoke it.
    // However this plan has been revoked by the note 397.
  }
  throw new Error('this code should not reach, the test has been failed.');
});

it('It increments the verion number on each and every save invocation', async () => {
  const ticket = Ticket.build({
    title: 'Ticket 1',
    price: 10,
    userId: '123',
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
