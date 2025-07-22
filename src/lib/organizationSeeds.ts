// Organization test seed data
import { supabase } from "@/integrations/supabase/client";

export interface SeedData {
  organizations: Array<{
    name: string;
    slug: string;
    subdomain: string;
    type: string;
    description: string;
    visibility: string;
  }>;
  groups: Array<{
    label: string;
    type: string;
    description: string;
    organization_name: string;
  }>;
  persons: Array<{
    name: string;
    gender: string;
    date_of_birth?: string;
    birth_place?: string;
    status: string;
    organization_name: string;
    group_label?: string;
  }>;
  connections: Array<{
    from_person_name: string;
    to_person_name: string;
    relationship_type: string;
    organization_name: string;
  }>;
}

export const seedData: SeedData = {
  organizations: [
    {
      name: "Rainbow Family Clinic",
      slug: "rainbow-family-clinic",
      subdomain: "rainbow-clinic",
      type: "fertility_clinic",
      description: "A progressive fertility clinic specializing in LGBTQ+ family building and donor conception services.",
      visibility: "public"
    },
    {
      name: "Pacific Sperm Bank",
      slug: "pacific-sperm-bank",
      subdomain: "pacific-sperm",
      type: "sperm_bank",
      description: "Premier sperm bank serving the Pacific Northwest with comprehensive donor screening and family support.",
      visibility: "public"
    },
    {
      name: "The Johnson Extended Family",
      slug: "johnson-extended-family",
      subdomain: "johnson-family",
      type: "family",
      description: "A large extended family network including donor-conceived children and their connections.",
      visibility: "private"
    },
    {
      name: "Donor Sibling Registry Northwest",
      slug: "dsr-northwest",
      subdomain: "dsr-nw",
      type: "registry",
      description: "Regional registry helping donor-conceived individuals find genetic half-siblings and donors.",
      visibility: "public"
    }
  ],
  groups: [
    {
      label: "Donor #2847 Families",
      type: "sibling_group",
      description: "Families with children conceived using donor #2847 from Pacific Sperm Bank",
      organization_name: "Pacific Sperm Bank"
    },
    {
      label: "Rainbow Clinic Class of 2020",
      type: "clinic_cohort",
      description: "Families who completed treatment at Rainbow Family Clinic in 2020",
      organization_name: "Rainbow Family Clinic"
    },
    {
      label: "Johnson Core Family",
      type: "nuclear_family",
      description: "The immediate Johnson family nucleus",
      organization_name: "The Johnson Extended Family"
    },
    {
      label: "Seattle Donor Siblings",
      type: "regional_group",
      description: "Donor-conceived individuals and families in the Seattle area",
      organization_name: "Donor Sibling Registry Northwest"
    }
  ],
  persons: [
    // Pacific Sperm Bank - Donor #2847 Families
    {
      name: "Sperm Donor #2847",
      gender: "male",
      date_of_birth: "1980-01-01",
      birth_place: "Unknown",
      status: "living",
      organization_name: "Pacific Sperm Bank",
      group_label: "Donor #2847 Families"
    },
    {
      name: "David Chen",
      gender: "male",
      date_of_birth: "1985-03-15",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "Pacific Sperm Bank",
      group_label: "Donor #2847 Families"
    },
    {
      name: "Maria Rodriguez",
      gender: "female",
      date_of_birth: "1987-07-22",
      birth_place: "Portland, OR",
      status: "living",
      organization_name: "Pacific Sperm Bank",
      group_label: "Donor #2847 Families"
    },
    {
      name: "Elena Chen-Rodriguez",
      gender: "female",
      date_of_birth: "2015-12-03",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "Pacific Sperm Bank",
      group_label: "Donor #2847 Families"
    },
    {
      name: "Alex Thompson",
      gender: "male",
      date_of_birth: "1990-11-08",
      birth_place: "Vancouver, BC",
      status: "living",
      organization_name: "Pacific Sperm Bank",
      group_label: "Donor #2847 Families"
    },
    {
      name: "Jamie Thompson",
      gender: "non-binary",
      date_of_birth: "2018-05-14",
      birth_place: "Vancouver, BC",
      status: "living",
      organization_name: "Pacific Sperm Bank",
      group_label: "Donor #2847 Families"
    },
    // Rainbow Family Clinic families
    {
      name: "Egg Donor #E123",
      gender: "female",
      date_of_birth: "1985-06-15",
      birth_place: "Unknown",
      status: "living",
      organization_name: "Rainbow Family Clinic",
      group_label: "Rainbow Clinic Class of 2020"
    },
    {
      name: "Dr. Sarah Kim",
      gender: "female",
      date_of_birth: "1982-09-12",
      birth_place: "San Francisco, CA",
      status: "living",
      organization_name: "Rainbow Family Clinic",
      group_label: "Rainbow Clinic Class of 2020"
    },
    {
      name: "Lisa Park",
      gender: "female",
      date_of_birth: "1984-04-18",
      birth_place: "Los Angeles, CA",
      status: "living",
      organization_name: "Rainbow Family Clinic",
      group_label: "Rainbow Clinic Class of 2020"
    },
    {
      name: "Luna Kim-Park",
      gender: "female",
      date_of_birth: "2020-03-15",
      birth_place: "San Francisco, CA",
      status: "living",
      organization_name: "Rainbow Family Clinic",
      group_label: "Rainbow Clinic Class of 2020"
    },
    // Johnson Extended Family
    {
      name: "Robert Johnson Sr.",
      gender: "male",
      date_of_birth: "1955-02-28",
      birth_place: "Chicago, IL",
      status: "living",
      organization_name: "The Johnson Extended Family",
      group_label: "Johnson Core Family"
    },
    {
      name: "Margaret Johnson",
      gender: "female",
      date_of_birth: "1958-06-14",
      birth_place: "Detroit, MI",
      status: "living",
      organization_name: "The Johnson Extended Family",
      group_label: "Johnson Core Family"
    },
    {
      name: "Robert Johnson Jr.",
      gender: "male",
      date_of_birth: "1985-10-05",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "The Johnson Extended Family",
      group_label: "Johnson Core Family"
    },
    {
      name: "Emily Johnson-Smith",
      gender: "female",
      date_of_birth: "1988-01-20",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "The Johnson Extended Family",
      group_label: "Johnson Core Family"
    }
  ],
  connections: [
    // Pacific Sperm Bank connections
    {
      from_person_name: "David Chen",
      to_person_name: "Maria Rodriguez",
      relationship_type: "partner",
      organization_name: "Pacific Sperm Bank"
    },
    {
      from_person_name: "David Chen",
      to_person_name: "Elena Chen-Rodriguez",
      relationship_type: "parent",
      organization_name: "Pacific Sperm Bank"
    },
    {
      from_person_name: "Maria Rodriguez",
      to_person_name: "Elena Chen-Rodriguez",
      relationship_type: "parent",
      organization_name: "Pacific Sperm Bank"
    },
    {
      from_person_name: "Alex Thompson",
      to_person_name: "Jamie Thompson",
      relationship_type: "parent",
      organization_name: "Pacific Sperm Bank"
    },
    // Add actual donor relationships
    {
      from_person_name: "Sperm Donor #2847",
      to_person_name: "Elena Chen-Rodriguez",
      relationship_type: "donor",
      organization_name: "Pacific Sperm Bank"
    },
    {
      from_person_name: "Sperm Donor #2847",
      to_person_name: "Jamie Thompson",
      relationship_type: "donor",
      organization_name: "Pacific Sperm Bank"
    },
    {
      from_person_name: "Elena Chen-Rodriguez",
      to_person_name: "Jamie Thompson",
      relationship_type: "donor_sibling",
      organization_name: "Pacific Sperm Bank"
    },
    // Rainbow Family Clinic connections
    {
      from_person_name: "Dr. Sarah Kim",
      to_person_name: "Lisa Park",
      relationship_type: "partner",
      organization_name: "Rainbow Family Clinic"
    },
    {
      from_person_name: "Dr. Sarah Kim",
      to_person_name: "Luna Kim-Park",
      relationship_type: "parent",
      organization_name: "Rainbow Family Clinic"
    },
    {
      from_person_name: "Lisa Park",
      to_person_name: "Luna Kim-Park",
      relationship_type: "parent",
      organization_name: "Rainbow Family Clinic"
    },
    {
      from_person_name: "Egg Donor #E123",
      to_person_name: "Luna Kim-Park",
      relationship_type: "donor",
      organization_name: "Rainbow Family Clinic"
    },
    // Johnson Family connections
    {
      from_person_name: "Robert Johnson Sr.",
      to_person_name: "Margaret Johnson",
      relationship_type: "partner",
      organization_name: "The Johnson Extended Family"
    },
    {
      from_person_name: "Robert Johnson Sr.",
      to_person_name: "Robert Johnson Jr.",
      relationship_type: "parent",
      organization_name: "The Johnson Extended Family"
    },
    {
      from_person_name: "Robert Johnson Sr.",
      to_person_name: "Emily Johnson-Smith",
      relationship_type: "parent",
      organization_name: "The Johnson Extended Family"
    },
    {
      from_person_name: "Margaret Johnson",
      to_person_name: "Robert Johnson Jr.",
      relationship_type: "parent",
      organization_name: "The Johnson Extended Family"
    },
    {
      from_person_name: "Margaret Johnson",
      to_person_name: "Emily Johnson-Smith",
      relationship_type: "parent",
      organization_name: "The Johnson Extended Family"
    },
    {
      from_person_name: "Robert Johnson Jr.",
      to_person_name: "Emily Johnson-Smith",
      relationship_type: "sibling",
      organization_name: "The Johnson Extended Family"
    }
  ]
};

export async function seedOrganizations(userId: string) {
  const results = {
    organizations: [] as any[],
    groups: [] as any[],
    persons: [] as any[],
    connections: [] as any[],
    errors: [] as string[]
  };

  try {
    console.log('Starting organization seeding process...');

    // Create organizations first
    for (const orgData of seedData.organizations) {
      try {
        const { data: organization, error } = await supabase
          .from('organizations')
          .insert({
            ...orgData,
            owner_id: userId
          })
          .select()
          .single();

        if (error) {
          results.errors.push(`Failed to create organization ${orgData.name}: ${error.message}`);
          continue;
        }

        results.organizations.push(organization);
        console.log(`Created organization: ${organization.name}`);
      } catch (err) {
        results.errors.push(`Failed to create organization ${orgData.name}: ${err}`);
      }
    }

    // Create groups
    for (const groupData of seedData.groups) {
      try {
        const organization = results.organizations.find(org => org.name === groupData.organization_name);
        if (!organization) {
          results.errors.push(`Organization not found for group: ${groupData.label}`);
          continue;
        }

        const { data: group, error } = await supabase
          .from('groups')
          .insert({
            label: groupData.label,
            type: groupData.type,
            description: groupData.description,
            organization_id: organization.id,
            owner_id: userId
          })
          .select()
          .single();

        if (error) {
          results.errors.push(`Failed to create group ${groupData.label}: ${error.message}`);
          continue;
        }

        results.groups.push(group);
        console.log(`Created group: ${group.label}`);
      } catch (err) {
        results.errors.push(`Failed to create group ${groupData.label}: ${err}`);
      }
    }

    // Create persons
    for (const personData of seedData.persons) {
      try {
        const organization = results.organizations.find(org => org.name === personData.organization_name);
        if (!organization) {
          results.errors.push(`Organization not found for person: ${personData.name}`);
          continue;
        }

        const { data: person, error } = await supabase
          .from('persons')
          .insert({
            name: personData.name,
            gender: personData.gender,
            date_of_birth: personData.date_of_birth,
            birth_place: personData.birth_place,
            status: personData.status,
            organization_id: organization.id,
            user_id: userId
          })
          .select()
          .single();

        if (error) {
          results.errors.push(`Failed to create person ${personData.name}: ${error.message}`);
          continue;
        }

        results.persons.push(person);
        console.log(`Created person: ${person.name}`);

        // Add person to group if specified
        if (personData.group_label) {
          const group = results.groups.find(g => g.label === personData.group_label);
          if (group) {
            await supabase
              .from('group_memberships')
              .insert({
                person_id: person.id,
                group_id: group.id,
                user_id: userId,
                role: 'member'
              });
          }
        }
      } catch (err) {
        results.errors.push(`Failed to create person ${personData.name}: ${err}`);
      }
    }

    // Create connections
    for (const connectionData of seedData.connections) {
      try {
        const organization = results.organizations.find(org => org.name === connectionData.organization_name);
        if (!organization) {
          results.errors.push(`Organization not found for connection: ${connectionData.from_person_name} -> ${connectionData.to_person_name}`);
          continue;
        }

        const fromPerson = results.persons.find(p => p.name === connectionData.from_person_name);
        const toPerson = results.persons.find(p => p.name === connectionData.to_person_name);

        if (!fromPerson || !toPerson) {
          results.errors.push(`Person not found for connection: ${connectionData.from_person_name} -> ${connectionData.to_person_name}`);
          continue;
        }

        const { data: connection, error } = await supabase
          .from('connections')
          .insert({
            from_person_id: fromPerson.id,
            to_person_id: toPerson.id,
            relationship_type: connectionData.relationship_type,
            organization_id: organization.id
          })
          .select()
          .single();

        if (error) {
          results.errors.push(`Failed to create connection ${connectionData.from_person_name} -> ${connectionData.to_person_name}: ${error.message}`);
          continue;
        }

        results.connections.push(connection);
        console.log(`Created connection: ${fromPerson.name} -> ${toPerson.name} (${connectionData.relationship_type})`);
      } catch (err) {
        results.errors.push(`Failed to create connection ${connectionData.from_person_name} -> ${connectionData.to_person_name}: ${err}`);
      }
    }

    console.log('Seeding completed!');
    console.log(`Created: ${results.organizations.length} organizations, ${results.groups.length} groups, ${results.persons.length} persons, ${results.connections.length} connections`);
    
    if (results.errors.length > 0) {
      console.log('Errors:', results.errors);
    }

    return results;
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

export async function clearSeededData(userId: string) {
  try {
    console.log('Clearing seeded data...');
    
    // Delete in reverse order due to foreign key constraints
    await supabase
      .from('connections')
      .delete()
      .in('organization_id', seedData.organizations.map(org => org.name));

    await supabase
      .from('group_memberships')
      .delete()
      .eq('user_id', userId);

    await supabase
      .from('persons')
      .delete()
      .eq('user_id', userId);

    await supabase
      .from('groups')
      .delete()
      .eq('owner_id', userId);

    await supabase
      .from('organizations')
      .delete()
      .eq('owner_id', userId);

    console.log('Seeded data cleared successfully');
  } catch (error) {
    console.error('Failed to clear seeded data:', error);
    throw error;
  }
}