const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FunnelQuestion = require('./models/FunnelQuestion');

dotenv.config();

const questions = [
    {
        question: "What type of business do you run?",
        order: 1,
        options: [
            { label: "Service-based (Agency, Freelancer, Consultant)", icon: "Briefcase", color: "from-blue-500 to-cyan-400" },
            { label: "Product-based (Physical products)", icon: "Store", color: "from-purple-500 to-pink-500" },
            { label: "Online/Digital (Courses, SaaS, etc.)", icon: "Globe", color: "from-emerald-500 to-teal-400" },
            { label: "Local business (Shop, Salon, Gym, etc.)", icon: "Building2", color: "from-amber-500 to-orange-400" },
            { label: "Other", icon: "MoreHorizontal", color: "from-slate-500 to-slate-400" }
        ]
    },
    {
        question: "What is your current monthly revenue?",
        order: 2,
        options: [
            { label: "Just starting (0–10K/month)", icon: "Rocket", color: "from-slate-500 to-slate-400" },
            { label: "10K – 50K/month", icon: "DollarSign", color: "from-blue-400 to-blue-500" },
            { label: "50K – 2L/month", icon: "TrendingUp", color: "from-emerald-400 to-emerald-600" },
            { label: "2L+ per month", icon: "Target", color: "from-amber-400 to-yellow-600" }
        ]
    },
    {
        question: "What is your biggest challenge right now?",
        order: 3,
        options: [
            { label: "Not getting consistent leads", icon: "Users", color: "from-red-500 to-orange-400" },
            { label: "Low sales or poor conversions", icon: "BarChart3", color: "from-fuchsia-500 to-purple-500" },
            { label: "Weak branding", icon: "Layout", color: "from-cyan-500 to-blue-500" },
            { label: "Losing money on ads", icon: "Megaphone", color: "from-rose-500 to-red-500" },
            { label: "Team or process issues", icon: "ShieldCheck", color: "from-slate-500 to-slate-600" }
        ]
    },
    {
        question: "How are you currently marketing your business?",
        order: 4,
        options: [
            { label: "Social media (Instagram, etc.)", icon: "Globe", color: "from-blue-400 to-indigo-500" },
            { label: "Paid ads (Facebook/Google)", icon: "Target", color: "from-rose-500 to-red-500" },
            { label: "Referrals / word of mouth", icon: "Users", color: "from-emerald-500 to-green-500" },
            { label: "Marketplaces (Amazon, Flipkart, etc.)", icon: "ShoppingCart", color: "from-orange-500 to-amber-500" },
            { label: "Not doing any marketing", icon: "MoreHorizontal", color: "from-slate-500 to-slate-600" }
        ]
    },
    {
        question: "What is your main goal for the next 3 months?",
        order: 5,
        options: [
            { label: "Generate more leads", icon: "Users", color: "from-blue-500 to-cyan-500" },
            { label: "Increase sales", icon: "TrendingUp", color: "from-green-500 to-emerald-500" },
            { label: "Build a strong brand", icon: "Award", color: "from-purple-500 to-pink-500" },
            { label: "Improve online presence", icon: "Globe", color: "from-cyan-500 to-blue-500" },
            { label: "Scale or automate the business", icon: "Rocket", color: "from-amber-500 to-orange-500" }
        ]
    }
];

const seedFunnel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding... 🚀');
        
        await FunnelQuestion.deleteMany();
        console.log('Cleared existing funnel questions.');
        
        await FunnelQuestion.insertMany(questions);
        console.log('Funnel questions updated with new set successfully! ✅');
        
        process.exit();
    } catch (err) {
        console.error('Error seeding funnel:', err);
        process.exit(1);
    }
};

seedFunnel();
