import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import mongoose from 'mongoose';
import { connectDB } from './src/db/index.js';

// Item schema (inline to avoid import issues with full app)
const itemSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        photos: [{ type: String }],
        category: {
            type: String,
            enum: ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Kitchen', 'Other'],
            required: true
        },
        mode: { type: String, enum: ['RENT', 'SELL', 'GIVE'], required: true },
        price: { type: Number, default: 0 },
        isAvailable: { type: Boolean, default: true },
        condition: {
            type: String,
            enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'],
            required: true
        },
        instantClaim: { type: Boolean, default: false },
        maxClaimers: { type: Number, default: 1 },
        claimedBy: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            claimedAt: Date,
            status: { type: String, enum: ['PENDING_PICKUP', 'COMPLETED', 'CANCELLED'], default: 'PENDING_PICKUP' }
        }],
        rentalTerms: { minDays: Number, maxDays: Number, depositRequired: Boolean, depositAmount: Number },
        pickupLocation: String,
        availabilitySchedule: {
            type: String,
            enum: ['ANYTIME', 'WEEKDAYS', 'WEEKENDS', 'BY_APPOINTMENT'],
            default: 'ANYTIME'
        }
    },
    { timestamps: true }
);

const Item = mongoose.model('Item', itemSchema);

// Realistic, authentic user-uploaded style photos for student marketplace listings
const itemImages = [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80', // 1. Engineering Mathematics (Used Textbook on desk)
    'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=1000&q=80', // 2. Casio Scientific Calculator
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80', // 3. Used Laptop on study table
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80', // 4. boAt Over-Ear Headphones
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80', // 5. Campus Commuter Bicycle
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80', // 6. Wooden Hostel Study Table
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80', // 7. Badminton Racket with Cover
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1000&q=80', // 8. CLRS Algorithms Textbook
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80', // 9. Wildcraft 35L College Backpack
    'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=1000&q=80', // 10. Electric Kettle (Hostel Essential)
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80', // 11. Study Desk Lamp
    'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=1000&q=80', // 12. Decathlon Football
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80', // 13. Logitech Wireless Mouse
];

const seedItems = (ownerId) => [
    {
        title: 'Higher Engineering Mathematics - B.S. Grewal (44th Ed)',
        description: 'Hardcover 44th Edition in solid condition. Minimal pencil notes on Calculus and Linear Algebra chapters. Essential for 1st & 2nd year B.Tech students.',
        category: 'Books',
        mode: 'SELL',
        price: 350,
        condition: 'GOOD',
        pickupLocation: 'Central Library, Ground Floor Steps',
        availabilitySchedule: 'WEEKDAYS',
        photos: [itemImages[0]],
        owner: ownerId,
    },
    {
        title: 'Casio FX-991EX Classwiz Scientific Calculator',
        description: 'Original Casio FX-991EX Classwiz. 552 functions with natural textbook display and matrix/vector calculation modes. Battery is fresh. Used for 1 semester.',
        category: 'Electronics',
        mode: 'SELL',
        price: 750,
        condition: 'LIKE_NEW',
        pickupLocation: 'Mechanical Canteen / Main Gate',
        availabilitySchedule: 'ANYTIME',
        photos: [itemImages[1]],
        owner: ownerId,
    },
    {
        title: 'Dell Inspiron 15 (i5 11th Gen, 8GB RAM, 512GB SSD)',
        description: 'Well-maintained Dell Inspiron 15 laptop. Intel Core i5 11th Gen, 8GB DDR4 RAM, 512GB NVMe SSD, 15.6-inch FHD screen. Great for coding, web dev, and assignments. Includes original 65W charger.',
        category: 'Electronics',
        mode: 'SELL',
        price: 24000,
        condition: 'GOOD',
        pickupLocation: 'CS Department, Lab 3',
        availabilitySchedule: 'BY_APPOINTMENT',
        photos: [itemImages[2]],
        owner: ownerId,
    },
    {
        title: 'boAt Rockerz 450 Wireless Bluetooth Headphones',
        description: 'Black boAt Rockerz 450 over-ear Bluetooth headphones with comfortable ear cushions. 15-hour battery backup, 40mm drivers. Comes with micro-USB charging cable.',
        category: 'Electronics',
        mode: 'SELL',
        price: 800,
        condition: 'GOOD',
        pickupLocation: 'Hostel Block B Entrance',
        availabilitySchedule: 'ANYTIME',
        photos: [itemImages[3]],
        owner: ownerId,
    },
    {
        title: 'Hero Sprint 26T Single Speed Campus Cycle',
        description: 'Sturdy black/green Hero Sprint 26T cycle for hostel-to-class daily commute. New brake pads installed last month. Smooth pedaling, both tyres have great tread remaining.',
        category: 'Sports',
        mode: 'SELL',
        price: 2800,
        condition: 'GOOD',
        pickupLocation: 'Cycle Stand near Main Gate',
        availabilitySchedule: 'WEEKENDS',
        photos: [itemImages[4]],
        owner: ownerId,
    },
    {
        title: 'Compact Wooden Study Table with Shelf',
        description: 'Standard hostel-sized wooden study table (3ft x 2ft) with bottom book rack. Sturdy and fits neatly next to single bed. Selling as I am moving out of hostel.',
        category: 'Furniture',
        mode: 'SELL',
        price: 1200,
        condition: 'FAIR',
        pickupLocation: 'Boys Hostel 4, Room 312',
        availabilitySchedule: 'WEEKENDS',
        photos: [itemImages[5]],
        owner: ownerId,
    },
    {
        title: 'Yonex Nanoray Light 18i Badminton Racket',
        description: 'Lightweight graphite badminton racket (77g, 30 lbs string tension). Includes Yonex full head cover. Available for weekend sports sessions or rent per day.',
        category: 'Sports',
        mode: 'RENT',
        price: 40,
        condition: 'LIKE_NEW',
        pickupLocation: 'Indoor Badminton Court / Sports Complex',
        availabilitySchedule: 'ANYTIME',
        rentalTerms: { minDays: 1, maxDays: 7, depositRequired: true, depositAmount: 400 },
        photos: [itemImages[6]],
        owner: ownerId,
    },
    {
        title: 'Introduction to Algorithms (CLRS) 3rd Edition',
        description: 'The standard algorithms bible (Cormen, Leiserson, Rivest, Stein). Clean paperback edition, perfect for DSA semester prep and placement interview rounds.',
        category: 'Books',
        mode: 'RENT',
        price: 25,
        condition: 'GOOD',
        pickupLocation: 'Central Library, Reference Section',
        availabilitySchedule: 'WEEKDAYS',
        rentalTerms: { minDays: 7, maxDays: 30, depositRequired: true, depositAmount: 250 },
        photos: [itemImages[7]],
        owner: ownerId,
    },
    {
        title: 'Wildcraft 35L College Backpack (Black/Navy)',
        description: 'Durable Wildcraft 35L multi-compartment backpack with padded 15.6" laptop sleeve and rain cover. All zippers working smoothly.',
        category: 'Other',
        mode: 'SELL',
        price: 650,
        condition: 'GOOD',
        pickupLocation: 'Student Activity Centre (SAC)',
        availabilitySchedule: 'WEEKDAYS',
        photos: [itemImages[8]],
        owner: ownerId,
    },
    {
        title: 'Pigeon 1.5L Stainless Steel Electric Kettle',
        description: 'Pigeon 1500W electric kettle for boiling water, tea, and noodles in hostel room. Automatic shutoff and boil-dry protection. Works perfectly.',
        category: 'Kitchen',
        mode: 'SELL',
        price: 450,
        condition: 'GOOD',
        pickupLocation: 'Hostel Mess Block A',
        availabilitySchedule: 'ANYTIME',
        photos: [itemImages[9]],
        owner: ownerId,
    },
    {
        title: 'Wipro 6W LED Flexible Gooseneck Desk Lamp',
        description: 'White flexible neck LED desk lamp with 3 color temperatures (warm, neutral, white) and touch dimmer. Powered by USB-C or power bank. Great for night study sessions.',
        category: 'Electronics',
        mode: 'SELL',
        price: 350,
        condition: 'LIKE_NEW',
        pickupLocation: 'Girls Hostel Block A Gate',
        availabilitySchedule: 'ANYTIME',
        photos: [itemImages[10]],
        owner: ownerId,
    },
    {
        title: 'Decathlon Kipsta Football (Size 5)',
        description: 'Decathlon Kipsta football size 5. Machine stitched with good grip for casual campus evening games. Free giveaway to anyone who plays regularly.',
        category: 'Sports',
        mode: 'GIVE',
        price: 0,
        condition: 'GOOD',
        instantClaim: true,
        maxClaimers: 1,
        pickupLocation: 'Football Ground Pavilion',
        availabilitySchedule: 'WEEKENDS',
        photos: [itemImages[11]],
        owner: ownerId,
    },
    {
        title: 'Logitech B170 Wireless Optical Mouse',
        description: 'Logitech B170 2.4GHz wireless mouse with USB nano receiver. 1000 DPI optical sensor, comfortable ambidextrous shape. 1x AA battery included.',
        category: 'Electronics',
        mode: 'SELL',
        price: 350,
        condition: 'LIKE_NEW',
        pickupLocation: 'Computer Centre / IT Desk',
        availabilitySchedule: 'WEEKDAYS',
        photos: [itemImages[12]],
        owner: ownerId,
    },
];

async function seed() {
    try {
        await connectDB();

        // Find the first user to use as seller
        const UserModel = mongoose.connection.collection('users');
        let user = await UserModel.findOne({});

        if (!user) {
            console.log('👤 No existing user found. Creating default seller account...');
            const defaultUser = {
                username: 'sasankreddy',
                email: 'sasank@nitrr.ac.in',
                fullName: 'Sasank Reddy',
                college: 'NIT Raipur',
                password: '$2b$10$e8HnCpBWqLFE/HeYnTz1Z.3CcypKp53oc8MLIcc1fd9gsy4vFOY52', // password123
                isVerified: true,
                avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const insertUserResult = await UserModel.insertOne(defaultUser);
            user = { _id: insertUserResult.insertedId, fullName: defaultUser.fullName, email: defaultUser.email };
        }

        console.log(`📦 Using seller: ${user.fullName} (${user.email})`);

        // Clear existing items
        const deleteResult = await Item.deleteMany({});
        console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing items`);

        // Insert seed items
        const items = seedItems(user._id);
        const insertedItems = await Item.insertMany(items);
        console.log(`✅ Inserted ${insertedItems.length} sample listings:`);

        insertedItems.forEach((item, i) => {
            const priceStr = item.price > 0 ? `₹${item.price}` : 'Free';
            console.log(`   ${i + 1}. ${item.title} — ${item.mode} — ${priceStr} — ${item.category}`);
        });

        console.log('\n🎉 Seed complete! Your marketplace now has sample listings.');
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
