/**
 * Seed script: Creates demo users and sample listings for development.
 *
 * Run: pnpm tsx scripts/seed-demo.ts
 *
 * Creates 5 demo users and ~20 listings across categories.
 * Idempotent: checks for existing demo users before inserting.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";
import { users, userStats } from "../src/modules/users/schema";
import { listings } from "../src/modules/listings/schema";
import { species } from "../src/modules/species/schema";
import { generateId } from "../src/lib/uuid";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

const DEMO_USERS = [
  {
    displayName: "Lena Gartner",
    email: "lena@demo.pflanzenulli.eu",
    accountType: "private" as const,
    countryCode: "DE",
    bio: "Urban jungle enthusiast from Berlin. Always propagating something.",
  },
  {
    displayName: "Marco Verde",
    email: "marco@demo.pflanzenulli.eu",
    accountType: "private" as const,
    countryCode: "IT",
    bio: "Aroid collector based in Milan. Mostly Philodendrons and Anthuriums.",
  },
  {
    displayName: "Sophie Blatt",
    email: "sophie@demo.pflanzenulli.eu",
    accountType: "private" as const,
    countryCode: "AT",
    bio: "Succulent lover from Vienna. My balcony is basically a greenhouse.",
  },
  {
    displayName: "Jan de Groene",
    email: "jan@demo.pflanzenulli.eu",
    accountType: "private" as const,
    countryCode: "NL",
    bio: "Hoya collector and terrarium builder. Amsterdam-based.",
  },
  {
    displayName: "Pflanzenwelt GmbH",
    email: "shop@demo.pflanzenulli.eu",
    accountType: "commercial" as const,
    countryCode: "DE",
    bio: "Small nursery in Hamburg. Specializing in rare aroids and hoyas.",
  },
];

interface ListingTemplate {
  speciesQuery: string;
  title: string;
  description: string;
  category: "plant" | "cutting" | "accessory";
  priceCents: number;
  isTradeable: boolean;
  userIndex: number;
  plantAttributes?: Record<string, unknown>;
}

const DEMO_LISTINGS: ListingTemplate[] = [
  {
    speciesQuery: "Monstera deliciosa",
    title: "Monstera deliciosa – large specimen with fenestrations",
    description:
      "Beautiful 3-year-old Monstera deliciosa with multiple fenestrated leaves. About 80cm tall in a 21cm pot. Very healthy, has been growing in bright indirect light. Perfect for someone who wants an instant impact plant. Can arrange local pickup in Berlin or ship within Germany.",
    category: "plant",
    priceCents: 4500,
    isTradeable: true,
    userIndex: 0,
    plantAttributes: { potSize: "21cm", ageMonths: 36, height: "80cm" },
  },
  {
    speciesQuery: "Philodendron gloriosum",
    title: "Philodendron gloriosum – rooted cutting",
    description:
      "Rooted cutting of my Philodendron gloriosum. Has one established leaf and a new one unfurling. This is a terrestrial crawler so it needs a wide pot. Grown in chunky aroid mix. Ships in sphagnum moss.",
    category: "cutting",
    priceCents: 2800,
    isTradeable: true,
    userIndex: 1,
    plantAttributes: { isRooted: true },
  },
  {
    speciesQuery: "Pilea peperomioides",
    title: "Pilea babies – set of 3 rooted pups",
    description:
      "My big Pilea has produced more babies than I can handle! Offering a set of 3 rooted pups, each about 8cm tall. These are super easy to grow and make great gifts. Already rooted in small pots, ready to go.",
    category: "plant",
    priceCents: 800,
    isTradeable: true,
    userIndex: 0,
    plantAttributes: { potSize: "6cm", height: "8cm" },
  },
  {
    speciesQuery: "Hoya carnosa",
    title: "Hoya carnosa 'Compacta' (Hindu Rope) – unrooted cutting",
    description:
      "Two-node cutting from my mature Hindu Rope Hoya. This cultivar has the beautiful twisted, curling leaves. Unrooted – you'll need to root it in water or perlite first. Ships wrapped in damp paper towel.",
    category: "cutting",
    priceCents: 1200,
    isTradeable: false,
    userIndex: 3,
  },
  {
    speciesQuery: "Begonia maculata",
    title: "Begonia maculata – established plant with spots",
    description:
      "Stunning Polka Dot Begonia in a 14cm pot. About 35cm tall with gorgeous silver spots on deep green leaves. Has been producing new growth consistently. Prefers bright indirect light and humidity above 50%.",
    category: "plant",
    priceCents: 1800,
    isTradeable: true,
    userIndex: 2,
    plantAttributes: { potSize: "14cm", height: "35cm" },
  },
  {
    speciesQuery: "Epipremnum aureum",
    title: "Golden Pothos – large trailing plant",
    description:
      "Massive golden pothos with trails over 1.5m long. This plant has been growing for years and is incredibly lush. Perfect as a hanging plant or on a tall shelf. Nearly unkillable – great for beginners too.",
    category: "plant",
    priceCents: 2000,
    isTradeable: true,
    userIndex: 0,
    plantAttributes: { potSize: "17cm", height: "150cm" },
  },
  {
    speciesQuery: "Ceropegia woodii",
    title: "String of Hearts – full pot, long strands",
    description:
      "Gorgeous String of Hearts with strands hanging about 60cm. The leaves have the classic heart shape with silver marbling. Comes in a 12cm hanging pot. This plant loves bright light and infrequent watering.",
    category: "plant",
    priceCents: 1500,
    isTradeable: false,
    userIndex: 2,
    plantAttributes: { potSize: "12cm" },
  },
  {
    speciesQuery: "Echeveria elegans",
    title: "Echeveria elegans rosette – perfect symmetry",
    description:
      "Single compact rosette of Echeveria elegans (Mexican Snowball). About 10cm in diameter with the beautiful powder-blue leaves. Stress colors appear with more sun exposure. Ships bare root.",
    category: "plant",
    priceCents: 600,
    isTradeable: true,
    userIndex: 2,
  },
  {
    speciesQuery: "Philodendron hederaceum",
    title: "Heartleaf Philodendron cuttings – 5 nodes",
    description:
      "Five single-node cuttings from my mature Heartleaf Philodendron. Each cutting has an aerial root started. These root incredibly easily in water. Perfect for starting a new plant or filling out an existing one.",
    category: "cutting",
    priceCents: 500,
    isTradeable: true,
    userIndex: 1,
  },
  {
    speciesQuery: "Ficus lyrata",
    title: "Fiddle Leaf Fig – 1.2m tall, branching",
    description:
      "Tall Fiddle Leaf Fig that has been notched to encourage branching. Currently has 3 branches with large, violin-shaped leaves. In a 24cm nursery pot. This one needs bright light and consistent watering. Local pickup only in Vienna.",
    category: "plant",
    priceCents: 6500,
    isTradeable: false,
    userIndex: 2,
    plantAttributes: { potSize: "24cm", height: "120cm", ageMonths: 48 },
  },
  {
    speciesQuery: "Sansevieria trifasciata",
    title: "Snake Plant division – 3 leaves",
    description:
      "Division from my large Snake Plant. Three healthy leaves with roots attached, about 40cm tall. This is the classic Sansevieria with dark green leaves and yellow edges. Tolerates almost any light condition.",
    category: "plant",
    priceCents: 700,
    isTradeable: true,
    userIndex: 0,
    plantAttributes: { height: "40cm" },
  },
  {
    speciesQuery: "Tradescantia zebrina",
    title: "Tradescantia zebrina – rooted cuttings bundle",
    description:
      "Bundle of 8 rooted cuttings of Tradescantia zebrina (Wandering Dude). The purple and silver striped leaves are stunning. These grow incredibly fast. Rooted in a small pot, ready for a bigger home.",
    category: "cutting",
    priceCents: 400,
    isTradeable: true,
    userIndex: 3,
    plantAttributes: { isRooted: true },
  },
  {
    speciesQuery: "Alocasia zebrina",
    title: "Alocasia zebrina – striking zebra stems",
    description:
      "Young Alocasia zebrina with 4 leaves and the distinctive zebra-striped stems. About 45cm tall. Needs humidity and warmth – not for beginners. This one goes dormant in winter but comes back stronger in spring.",
    category: "plant",
    priceCents: 3500,
    isTradeable: true,
    userIndex: 1,
    plantAttributes: { potSize: "15cm", height: "45cm" },
  },
  {
    speciesQuery: "Crassula ovata",
    title: "Jade Plant – 15-year-old bonsai style",
    description:
      "Mature Jade Plant that I have been growing in a bonsai style for over 15 years. Thick woody trunk, compact canopy. About 30cm tall in a ceramic bonsai pot. This is a statement piece. Local pickup in Amsterdam only.",
    category: "plant",
    priceCents: 8000,
    isTradeable: false,
    userIndex: 3,
    plantAttributes: { potSize: "20cm", height: "30cm", ageMonths: 180 },
  },
  // Accessories
  {
    speciesQuery: "",
    title: "Handmade macrame plant hanger – natural cotton",
    description:
      "Hand-knotted macrame plant hanger made from 100% natural cotton rope. Fits pots up to 18cm diameter. About 90cm long including the hanging loop. Each one is slightly unique. Perfect for trailing plants like Pothos or String of Hearts.",
    category: "accessory",
    priceCents: 1800,
    isTradeable: false,
    userIndex: 0,
  },
  {
    speciesQuery: "",
    title: "Chunky aroid potting mix – 3L bag",
    description:
      "My custom aroid potting mix: orchid bark, perlite, charcoal, worm castings, and coco coir. Perfect drainage for Monsteras, Philodendrons, and other aroids. 3-liter bag, enough for 2-3 repots. Made fresh to order.",
    category: "accessory",
    priceCents: 900,
    isTradeable: false,
    userIndex: 4,
  },
  {
    speciesQuery: "",
    title: "Moss pole – 60cm coco coir totem",
    description:
      "60cm coco coir moss pole for climbing aroids. Helps Monsteras and Philodendrons develop larger leaves. Comes with ties to attach the plant. Much better than the cheap ones from the garden center.",
    category: "accessory",
    priceCents: 1200,
    isTradeable: false,
    userIndex: 4,
  },
  {
    speciesQuery: "",
    title: "Terracotta pot set – 3 sizes with saucers",
    description:
      "Set of 3 terracotta pots (10cm, 14cm, 18cm) with matching saucers. Classic Italian style, unglazed. These breathe well which most plants love. Minor kiln variations add character. Pickup preferred in Hamburg.",
    category: "accessory",
    priceCents: 2200,
    isTradeable: false,
    userIndex: 4,
  },
];

async function seed() {
  // Check if demo users already exist
  const existingDemo = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_USERS[0]!.email))
    .limit(1);

  if (existingDemo.length > 0) {
    console.log("Demo data already exists. Skipping.");
    await client.end();
    return;
  }

  console.log("Creating demo users...");
  const userIds: string[] = [];

  for (const userData of DEMO_USERS) {
    const id = generateId();
    await db.insert(users).values({
      id,
      email: userData.email,
      displayName: userData.displayName,
      accountType: userData.accountType,
      countryCode: userData.countryCode,
      bio: userData.bio,
      preferredLanguage: "en",
      verificationStatus: "email_verified",
      onboardingCompleted: true,
      gdprConsentAt: new Date(),
      tosAcceptedAt: new Date(),
      tosVersion: "1.0",
    });

    await db.insert(userStats).values({ userId: id });

    userIds.push(id);
    console.log(`  Created user: ${userData.displayName}`);
  }

  // Fetch all species for matching
  const allSpecies = await db
    .select({ id: species.id, scientificName: species.scientificName })
    .from(species);

  const speciesMap = new Map(allSpecies.map((s) => [s.scientificName, s.id]));

  console.log(`\nCreating ${DEMO_LISTINGS.length} demo listings...`);

  for (const listing of DEMO_LISTINGS) {
    const userId = userIds[listing.userIndex]!;
    const user = DEMO_USERS[listing.userIndex]!;
    const speciesId = listing.speciesQuery
      ? speciesMap.get(listing.speciesQuery) ?? null
      : null;

    // Look up cross-border eligibility
    let crossBorderEligible = false;
    if (speciesId) {
      const sp = await db
        .select({ crossBorderAllowed: species.crossBorderAllowed })
        .from(species)
        .where(eq(species.id, speciesId))
        .limit(1);
      crossBorderEligible = sp[0]?.crossBorderAllowed ?? false;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    await db.insert(listings).values({
      id: generateId(),
      userId,
      speciesId,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      priceCents: listing.priceCents,
      currency: "EUR",
      isTradeable: listing.isTradeable,
      quantityAvailable: 1,
      quantityUnit: "pieces",
      status: "active",
      countryCode: user.countryCode,
      crossBorderEligible,
      plantAttributes: listing.plantAttributes ?? null,
      expiresAt,
    });

    console.log(`  Created: ${listing.title.substring(0, 50)}...`);
  }

  console.log(
    `\nDone: ${userIds.length} users, ${DEMO_LISTINGS.length} listings.`,
  );
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
