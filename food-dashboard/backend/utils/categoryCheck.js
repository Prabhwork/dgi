/**
 * Helper to identify if a business category belongs to the "Restaurant" ecosystem.
 * This covers the 305+ granular Google categories related to food and dining.
 */
const isFoodRelated = (categoryName) => {
    if (!categoryName) return false;
    
    const keywords = [
        'Restaurant', 'Cafe', 'Dining', 'Food', 'Bakery', 'Bar', 'Grill', 
        'Bistro', 'Kitchen', 'Hotel', 'Resort', 'Sweets', 'Snacks', 
        'Pizzeria', 'Steakhouse', 'Caterer', 'Diner', 'Canteen', 'Dhabba'
    ];

    const lowerName = categoryName.toLowerCase();
    return keywords.some(keyword => lowerName.includes(keyword.toLowerCase()));
};

module.exports = { isFoodRelated };
