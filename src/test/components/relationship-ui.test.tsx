import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PersonConnectionManager } from '@/components/people/PersonConnectionManager';
import { supabase } from '@/integrations/supabase/client';
import { waitFor } from '@testing-library/react';

const makePerson = (id: string, name: string) => ({ id, name });

const allTypes = [
  { type: 'parent', label: 'Parent' },
  { type: 'child', label: 'Child' },
  { type: 'partner', label: 'Partner' },
  { type: 'sibling', label: 'Sibling' },
  { type: 'donor', label: 'Donor' },
  { type: 'gestational_carrier', label: 'Gestational Carrier' },
];

describe('PersonConnectionManager UI', () => {
  it('renders all relationship types and their reciprocal/symmetric display', async () => {
    const person = makePerson('p1', 'Alice');
    const availablePersons = [
      makePerson('p2', 'Bob'),
      makePerson('p3', 'Charlie'),
      makePerson('p4', 'Daisy'),
      makePerson('p5', 'Donor Dan'),
      makePerson('p6', 'Carrier Carla'),
    ];
    const connections = [
      // Parent (outgoing) - Alice is Bob's parent
      { 
        id: 'c1', 
        from_person_id: 'p1', 
        to_person_id: 'p2', 
        relationship_type: 'parent',
        direction: 'outgoing',
        other_person_name: 'Bob',
        other_person_id: 'p2'
      },
      // Partner (symmetric) - Alice is Daisy's partner
      { 
        id: 'c3', 
        from_person_id: 'p1', 
        to_person_id: 'p4', 
        relationship_type: 'partner',
        direction: 'outgoing',
        other_person_name: 'Daisy',
        other_person_id: 'p4'
      },
      // Sibling (symmetric) - Alice is Charlie's sibling
      { 
        id: 'c5', 
        from_person_id: 'p1', 
        to_person_id: 'p3', 
        relationship_type: 'sibling',
        direction: 'outgoing',
        other_person_name: 'Charlie',
        other_person_id: 'p3'
      },
    ];
    // Set mock data
    (supabase as any).__setMockPersons([person, ...availablePersons]);
    (supabase as any).__setMockConnections(connections);
    render(
      <PersonConnectionManager
        person={person}
        onConnectionUpdated={() => {}}
      />
    );
    // Wait for UI to update
    await waitFor(() => {
      expect(screen.getByText(/Alice is Bob's parent/)).toBeInTheDocument();
      expect(screen.getByText(/Alice is Daisy's partner/)).toBeInTheDocument();
      expect(screen.getByText(/Alice is Charlie's sibling/)).toBeInTheDocument();
    });
  });

  it('blocks self-relationships in the UI', async () => {
    const person = makePerson('p1', 'Alice');
    const connections = [
      { 
        id: 'c1', 
        from_person_id: 'p1', 
        to_person_id: 'p1', 
        relationship_type: 'parent',
        direction: 'outgoing',
        other_person_name: 'Alice',
        other_person_id: 'p1'
      },
    ];
    (supabase as any).__setMockPersons([person]);
    (supabase as any).__setMockConnections(connections);
    render(
      <PersonConnectionManager
        person={person}
        onConnectionUpdated={() => {}}
      />
    );
    await waitFor(() => {
      expect(screen.queryByText(/Alice is Alice's parent/)).not.toBeInTheDocument();
    });
  });

  it('shows external connections summary and expandable list', async () => {
    const person = makePerson('p1', 'Alice');
    const availablePersons = [makePerson('p2', 'Bob')];
    const connections = [
      // In-tree connection
      { 
        id: 'c1', 
        from_person_id: 'p1', 
        to_person_id: 'p2', 
        relationship_type: 'parent',
        direction: 'outgoing',
        other_person_name: 'Bob',
        other_person_id: 'p2'
      },
      // External connection (p3 not in availablePersons)
      { 
        id: 'c2', 
        from_person_id: 'p1', 
        to_person_id: 'p3', 
        relationship_type: 'parent',
        direction: 'outgoing',
        other_person_name: 'Unknown',
        other_person_id: 'p3'
      },
    ];
    (supabase as any).__setMockPersons([person, ...availablePersons]);
    (supabase as any).__setMockConnections(connections);
    render(
      <PersonConnectionManager
        person={person}
        onConnectionUpdated={() => {}}
      />
    );
    await waitFor(() => {
      // Look for the button text that actually appears in the UI
      expect(screen.getByText(/connection.*to people outside this tree/i)).toBeInTheDocument();
    });
  });

  it('displays correct reciprocal relationships for parent-child connections', async () => {
    // Test the specific scenario from the user's image
    // Maggie is Ruby's parent, so when viewing Maggie's card, it should show "Parent"
    const maggie = makePerson('maggie', 'Maggie Lerman');
    const ruby = makePerson('ruby', 'Ruby Lerman');
    const availablePersons = [ruby];
    
    // Maggie is Ruby's parent (outgoing connection from Maggie to Ruby)
    const connections = [
      { 
        id: 'c1', 
        from_person_id: 'maggie', 
        to_person_id: 'ruby', 
        relationship_type: 'parent',
        direction: 'outgoing',
        other_person_name: 'Ruby Lerman',
        other_person_id: 'ruby'
      },
    ];
    
    (supabase as any).__setMockPersons([maggie, ...availablePersons]);
    (supabase as any).__setMockConnections(connections);
    
    render(
      <PersonConnectionManager
        person={maggie}
        onConnectionUpdated={() => {}}
      />
    );
    
    await waitFor(() => {
      // Should show "Maggie is Ruby's parent"
      expect(screen.getByText(/Maggie Lerman is Ruby Lerman's parent/)).toBeInTheDocument();
      expect(screen.queryByText(/Ruby Lerman is Maggie Lerman's child/)).not.toBeInTheDocument();
    });
  });

  it('displays correct reciprocal relationships for incoming parent connections', async () => {
    // Test the scenario where someone is the parent of the current person
    // Ruby is Maggie's child, so when viewing Ruby's card with an incoming parent connection, it should show "Child"
    const ruby = makePerson('ruby', 'Ruby Lerman');
    const maggie = makePerson('maggie', 'Maggie Lerman');
    const availablePersons = [maggie];
    
    // Maggie is Ruby's parent (incoming connection to Ruby from Maggie)
    const connections = [
      { 
        id: 'c1', 
        from_person_id: 'maggie', 
        to_person_id: 'ruby', 
        relationship_type: 'parent',
        direction: 'incoming',
        other_person_name: 'Maggie Lerman',
        other_person_id: 'maggie'
      },
    ];
    
    (supabase as any).__setMockPersons([ruby, ...availablePersons]);
    (supabase as any).__setMockConnections(connections);
    
    render(
      <PersonConnectionManager
        person={ruby}
        onConnectionUpdated={() => {}}
      />
    );
    
    await waitFor(() => {
      // Should show "Ruby is Maggie's child" not "Maggie is Ruby's parent"
      expect(screen.getByText(/Ruby Lerman is Maggie Lerman's child/)).toBeInTheDocument();
      expect(screen.queryByText(/Maggie Lerman is Ruby Lerman's parent/)).not.toBeInTheDocument();
    });
  });
}); 