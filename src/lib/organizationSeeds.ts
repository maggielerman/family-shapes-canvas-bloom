// Organization test seed data
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface SeedData {
  organizations: Array<{
    name: string;
    slug: string;
    subdomain: string;
    type: string;
    description: string;
    visibility: string;
  }>;
  familyTrees: Array<{
    name: string;
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
    donor?: boolean;
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
      slug: "rainbow-family-clinic-2025-07-22",
      subdomain: "rainbow-clinic",
      type: "fertility_clinic",
      description: "A progressive fertility clinic specializing in LGBTQ+ family building and donor conception services.",
      visibility: "public",
    },
    {
      name: "Pacific Sperm Bank",
      slug: "pacific-sperm-bank-2025-07-22",
      subdomain: "pacific-sperm",
      type: "sperm_bank",
      description: "A leading sperm bank serving the Pacific Northwest with comprehensive donor services.",
      visibility: "public",
    },
    {
      name: "The Johnson Extended Family",
      slug: "johnson-extended-family-2025-07-22",
      subdomain: "johnson-family",
      type: "other",
      description: "A large extended family network including donor-conceived children and their families.",
      visibility: "private",
    },
    {
      name: "Donor Sibling Registry Northwest",
      slug: "dsr-northwest-2025-07-22",
      subdomain: "dsr-nw",
      type: "other",
      description: "Regional registry helping donor-conceived individuals find genetic relatives and build connections.",
      visibility: "public",
    },
  ],
  familyTrees: [
    {
      name: "Donor #2847 Families",
      description: "Families connected through Sperm Donor #2847",
      organization_name: "pacific-sperm-bank-2025-07-22",
    },
    {
      name: "Rainbow Clinic Class of 2020",
      description: "Families who started their journey at Rainbow Clinic in 2020",
      organization_name: "rainbow-family-clinic-2025-07-22",
    },
    {
      name: "Johnson Core Family",
      description: "The core Johnson family members",
      organization_name: "johnson-extended-family-2025-07-22",
    },
    {
      name: "Seattle Donor Siblings",
      description: "Donor-conceived individuals in the Seattle area",
      organization_name: "dsr-northwest-2025-07-22",
    },
  ],
  persons: [
    // Pacific Sperm Bank families
    {
      name: "Sperm Donor #2847",
      gender: "male",
      date_of_birth: "1980-03-15",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "pacific-sperm-bank-2025-07-22",
      donor: true,
    },
    {
      name: "David Chen",
      gender: "male",
      date_of_birth: "1985-07-22",
      birth_place: "Portland, OR",
      status: "living",
      organization_name: "pacific-sperm-bank-2025-07-22",
      donor: false,
    },
    {
      name: "Maria Rodriguez",
      gender: "female",
      date_of_birth: "1987-11-08",
      birth_place: "Vancouver, BC",
      status: "living",
      organization_name: "pacific-sperm-bank-2025-07-22",
      donor: false,
    },
    {
      name: "Elena Chen-Rodriguez",
      gender: "female",
      date_of_birth: "2018-05-14",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "pacific-sperm-bank-2025-07-22",
      donor: false,
    },
    {
      name: "Alex Thompson",
      gender: "male",
      date_of_birth: "1982-09-30",
      birth_place: "Tacoma, WA",
      status: "living",
      organization_name: "pacific-sperm-bank-2025-07-22",
      donor: false,
    },
    {
      name: "Jamie Thompson",
      gender: "non-binary",
      date_of_birth: "2019-12-03",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "pacific-sperm-bank-2025-07-22",
      donor: false,
    },
    // Rainbow Family Clinic families
    {
      name: "Egg Donor #E123",
      gender: "female",
      date_of_birth: "1990-01-20",
      birth_place: "San Francisco, CA",
      status: "living",
      organization_name: "rainbow-family-clinic-2025-07-22",
      donor: true,
    },
    {
      name: "Dr. Sarah Kim",
      gender: "female",
      date_of_birth: "1988-04-12",
      birth_place: "Los Angeles, CA",
      status: "living",
      organization_name: "rainbow-family-clinic-2025-07-22",
      donor: false,
    },
    {
      name: "Lisa Park",
      gender: "female",
      date_of_birth: "1990-08-25",
      birth_place: "San Diego, CA",
      status: "living",
      organization_name: "rainbow-family-clinic-2025-07-22",
      donor: false,
    },
    {
      name: "Luna Kim-Park",
      gender: "female",
      date_of_birth: "2020-06-18",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "rainbow-family-clinic-2025-07-22",
      donor: false,
    },
    // Johnson Family
    {
      name: "Robert Johnson Sr.",
      gender: "male",
      date_of_birth: "1955-04-12",
      birth_place: "Spokane, WA",
      status: "living",
      organization_name: "johnson-extended-family-2025-07-22",
      donor: false,
    },
    {
      name: "Margaret Johnson",
      gender: "female",
      date_of_birth: "1957-08-20",
      birth_place: "Tacoma, WA",
      status: "living",
      organization_name: "johnson-extended-family-2025-07-22",
      donor: false,
    },
    {
      name: "Robert Johnson Jr.",
      gender: "male",
      date_of_birth: "1985-06-15",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "johnson-extended-family-2025-07-22",
      donor: false,
    },
    {
      name: "Emily Johnson-Smith",
      gender: "female",
      date_of_birth: "1988-12-03",
      birth_place: "Seattle, WA",
      status: "living",
      organization_name: "johnson-extended-family-2025-07-22",
      donor: false,
    },
  ],
  connections: [
    // Pacific Sperm Bank connections
    {
      from_person_name: "David Chen",
      to_person_name: "Maria Rodriguez",
      relationship_type: "partner",
      organization_name: "pacific-sperm-bank-2025-07-22",
    },
    {
      from_person_name: "David Chen",
      to_person_name: "Elena Chen-Rodriguez",
      relationship_type: "parent",
      organization_name: "pacific-sperm-bank-2025-07-22",
    },
    {
      from_person_name: "Maria Rodriguez",
      to_person_name: "Elena Chen-Rodriguez",
      relationship_type: "parent",
      organization_name: "pacific-sperm-bank-2025-07-22",
    },
    {
      from_person_name: "Alex Thompson",
      to_person_name: "Jamie Thompson",
      relationship_type: "parent",
      organization_name: "pacific-sperm-bank-2025-07-22",
    },
    // Add actual donor relationships
    {
      from_person_name: "Sperm Donor #2847",
      to_person_name: "Elena Chen-Rodriguez",
      relationship_type: "donor",
      organization_name: "pacific-sperm-bank-2025-07-22",
    },
    {
      from_person_name: "Sperm Donor #2847",
      to_person_name: "Jamie Thompson",
      relationship_type: "donor",
      organization_name: "pacific-sperm-bank-2025-07-22",
    },
    {
      from_person_name: "Elena Chen-Rodriguez",
      to_person_name: "Jamie Thompson",
      relationship_type: "sibling",
      organization_name: "pacific-sperm-bank-2025-07-22",
    },
    // Rainbow Family Clinic connections
    {
      from_person_name: "Dr. Sarah Kim",
      to_person_name: "Lisa Park",
      relationship_type: "partner",
      organization_name: "rainbow-family-clinic-2025-07-22",
    },
    {
      from_person_name: "Dr. Sarah Kim",
      to_person_name: "Luna Kim-Park",
      relationship_type: "parent",
      organization_name: "rainbow-family-clinic-2025-07-22",
    },
    {
      from_person_name: "Lisa Park",
      to_person_name: "Luna Kim-Park",
      relationship_type: "parent",
      organization_name: "rainbow-family-clinic-2025-07-22",
    },
    {
      from_person_name: "Egg Donor #E123",
      to_person_name: "Luna Kim-Park",
      relationship_type: "donor",
      organization_name: "rainbow-family-clinic-2025-07-22",
    },
    // Johnson Family connections
    {
      from_person_name: "Robert Johnson Sr.",
      to_person_name: "Margaret Johnson",
      relationship_type: "partner",
      organization_name: "johnson-extended-family-2025-07-22",
    },
    {
      from_person_name: "Robert Johnson Sr.",
      to_person_name: "Robert Johnson Jr.",
      relationship_type: "parent",
      organization_name: "johnson-extended-family-2025-07-22",
    },
    {
      from_person_name: "Robert Johnson Sr.",
      to_person_name: "Emily Johnson-Smith",
      relationship_type: "parent",
      organization_name: "johnson-extended-family-2025-07-22",
    },
    {
      from_person_name: "Margaret Johnson",
      to_person_name: "Robert Johnson Jr.",
      relationship_type: "parent",
      organization_name: "johnson-extended-family-2025-07-22",
    },
    {
      from_person_name: "Margaret Johnson",
      to_person_name: "Emily Johnson-Smith",
      relationship_type: "parent",
      organization_name: "johnson-extended-family-2025-07-22",
    },
    {
      from_person_name: "Robert Johnson Jr.",
      to_person_name: "Emily Johnson-Smith",
      relationship_type: "sibling",
      organization_name: "johnson-extended-family-2025-07-22",
    },
  ],
};

export async function seedOrganizations(userId: string, supabase: SupabaseClient<Database>) {
  const results = {
    organizations: [] as any[],
    groups: [] as any[],
    persons: [] as any[],
    connections: [] as any[],
    donors: [] as any[],
  };

  try {
    // Create organizations
    for (const org of seedData.organizations) {
      try {
        const { data: organization, error } = await supabase
          .from('organizations')
          .insert({
            ...org,
            owner_id: userId,
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to create organization ${org.name}:`, error);
        } else {
          results.organizations.push(organization);
          console.log(`✅ Created organization: ${org.name}`);
        }
      } catch (error) {
        console.error(`Error creating organization ${org.name}:`, error);
      }
    }

    // Create family trees for each organization
    for (const familyTree of seedData.familyTrees) {
      try {
        const org = results.organizations.find(o => o.slug === familyTree.organization_name);
        if (!org) {
          console.error(`Organization not found for family tree ${familyTree.name}`);
          continue;
        }

        const { data: createdFamilyTree, error } = await supabase
          .from('family_trees')
          .insert({
            name: familyTree.name,
            description: familyTree.description,
            organization_id: org.id,
            user_id: userId,
            visibility: 'private',
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to create family tree ${familyTree.name}:`, error);
        } else {
          results.familyTrees.push(createdFamilyTree);
          console.log(`✅ Created family tree: ${familyTree.name}`);
        }
      } catch (error) {
        console.error(`Error creating family tree ${familyTree.name}:`, error);
      }
    }

    // Create persons and donors
    for (const person of seedData.persons) {
      try {
        const org = results.organizations.find(o => o.slug === person.organization_name);
        if (!org) {
          console.error(`Organization not found for person ${person.name}`);
          continue;
        }

        // Create the person first
        const { data: createdPerson, error: personError } = await supabase
          .from('persons')
          .insert({
            name: person.name,
            gender: person.gender,
            date_of_birth: person.date_of_birth,
            birth_place: person.birth_place,
            status: person.status,
            organization_id: org.id,
            user_id: userId,
            donor: person.donor || false,
          })
          .select()
          .single();

        if (personError) {
          console.error(`Failed to create person ${person.name}:`, personError);
          continue;
        }

        results.persons.push(createdPerson);
        console.log(`✅ Created person: ${person.name}`);

        // If this is a donor person, create a donor record
        if (person.donor) {
          try {
            const donorData = {
              person_id: createdPerson.id,
              donor_type: person.name.includes('Sperm') ? 'sperm' : 'egg',
              is_anonymous: true,
              donor_number: person.name.includes('Sperm') ? '2847' : 'E123',
              sperm_bank: person.name.includes('Sperm') ? 'Pacific Sperm Bank' : null,
            };

            const { data: donor, error: donorError } = await supabase
              .from('donors')
              .insert(donorData)
              .select()
              .single();

            if (donorError) {
              console.error(`Failed to create donor record for ${person.name}:`, donorError);
            } else {
              results.donors.push(donor);
              console.log(`✅ Created donor record for: ${person.name}`);
            }
          } catch (error) {
            console.error(`Error creating donor record for ${person.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error creating person ${person.name}:`, error);
      }
    }

    // Create connections
    for (const connection of seedData.connections) {
      try {
        const fromPerson = results.persons.find(p => p.name === connection.from_person_name);
        const toPerson = results.persons.find(p => p.name === connection.to_person_name);
        const org = results.organizations.find(o => o.slug === connection.organization_name);

        if (!fromPerson || !toPerson) {
          console.error(`Person not found for connection: ${connection.from_person_name} -> ${connection.to_person_name}`);
          continue;
        }

        const { data: createdConnection, error } = await supabase
          .from('connections')
          .insert({
            from_person_id: fromPerson.id,
            to_person_id: toPerson.id,
            relationship_type: connection.relationship_type,
            organization_id: org?.id,
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to create connection: ${connection.from_person_name} -> ${connection.to_person_name}`, error);
        } else {
          results.connections.push(createdConnection);
          console.log(`✅ Created connection: ${connection.from_person_name} -> ${connection.to_person_name}`);
        }
      } catch (error) {
        console.error(`Error creating connection: ${connection.from_person_name} -> ${connection.to_person_name}`, error);
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`✅ Organizations: ${results.organizations.length}/${seedData.organizations.length}`);
    console.log(`✅ Groups: ${results.groups.length}/${seedData.familyTrees.length}`);
    console.log(`✅ Persons: ${results.persons.length}/${seedData.persons.length}`);
    console.log(`✅ Donors: ${results.donors.length}/${seedData.persons.filter(p => p.donor).length}`);
    console.log(`✅ Connections: ${results.connections.length}/${seedData.connections.length}`);

    // Only proceed with groups, persons, and connections if organizations were created
    if (results.organizations.length === 0) {
      console.log('❌ No organizations were created. Skipping groups, persons, and connections.');
      return results;
    }

    return results;
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

export async function clearSeededData(userId: string, supabase: SupabaseClient<Database>) {
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