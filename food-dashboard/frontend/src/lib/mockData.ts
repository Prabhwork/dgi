export const CATEGORIES = ['Pizza', 'Burgers', 'Drinks', 'Dessert', 'Chinese', 'Indian Main Course'];

export const INITIAL_ORDERS = [
  { id: 'ORD-7721', customer: 'Rahul Sharma', items: '2x Paneer Pizza, 1x Coke', total: 649, status: 'Preparing', payment: 'Paid', time: '12:45 PM' },
  { id: 'ORD-7722', customer: 'Priya Singh', items: '1x Veg Whopper, 1x Fries', total: 399, status: 'Pending', payment: 'Paid', time: '01:02 PM' },
  { id: 'ORD-7723', customer: 'Amit Verma', items: '3x Garlic Bread', total: 297, status: 'Accepted', payment: 'Pending', time: '01:15 PM' },
  { id: 'ORD-7724', customer: 'Sonia Gupta', items: '1x Chocolate Lava Cake', total: 150, status: 'Ready', payment: 'Paid', time: '01:20 PM' },
  { id: 'ORD-7725', customer: 'Vikram Raj', items: '2x Hakka Noodles', total: 420, status: 'Completed', payment: 'Paid', time: '11:30 AM' },
];

export const STATS = [
  { label: 'Total Orders', value: '42', sub: '+12% from yesterday', icon: 'orders', color: 'primary' },
  { label: 'Total Revenue', value: '₹12,450', sub: '+8% from yesterday', icon: 'revenue', color: 'emerald' },
  { label: 'Pending Orders', value: '08', sub: 'Needs attention', icon: 'pending', color: 'amber' },
  { label: 'Completed', value: '34', sub: 'Successfully delivered', icon: 'completed', color: 'blue' },
];

export const REVIEWS = [
  { id: 1, customer: 'Anjali Verma', rating: 5, comment: 'Best Paneer Pizza in the area! Highly recommend.', date: '02 Apr, 2026', sentiment: 'Positive' },
  { id: 2, customer: 'Karan Mehra', rating: 4, comment: 'Great taste, but preparation took a bit longer than expected.', date: '01 Apr, 2026', sentiment: 'Neutral' },
  { id: 3, customer: 'Suresh Raina', rating: 5, comment: 'Packaged very well. Still hot when it arrived!', date: '31 Mar, 2026', sentiment: 'Positive' },
  { id: 4, customer: 'Neha Kapoor', rating: 2, comment: 'Fries were a bit soggy this time. Disappointed.', date: '30 Mar, 2026', sentiment: 'Negative' },
];

export const MONTHLY_SALES = [
  { month: 'Oct', revenue: 45000, orders: 450 },
  { month: 'Nov', revenue: 52000, orders: 520 },
  { month: 'Dec', revenue: 78000, orders: 810 },
  { month: 'Jan', revenue: 64000, orders: 670 },
  { month: 'Feb', revenue: 85000, orders: 890 },
  { month: 'Mar', revenue: 92000, orders: 940 },
];

export const PRODUCTS = [
  { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 299, originalPrice: 399, isVeg: true, prepTime: 15, available: true, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400' },
  { id: 2, name: 'Double Patty Burger', category: 'Burgers', price: 199, isVeg: false, prepTime: 10, available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { id: 3, name: 'Iced Americano', category: 'Drinks', price: 149, isVeg: true, prepTime: 5, available: false, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400' },
];
