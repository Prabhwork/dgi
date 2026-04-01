const updatePrebook = async () => {
    try {
        const targetId = '69bb9a15c9b4ca5debd71cd7'; 

        const htmlContent = `
<div class='space-y-4 text-left'>
  <p class='font-bold text-lg text-primary'>Get the Power of Micro Mapping at a Fraction of the Cost</p>
  <p class='text-sm sm:text-base'>In 2026, a basic map pin isn't enough to beat the competition. You need a digital storefront that works while you sleep. To celebrate our upcoming launch, we are giving our early partners an unbeatable advantage.</p>
  
  <div class='bg-primary/5 p-4 sm:p-5 rounded-2xl border border-primary/20 my-5 shadow-inner'>
    <p class='font-bold text-xs sm:text-sm uppercase tracking-widest mb-2 opacity-80'>Special Pre-Launch Price:</p>
    <div class='flex items-center gap-4'>
      <span class='text-2xl sm:text-3xl line-through opacity-40 font-bold'>₹ 7,500</span>
      <span class='text-4xl sm:text-5xl font-black text-primary drop-shadow-sm'>₹ 2,500</span>
    </div>
    <p class='text-xs sm:text-sm mt-2 font-bold opacity-80'>(One-Time Setup for one year — Flat 66% OFF)</p>
  </div>

  <p class='font-bold text-sm sm:text-base mt-6 mb-3 border-b pb-2 border-white/10'>Why Grab This Offer Today?</p>
  <ul class='space-y-3 mb-6'>
    <li class='flex gap-3 items-start'><span class='text-primary mt-1'>✓</span> <div><strong>Massive Savings:</strong> Save ₹ 5,000 immediately. This price will never be this low again once we go live.</div></li>
    <li class='flex gap-3 items-start'><span class='text-primary mt-1'>✓</span> <div><strong>The "First-Mover" Advantage:</strong> Shops that join during pre-launch get priority placement in our directory, ensuring you are at the top when customers in your area search.</div></li>
    <li class='flex gap-3 items-start'><span class='text-primary mt-1'>✓</span> <div><strong>Total Control:</strong> Unlock your Merchant Panel today. Start uploading your gallery, setting your timings, and preparing to receive orders from your local neighborhood.</div></li>
    <li class='flex gap-3 items-start'><span class='text-primary mt-1'>✓</span> <div><strong>Stop Losing Neighbors:</strong> Your neighbors are ordering from global apps because they can't see your stock online. Micro Mapping puts your products in their hands.</div></li>
  </ul>

  <p class='font-bold text-sm sm:text-base mt-6 mb-3 border-b pb-2 border-white/10'>What Happens After You Join?</p>
  <ol class='space-y-3 mb-6 list-decimal list-inside font-medium'>
    <li><strong>Instant Activation:</strong> Your business status goes "Live."</li>
    <li><strong>Badge Award:</strong> Receive the DBI Verified Badge instantly on your profile.</li>
    <li><strong>Community Entry:</strong> Gain immediate access to the Business Brotherhood for bulk buying and fraud alerts.</li>
  </ol>

  <div class='bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-500/20 mt-6 flex gap-3 items-start shadow-sm'>
    <span class='text-xl'>⚠️</span>
    <p class='text-sm leading-relaxed font-bold'>Act Fast: This ₹ 2,500 offer is strictly limited to the first 100 members in your zone. Once the slots are full, the price returns to ₹ 7,500.</p>
  </div>
</div>
`;

        const res = await fetch(`http://localhost:5001/api/upcoming-categories/${targetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: htmlContent })
        });
        
        const data = await res.json();

        if (data.success) {
            console.log('Successfully updated Pre-Book(Anything) description via API!');
        } else {
            console.log('Update failed:', data.message);
        }

    } catch (error) {
        console.error('Error with API:', error);
    }
};

updatePrebook();
